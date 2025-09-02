import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import * as https from 'https';
import { URL } from 'url';

export async function pennylaneApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: string,
  endpoint: string,
  body?: any,
  retryCount = 0
): Promise<any> {
  const credentials = await this.getCredentials('pennylaneApi');
  const apiToken = credentials.apiToken as string;
  const companyId = credentials.companyId as string;
  
  const url = new URL(`https://app.pennylane.com/api/external/v2${endpoint}`);
  if (companyId && !url.searchParams.has('company_id')) {
    url.searchParams.append('company_id', companyId);
  }
  
  // Debug: Log détaillé de la requête v1.7.2
  console.log(`🌐 API Request v1.7.2: ${method} ${url.toString()}`);
  console.log(`🔑 Token: ${apiToken ? `${apiToken.substring(0, 10)}...` : 'MISSING'}`);
  console.log(`🏢 Company ID: ${companyId || 'MISSING'}`);
  console.log(`📤 Body: ${body ? JSON.stringify(body).substring(0, 200) : 'empty'}`);
  
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
        // Debug info
        console.log(`📡 API Response: ${res.statusCode} - ${res.headers['content-type']} - ${data.length} chars`);
        
        // Vérifier si c'est du HTML (erreur Pennylane/Cloudflare)
        if (data.trim().startsWith('<!DOCTYPE html>') || data.includes('<html')) {
          // Si c'est du rate limiting et qu'on peut retry
          if ((res.statusCode === 429 || res.statusCode === 503) && retryCount < 3) {
            const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`🔄 Rate limiting détecté, retry dans ${delayMs}ms (tentative ${retryCount + 1}/3)`);
            
            setTimeout(async () => {
              try {
                const result = await pennylaneApiRequest.call(this, method, endpoint, body, retryCount + 1);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, delayMs);
            return;
          }
          
          // Message d'erreur spécifique selon le status
          let specificCause = '';
          if (res.statusCode === 200) {
            specificCause = `
🚨 **PROBLÈME D'AUTHENTIFICATION PROBABLE** (Status 200 + HTML)
➜ Votre TOKEN API est probablement invalide ou expiré
➜ Pennylane redirige vers une page de login/erreur (d'où le HTML)`;
          } else if (res.statusCode === 401) {
            specificCause = `
🚨 **TOKEN API INVALIDE** (Status 401)
➜ Le token dans vos credentials n8n est expiré ou incorrect`;
          } else if (res.statusCode === 403) {
            specificCause = `
🚨 **ACCÈS REFUSÉ** (Status 403)  
➜ Token valide mais permissions insuffisantes
➜ Vérifiez les droits de votre token API`;
          }
          
          const errorMsg = `❌ API Pennylane retourne du HTML au lieu de JSON!
🔍 Status: ${res.statusCode}
🌐 Content-Type: ${res.headers['content-type']}${specificCause}

📝 Autres causes possibles:
  - Rate limiting (trop de requêtes simultanées)
  - Maintenance Pennylane ou Cloudflare
  - Company ID incorrect dans les credentials
  
🔧 Solutions:
  1. **VÉRIFIEZ VOS CREDENTIALS n8n** (token + company_id)
  2. **Regénérez un nouveau token** dans Pennylane
  3. Attendez quelques minutes (rate limiting)
  4. Vérifiez le statut de Pennylane
  
📄 HTML Response preview: ${data.substring(0, 300)}...`;
          
          reject(new Error(errorMsg));
          return;
        }
        
        // Gestion spéciale du rate limiting (texte brut)
        if (res.statusCode === 429 && data.includes('Rate limit exceeded')) {
          const errorMsg = `❌ Rate Limit Pennylane Dépassé!
🚨 Message: ${data}
⏱️ Retry automatique en cours...`;
          
          if (retryCount < 3) {
            const delayMs = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s pour rate limit
            console.log(`🔄 Rate limit, retry dans ${delayMs}ms (tentative ${retryCount + 1}/3)`);
            
            setTimeout(async () => {
              try {
                const result = await pennylaneApiRequest.call(this, method, endpoint, body, retryCount + 1);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, delayMs);
            return;
          } else {
            reject(new Error(errorMsg + '\n❌ Trop de tentatives, arrêt.'));
            return;
          }
        }
        
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode! >= 200 && res.statusCode! < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`❌ HTTP ${res.statusCode}: ${parsed.message || parsed.error || data}`));
          }
        } catch (e) {
          // Si ce n'est pas du JSON et pas du rate limiting, c'est une autre erreur
          reject(new Error(`❌ JSON Parse Error: Réponse inattendue de l'API
🔍 Status: ${res.statusCode}
📝 Content: ${data.substring(0, 200)}...
🚨 Error: ${e instanceof Error ? e.message : 'Unknown parse error'}`));
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
