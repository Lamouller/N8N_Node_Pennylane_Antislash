// Debug spécifique pour "workflow has issues"
const fs = require('fs');

console.log('🔍 Debug spécifique "workflow has issues"...\n');

try {
  const { Pennylane } = require('./dist/nodes/Pennylane/Pennylane.node.js');
  const { PennylaneTokenApi } = require('./dist/credentials/PennylaneTokenApi.credentials.js');
  
  console.log('✅ Modules chargés');
  
  const node = new Pennylane();
  const credential = new PennylaneTokenApi();
  
  // Test 1: Validation de base
  console.log('\n1️⃣ VALIDATION DE BASE:');
  const desc = node.description;
  
  // Vérifications critiques n8n
  const validations = [
    { name: 'displayName', value: desc.displayName, check: v => !!v && typeof v === 'string' },
    { name: 'name', value: desc.name, check: v => !!v && /^[a-zA-Z][a-zA-Z0-9]*$/.test(v) },
    { name: 'version', value: desc.version, check: v => typeof v === 'number' && v > 0 },
    { name: 'group', value: desc.group, check: v => Array.isArray(v) && v.length > 0 },
    { name: 'inputs', value: desc.inputs, check: v => Array.isArray(v) },
    { name: 'outputs', value: desc.outputs, check: v => Array.isArray(v) },
    { name: 'properties', value: desc.properties, check: v => Array.isArray(v) && v.length > 0 },
    { name: 'credentials', value: desc.credentials, check: v => Array.isArray(v) && v.length > 0 },
    { name: 'execute', value: node.execute, check: v => typeof v === 'function' }
  ];
  
  validations.forEach(validation => {
    const passed = validation.check(validation.value);
    console.log(`   ${passed ? '✅' : '❌'} ${validation.name}: ${passed ? 'OK' : 'INVALID'} (${typeof validation.value})`);
    if (!passed) {
      console.log(`      Value: ${JSON.stringify(validation.value)}`);
    }
  });
  
  // Test 2: Validation des properties en détail
  console.log('\n2️⃣ VALIDATION DES PROPERTIES:');
  const properties = desc.properties;
  console.log(`   Total properties: ${properties.length}`);
  
  let errorCount = 0;
  let criticalErrors = [];
  
  properties.forEach((prop, index) => {
    const errors = [];
    
    // Vérifications essentielles
    if (!prop.displayName) errors.push('missing displayName');
    if (!prop.name) errors.push('missing name');
    if (!prop.type) errors.push('missing type');
    
    // Vérifications par type
    if (prop.type === 'options') {
      if (!prop.options && !prop.typeOptions?.loadOptionsMethod) {
        errors.push('options type needs options array or loadOptionsMethod');
      }
    }
    
    if (prop.type === 'collection') {
      if (!prop.options || !Array.isArray(prop.options)) {
        errors.push('collection needs options array');
      }
    }
    
    // Vérification displayOptions
    if (prop.displayOptions) {
      if (typeof prop.displayOptions !== 'object') {
        errors.push('invalid displayOptions');
      } else {
        // Vérifier la structure des displayOptions
        if (prop.displayOptions.show && typeof prop.displayOptions.show !== 'object') {
          errors.push('invalid displayOptions.show');
        }
        if (prop.displayOptions.hide && typeof prop.displayOptions.hide !== 'object') {
          errors.push('invalid displayOptions.hide');
        }
      }
    }
    
    // Vérification du nom (ne doit pas avoir de caractères spéciaux)
    if (prop.name && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(prop.name)) {
      errors.push('invalid name format');
    }
    
    if (errors.length > 0) {
      errorCount++;
      if (errorCount <= 5) {  // Montrer seulement les 5 premières erreurs
        criticalErrors.push({
          index,
          name: prop.name || 'UNNAMED',
          displayName: prop.displayName || 'NO_DISPLAY_NAME',
          type: prop.type || 'NO_TYPE',
          errors
        });
      }
    }
  });
  
  if (errorCount > 0) {
    console.log(`   ❌ ${errorCount} properties avec erreurs`);
    console.log('   🔍 Premières erreurs:');
    criticalErrors.forEach(prop => {
      console.log(`      [${prop.index}] ${prop.name} (${prop.type}): ${prop.errors.join(', ')}`);
    });
    if (errorCount > 5) {
      console.log(`      ... et ${errorCount - 5} autres erreurs`);
    }
  } else {
    console.log('   ✅ Toutes les properties sont valides');
  }
  
  // Test 3: Validation des credentials
  console.log('\n3️⃣ VALIDATION DES CREDENTIALS:');
  if (desc.credentials && desc.credentials.length > 0) {
    desc.credentials.forEach((cred, i) => {
      console.log(`   Credential ${i + 1}:`);
      console.log(`     name: ${cred.name || 'MISSING'}`);
      console.log(`     required: ${cred.required}`);
      
      // Vérifier que le nom du credential est valide
      if (!cred.name || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(cred.name)) {
        console.log(`     ❌ INVALID credential name format`);
      } else {
        console.log(`     ✅ Valid credential name`);
      }
    });
  } else {
    console.log('   ❌ No credentials defined');
  }
  
  // Test 4: Validation JSON
  console.log('\n4️⃣ VALIDATION JSON:');
  try {
    const serialized = JSON.stringify(desc);
    const deserialized = JSON.parse(serialized);
    console.log('   ✅ JSON serialization/deserialization OK');
    console.log(`   📏 JSON size: ${serialized.length} chars`);
    
    // Vérifier s'il y a des fonctions dans les propriétés
    const hasInvalidContent = serialized.includes('function') || serialized.includes('[object Object]');
    if (hasInvalidContent) {
      console.log('   ⚠️ Possible invalid content detected in JSON');
    }
    
  } catch (error) {
    console.log('   ❌ JSON serialization failed:', error.message);
    console.log('   💡 This could cause "workflow has issues" error');
  }
  
  // Test 5: Recherche de patterns problématiques
  console.log('\n5️⃣ RECHERCHE DE PATTERNS PROBLÉMATIQUES:');
  
  // Rechercher des propriétés avec des noms en conflit
  const propertyNames = properties.map(p => p.name).filter(Boolean);
  const duplicateNames = propertyNames.filter((name, index) => propertyNames.indexOf(name) !== index);
  
  if (duplicateNames.length > 0) {
    console.log(`   ❌ Duplicate property names: ${[...new Set(duplicateNames)].join(', ')}`);
  } else {
    console.log('   ✅ No duplicate property names');
  }
  
  // Rechercher des loadOptions methods non utilisées
  if (node.methods && node.methods.loadOptions) {
    const availableMethods = Object.keys(node.methods.loadOptions);
    const usedMethods = new Set();
    
    // Recherche récursive des loadOptions utilisées
    function findLoadOptions(props) {
      props.forEach(prop => {
        if (prop.typeOptions?.loadOptionsMethod) {
          usedMethods.add(prop.typeOptions.loadOptionsMethod);
        }
        if (prop.options && Array.isArray(prop.options)) {
          prop.options.forEach(option => {
            if (option.properties) {
              findLoadOptions(option.properties);
            }
          });
        }
      });
    }
    
    findLoadOptions(properties);
    
    console.log(`   📊 LoadOptions methods: ${availableMethods.length} available, ${usedMethods.size} used`);
    
    const unusedMethods = availableMethods.filter(m => !usedMethods.has(m));
    if (unusedMethods.length > 0) {
      console.log(`   ⚠️ Unused loadOptions methods: ${unusedMethods.slice(0, 5).join(', ')}`);
    }
    
    // Vérifier les méthodes manquantes
    const missingMethods = [...usedMethods].filter(m => !availableMethods.includes(m));
    if (missingMethods.length > 0) {
      console.log(`   ❌ Missing loadOptions methods: ${missingMethods.join(', ')}`);
    }
  }
  
  console.log('\n🎯 DIAGNOSTIC "WORKFLOW HAS ISSUES":');
  
  if (errorCount > 0) {
    console.log('❌ DES ERREURS ONT ÉTÉ DÉTECTÉES dans les properties');
    console.log('   → Ces erreurs peuvent causer "workflow has issues"');
    console.log('   → Corrigez les erreurs listées ci-dessus');
  } else {
    console.log('✅ Aucune erreur détectée dans la structure du node');
    console.log('   → Le problème peut être:');
    console.log('     1. Cache n8n non vidé');
    console.log('     2. Version n8n incompatible');
    console.log('     3. Installation corrompue');
    console.log('     4. Conflit avec un autre node');
  }
  
  console.log('\n💡 ACTIONS RECOMMANDÉES:');
  console.log('1. Si des erreurs ❌ ci-dessus → Les corriger');
  console.log('2. Si pas d\'erreurs → Redémarrer n8n complètement');
  console.log('3. Vérifier version n8n (doit être compatible avec n8nNodesApiVersion: 1)');
  console.log('4. Réinstaller le package proprement');
  
} catch (error) {
  console.log('❌ ERREUR FATALE:', error.message);
  console.log('Stack:', error.stack?.split('\n').slice(0, 10).join('\n'));
}
