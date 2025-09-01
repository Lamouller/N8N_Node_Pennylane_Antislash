#!/usr/bin/env node

/**
 * CRÉER UN PACKAGE DE DIAGNOSTIC MINIMAL POUR RAILWAY
 * Pour identifier exactement ce qui cause l'erreur sur Railway
 */

const fs = require('fs');
const path = require('path');

console.log('🛠️ CRÉATION PACKAGE DE DIAGNOSTIC\n');

// Créer la structure minimale
const dirs = [
  'diagnostic-package',
  'diagnostic-package/dist',
  'diagnostic-package/dist/credentials', 
  'diagnostic-package/dist/nodes',
  'diagnostic-package/dist/nodes/Test'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 1. Package.json minimal
const packageJson = {
  "name": "n8n-diagnostic-pennylane",
  "version": "1.0.0",
  "description": "Diagnostic package for Pennylane node loading issues",
  "main": "index.js",
  "files": ["dist"],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/TestCredential.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Test/Test.node.js"
    ]
  },
  "dependencies": {
    "n8n-workflow": "^1.55.0"
  }
};

fs.writeFileSync('diagnostic-package/package.json', JSON.stringify(packageJson, null, 2));

// 2. Credential minimal
const credentialContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class TestCredential {
  constructor() {
    this.name = 'testCredential';
    this.displayName = 'Test Credential';
    this.properties = [
      {
        displayName: 'Test Token',
        name: 'token',
        type: 'string',
        default: '',
      }
    ];
  }
}

exports.class = TestCredential;
`;

fs.writeFileSync('diagnostic-package/dist/credentials/TestCredential.credentials.js', credentialContent);

// 3. Node minimal
const nodeContent = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

class Test {
  constructor() {
    this.description = {
      displayName: 'Test Node',
      name: 'test',
      group: ['transform'],
      version: 1,
      description: 'Minimal test node for diagnostics',
      defaults: {
        name: 'Test',
      },
      inputs: ['main'],
      outputs: ['main'],
      credentials: [
        {
          name: 'testCredential',
          required: false,
        },
      ],
      properties: [
        {
          displayName: 'Test Message',
          name: 'message',
          type: 'string',
          default: 'Hello World',
          description: 'Test message',
        },
      ],
    };
  }

  async execute(context) {
    const items = context.getInputData();
    const message = context.getNodeParameter('message', 0);
    
    return [{
      json: {
        message: message,
        timestamp: new Date().toISOString(),
        diagnostic: 'Package loaded successfully on Railway'
      }
    }];
  }
}

exports.class = Test;
`;

fs.writeFileSync('diagnostic-package/dist/nodes/Test/Test.node.js', nodeContent);

// 4. Test de chargement
const testContent = `#!/usr/bin/env node

console.log('🧪 TEST DIAGNOSTIC PACKAGE');

try {
  const cred = require('./dist/credentials/TestCredential.credentials.js');
  const node = require('./dist/nodes/Test/Test.node.js');
  
  console.log('✅ Credential loaded:', typeof cred.class);
  console.log('✅ Node loaded:', typeof node.class);
  
  const credInstance = new cred.class();
  const nodeInstance = new node.class();
  
  console.log('✅ Credential instantiated:', credInstance.name);
  console.log('✅ Node instantiated:', nodeInstance.description.name);
  
  console.log('🎉 DIAGNOSTIC PACKAGE OK');
} catch (error) {
  console.log('❌ ERROR:', error.message);
}
`;

fs.writeFileSync('diagnostic-package/test.js', testContent);

console.log('✅ Package de diagnostic créé dans ./diagnostic-package/');
console.log('\n📋 INSTRUCTIONS POUR RAILWAY:');
console.log('1. cd diagnostic-package');
console.log('2. npm publish --tag diagnostic');
console.log('3. Sur Railway: npm install n8n-diagnostic-pennylane@diagnostic');
console.log('4. Observer si ce package minimal se charge');
console.log('\nSi le diagnostic se charge → problème dans notre package principal');
console.log('Si le diagnostic échoue → problème environnement Railway');

// Afficher le contenu pour vérification
console.log('\n📦 CONTENU PACKAGE.JSON:');
console.log(JSON.stringify(packageJson, null, 2));
