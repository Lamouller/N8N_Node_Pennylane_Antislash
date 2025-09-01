#!/usr/bin/env node

/**
 * Test de la structure d'export des credentials n8n
 */

console.log('🧪 TEST STRUCTURE EXPORT CREDENTIAL\n');

try {
  // Test 1: Import direct
  console.log('1️⃣ Import direct:');
  const credentialModule = require('./dist/credentials/PennylaneTokenApi.credentials.js');
  console.log('   Keys disponibles:', Object.keys(credentialModule));
  console.log('   Type de PennylaneTokenApi:', typeof credentialModule.PennylaneTokenApi);
  
  // Test 2: Instance de la classe
  console.log('\n2️⃣ Test instantiation:');
  const CredentialClass = credentialModule.PennylaneTokenApi;
  if (CredentialClass) {
    const instance = new CredentialClass();
    console.log('   ✅ Instance créée');
    console.log('   - displayName:', instance.displayName);
    console.log('   - name:', instance.name);
    console.log('   - properties:', instance.properties ? instance.properties.length : 0);
  } else {
    console.log('   ❌ Classe introuvable');
  }
  
  // Test 3: Structure attendue par n8n
  console.log('\n3️⃣ Structure pour n8n:');
  console.log('   credentialModule.class:', typeof credentialModule.class);
  
  // Si .class n'existe pas, on peut essayer de le créer
  if (!credentialModule.class && credentialModule.PennylaneTokenApi) {
    console.log('   🔧 Tentative de création de .class...');
    credentialModule.class = credentialModule.PennylaneTokenApi;
    console.log('   credentialModule.class après fix:', typeof credentialModule.class);
  }
  
} catch (error) {
  console.log('❌ ERREUR:', error.message);
}

console.log('\n🔬 STRUCTURE RÉELLE COMPILÉE:');
const fs = require('fs');
const content = fs.readFileSync('./dist/credentials/PennylaneTokenApi.credentials.js', 'utf8');

// Chercher la ligne d'export
const exportLines = content.split('\n').filter(line => line.includes('exports.'));
console.log('   Lignes d\'export trouvées:');
exportLines.forEach((line, i) => {
  console.log(`   ${i + 1}. ${line.trim()}`);
});

console.log('\n🏁 TEST TERMINÉ');
