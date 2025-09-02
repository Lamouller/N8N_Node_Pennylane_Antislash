# n8n-nodes-pennylane-new-antislash

🚀 **Node n8n officiel pour l'API Pennylane v2 - Complet & Production-Ready**

## ✨ Fonctionnalités

- 🎯 **100% Couverture API** - Tous les endpoints Pennylane v2
- 🛠️ **CRUD Complet** - Create, Read, Update, Delete
- 🔄 **Trigger Node** - Monitoring temps réel via Changelogs
- 📋 **Interface Intuitive** - Dropdowns, validation, UI/UX optimisée
- ➕ **Boutons Add/Remove** - Gestion dynamique des lignes de facture
- 🎨 **4 Méthodes de Création** - Simple, Advanced, Dynamic, JSON Template

## 🚀 Installation

```bash
npm install n8n-nodes-pennylane-new-antislash
```

## 📋 Ressources Supportées

### 👥 Commercial
- **Customer** - Clients (entreprise/particulier)
- **Product** - Produits/services
- **Customer Invoice** - Factures clients avec lignes multiples
- **Quote** - Devis

### 🏢 Fournisseurs
- **Supplier** - Fournisseurs
- **Supplier Invoice** - Factures fournisseurs

### 💳 Financier
- **Bank Account** - Comptes bancaires
- **Transaction** - Transactions
- **SEPA Mandate** - Mandats SEPA
- **GoCardless Mandate** - Mandats GoCardless

### 📊 Comptabilité
- **Journal** - Journaux comptables
- **Ledger Account** - Plan comptable
- **Ledger Entry** - Écritures comptables
- **Trial Balance** - Balance comptable
- **Fiscal Year** - Exercices fiscaux

### 🏷️ Catégorisation
- **Category** - Catégories analytiques
- **Category Group** - Groupes de catégories

### 🔄 Monitoring
- **Customer Invoice Changes** - Changements factures clients
- **Supplier Invoice Changes** - Changements factures fournisseurs
- **Customer Changes** - Changements clients
- **Supplier Changes** - Changements fournisseurs
- **Product Changes** - Changements produits
- **Transaction Changes** - Changements transactions

## 🎯 Création de Factures - 4 Méthodes

### 1. 📝 Simple Invoice (Quick)
Création rapide 1 ligne
```
Customer + Product + Quantity = Facture
```

### 2. 📋 Advanced Invoice (JSON Lines)
Lignes multiples via JSON
```json
[
  {
    "product_id": 123,
    "quantity": "2",
    "raw_currency_unit_price": "7500",
    "unit": "hour",
    "vat_rate": "FR_200",
    "label": "Consultation IT",
    "discount_amount": "200"
  }
]
```

### 3. ➕ Dynamic Lines (Add/Remove) - **RECOMMANDÉ**
Interface avec vrais boutons Add/Remove
```
┌─────────────────────────────────────┐
│ 📦 Product: [Dropdown]             │
│ 🔢 Quantity: 2.5                   │
│ 💰 Unit Price (cents): 7500        │
│ 📝 Label: "Consultation IT"        │
│ 📏 Unit: Hour ▼                    │
│ 🎯 VAT Rate: 20% (FR_200) ▼        │
│ 💸 Discount: 200 cents             │
└─────────────────────────────────────┘
[➕ Add Line] [🗑️ Remove]
```

### 4. 📄 JSON Template (Complete)
Contrôle total avec JSON complet

## 🔧 Configuration

### 1. Credentials
- **API Token** : Votre token API Pennylane
- **Company ID** : ID de votre société

### 2. Authentification
Le node utilise l'authentification Bearer Token pour tous les appels API.

## 🎯 Exemples d'Usage

### Créer un Client
```
Resource: Customer
Operation: Create
Customer Type: Company
Name: "Ma Société"
Email: "contact@masociete.fr"
SIRET: "12345678901234"
```

### Créer une Facture Multi-Lignes
```
Resource: Customer Invoice
Operation: Create
Method: ➕ Dynamic Lines (Add/Remove)

Line 1:
- Product: Consultation IT
- Quantity: 2
- Unit Price: 7500 (75.00€)
- Unit: hour
- Discount: 200 cents

Line 2:
- Product: Formation
- Quantity: 1
- Unit Price: 15000 (150.00€)
- Unit: day

Global Discount: 10%
```

### Trigger - Monitoring Temps Réel
```
Trigger: Pennylane Trigger
Resource Type: Customer Invoices
Event Types: Created, Updated
Poll Interval: 60 seconds
```

## 📚 Documentation API

Basé sur l'API officielle Pennylane v2 :
https://pennylane.readme.io/reference

## 🐛 Support

- **Issues** : [GitHub Issues](https://github.com/Lamouller/n8n-nodes-pennylane-new-antislash/issues)
- **Documentation** : [Pennylane API Docs](https://pennylane.readme.io/reference)

## 📄 License

MIT

## 🎉 Contributors

Développé par Lamouller - [@Lamouller](https://github.com/Lamouller)

---

⭐ **Si ce node vous aide, n'hésitez pas à mettre une étoile sur GitHub !**
