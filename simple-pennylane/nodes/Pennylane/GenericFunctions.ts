import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import * as https from 'https';
import { URL } from 'url';

export async function pennylaneApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  const credentials = await this.getCredentials('pennylaneApi');
  const apiToken = credentials.apiToken as string;
  const companyId = credentials.companyId as string;
  
  const url = new URL(`https://app.pennylane.com/api/external/v2${endpoint}`);
  if (companyId && !url.searchParams.has('company_id')) {
    url.searchParams.append('company_id', companyId);
  }
  
  return new Promise((resolve, reject) => {
    const options = {
      method: method.toUpperCase(),
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-pennylane-simple/1.0.0'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode! >= 200 && res.statusCode! < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
