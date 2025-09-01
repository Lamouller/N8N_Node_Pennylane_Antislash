# n8n Community Node: Pennylane (Antislash)

[![npm version](https://img.shields.io/npm/v/n8n-nodes-pennylane-antislash.svg)](https://www.npmjs.com/package/n8n-nodes-pennylane-antislash)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive n8n community node for integrating with the **Pennylane External API v2**. This node provides full access to Pennylane's accounting, invoicing, and financial management capabilities.

## 🚀 Features

- **Full API v2 Coverage**: All resources and operations from Pennylane External API v2
- **Dual Authentication**: Support for both API Token and OAuth2 authentication
- **Smart Rate Limiting**: Built-in rate limiting (5 req/s) with automatic retry/backoff
- **Cursor-based Pagination**: Automatic handling of large datasets
- **File Upload Support**: Binary file uploads for appendices and imports
- **Real-time Triggers**: Polling triggers for changelog monitoring
- **TypeScript**: Fully typed with strict type checking
- **Production Ready**: Comprehensive error handling and logging

## 📋 Supported Resources

### Core Business Entities
- **Customer Invoices** - Full CRUD, email sending, file uploads, status management
- **Supplier Invoices** - Import, validation, categorization, payment tracking
- **Customers** - Individual and company management
- **Suppliers** - Vendor relationship management
- **Products** - Catalog and pricing management

### Accounting & Finance
- **Ledger Accounts** - Chart of accounts management
- **Ledger Entries** - Journal entries with analytical categories
- **Transactions** - Bank transaction matching and reconciliation
- **Bank Accounts** - Financial institution integration
- **Journals** - Accounting journal management
- **Fiscal Years** - Financial period management

### Analytics & Reporting
- **Categories** - Analytical categorization system
- **Category Groups** - Hierarchical category organization
- **Exports** - AGL and FEC export generation
- **Templates** - Document template management

### Advanced Features
- **Quotes** - Sales quotation management
- **Commercial Documents** - Orders, delivery notes, credit notes
- **Mandates** - SEPA and GoCardless payment mandates
- **File Attachments** - Document and appendix management
- **E-Invoices** - Electronic invoice import (beta)
- **Billing Subscriptions** - Recurring billing management

## 🔐 Authentication

### API Token Authentication (Recommended)

1. **Generate API Token**:
   - Log into your Pennylane account
   - Go to **Settings** → **API** → **External API**
   - Click **Generate Token**
   - Select required scopes for your use case
   - Copy the generated token

2. **Configure in n8n**:
   - Use credential type: `Pennylane Token API`
   - Enter your API token
   - Optionally set your Company ID
   - Choose environment (Production/Sandbox)

**Required Scopes**:
- `read`: Read access to all resources
- `write`: Create, update, delete operations
- `accounting`: Ledger and accounting operations
- `invoicing`: Invoice management
- `billing`: Subscription and billing operations

### OAuth2 Authentication (For Integration Partners)

1. **Partner Registration**:
   - Contact Pennylane partnerships team
   - Register your application
   - Receive Client ID and Client Secret

2. **Configure in n8n**:
   - Use credential type: `Pennylane OAuth2 API`
   - Enter your Client ID and Client Secret
   - Set authorization and token URLs
   - Configure required scopes

## 📖 Usage Examples

### 1. Create and Send a Customer Invoice

```json
{
  "resource": "customerInvoice",
  "operation": "create",
  "customerId": "cust_123",
  "number": "INV-2024-001",
  "issueDate": "2024-01-15T00:00:00Z",
  "dueDate": "2024-02-15T00:00:00Z",
  "currency": "EUR",
  "lines": {
    "line": [
      {
        "description": "Web Development Services",
        "quantity": 40,
        "unitPrice": 75,
        "vatRate": 20,
        "categoryId": "cat_456"
      }
    ]
  }
}
```

### 2. Import Supplier Invoice from File

```json
{
  "resource": "supplierInvoice",
  "operation": "importFromFile",
  "binaryPropertyName": "invoiceFile",
  "fileName": "supplier_invoice.pdf"
}
```

### 3. Create Ledger Entry with Categories

```json
{
  "resource": "ledgerEntry",
  "operation": "create",
  "journalId": "jour_789",
  "date": "2024-01-15T00:00:00Z",
  "reference": "LE-2024-001",
  "description": "Office supplies purchase",
  "lines": {
    "line": [
      {
        "ledgerAccountId": "acc_101",
        "debit": 120,
        "credit": 0,
        "categoryId": "cat_office"
      },
      {
        "ledgerAccountId": "acc_201",
        "debit": 0,
        "credit": 120,
        "categoryId": "cat_supplies"
      }
    ]
  }
}
```

### 4. Match Bank Transaction to Invoice

```json
{
  "resource": "transaction",
  "operation": "match",
  "transactionId": "trans_123",
  "invoiceId": "inv_456",
  "matchType": "customer"
}
```

### 5. Export AGL Data

```json
{
  "resource": "export",
  "operation": "create",
  "type": "agl",
  "parameters": {
    "fiscal_year_id": "fy_2024",
    "format": "csv"
  }
}
```

### 6. Monitor Changes with Trigger

```json
{
  "resourceToWatch": "customer_invoices",
  "pollingInterval": 300,
  "pageSize": 50,
  "additionalFields": {
    "status": "sent",
    "maxItems": 1000
  }
}
```

## ⚙️ Configuration

### Rate Limiting

The node respects Pennylane's 5 requests per second limit by default. You can adjust this in **Advanced Settings**:

- **Requests per Second**: 1-10 (default: 5)
- **Automatic Retry**: Exponential backoff on 429 errors
- **Retry-After Header**: Respects server-specified delays

### Environment Selection

- **Production**: Live Pennylane environment
- **Sandbox**: Test environment for development

### Pagination

- **Automatic**: Handles cursor-based pagination transparently
- **Configurable**: Set page size and maximum items
- **Efficient**: Only fetches data when needed

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- transport.test.ts
```

### Integration Tests

Set environment variables for live testing:

```bash
export PENNYLANE_API_TOKEN="your_token"
export PENNYLANE_COMPANY_ID="your_company_id"
export PENNYLANE_ENVIRONMENT="sandbox"

npm test -- --testNamePattern="integration"
```

## 🚨 Error Handling

### Common Error Codes

- **401 Unauthorized**: Invalid or expired credentials
- **403 Forbidden**: Insufficient scope permissions
- **429 Too Many Requests**: Rate limit exceeded (auto-retry)
- **400 Bad Request**: Validation errors in request data

### Scope Error Example

```json
{
  "error": "Insufficient Scope",
  "message": "Operation requires scope: write:invoices. Current scope: read:invoices",
  "required_scope": "write:invoices",
  "scope": "read:invoices"
}
```

### Troubleshooting

1. **Authentication Issues**:
   - Verify API token is valid and not expired
   - Check Company ID is correct
   - Ensure OAuth2 credentials are properly configured

2. **Rate Limiting**:
   - Reduce requests per second setting
   - Implement proper delays between operations
   - Use batch operations when possible

3. **File Upload Issues**:
   - Ensure binary property contains valid file data
   - Check file size limits (typically 10MB)
   - Verify file format is supported

4. **Scope Errors**:
   - Review required scopes for your operations
   - Regenerate API token with appropriate permissions
   - Contact Pennylane support for scope clarification

## 📚 API Reference

For detailed API documentation, visit:
- [Pennylane API Reference](https://pennylane.readme.io/reference)
- [Authentication Guide](https://pennylane.readme.io/docs/generating-my-api-token)
- [OAuth2 Walkthrough](https://pennylane.readme.io/docs/oauth-20-walkthrough)
- [Rate Limiting](https://pennylane.readme.io/docs/rate-limiting-1)
- [Pagination Guide](https://pennylane.readme.io/docs/using-cursor-based-pagination)

## 🔧 Development

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- TypeScript knowledge

### Setup

```bash
# Clone repository
git clone https://github.com/trystanlamouller/n8n-nodes-pennylane-antislash.git
cd n8n-nodes-pennylane-antislash

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

```
src/
├── credentials/           # Authentication credentials
├── helpers/              # Utility functions and transport layer
│   ├── mappers/         # Type definitions and mappers
│   ├── transport.ts     # HTTP client with retry/pagination
│   └── loadOptions.ts   # Dynamic dropdown loaders
├── nodes/               # Main node implementations
│   └── Pennylane/      # Pennylane resource nodes
└── triggers/            # Trigger node implementations
    └── PennylaneTrigger/ # Changelog polling trigger
```

### Adding New Resources

1. Create resource file in `src/nodes/Pennylane/resources/`
2. Implement required operations (CRUD, custom actions)
3. Add to main node's resource list
4. Create corresponding load options
5. Add unit tests
6. Update documentation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Use strict type checking
- Write comprehensive JSDoc comments
- Maintain consistent code formatting
- Follow n8n node patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/trystanlamouller/n8n-nodes-pennylane-antislash/issues)
- **Discussions**: [GitHub Discussions](https://github.com/trystanlamouller/n8n-nodes-pennylane-antislash/discussions)
- **Documentation**: [Pennylane API Docs](https://pennylane.readme.io/)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## 🙏 Acknowledgments

- Pennylane team for excellent API documentation
- n8n community for the robust node framework
- Contributors and maintainers

---

**Made with ❤️ by the n8n Community**
