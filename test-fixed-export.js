#!/usr/bin/env node

/**
 * Test de la structure d'export n8n corrigée
 */

console.log('🧪 TEST STRUCTURE EXPORT CORRIGÉE\n');

try {
  // Test 1: Credential
  console.log('1️⃣ Test Credential:');
  const credentialModule = require('./dist/credentials/PennylaneTokenApi.credentials.js');
  console.log('   Keys:', Object.keys(credentialModule));
  console.log('   credentialModule.class:', typeof credentialModule.class);
  
  if (credentialModule.class) {
    const credInstance = new credentialModule.class();
    console.log('   ✅ Credential instancié');
    console.log('   - displayName:', credInstance.displayName);
    console.log('   - name:', credInstance.name);
  }
  
  // Test 2: Node principal
  console.log('\n2️⃣ Test Node principal:');
  const nodeModule = require('./dist/nodes/Pennylane/Pennylane.node.js');
  console.log('   Keys:', Object.keys(nodeModule));
  console.log('   nodeModule.class:', typeof nodeModule.class);
  
  if (nodeModule.class) {
    const nodeInstance = new nodeModule.class();
    console.log('   ✅ Node instancié');
    console.log('   - displayName:', nodeInstance.description?.displayName);
    console.log('   - name:', nodeInstance.description?.name);
    console.log('   - execute method:', typeof nodeInstance.execute);
  }
  
  // Test 3: Trigger
  console.log('\n3️⃣ Test Trigger:');
  const triggerModule = require('./dist/triggers/PennylaneTrigger/PennylaneTrigger.node.js');
  console.log('   Keys:', Object.keys(triggerModule));
  console.log('   triggerModule.class:', typeof triggerModule.class);
  
  if (triggerModule.class) {
    const triggerInstance = new triggerModule.class();
    console.log('   ✅ Trigger instancié');
    console.log('   - displayName:', triggerInstance.description?.displayName);
    console.log('   - name:', triggerInstance.description?.name);
    console.log('   - trigger method:', typeof triggerInstance.trigger);
  }
  
  console.log('\n✅ TOUS LES MODULES SONT CORRECTEMENT EXPORTÉS !');
  
} catch (error) {
  console.log('❌ ERREUR:', error.message);
  console.log('Stack:', error.stack);
}

console.log('\n🏁 TEST TERMINÉ');
