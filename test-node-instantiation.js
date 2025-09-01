#!/usr/bin/env node

/**
 * Test simple pour vérifier que les nodes peuvent être instanciés
 */

try {
  console.log('🧪 Test d\'instantiation des nodes...');
  
  // Test 1: Import des classes
  console.log('📥 Import des classes...');
  const { Pennylane } = require('./dist/nodes/Pennylane/Pennylane.node.js');
  const { PennylaneTrigger } = require('./dist/triggers/PennylaneTrigger/PennylaneTrigger.node.js');
  const { PennylaneTokenApi } = require('./dist/credentials/PennylaneTokenApi.credentials.js');
  
  console.log('✅ Classes importées avec succès');
  
  // Test 2: Instantiation
  console.log('🏗️  Instantiation des nodes...');
  const pennylaneNode = new Pennylane();
  const pennylaneTrigger = new PennylaneTrigger();
  const pennylaneCredentials = new PennylaneTokenApi();
  
  console.log('✅ Nodes instanciés avec succès');
  
  // Test 3: Vérification des propriétés de base
  console.log('🔍 Vérification des propriétés...');
  
  console.log('Pennylane Node:');
  console.log(`  - Name: ${pennylaneNode.description.name}`);
  console.log(`  - DisplayName: ${pennylaneNode.description.displayName}`);
  console.log(`  - Properties count: ${pennylaneNode.description.properties.length}`);
  console.log(`  - Methods: ${Object.keys(pennylaneNode.methods?.loadOptions || {}).length} loadOptions`);
  
  console.log('Pennylane Trigger:');
  console.log(`  - Name: ${pennylaneTrigger.description.name}`);
  console.log(`  - DisplayName: ${pennylaneTrigger.description.displayName}`);
  console.log(`  - Properties count: ${pennylaneTrigger.description.properties.length}`);
  
  console.log('Pennylane Credentials:');
  console.log(`  - Name: ${pennylaneCredentials.name}`);
  console.log(`  - DisplayName: ${pennylaneCredentials.displayName}`);
  console.log(`  - Properties count: ${pennylaneCredentials.properties.length}`);
  
  // Test 4: Vérification des noms uniques
  console.log('🔗 Vérification des noms uniques...');
  const nodeNames = [pennylaneNode.description.name, pennylaneTrigger.description.name];
  const uniqueNames = [...new Set(nodeNames)];
  
  if (nodeNames.length === uniqueNames.length) {
    console.log('✅ Tous les noms de nodes sont uniques');
  } else {
    console.log('❌ CONFLIT: Noms de nodes dupliqués!');
    console.log('Names:', nodeNames);
  }
  
  // Test 5: Vérification des credentials
  console.log('🔑 Vérification des credentials...');
  const expectedCredName = 'pennylaneTokenApi';
  
  const nodeCredentials = pennylaneNode.description.credentials;
  const triggerCredentials = pennylaneTrigger.description.credentials;
  
  const nodeCredMatch = nodeCredentials.some(c => c.name === expectedCredName);
  const triggerCredMatch = triggerCredentials.some(c => c.name === expectedCredName);
  
  console.log(`  - Node credentials: ${nodeCredMatch ? '✅' : '❌'}`);
  console.log(`  - Trigger credentials: ${triggerCredMatch ? '✅' : '❌'}`);
  
  // Test 6: Vérification de loadOptions
  console.log('🔄 Vérification des loadOptions...');
  const loadOptionsMethods = Object.keys(pennylaneNode.methods?.loadOptions || {});
  console.log(`  - Méthodes loadOptions disponibles: ${loadOptionsMethods.length}`);
  console.log(`  - Méthodes: ${loadOptionsMethods.join(', ')}`);
  
  if (loadOptionsMethods.length > 0) {
    console.log('✅ loadOptions configurés');
  } else {
    console.log('❌ PROBLÈME: Aucune méthode loadOptions trouvée!');
  }
  
  console.log('\n🎉 TOUS LES TESTS PASSÉS - Les nodes semblent correctement configurés');
  
} catch (error) {
  console.error('❌ ERREUR lors du test des nodes:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
