import { IExecuteFunctions, ILoadOptionsFunctions, ITriggerFunctions } from 'n8n-workflow';
import * as https from 'https';
import * as http from 'http';
import * as querystring from 'querystring';
import { URL } from 'url';

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

export interface PennylaneError {
  error: string;
  message: string;
  scope?: string;
  required_scope?: string;
}

export class PennylaneTransport {
  private credentials: PennylaneCredentials;
  private baseURL: string;
  private rateLimitTokens = 5;
  private lastRequestTime = 0;

  constructor(credentials: PennylaneCredentials) {
    this.credentials = credentials;
    this.baseURL = credentials.environment === 'sandbox'
      ? 'https://app.pennylane.com/api/external/v2/sandbox'
      : 'https://app.pennylane.com/api/external/v2';
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

  private makeRequest(options: any, data?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const client = options.protocol === 'https:' ? https : http;
      
      const req = client.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const statusCode = res.statusCode || 0;
            
            if (statusCode >= 200 && statusCode < 300) {
              const parsedData = responseData ? JSON.parse(responseData) : {};
              resolve({
                data: parsedData,
                status: statusCode,
                headers: res.headers
              });
            } else {
              let errorData;
              try {
                errorData = JSON.parse(responseData);
              } catch {
                errorData = { message: responseData || 'Unknown error' };
              }
              
              const error = new Error(`HTTP ${statusCode}: ${errorData.message || 'Request failed'}`);
              (error as any).response = {
                status: statusCode,
                data: errorData,
                headers: res.headers
              };
              reject(error);
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse response: ${parseError}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (data) {
        req.write(data);
      }
      
      req.end();
    });
  }

  private buildMultipartData(fields: Record<string, any>, files?: { name: string; buffer: Buffer; filename: string }[]): { data: string; boundary: string } {
    const boundary = `----formdata-n8n-${Date.now()}`;
    let data = '';
    
    // Add fields
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        data += `--${boundary}\r\n`;
        data += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        data += `${value}\r\n`;
      }
    }
    
    // Add files
    if (files) {
      for (const file of files) {
        data += `--${boundary}\r\n`;
        data += `Content-Disposition: form-data; name="${file.name}"; filename="${file.filename}"\r\n`;
        data += `Content-Type: application/octet-stream\r\n\r\n`;
        data += file.buffer.toString('binary');
        data += '\r\n';
      }
    }
    
    data += `--${boundary}--\r\n`;
    
    return { data, boundary };
  }

  async request<T = any>(config: any, maxRetries = 5): Promise<{ data: T }> {
    await this.enforceRateLimit();
    
    const url = new URL(config.url, this.baseURL);
    
    // Add company_id to query params if not already present
    if (this.credentials.companyId && !url.searchParams.has('company_id')) {
      url.searchParams.set('company_id', this.credentials.companyId);
    }
    
    // Add other query params
    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: config.method || 'GET',
      protocol: url.protocol,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-pennylane-antislash-node/1.0.0',
        ...config.headers
      }
    };
    
    // Add authentication
    if (this.credentials.apiToken) {
      options.headers['Authorization'] = `Bearer ${this.credentials.apiToken}`;
    } else if (this.credentials.accessToken) {
      options.headers['Authorization'] = `Bearer ${this.credentials.accessToken}`;
    }
    
    let requestData: string | undefined;
    
    if (config.data) {
      if (typeof config.data === 'string') {
        requestData = config.data;
      } else {
        requestData = JSON.stringify(config.data);
        options.headers['Content-Length'] = Buffer.byteLength(requestData);
      }
    }
    
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(options, requestData);
        return response;
      } catch (error: any) {
        lastError = error;
        
        const status = error.response?.status;
        
        // Don't retry on client errors (4xx) except 429
        if (status >= 400 && status < 500 && status !== 429) {
          // Handle specific errors
          if (status === 401) {
            throw new Error('Authentication failed. Please check your API token or OAuth credentials.');
          }
          if (status === 403 && error.response?.data?.required_scope) {
            const data = error.response.data;
            throw new Error(`Operation requires scope: ${data.required_scope}. Current scope: ${data.scope || 'unknown'}`);
          }
          if (status === 400) {
            const message = error.response?.data?.message || 'Bad Request';
            throw new Error(`Validation error: ${message}`);
          }
          throw error;
        }
        
        // Handle rate limiting
        if (status === 429) {
          const retryAfter = error.response?.headers['retry-after']
            ? parseInt(error.response.headers['retry-after']) * 1000
            : 1000;
          await new Promise(resolve => setTimeout(resolve, retryAfter));
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

  async uploadFile(
    endpoint: string,
    fileBuffer: Buffer,
    fileName: string,
    additionalFields: Record<string, any> = {}
  ): Promise<any> {
    const { data, boundary } = this.buildMultipartData(additionalFields, [
      { name: 'file', buffer: fileBuffer, filename: fileName }
    ]);
    
    const response = await this.request({
      method: 'POST',
      url: endpoint,
      data,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(data)
      }
    });

    return response.data;
  }

  setRateLimit(rps: number): void {
    this.rateLimitTokens = Math.max(1, Math.min(10, rps));
  }
}

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
