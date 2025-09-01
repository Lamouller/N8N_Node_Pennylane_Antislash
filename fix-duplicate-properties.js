// Script pour corriger les noms de propriétés dupliqués
const fs = require('fs');
const path = require('path');

console.log('🔥 CORRECTION CRITIQUE - Noms de propriétés dupliqués\n');

// Mapping des ressources et leurs préfixes uniques
const resourceMappings = {
  'customer': 'customerId',
  'supplier': 'supplierId', 
  'product': 'productId',
  'category': 'categoryId',
  'user': 'userId',
  'journal': 'journalId',
  'bankAccount': 'bankAccountId',
  'ledgerAccount': 'ledgerAccountId',
  'invoice': 'invoiceId',
  'quote': 'quoteId',
  'payment': 'paymentId',
  'transaction': 'transactionId',
  'export': 'exportId',
  'billingSubscription': 'billingSubscriptionId',
  'eInvoice': 'eInvoiceId',
  'ledgerEntry': 'ledgerEntryId'
};

// Noms problématiques identifiés
const duplicateNames = ['operation', 'id', 'paymentData', 'filters', 'emailData'];

console.log('📋 Propriétés dupliquées à corriger:', duplicateNames.join(', '));

// Lire tous les fichiers de ressources
const resourcesDir = './src/nodes/Pennylane/resources';
const resourceFiles = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.resource.ts'));

console.log(`\n🔍 Scanning ${resourceFiles.length} resource files...\n`);

let totalChanges = 0;

resourceFiles.forEach(file => {
  const filePath = path.join(resourcesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;
  
  // Extraire le nom de la ressource du nom de fichier
  const resourceName = file.replace('.resource.ts', '').toLowerCase();
  
  console.log(`📄 Processing ${file}...`);
  
  // Identifier le nom de la ressource dans le contenu pour créer le préfix
  let resourceKey = null;
  for (const [key, prefix] of Object.entries(resourceMappings)) {
    if (resourceName.includes(key.toLowerCase())) {
      resourceKey = key;
      break;
    }
  }
  
  if (!resourceKey) {
    // Fallback: utiliser le nom du fichier comme clé
    resourceKey = resourceName.replace(/s$/, ''); // Enlever le 's' final si présent
  }
  
  console.log(`   📋 Resource key: ${resourceKey}`);
  
  // Pour chaque propriété dupliquée, créer une version unique
  duplicateNames.forEach(dupName => {
    if (dupName === 'id') {
      // Cas spécial pour 'id' - le renommer avec le nom de la ressource
      const newName = `${resourceKey}Id`;
      const pattern = new RegExp(`name: '${dupName}'`, 'g');
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        console.log(`   🔄 Renaming '${dupName}' → '${newName}' (${matches.length} occurrences)`);
        content = content.replace(pattern, `name: '${newName}'`);
        fileChanges += matches.length;
      }
    } else if (dupName === 'filters') {
      // Cas spécial pour 'filters' - le renommer avec le nom de la ressource
      const newName = `${resourceKey}Filters`;
      const pattern = new RegExp(`name: '${dupName}'`, 'g');
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        console.log(`   🔄 Renaming '${dupName}' → '${newName}' (${matches.length} occurrences)`);
        content = content.replace(pattern, `name: '${newName}'`);
        fileChanges += matches.length;
      }
    } else if (dupName === 'paymentData') {
      // Cas spécial pour 'paymentData'
      const newName = `${resourceKey}PaymentData`;
      const pattern = new RegExp(`name: '${dupName}'`, 'g');
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        console.log(`   🔄 Renaming '${dupName}' → '${newName}' (${matches.length} occurrences)`);
        content = content.replace(pattern, `name: '${newName}'`);
        fileChanges += matches.length;
      }
    } else if (dupName === 'emailData') {
      // Cas spécial pour 'emailData'
      const newName = `${resourceKey}EmailData`;
      const pattern = new RegExp(`name: '${dupName}'`, 'g');
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        console.log(`   🔄 Renaming '${dupName}' → '${newName}' (${matches.length} occurrences)`);
        content = content.replace(pattern, `name: '${newName}'`);
        fileChanges += matches.length;
      }
    } else if (dupName === 'operation') {
      // Ne pas renommer 'operation' car c'est probablement une référence au champ principal
      // Mais vérifier s'il y a effectivement un conflit
      const pattern = new RegExp(`name: '${dupName}'`, 'g');
      const matches = content.match(pattern);
      
      if (matches && matches.length > 0) {
        console.log(`   ⚠️  Found '${dupName}' (${matches.length} occurrences) - manual review needed`);
      }
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

console.log(`🎯 TOTAL: ${totalChanges} propriétés renommées dans ${resourceFiles.length} fichiers\n`);

if (totalChanges > 0) {
  console.log('🔄 Rebuilding...');
  
  // Rebuild pour s'assurer que les changements sont pris en compte
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch (error) {
    console.log('❌ Build failed:', error.message);
  }
  
  console.log('\n🧪 Testing for remaining duplicates...');
  
  // Re-test pour vérifier
  try {
    execSync('node debug-workflow-validation.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
} else {
  console.log('💡 Aucune modification automatique possible. Révision manuelle nécessaire.');
}
