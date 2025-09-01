#!/usr/bin/env node

/**
 * DIAGNOSTIC COMPLET - Validation structure n8n node
 * Détecte les problèmes qui causent "workflow has issues"
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC COMPLET - Validation structure n8n node\n');

// 1. Vérifier la structure des fichiers compilés
const distDir = './dist';
const expectedFiles = [
  'dist/credentials/PennylaneTokenApi.credentials.js',
  'dist/nodes/Pennylane/Pennylane.node.js',
  'dist/triggers/PennylaneTrigger/PennylaneTrigger.node.js'
];

console.log('📁 VÉRIFICATION FICHIERS COMPILÉS:');
expectedFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  
  if (exists) {
    const stats = fs.statSync(file);
    console.log(`      📏 Taille: ${(stats.size / 1024).toFixed(1)}KB`);
    
    // Vérifier si le fichier contient des erreurs évidentes
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('undefined')) {
      console.log(`      ⚠️  Contient des 'undefined' suspects`);
    }
    if (content.includes('Error:')) {
      console.log(`      ⚠️  Contient des erreurs`);
    }
  }
});

console.log('\n📦 VÉRIFICATION PACKAGE.JSON:');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Vérifier la configuration n8n
const n8nConfig = packageJson.n8n;
console.log('   n8nNodesApiVersion:', n8nConfig?.n8nNodesApiVersion || 'MANQUANT');

console.log('   Credentials:');
n8nConfig?.credentials?.forEach(cred => {
  const exists = fs.existsSync(cred);
  console.log(`      ${exists ? '✅' : '❌'} ${cred}`);
});

console.log('   Nodes:');
n8nConfig?.nodes?.forEach(node => {
  const exists = fs.existsSync(node);
  console.log(`      ${exists ? '✅' : '❌'} ${node}`);
});

// 2. Tester l'importation des modules compilés
console.log('\n🔬 TEST IMPORTATION MODULES:');

try {
  console.log('   🧪 Test credential...');
  const credentialPath = './dist/credentials/PennylaneTokenApi.credentials.js';
  if (fs.existsSync(credentialPath)) {
    const credential = require(path.resolve(credentialPath));
    console.log(`      ✅ Credential importé - Class: ${credential.class?.name || 'UNDEFINED'}`);
    
    // Vérifier la structure
    const instance = new credential.class();
    console.log(`         - displayName: ${instance.displayName || 'MANQUANT'}`);
    console.log(`         - name: ${instance.name || 'MANQUANT'}`);
    console.log(`         - properties: ${instance.properties ? Object.keys(instance.properties).length : 0} propriétés`);
  }
} catch (error) {
  console.log(`      ❌ ERREUR credential: ${error.message}`);
}

try {
  console.log('   🧪 Test node principal...');
  const nodePath = './dist/nodes/Pennylane/Pennylane.node.js';
  if (fs.existsSync(nodePath)) {
    const node = require(path.resolve(nodePath));
    console.log(`      ✅ Node importé - Class: ${node.class?.name || 'UNDEFINED'}`);
    
    // Vérifier la structure
    const instance = new node.class();
    console.log(`         - displayName: ${instance.description?.displayName || 'MANQUANT'}`);
    console.log(`         - name: ${instance.description?.name || 'MANQUANT'}`);
    console.log(`         - properties: ${instance.description?.properties ? instance.description.properties.length : 0} propriétés`);
    
    // Vérifier les méthodes
    console.log(`         - execute method: ${typeof instance.execute === 'function' ? 'OK' : 'MANQUANT'}`);
    console.log(`         - loadOptions method: ${typeof instance.methods?.loadOptions === 'object' ? Object.keys(instance.methods.loadOptions).length + ' méthodes' : 'MANQUANT'}`);
  }
} catch (error) {
  console.log(`      ❌ ERREUR node principal: ${error.message}`);
  console.log(`         Stack: ${error.stack.split('\n')[1]}`);
}

try {
  console.log('   🧪 Test trigger...');
  const triggerPath = './dist/triggers/PennylaneTrigger/PennylaneTrigger.node.js';
  if (fs.existsSync(triggerPath)) {
    const trigger = require(path.resolve(triggerPath));
    console.log(`      ✅ Trigger importé - Class: ${trigger.class?.name || 'UNDEFINED'}`);
    
    // Vérifier la structure
    const instance = new trigger.class();
    console.log(`         - displayName: ${instance.description?.displayName || 'MANQUANT'}`);
    console.log(`         - name: ${instance.description?.name || 'MANQUANT'}`);
    console.log(`         - trigger method: ${typeof instance.trigger === 'function' ? 'OK' : 'MANQUANT'}`);
  }
} catch (error) {
  console.log(`      ❌ ERREUR trigger: ${error.message}`);
}

// 3. Vérifier les dépendances dans les fichiers compilés
console.log('\n📋 ANALYSE DÉPENDANCES:');
expectedFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Chercher des require() suspects
    const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    const suspiciousRequires = requires.filter(req => 
      req.includes('axios') || 
      req.includes('form-data') ||
      req.includes('request') ||
      !req.includes('n8n-workflow')
    );
    
    if (suspiciousRequires.length > 0) {
      console.log(`   ⚠️  ${file}:`);
      suspiciousRequires.forEach(req => console.log(`      - ${req}`));
    }
  }
});

// 4. Vérifier le fichier transport-old.ts qui pourrait être inclus par erreur
const transportOldPath = './dist/helpers/transport-old.js';
if (fs.existsSync(transportOldPath)) {
  console.log('\n⚠️  PROBLÈME DÉTECTÉ:');
  console.log('   transport-old.js est présent dans dist/ - cela peut causer des conflits');
  console.log('   Ce fichier contient des dépendances axios/form-data prohibées');
}

console.log('\n🏁 DIAGNOSTIC TERMINÉ');
