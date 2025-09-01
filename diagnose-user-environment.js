// Script pour aider l'utilisateur à diagnostiquer son environnement n8n
console.log('🔍 DIAGNOSTIC ENVIRONNEMENT N8N - Guide utilisateur\n');

console.log('Pour identifier la cause exacte de votre erreur, veuillez exécuter ces commandes dans votre environnement n8n et me communiquer les résultats :\n');

console.log('📋 INFORMATIONS REQUISES :\n');

console.log('1️⃣ VERSION N8N :');
console.log('   Commande : n8n --version');
console.log('   (Ou dans Railway : vérifiez la version dans les logs de démarrage)\n');

console.log('2️⃣ STATUT DU PACKAGE :');
console.log('   Commande : npm list n8n-nodes-pennylane-antislash');
console.log('   (Vérifiez que la version 2.6.0 est bien installée)\n');

console.log('3️⃣ REDÉMARRAGE COMPLET :');
console.log('   - Sur Railway : Redéployez complètement votre application');
console.log('   - En local : Arrêtez n8n complètement, videz le cache, redémarrez\n');

console.log('4️⃣ TEST AVEC WORKFLOW MINIMAL :');
console.log('   Créez un nouveau workflow avec SEULEMENT :');
console.log('   - Un node Pennylane');
console.log('   - Resource : Customer');
console.log('   - Operation : Get All');
console.log('   - Laissez tous les champs optionnels vides\n');

console.log('5️⃣ LOGS D\'ERREUR DÉTAILLÉS :');
console.log('   Activez le debug dans n8n et capturez l\'erreur complète');
console.log('   (pas seulement "workflow has issues")\n');

console.log('6️⃣ COMPARAISON AVEC VOS AUTRES NODES :');
console.log('   Testez vos autres nodes NPM qui fonctionnent');
console.log('   Comparez le comportement exact\n');

console.log('🎯 QUESTIONS SPÉCIFIQUES :\n');

console.log('❓ À QUEL MOMENT EXACT l\'erreur apparaît-elle ?');
console.log('   a) Lors de l\'ajout du node au workflow ?');
console.log('   b) Lors de la sauvegarde du workflow ?');
console.log('   c) Lors de l\'exécution du workflow ?');
console.log('   d) Lors de la configuration des paramètres ?\n');

console.log('❓ VOYEZ-VOUS les champs du node correctement ?');
console.log('   - Resource dropdown visible ?');
console.log('   - Operation dropdown visible ?');
console.log('   - Credential dropdown visible ?\n');

console.log('❓ AUTRES NODES dans le même workflow :');
console.log('   - Le workflow fonctionne-t-il sans le node Pennylane ?');
console.log('   - Avez-vous d\'autres nodes dans le workflow ?\n');

console.log('💡 TESTS DE CONTOURNEMENT :\n');

console.log('🔄 Test 1 - Installation propre :');
console.log('   npm uninstall n8n-nodes-pennylane-antislash');
console.log('   Redémarrez n8n');
console.log('   npm install n8n-nodes-pennylane-antislash@2.6.0');
console.log('   Redémarrez n8n\n');

console.log('🔄 Test 2 - Workflow vierge :');
console.log('   Créez un workflow totalement nouveau');
console.log('   Ajoutez SEULEMENT le node Pennylane');
console.log('   Ne configurez RIEN d\'autre\n');

console.log('🔄 Test 3 - Credential simple :');
console.log('   Créez un nouveau credential avec seulement :');
console.log('   - Auth Type : API Token');
console.log('   - API Token : votre token');
console.log('   - Company ID : votre ID\n');

console.log('📊 PROCHAINES ÉTAPES :\n');
console.log('Communiquez-moi EXACTEMENT :');
console.log('✅ Version n8n');
console.log('✅ Version du package installée');
console.log('✅ Moment précis de l\'erreur');
console.log('✅ Message d\'erreur complet (avec stack trace si possible)');
console.log('✅ Résultat des tests de contournement');
console.log('✅ Comportement comparé avec vos autres nodes\n');

console.log('🎯 OBJECTIF : Identifier si c\'est un problème de :');
console.log('   - Cache n8n');
console.log('   - Version incompatible');
console.log('   - Configuration Railway');
console.log('   - Conflit avec autre package');
console.log('   - Credential malformé');
console.log('   - Workflow corrompu\n');

console.log('💪 Avec ces informations, nous pourrons résoudre définitivement le problème !');
