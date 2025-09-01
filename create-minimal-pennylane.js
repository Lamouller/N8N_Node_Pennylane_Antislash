#!/usr/bin/env node

/**
 * CRÉER UNE VERSION MINIMALE DU NODE PENNYLANE
 * Pour identifier où est le problème exactement
 */

const fs = require('fs');

console.log('🛠️ CRÉATION NODE PENNYLANE MINIMAL\n');

// Structure minimale identique à v2.5.0 mais ultra simple
const packageJson = {
  "name": "n8n-pennylane-minimal",
  "version": "1.0.0",
  "description": "Minimal Pennylane node for debugging",
  "files": ["dist"],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": ["dist/credentials/PennylaneMinimal.credentials.js"],
    "nodes": ["dist/nodes/PennylaneMinimal/PennylaneMinimal.node.js"]
  },
  "dependencies": {
    "n8n-workflow": "^1.55.0"
  }
};

// Créer la structure
const dirs = [
  'minimal-package',
  'minimal-package/dist',
  'minimal-package/dist/credentials',
  'minimal-package/dist/nodes',
  'minimal-package/dist/nodes/PennylaneMinimal'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

fs.writeFileSync('minimal-package/package.json', JSON.stringify(packageJson, null, 2));

// Credential minimal
const credentialContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PennylaneMinimal = void 0;

class PennylaneMinimal {
  constructor() {
    this.name = 'pennylaneMinimal';
    this.displayName = 'Pennylane Minimal';
    this.properties = [
      {
        displayName: 'API Token',
        name: 'apiToken',
        type: 'string',
        default: '',
      }
    ];
  }
}
exports.PennylaneMinimal = PennylaneMinimal;
`;

fs.writeFileSync('minimal-package/dist/credentials/PennylaneMinimal.credentials.js', credentialContent);

// Node minimal avec JUSTE la structure Pennylane mais sans complexité
const nodeContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PennylaneMinimal = void 0;

class PennylaneMinimal {
  constructor() {
    this.description = {
      displayName: 'Pennylane Minimal',
      name: 'pennylaneMinimal',
      group: ['transform'],
      version: 1,
      description: 'Minimal Pennylane node for debugging',
      defaults: { name: 'Pennylane Minimal' },
      inputs: ['main'],
      outputs: ['main'],
      credentials: [{ name: 'pennylaneMinimal', required: true }],
      properties: [
        {
          displayName: 'Resource',
          name: 'resource',
          type: 'options',
          options: [
            { name: 'Customer', value: 'customer' },
            { name: 'Invoice', value: 'invoice' }
          ],
          default: 'customer',
        },
        {
          displayName: 'Operation',
          name: 'operation',
          type: 'options',
          displayOptions: { show: { resource: ['customer'] } },
          options: [
            { name: 'Get All', value: 'getAll' }
          ],
          default: 'getAll',
        }
      ],
    };
  }

  async execute(context) {
    const items = context.getInputData();
    const resource = context.getNodeParameter('resource', 0);
    const operation = context.getNodeParameter('operation', 0);
    
    return [{
      json: {
        resource,
        operation,
        message: 'Pennylane minimal node working!',
        timestamp: new Date().toISOString()
      }
    }];
  }
}
exports.PennylaneMinimal = PennylaneMinimal;
`;

fs.writeFileSync('minimal-package/dist/nodes/PennylaneMinimal/PennylaneMinimal.node.js', nodeContent);

console.log('✅ Package Pennylane minimal créé');
console.log('\n📋 INSTRUCTIONS:');
console.log('1. cd minimal-package');  
console.log('2. npm publish --tag minimal');
console.log('3. Sur Railway: npm install n8n-pennylane-minimal@minimal');
console.log('\nCe package minimal devrait nous dire si le problème vient de:');
console.log('- La structure du package');
console.log('- La complexité du code');  
console.log('- Autre chose');

console.log('\n🏁 PACKAGE MINIMAL PRÊT');
