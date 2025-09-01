#!/usr/bin/env node

/**
 * Test pour vérifier les propriétés qui pourraient causer des problèmes de validation n8n
 */

try {
  console.log('🔍 Analyse des propriétés pour problèmes potentiels...');
  
  const { Pennylane } = require('./dist/nodes/Pennylane/Pennylane.node.js');
  const node = new Pennylane();
  const properties = node.description.properties;
  
  console.log(`📊 Total de propriétés: ${properties.length}`);
  
  // Test 1: Propriétés sans displayOptions (globales)
  const globalProperties = properties.filter(p => !p.displayOptions);
  console.log(`\n🌐 Propriétés globales (sans displayOptions): ${globalProperties.length}`);
  globalProperties.forEach(p => {
    console.log(`  - ${p.name} (${p.type})`);
  });
  
  // Test 2: Propriétés avec displayOptions complexes
  const conditionalProperties = properties.filter(p => p.displayOptions);
  console.log(`\n🔀 Propriétés conditionnelles: ${conditionalProperties.length}`);
  
  // Test 3: Recherche de propriétés avec le même nom
  const propertyNames = properties.map(p => p.name);
  const duplicates = propertyNames.filter((name, index) => propertyNames.indexOf(name) !== index);
  
  if (duplicates.length > 0) {
    console.log(`\n❌ PROBLÈME DÉTECTÉ: Propriétés dupliquées!`);
    console.log(`Noms dupliqués: ${[...new Set(duplicates)].join(', ')}`);
  } else {
    console.log(`\n✅ Aucune propriété dupliquée`);
  }
  
  // Test 4: Vérification des loadOptionsMethod
  const loadOptionsProps = properties.filter(p => p.loadOptionsMethod);
  console.log(`\n🔄 Propriétés avec loadOptionsMethod: ${loadOptionsProps.length}`);
  
  const loadOptionsMethods = [...new Set(loadOptionsProps.map(p => p.loadOptionsMethod))];
  const availableMethods = Object.keys(node.methods?.loadOptions || {});
  
  console.log(`Méthodes utilisées: ${loadOptionsMethods.join(', ')}`);
  console.log(`Méthodes disponibles: ${availableMethods.join(', ')}`);
  
  const missingMethods = loadOptionsMethods.filter(method => !availableMethods.includes(method));
  if (missingMethods.length > 0) {
    console.log(`❌ PROBLÈME: Méthodes loadOptions manquantes: ${missingMethods.join(', ')}`);
  } else {
    console.log(`✅ Toutes les méthodes loadOptions sont disponibles`);
  }
  
  // Test 5: Vérification des propriétés required sans displayOptions
  const requiredGlobalProps = properties.filter(p => p.required && !p.displayOptions);
  console.log(`\n🔒 Propriétés requises globales: ${requiredGlobalProps.length}`);
  requiredGlobalProps.forEach(p => {
    console.log(`  - ${p.name} (${p.type})`);
  });
  
  // Test 6: Propriétés avec default manquant
  const propsWithoutDefault = properties.filter(p => 
    p.type !== 'notice' && 
    p.type !== 'collection' && 
    typeof p.default === 'undefined'
  );
  console.log(`\n⚠️  Propriétés sans valeur default: ${propsWithoutDefault.length}`);
  if (propsWithoutDefault.length > 0) {
    propsWithoutDefault.slice(0, 5).forEach(p => {
      console.log(`  - ${p.name} (${p.type})`);
    });
    if (propsWithoutDefault.length > 5) {
      console.log(`  ... et ${propsWithoutDefault.length - 5} autres`);
    }
  }
  
  // Test 7: Structures complexes qui pourraient poser problème
  console.log(`\n🔍 Analyse des structures complexes...`);
  
  const collectionProps = properties.filter(p => p.type === 'collection');
  console.log(`  - Collections: ${collectionProps.length}`);
  
  const multiOptionsProps = properties.filter(p => p.type === 'multiOptions');
  console.log(`  - MultiOptions: ${multiOptionsProps.length}`);
  
  const fileProps = properties.filter(p => p.type === 'file');
  console.log(`  - File inputs: ${fileProps.length}`);
  
  console.log('\n✅ Analyse terminée');
  
} catch (error) {
  console.error('❌ ERREUR lors de l\'analyse:');
  console.error(error.message);
  process.exit(1);
}
