# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Pennylane n8n community node
- Full Pennylane External API v2 support
- Dual authentication (API Token + OAuth2)
- Comprehensive resource coverage
- Smart rate limiting and retry logic
- Cursor-based pagination support
- File upload capabilities
- Real-time changelog triggers

### Resources Implemented
- Customer Invoices (full CRUD + operations)
- Products (full CRUD)
- Customers (load options)
- Suppliers (load options)
- Categories (load options)
- Templates (load options)
- Ledger Accounts (load options)
- Bank Accounts (load options)
- Journals (load options)
- Fiscal Years (load options)
- Users (load options)

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

## [1.0.0] - 2024-01-XX

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
