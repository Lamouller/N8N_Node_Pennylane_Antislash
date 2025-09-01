import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IExecuteFunctions, ILoadOptionsFunctions, ITriggerFunctions, ICredentialDataDecryptedObject } from 'n8n-workflow';

export interface PennylaneCredentials {
  apiToken?: string;
  accessToken?: string;
  companyId?: string;
  environment: 'production' | 'sandbox';
}

export interface PennylaneApiResponse<T = any> {
  data: T;
  items?: T[];
  has_more?: boolean;
  next_cursor?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Build correct Pennylane API endpoint with company_id as query parameter
 */
export function buildPennylaneEndpoint(resource: string, companyId: string, params: Record<string, any> = {}): string {
  const queryParams = new URLSearchParams({
    company_id: companyId,
    ...params
  });
  
  return `/${resource}?${queryParams.toString()}`;
}

/**
 * Build endpoint for single resource by ID
 */
export function buildPennylaneResourceEndpoint(resource: string, resourceId: string, companyId: string): string {
  return `/${resource}/${resourceId}?company_id=${companyId}`;
}

export interface PennylaneError {
  error: string;
  message: string;
  scope?: string;
  required_scope?: string;
}

export class PennylaneTransport {
  private client: AxiosInstance;
  private credentials: PennylaneCredentials;
  private rateLimitTokens = 5; // 5 requests per second
  private lastRequestTime = 0;

  constructor(credentials: PennylaneCredentials) {
    this.credentials = credentials;
    
    const baseURL = credentials.environment === 'sandbox' 
      ? 'https://app.pennylane.com/api/external/v2/sandbox'
      : 'https://app.pennylane.com/api/external/v2';

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-pennylane-antislash-node/1.0.0',
      },
    });

    // Add request interceptor for auth and rate limiting
    this.client.interceptors.request.use((config: any) => this.handleRequest(config));
    
    // Add response interceptor for retry logic
    this.client.interceptors.response.use(
      (response) => response,
      this.handleResponseError.bind(this)
    );
  }

  private async handleRequest(config: any): Promise<any> {
    // Add authentication header
    if (this.credentials.apiToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.credentials.apiToken}`,
      };
    } else if (this.credentials.accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.credentials.accessToken}`,
      };
    }

    // Add company_id to query params if not already present and companyId is available
    if (this.credentials.companyId && config.url) {
      // Check if URL already has query parameters
      const hasParams = config.url.includes('?');
      const separator = hasParams ? '&' : '?';
      
      // Only add company_id if it's not already in the URL
      if (!config.url.includes('company_id=')) {
        config.url = config.url + separator + `company_id=${this.credentials.companyId}`;
      }
    }

    // Rate limiting
    await this.enforceRateLimit();
    
    return config;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.rateLimitTokens; // 200ms between requests

    if (timeSinceLastRequest < minInterval) {
      const delay = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async handleResponseError(error: any): Promise<never> {
    if (error.response) {
      const { status, data, headers } = error.response;
      
      // Handle rate limiting
      if (status === 429) {
        const retryAfter = headers['retry-after'] 
          ? parseInt(headers['retry-after']) * 1000 
          : 1000;
        
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        throw error; // Re-throw to trigger retry
      }

      // Handle scope errors
      if (status === 403 && data?.required_scope) {
        const pennylaneError: PennylaneError = {
          error: 'Insufficient Scope',
          message: `Operation requires scope: ${data.required_scope}. Current scope: ${data.scope || 'unknown'}`,
          scope: data.scope,
          required_scope: data.required_scope,
        };
        throw new Error(JSON.stringify(pennylaneError));
      }

      // Handle authentication errors
      if (status === 401) {
        throw new Error('Authentication failed. Please check your API token or OAuth credentials.');
      }

      // Handle validation errors
      if (status === 400) {
        const message = data?.message || 'Bad Request';
        throw new Error(`Validation error: ${message}`);
      }
    }

    throw error;
  }

  /**
   * Make a request with automatic retry logic
   */
  async request<T = any>(
    config: any,
    maxRetries = 5
  ): Promise<AxiosResponse<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.client.request<T>(config);
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 429
        if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
          throw error;
        }
        
        // Don't retry on authentication errors
        if (error.response?.status === 401) {
          throw error;
        }
        
        // Exponential backoff for retries
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          const jitter = Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay + jitter));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Get data with automatic pagination
   */
  async getAllPages<T = any>(
    endpoint: string,
    params: Record<string, any> = {},
    maxItems?: number
  ): Promise<T[]> {
    const allItems: T[] = [];
    let cursor: string | undefined;
    let hasMore = true;
    let itemCount = 0;

    while (hasMore && (!maxItems || itemCount < maxItems)) {
      const queryParams = { ...params };
      if (cursor) {
        queryParams.cursor = cursor;
      }

      const response = await this.request<PennylaneApiResponse<T>>({
        method: 'GET',
        url: endpoint,
        params: queryParams,
      });

      const data = response.data;
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : []);
      
      allItems.push(...items);
      itemCount += items.length;
      
      hasMore = data.has_more === true;
      cursor = data.next_cursor;
      
      // Safety check to prevent infinite loops
      if (items.length === 0) {
        break;
      }
    }

    return maxItems ? allItems.slice(0, maxItems) : allItems;
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile(
    endpoint: string,
    fileBuffer: Buffer,
    fileName: string,
    additionalFields: Record<string, any> = {}
  ): Promise<any> {
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'application/octet-stream',
    });

    // Add additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });

    const response = await this.request({
      method: 'POST',
      url: endpoint,
      data: form,
      headers: {
        ...form.getHeaders(),
      },
    });

    return response.data;
  }

  /**
   * Set rate limit (requests per second)
   */
  setRateLimit(rps: number): void {
    this.rateLimitTokens = Math.max(1, Math.min(10, rps)); // Clamp between 1-10 rps
  }
}

/**
 * Create transport instance from n8n credentials
 */
export async function createTransport(
  context: IExecuteFunctions | ILoadOptionsFunctions | ITriggerFunctions,
  credentialType: 'pennylaneTokenApi' = 'pennylaneTokenApi'
): Promise<PennylaneTransport> {
  const credentials = await context.getCredentials(credentialType);
  
  if (!credentials) {
    throw new Error(`No credentials found for ${credentialType}`);
  }

  const authType = credentials.authType as string || 'token';
  const pennylaneCredentials: PennylaneCredentials = {
    environment: (credentials.environment as 'production' | 'sandbox') || 'production',
  };

  if (authType === 'token') {
    if (!credentials.apiToken) {
      throw new Error('API Token is required for Token authentication');
    }
    pennylaneCredentials.apiToken = credentials.apiToken as string;
    pennylaneCredentials.companyId = credentials.companyId as string;
  } else if (authType === 'oauth2') {
    if (!credentials.accessToken) {
      throw new Error('Access Token is required for OAuth2 authentication');
    }
    pennylaneCredentials.accessToken = credentials.accessToken as string;
    pennylaneCredentials.companyId = credentials.oauthCompanyId as string;
  } else {
    throw new Error(`Unsupported authentication type: ${authType}`);
  }

  return new PennylaneTransport(pennylaneCredentials);
}
