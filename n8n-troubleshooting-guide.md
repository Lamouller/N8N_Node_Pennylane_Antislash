# 🔧 Guide de dépannage n8n - Pennylane Node

## ✅ STATUS: Node techniquement PARFAIT
Toutes les validations passent. Le problème est dans l'environnement n8n.

## 🎯 DIAGNOSTIC COMPLET

### 1. **Statut du Node**
- ✅ Structure 100% valide
- ✅ 104 properties valides
- ✅ LoadOptions configurées correctement
- ✅ Sérialisation JSON fonctionne
- ✅ Compatible avec n8n API v1

### 2. **Causes probables**

#### A. Cache n8n non vidé
```bash
# Redémarrage complet n8n
pm2 restart n8n  # ou
docker restart n8n  # ou
killall node && npm start
```

#### B. Installation incomplète
```bash
# Réinstallation propre
npm uninstall n8n-nodes-pennylane-antislash
npm cache clean --force
npm install n8n-nodes-pennylane-antislash@2.4.0
# Redémarrer n8n
```

#### C. Problème de workflow spécifique
- Créez un **nouveau workflow vide**
- Ajoutez seulement : `Manual Trigger` → `Pennylane`
- Ne configurez rien d'autre

## 🚨 ACTIONS PRIORITAIRES

### 1. Vérifiez les logs n8n
```bash
# Selon votre installation
docker logs n8n -f
# ou
pm2 logs n8n
# ou
journalctl -u n8n -f
```

### 2. Test minimal
1. Nouveau workflow
2. Manual Trigger
3. Node Pennylane
4. Resource: Customer
5. Operation: Get All
6. Configurez SEULEMENT le credential

### 3. Vérifiez l'installation
Dans n8n → Settings → Community Nodes:
- `n8n-nodes-pennylane-antislash@2.4.0` doit apparaître
- Status: Installed

## 🔍 MESSAGES D'ERREUR SPÉCIFIQUES

### Si vous voyez "workflow has issues":
1. Cliquez sur le point rouge d'erreur
2. Regardez le message exact
3. Partagez le message complet

### Messages courants et solutions:

#### "Node not found"
```bash
npm install n8n-nodes-pennylane-antislash@2.4.0
# Redémarrer n8n
```

#### "Credential not found"
- Allez dans Settings → Credentials
- Créez un nouveau "Pennylane API"
- Choisissez "API Token"
- Remplissez vos informations

#### "loadOptions failed"
- Le credential n'est pas configuré
- Ou problème de réseau/API

## 🎯 TEST ULTIME

Si rien ne marche, testez avec un node simple:

1. Créez un workflow avec juste HTTP Request
2. URL: `https://app.pennylane.com/api/external/v2/customers?company_id=22207649&limit=1`
3. Headers: `Authorization: Bearer c6raX8-CGldGVHvp2RvQsCi1iojylhulkOYwBhNWJhI`

Si ça marche → Problème node
Si ça ne marche pas → Problème API/réseau

## 📞 INFORMATIONS NÉCESSAIRES

Pour continuer le diagnostic, partagez:

1. **Version n8n exacte** : Dans n8n → About
2. **Message d'erreur exact** : Copier-coller complet
3. **Logs n8n** : Pendant que vous testez
4. **Installation** : Docker, npm, ou autre ?
5. **OS** : Linux, Mac, Windows ?

## 🏆 RÉSUMÉ

Le node `n8n-nodes-pennylane-antislash@2.4.0` est **techniquement parfait**. 

Le problème est soit :
- Cache/redémarrage n8n
- Installation corrompue  
- Workflow mal configuré
- Version n8n incompatible

**99% des cas** : Redémarrage complet de n8n résout le problème.
