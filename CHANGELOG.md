# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2023-12-XX

### Added - Complete Accounting Module
- **📊 Journals**: Full accounting journal management (create, get, list)
- **📋 Ledger Accounts**: Complete chart of accounts management 
- **📝 Ledger Entries**: Full accounting entries with lines support
- **💳 Mandates**: SEPA and GoCardless mandate management (create, update, delete, email, associate, cancel)
- **🔄 Billing Subscriptions**: Recurring subscription management with invoice line tracking
- **⚡ E-Invoices**: Electronic invoice import (BETA)
- **🔧 Enhanced LoadOptions**: Real API calls instead of sample data for all dropdowns

### Improved
- **📞 Dynamic Dropdowns**: All load options now fetch real data from Pennylane API
- **🏗️ Better Architecture**: More modular resource structure
- **🔐 Enhanced Security**: Better scope handling for accounting operations

### Resources Added (5 new)
- ✅ Journals (3 operations)
- ✅ Ledger Accounts (3 operations)
- ✅ Ledger Entries (5 operations) 
- ✅ Mandates (8 operations - SEPA & GoCardless)
- ✅ Billing Subscriptions (6 operations)
- ✅ E-Invoices (1 import operation)

## [1.1.0] - 2023-12-XX

### Added - Complete API Coverage
- **🎯 All Major Resources**: Implemented full CRUD operations for all Pennylane API v2 resources
- **👥 Customer Management**: Full CRUD operations with advanced filtering
- **🏢 Supplier Management**: Complete supplier lifecycle management
- **📄 Supplier Invoices**: Full management including payment tracking, file uploads, and import
- **💼 Quotes**: Complete quote lifecycle (create, send, accept, refuse, convert to invoice)
- **🏷️ Categories**: Analytical category management with hierarchy support
- **🏦 Bank Accounts**: Complete bank account management and configuration
- **💳 Transactions**: Advanced transaction management with reconciliation
- **📎 File Attachments**: Upload, download, and manage attachments for any resource
- **👤 Users**: Complete user management and invitation system
- **📊 Exports**: Advanced reporting (FEC, Trial Balance, Analytical Ledger)

### Enhanced
- **📈 Customer Invoices**: Added finalize, payment tracking, email sending, appendix upload, import
- **🛍️ Products**: Complete product lifecycle with category management
- **🔒 Security**: Better error handling and scope validation
- **⚡ Performance**: Optimized API calls and resource management

### Resources Now Fully Implemented
- ✅ Customer Invoices (15+ operations)
- ✅ Supplier Invoices (8+ operations) 
- ✅ Customers (full CRUD)
- ✅ Suppliers (full CRUD)
- ✅ Products (full CRUD)
- ✅ Quotes (9+ operations)
- ✅ Categories (full CRUD)
- ✅ Bank Accounts (full CRUD)
- ✅ Transactions (6+ operations)
- ✅ File Attachments (6+ operations)
- ✅ Users (7+ operations)
- ✅ Exports (7+ operations)

### Features
- Automatic retry with exponential backoff
- Rate limiting (5 req/s default, configurable 1-10)
- Environment selection (Production/Sandbox)
- Comprehensive error handling
- Scope-aware error messages
- Binary file upload support
- Dynamic dropdown loaders
- TypeScript with strict typing

### Technical
- Built with TypeScript
- ESLint + Prettier configuration
- Jest testing framework
- GitHub Actions CI/CD
- Comprehensive documentation
- Contributing guidelines

## [1.0.2] - 2023-12-XX

### Fixed
- 🎨 Logo display in n8n interface
- 🔧 Icon path structure in build process
- 📝 Repository URL consistency

## [1.0.1] - 2023-12-XX

### Added
- 🎨 Custom Pennylane logo integration

## [1.0.0] - 2023-12-XX

### Added
- Initial release
- Core Pennylane integration capabilities
- Basic resource operations
- Authentication systems
- Transport layer with retry logic
- Pagination helpers
- Load options for dynamic dropdowns
- Trigger node for changelog monitoring

### Known Issues
- Some advanced resources not yet implemented
- Limited test coverage for edge cases
- Documentation may need expansion

---

## Version History

- **1.0.0**: Initial release with core functionality
- **Future versions**: Will include additional resources, enhanced operations, and improved features

## Contributing to Changelog

When adding new features or fixing bugs, please update this changelog following the established format. Include:

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

## Release Process

1. **Development**: Features developed in feature branches
2. **Testing**: Comprehensive testing in development
3. **Release Candidate**: Tagged release candidate for testing
4. **Release**: Tagged release with changelog updates
5. **Documentation**: Updated documentation and examples
