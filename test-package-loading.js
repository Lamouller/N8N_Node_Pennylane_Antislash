#!/usr/bin/env node

/**
 * DIAGNOSTIC AVANCÉ - Test de chargement package n8n
 * Simule exactement ce que n8n fait lors du chargement
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC AVANCÉ - Test chargement package n8n\n');

// Simuler l'environnement n8n
process.env.NODE_ENV = 'production';

try {
  console.log('📦 ANALYSE PACKAGE.JSON:');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const n8nConfig = packageJson.n8n;
  
  console.log(`   Package: ${packageJson.name}@${packageJson.version}`);
  console.log(`   Main: ${packageJson.main}`);
  console.log(`   Files: ${JSON.stringify(packageJson.files)}`);
  console.log(`   n8nNodesApiVersion: ${n8nConfig.n8nNodesApiVersion}`);
  
  // Vérifier chaque fichier déclaré
  console.log('\n🔬 VÉRIFICATION FICHIERS DÉCLARÉS:');
  
  // Credentials
  console.log('   📋 Credentials:');
  for (const credPath of n8nConfig.credentials || []) {
    const exists = fs.existsSync(credPath);
    console.log(`      ${exists ? '✅' : '❌'} ${credPath}`);
    
    if (exists) {
      try {
        const credModule = require(path.resolve(credPath));
        console.log(`         - Keys: ${Object.keys(credModule)}`);
        console.log(`         - Class: ${typeof credModule.class}`);
        
        if (credModule.class) {
          const instance = new credModule.class();
          console.log(`         - Name: ${instance.name || 'UNDEFINED'}`);
          console.log(`         - DisplayName: ${instance.displayName || 'UNDEFINED'}`);
        }
      } catch (error) {
        console.log(`         ❌ ERREUR CHARGEMENT: ${error.message}`);
      }
    }
  }
  
  // Nodes
  console.log('   🔧 Nodes:');
  for (const nodePath of n8nConfig.nodes || []) {
    const exists = fs.existsSync(nodePath);
    console.log(`      ${exists ? '✅' : '❌'} ${nodePath}`);
    
    if (exists) {
      try {
        const nodeModule = require(path.resolve(nodePath));
        console.log(`         - Keys: ${Object.keys(nodeModule)}`);
        console.log(`         - Class: ${typeof nodeModule.class}`);
        
        if (nodeModule.class) {
          const instance = new nodeModule.class();
          const desc = instance.description;
          console.log(`         - Name: ${desc?.name || 'UNDEFINED'}`);
          console.log(`         - DisplayName: ${desc?.displayName || 'UNDEFINED'}`);
          console.log(`         - Properties: ${desc?.properties?.length || 0}`);
          console.log(`         - Execute: ${typeof instance.execute}`);
          
          // Vérifier les méthodes loadOptions
          if (instance.methods?.loadOptions) {
            console.log(`         - LoadOptions: ${Object.keys(instance.methods.loadOptions).length} méthodes`);
          }
        }
      } catch (error) {
        console.log(`         ❌ ERREUR CHARGEMENT: ${error.message}`);
        console.log(`         Stack: ${error.stack.split('\n')[1]}`);
      }
    }
  }
  
  console.log('\n🧪 TEST REQUIRE MANUEL:');
  
  // Test charge tous les modules
  const allModules = [
    ...n8nConfig.credentials,
    ...n8nConfig.nodes
  ];
  
  for (const modulePath of allModules) {
    try {
      console.log(`   📦 Test ${path.basename(modulePath)}...`);
      delete require.cache[path.resolve(modulePath)];
      const module = require(path.resolve(modulePath));
      
      if (module.class && typeof module.class === 'function') {
        const instance = new module.class();
        console.log(`      ✅ Instanciation réussie`);
      } else {
        console.log(`      ❌ Pas de classe exportée ou classe invalide`);
      }
    } catch (error) {
      console.log(`      ❌ ERREUR: ${error.message}`);
      
      // Analyser le type d'erreur
      if (error.message.includes('Cannot find module')) {
        console.log(`         → MODULE MANQUANT dans les dépendances`);
      } else if (error.message.includes('SyntaxError')) {
        console.log(`         → ERREUR DE SYNTAXE dans le code compilé`);
      } else if (error.message.includes('is not a constructor')) {
        console.log(`         → PROBLÈME D'EXPORT/IMPORT`);
      }
    }
  }
  
  console.log('\n🔎 ANALYSE DÉPENDANCES:');
  
  // Vérifier si des dépendances sont manquantes
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  console.log(`   Runtime dependencies: ${Object.keys(dependencies).length}`);
  Object.keys(dependencies).forEach(dep => {
    console.log(`      - ${dep}@${dependencies[dep]}`);
  });
  
  console.log(`   Dev dependencies: ${Object.keys(devDependencies).length}`);
  
  // Chercher des require() dans les fichiers compilés
  console.log('\n🔍 SCAN REQUIRES DANS FICHIERS COMPILÉS:');
  
  for (const modulePath of allModules) {
    if (fs.existsSync(modulePath)) {
      const content = fs.readFileSync(modulePath, 'utf8');
      const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
      
      if (requires.length > 0) {
        console.log(`   📄 ${path.basename(modulePath)}:`);
        const uniqueRequires = [...new Set(requires)];
        uniqueRequires.forEach(req => {
          const match = req.match(/require\(['"]([^'"]+)['"]\)/);
          if (match) {
            const moduleName = match[1];
            
            // Vérifier si c'est un module externe
            if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
              const isInDeps = dependencies[moduleName] || devDependencies[moduleName];
              console.log(`      ${isInDeps ? '✅' : '⚠️ '} ${req} ${!isInDeps ? '← MODULE EXTERNE' : ''}`);
            }
          }
        });
      }
    }
  }
  
} catch (error) {
  console.log('❌ ERREUR FATALE:', error.message);
  console.log('Stack:', error.stack);
}

console.log('\n🏁 DIAGNOSTIC TERMINÉ');
