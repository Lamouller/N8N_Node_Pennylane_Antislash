# 🚨 DIAGNOSTIC - "The specified package could not be loaded"

## 🎯 CAUSES POSSIBLES

### 1. **Problème de cache n8n**
```bash
# Sur Railway, essayez:
rm -rf ~/.n8n/cache
rm -rf ~/.n8n/nodes/node_modules/n8n-nodes-pennylane-antislash
npm cache clean --force
```

### 2. **Problème de structure de fichiers**
Le package pourrait avoir des fichiers manquants ou corrompus.

### 3. **Problème de dépendances**
Les dépendances runtime (axios, form-data) pourraient causer des erreurs de chargement.

### 4. **Erreur JavaScript dans le code**
Une erreur de syntaxe ou d'import pourrait empêcher le chargement.

### 5. **Problème de permissions**
Les fichiers pourraient ne pas avoir les bonnes permissions.

## 🔧 SOLUTIONS À TESTER (dans l'ordre)

### ✅ SOLUTION 1: Forcer une installation propre
```bash
# Sur Railway:
npm uninstall n8n-nodes-pennylane-antislash
rm -rf ~/.n8n/cache
rm -rf ~/.n8n/nodes
npm cache clean --force
npm install n8n-nodes-pennylane-antislash@2.6.3-test-no-deps
```

### ✅ SOLUTION 2: Vérifier les logs détaillés
```bash
# Démarrer n8n avec logs détaillés pour voir l'erreur exacte
N8N_LOG_LEVEL=debug npm start
```

### ✅ SOLUTION 3: Installation manuelle
```bash
# Si npm install ne marche pas, essayez:
mkdir -p ~/.n8n/nodes
cd ~/.n8n/nodes
npm install n8n-nodes-pennylane-antislash@2.6.3-test-no-deps
```

### ✅ SOLUTION 4: Revenir à une version basique
```bash
# Essayez d'abord une version sans loadOptions
npm install n8n-nodes-pennylane-antislash@2.6.3-test-no-deps
```

## 🎯 TEST RAPIDE

Essayez d'abord la **SOLUTION 1** car c'est souvent un problème de cache.

Si ça ne marche toujours pas, regardez les **logs n8n au démarrage** pour voir l'erreur exacte.

## 📞 BESOIN D'AIDE

Si aucune solution ne marche, donnez-moi:
1. Les logs n8n complets au démarrage
2. Le résultat de `npm list n8n-nodes-pennylane-antislash`
3. Le contenu de `~/.n8n/nodes/` après installation
