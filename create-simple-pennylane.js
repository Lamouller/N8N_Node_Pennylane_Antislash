#!/usr/bin/env node

/**
 * CRÉER UNE VERSION SIMPLE DU NODE PENNYLANE
 * Avec la structure d'Axonaut qui fonctionne
 */

const fs = require('fs');
const path = require('path');

console.log('🛠️ CRÉATION NODE PENNYLANE SIMPLE (structure Axonaut)\n');

// Créer la structure comme Axonaut
const dirs = [
  'simple-pennylane',
  'simple-pennylane/credentials',
  'simple-pennylane/nodes',
  'simple-pennylane/nodes/Pennylane'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Package.json comme Axonaut (sans n8nNodesApiVersion)
const packageJson = {
  "name": "n8n-nodes-pennylane-simple",
  "version": "1.0.0",
  "description": "Simple Pennylane node (Axonaut structure)",
  "files": ["dist"],
  "n8n": {
    "credentials": ["dist/credentials/PennylaneApi.credentials.js"],
    "nodes": ["dist/nodes/Pennylane/Pennylane.node.js"]
  },
  "dependencies": {
    "n8n-workflow": "^1.55.0"
  },
  "devDependencies": {
    "@types/node": "^18.16.16",
    "typescript": "^5.1.3"
  },
  "scripts": {
    "build": "tsc"
  }
};

fs.writeFileSync('simple-pennylane/package.json', JSON.stringify(packageJson, null, 2));

// tsconfig.json simple
const tsconfig = {
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "rootDir": "./"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
};

fs.writeFileSync('simple-pennylane/tsconfig.json', JSON.stringify(tsconfig, null, 2));

// Credential simple
const credentialContent = `import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PennylaneApi implements ICredentialType {
  name = 'pennylaneApi';
  displayName = 'Pennylane API';
  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      default: '',
      required: true,
    },
    {
      displayName: 'Company ID',
      name: 'companyId',
      type: 'string',
      default: '',
      required: true,
    }
  ];
}
`;

fs.writeFileSync('simple-pennylane/credentials/PennylaneApi.credentials.ts', credentialContent);

// GenericFunctions.ts (comme Axonaut)
const genericFunctions = `import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
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
  
  const url = new URL(\`https://app.pennylane.com/api/external/v2\${endpoint}\`);
  if (companyId && !url.searchParams.has('company_id')) {
    url.searchParams.append('company_id', companyId);
  }
  
  return new Promise((resolve, reject) => {
    const options = {
      method: method.toUpperCase(),
      headers: {
        'Authorization': \`Bearer \${apiToken}\`,
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
            reject(new Error(\`HTTP \${res.statusCode}: \${parsed.message || data}\`));
          }
        } catch (e) {
          reject(new Error(\`Parse error: \${data}\`));
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
`;

fs.writeFileSync('simple-pennylane/nodes/Pennylane/GenericFunctions.ts', genericFunctions);

// Node principal simple (comme structure Axonaut)
const nodeContent = `import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
  NodeConnectionType,
} from 'n8n-workflow';

import { pennylaneApiRequest } from './GenericFunctions';

export class Pennylane implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pennylane Simple',
    name: 'pennylaneSimple',
    icon: 'file:pennylane.png',
    group: ['transform'],
    version: 1,
    description: 'Simple Pennylane integration',
    defaults: {
      name: 'Pennylane Simple',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'pennylaneApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          { name: 'Customer', value: 'customer' },
          { name: 'Invoice', value: 'invoice' },
        ],
        default: 'customer',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: { resource: ['customer'] },
        },
        options: [
          { name: 'Get All', value: 'getAll' },
          { name: 'Get', value: 'get' },
        ],
        default: 'getAll',
      },
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'string',
        displayOptions: {
          show: { resource: ['customer'], operation: ['get'] },
        },
        default: '',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const response = await pennylaneApiRequest.call(this, 'GET', '/customers');
          const customers = response.items || [];
          return customers.map((customer: any) => ({
            name: customer.name || customer.id,
            value: customer.id,
          }));
        } catch (error) {
          return [];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        let responseData;

        if (resource === 'customer') {
          if (operation === 'getAll') {
            responseData = await pennylaneApiRequest.call(this, 'GET', '/customers');
          } else if (operation === 'get') {
            const customerId = this.getNodeParameter('customerId', i) as string;
            responseData = await pennylaneApiRequest.call(this, 'GET', \`/customers/\${customerId}\`);
          }
        }

        returnData.push({
          json: responseData || { message: 'No data returned' },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}
`;

fs.writeFileSync('simple-pennylane/nodes/Pennylane/Pennylane.node.ts', nodeContent);

console.log('✅ Node Pennylane simple créé avec structure Axonaut');
console.log('\n📋 INSTRUCTIONS:');
console.log('1. cd simple-pennylane');
console.log('2. npm install');
console.log('3. npm run build');
console.log('4. npm publish');
console.log('\nCe node simple devrait fonctionner comme Axonaut !');

console.log('\n🏁 NODE SIMPLE PRÊT');
