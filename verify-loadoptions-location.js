#!/usr/bin/env node

/**
 * Vérifier exactement où sont les loadOptionsMethod
 */

try {
  console.log('🔍 Vérification de l\'emplacement des loadOptionsMethod...');
  
  const { Pennylane } = require('./dist/nodes/Pennylane/Pennylane.node.js');
  const node = new Pennylane();
  const properties = node.description.properties;
  
  console.log(`📊 Total de propriétés: ${properties.length}`);
  
  let foundInTypeOptions = 0;
  let foundInProperty = 0;
  
  const scanProperties = (props, prefix = '') => {
    props.forEach((prop, index) => {
      // Vérification directe
      if (prop.loadOptionsMethod) {
        foundInProperty++;
        console.log(`✓ Prop ${prefix}${index}: ${prop.name} -> ${prop.loadOptionsMethod}`);
      }
      
      // Vérification dans typeOptions
      if (prop.typeOptions?.loadOptionsMethod) {
        foundInTypeOptions++;
        console.log(`✓ TypeOptions ${prefix}${index}: ${prop.name} -> ${prop.typeOptions.loadOptionsMethod}`);
      }
      
      // Vérification dans les collections
      if (prop.type === 'collection' && prop.options) {
        scanProperties(prop.options, `${prefix}${index}.`);
      }
    });
  };
  
  scanProperties(properties);
  
  console.log(`\n📊 Résultats:`);
  console.log(`  - loadOptionsMethod direct: ${foundInProperty}`);
  console.log(`  - loadOptionsMethod dans typeOptions: ${foundInTypeOptions}`);
  console.log(`  - Total: ${foundInProperty + foundInTypeOptions}`);
  
  if (foundInTypeOptions > 0) {
    console.log('\n⚠️  PROBLÈME DÉTECTÉ!');
    console.log('Les loadOptionsMethod sont dans typeOptions, pas au niveau principal!');
    console.log('n8n s\'attend à les trouver directement dans la propriété.');
  }
  
} catch (error) {
  console.error('❌ ERREUR:', error.message);
  process.exit(1);
}
