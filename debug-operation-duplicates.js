#!/usr/bin/env node

/**
 * Debug précis pour identifier d'où viennent les doublons 'operation'
 */

try {
  console.log('🔍 Debug des propriétés operation dupliquées...');
  
  const { Pennylane } = require('./dist/nodes/Pennylane/Pennylane.node.js');
  const node = new Pennylane();
  const properties = node.description.properties;
  
  // Trouver toutes les propriétés 'operation'
  const operationProps = properties.filter(p => p.name === 'operation');
  console.log(`\n📊 Total de propriétés 'operation': ${operationProps.length}`);
  
  if (operationProps.length > 1) {
    console.log('\n❌ DOUBLONS DÉTECTÉS!\n');
    
    operationProps.forEach((prop, index) => {
      console.log(`=== OPERATION #${index + 1} ===`);
      console.log(`Display Name: ${prop.displayName}`);
      console.log(`Type: ${prop.type}`);
      console.log(`Default: ${prop.default}`);
      
      if (prop.displayOptions?.show?.resource) {
        console.log(`Resource: ${JSON.stringify(prop.displayOptions.show.resource)}`);
      } else {
        console.log('Resource: GLOBAL (pas de displayOptions.show.resource)');
      }
      
      if (prop.options) {
        console.log(`Options count: ${prop.options.length}`);
        console.log(`First option: ${prop.options[0]?.name} (${prop.options[0]?.value})`);
      }
      console.log('');
    });
    
    // Vérifier si ce sont exactement les mêmes objets (référence)
    const firstOp = operationProps[0];
    const duplicatesOfFirst = operationProps.filter(op => op === firstOp).length;
    console.log(`Références identiques au premier: ${duplicatesOfFirst}/${operationProps.length}`);
    
    // Vérifier les resources concernées
    const resources = operationProps
      .map(op => op.displayOptions?.show?.resource?.[0])
      .filter(r => r);
    console.log(`Resources avec operation: ${resources.join(', ')}`);
    
  } else {
    console.log('✅ Aucun doublon détecté');
  }
  
} catch (error) {
  console.error('❌ ERREUR lors du debug:');
  console.error(error.message);
  process.exit(1);
}
