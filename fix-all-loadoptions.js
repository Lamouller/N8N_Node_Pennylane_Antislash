#!/usr/bin/env node

/**
 * Script pour corriger automatiquement tous les loadOptionsMethod
 * De typeOptions vers niveau principal
 */

const fs = require('fs');
const path = require('path');

const resourcesDir = 'src/nodes/Pennylane/resources';

function fixLoadOptionsInFile(filePath) {
  console.log(`🔧 Correction de ${path.basename(filePath)}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  // Pattern pour identifier et corriger typeOptions avec loadOptionsMethod
  const typeOptionsPattern = /(\s+)typeOptions:\s*\{\s*\n\s+loadOptionsMethod:\s*(['"][^'"]+['"])\s*,?\s*\n\s*\},?/g;
  
  const correctedContent = content.replace(typeOptionsPattern, (match, indent, methodName) => {
    changeCount++;
    // Remplacer par loadOptionsMethod direct
    return `${indent}loadOptionsMethod: ${methodName},`;
  });
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, correctedContent, 'utf8');
    console.log(`✅ ${changeCount} correction(s) appliquée(s) dans ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️  Aucune correction nécessaire dans ${path.basename(filePath)}`);
  }
  
  return changeCount;
}

function main() {
  console.log('🚀 Correction automatique des loadOptionsMethod...\n');
  
  let totalChanges = 0;
  
  // Lister tous les fichiers .ts dans le dossier resources
  const files = fs.readdirSync(resourcesDir)
    .filter(file => file.endsWith('.resource.ts'))
    .map(file => path.join(resourcesDir, file));
  
  console.log(`📁 Traitement de ${files.length} fichiers resources...\n`);
  
  files.forEach(file => {
    const changes = fixLoadOptionsInFile(file);
    totalChanges += changes;
  });
  
  console.log(`\n🎉 Correction terminée !`);
  console.log(`📊 Total: ${totalChanges} corrections appliquées`);
  
  if (totalChanges > 0) {
    console.log('\n⚠️  N\'oubliez pas de :');
    console.log('1. Exécuter npm run build');
    console.log('2. Tester les loadOptions');
    console.log('3. Publier la nouvelle version');
  }
}

main();
