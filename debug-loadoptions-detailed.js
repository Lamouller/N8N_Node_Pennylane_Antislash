#!/usr/bin/env node

/**
 * Debug détaillé des loadOptions
 */

try {
  console.log('🔍 Debug détaillé des loadOptions...');
  
  const { Pennylane } = require('./dist/nodes/Pennylane/Pennylane.node.js');
  const node = new Pennylane();
  const properties = node.description.properties;
  
  console.log(`📊 Total de propriétés: ${properties.length}`);
  
  // Rechercher toutes les propriétés avec loadOptionsMethod
  const loadOptionsProps = [];
  
  properties.forEach((prop, index) => {
    if (prop.loadOptionsMethod) {
      loadOptionsProps.push({
        index,
        name: prop.name,
        loadOptionsMethod: prop.loadOptionsMethod,
        displayName: prop.displayName,
        type: prop.type,
        displayOptions: prop.displayOptions
      });
    }
    
    // Vérifier aussi dans les collections
    if (prop.type === 'collection' && prop.options) {
      prop.options.forEach((collectionProp, colIndex) => {
        if (collectionProp.loadOptionsMethod) {
          loadOptionsProps.push({
            index: `${index}.${colIndex}`,
            name: `${prop.name}.${collectionProp.name}`,
            loadOptionsMethod: collectionProp.loadOptionsMethod,
            displayName: collectionProp.displayName,
            type: collectionProp.type,
            displayOptions: collectionProp.displayOptions,
            parent: prop.name
          });
        }
      });
    }
  });
  
  console.log(`\n🔄 Propriétés avec loadOptionsMethod: ${loadOptionsProps.length}`);
  
  if (loadOptionsProps.length > 0) {
    console.log('\nDétails:');
    loadOptionsProps.forEach(prop => {
      console.log(`  - ${prop.name}: ${prop.loadOptionsMethod} ${prop.parent ? `(dans ${prop.parent})` : ''}`);
    });
    
    // Vérifier si les méthodes existent
    const methodsUsed = [...new Set(loadOptionsProps.map(p => p.loadOptionsMethod))];
    const methodsAvailable = Object.keys(node.methods?.loadOptions || {});
    
    console.log(`\n📋 Méthodes utilisées: ${methodsUsed.join(', ')}`);
    console.log(`📋 Méthodes disponibles: ${methodsAvailable.join(', ')}`);
    
    const missing = methodsUsed.filter(m => !methodsAvailable.includes(m));
    if (missing.length > 0) {
      console.log(`❌ Méthodes manquantes: ${missing.join(', ')}`);
    } else {
      console.log(`✅ Toutes les méthodes sont disponibles`);
    }
  } else {
    console.log('❌ Aucune propriété avec loadOptionsMethod trouvée!');
    
    // Vérifier le premier niveau des propriétés
    console.log('\n🔍 Échantillon des propriétés:');
    properties.slice(0, 10).forEach((prop, index) => {
      console.log(`  ${index}: ${prop.name} (${prop.type}) - loadOptionsMethod: ${prop.loadOptionsMethod || 'undefined'}`);
    });
  }
  
} catch (error) {
  console.error('❌ ERREUR lors du debug:');
  console.error(error.message);
  process.exit(1);
}
