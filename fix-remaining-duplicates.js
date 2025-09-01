// Deuxième passe pour éliminer les doublons restants
const fs = require('fs');
const path = require('path');

console.log('🔥 DEUXIÈME PASSE - Élimination des doublons restants\n');

// Mapping spécifique pour éviter les conflits
const specificMappings = {
  'CustomerInvoices.resource.ts': {
    'customerId': 'customerInvoiceId',
    'customerFilters': 'customerInvoiceFilters',
    'customerPaymentData': 'customerInvoicePaymentData',
    'customerEmailData': 'customerInvoiceEmailData'
  },
  'SupplierInvoices.resource.ts': {
    'supplierId': 'supplierInvoiceId', 
    'supplierFilters': 'supplierInvoiceFilters',
    'supplierPaymentData': 'supplierInvoicePaymentData'
  },
  'CustomerInvoiceTemplates.resource.ts': {
    'customerFilters': 'customerTemplateFilters'
  },
  'CategoryGroups.resource.ts': {
    'categoryId': 'categoryGroupId',
    'categoryFilters': 'categoryGroupFilters'
  }
};

// Lire tous les fichiers de ressources
const resourcesDir = './src/nodes/Pennylane/resources';
const resourceFiles = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.resource.ts'));

console.log(`🔍 Processing specific files for remaining duplicates...\n`);

let totalChanges = 0;

Object.entries(specificMappings).forEach(([fileName, mappings]) => {
  const filePath = path.join(resourcesDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;
  
  console.log(`📄 Processing ${fileName}...`);
  
  Object.entries(mappings).forEach(([oldName, newName]) => {
    const pattern = new RegExp(`name: '${oldName}'`, 'g');
    const matches = content.match(pattern);
    
    if (matches && matches.length > 0) {
      console.log(`   🔄 Renaming '${oldName}' → '${newName}' (${matches.length} occurrences)`);
      content = content.replace(pattern, `name: '${newName}'`);
      fileChanges += matches.length;
    }
  });
  
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`   ✅ Saved ${fileChanges} changes`);
    totalChanges += fileChanges;
  } else {
    console.log(`   📝 No changes needed`);
  }
  
  console.log('');
});

// Gestion spéciale du problème 'operation'
console.log('🔍 Handling "operation" duplicates...\n');

resourceFiles.forEach(file => {
  const filePath = path.join(resourcesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Chercher des définitions de propriété nommée 'operation' (pas les références)
  const operationPropertyPattern = /{\s*displayName:[^}]*name:\s*'operation'[^}]*}/g;
  const matches = content.match(operationPropertyPattern);
  
  if (matches && matches.length > 0) {
    console.log(`📄 Found 'operation' property definition in ${file}`);
    console.log(`   Context: ${matches[0].substring(0, 100)}...`);
    
    // Si c'est une propriété personnalisée (pas la référence au champ operation principal)
    // on peut la renommer. Sinon, on la laisse.
    const resourceName = file.replace('.resource.ts', '').toLowerCase();
    
    if (matches[0].includes('displayName') && !matches[0].includes('Operation')) {
      const newName = `${resourceName}Operation`;
      console.log(`   🔄 Could rename to '${newName}' (manual review recommended)`);
    }
  }
});

console.log(`\n🎯 TOTAL DEUXIÈME PASSE: ${totalChanges} propriétés renommées\n`);

if (totalChanges > 0) {
  console.log('🔄 Rebuilding...');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch (error) {
    console.log('❌ Build failed:', error.message);
  }
  
  console.log('\n🧪 Final test for duplicates...');
  
  try {
    execSync('node debug-workflow-validation.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
} else {
  console.log('💡 Pas de changements nécessaires dans cette passe.');
}
