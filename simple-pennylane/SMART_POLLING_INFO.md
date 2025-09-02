# 🧠 Smart Polling - Trigger Optimisations

## 🚀 **NOUVELLES FONCTIONNALITÉS v1.2.4**

### **📊 Polling Intelligent :**
- **Démarre** à 2 minutes par défaut
- **S'adapte** selon l'activité détectée
- **Ralentit** progressivement si pas d'activité
- **Accélère** dès qu'il y a de l'activité

### **⚙️ Paramètres Configurables :**

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| **Poll Interval** | 2 min | Intervalle initial |
| **Smart Polling** | ✅ Activé | Active l'adaptation intelligente |
| **Max Poll Interval** | 15 min | Intervalle maximum atteint |
| **Auto-Stop After** | 0 (jamais) | Arrêt automatique après X heures |

### **🎯 Stratégie de Backoff :**

```
Vérifications vides → Nouvel intervalle
0-2 checks        → 2 min  (initial)
3-5 checks        → 3 min  (1.5x)
6-8 checks        → 4.5 min
9-11 checks       → 6.7 min
12+ checks        → 15 min (maximum)
```

### **🔄 Comportement Adaptatif :**

#### **😴 Aucune Activité :**
- Augmente progressivement l'intervalle
- Logs informatifs dans la console
- Option d'arrêt automatique

#### **🎉 Activité Détectée :**
- Remet l'intervalle à 2 minutes
- Redémarre immédiatement le polling rapide
- Métadonnées ajoutées aux événements

### **📋 Données Supplémentaires :**

Chaque événement émis contient :
```json
{
  "webhook_data": {
    "polling_info": {
      "current_interval": 2,
      "consecutive_empty": 0,
      "smart_polling": true
    }
  }
}
```

### **💡 Avantages :**

- **✅ Économie API** : Moins d'appels quand inactif
- **✅ Réactivité** : Rapide quand actif  
- **✅ Flexible** : Configurable selon les besoins
- **✅ Intelligent** : S'adapte automatiquement
- **✅ Transparent** : Logs clairs du comportement

### **🎛️ Modes d'Utilisation :**

#### **Mode Standard :**
```
Smart Polling: ✅ 
Poll Interval: 2 min
Max Poll Interval: 15 min
Auto-Stop: 0 (jamais)
```

#### **Mode Économique :**
```
Smart Polling: ✅
Poll Interval: 5 min  
Max Poll Interval: 30 min
Auto-Stop: 24h
```

#### **Mode Temps Réel :**
```
Smart Polling: ❌
Poll Interval: 1 min
(Intervalle fixe, consomme plus d'API)
```

