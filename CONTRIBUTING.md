# Contributing to n8n-nodes-pennylane

Thank you for your interest in contributing to the Pennylane n8n community node! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- Git
- Basic knowledge of TypeScript and n8n

### Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/n8n-nodes-pennylane.git
   cd n8n-nodes-pennylane
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Build the Project**:
   ```bash
   npm run build
   ```

4. **Run Tests**:
   ```bash
   npm test
   ```

5. **Lint Code**:
   ```bash
   npm run lint
   ```

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Use strict mode and avoid `any` types
- **Formatting**: Use Prettier (configured in `.prettierrc`)
- **Linting**: Follow ESLint rules (configured in `.eslintrc.js`)
- **Naming**: Use descriptive names for variables, functions, and classes
- **Comments**: Add JSDoc comments for public methods and complex logic

### File Structure

```
src/
├── credentials/           # Authentication credentials
├── helpers/              # Utility functions
│   ├── mappers/         # Type definitions
│   ├── transport.ts     # HTTP client
│   └── loadOptions.ts   # Dynamic dropdowns
├── nodes/               # Main node implementations
│   └── Pennylane/      # Resource nodes
└── triggers/            # Trigger implementations
```

### Adding New Resources

1. **Create Resource File**:
   - Create `src/nodes/Pennylane/resources/ResourceName.resource.ts`
   - Follow the existing pattern from `CustomerInvoices.resource.ts`

2. **Implement Required Methods**:
   - `execute()`: Main execution logic
   - CRUD operations: `create()`, `get()`, `getAll()`, `update()`, `delete()`
   - Custom operations as needed

3. **Add to Main Node**:
   - Update `Pennylane.node.ts` to include the new resource
   - Add resource-specific properties and operations

4. **Create Load Options**:
   - Add corresponding functions in `loadOptions.ts`
   - Use the `loadOptionsMethod` property in node properties

5. **Add Types**:
   - Define interfaces in `src/helpers/mappers/types.ts`
   - Follow existing naming conventions

### Example Resource Structure

```typescript
export class NewResource implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'New Resource',
    name: 'newResource',
    // ... other properties
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'Create', value: 'create' },
          { name: 'Get', value: 'get' },
          // ... other operations
        ],
      },
      // ... other properties
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Implementation
  }

  // Private methods for each operation
  private async createResource(transport: any, itemIndex: number): Promise<any> {
    // Implementation
  }
}
```

## 🧪 Testing

### Writing Tests

- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API interactions (use environment variables)
- **Test Files**: Place in `test/__tests__/` directory
- **Naming**: Use descriptive test names and group related tests

### Test Structure

```typescript
describe('ResourceName', () => {
  describe('create', () => {
    it('should create a resource successfully', async () => {
      // Test implementation
    });

    it('should handle validation errors', async () => {
      // Test error handling
    });
  });
});
```

### Running Tests

```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Specific test file
npm test -- ResourceName.test.ts

# Watch mode
npm test -- --watch
```

## 🔧 Building and Testing

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Build with icons
npm run build:icons
```

### Local Testing in n8n

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Link to n8n**:
   ```bash
   # In the project directory
   npm link

   # In your n8n installation
   npm link n8n-nodes-pennylane
   ```

3. **Restart n8n** and the node should appear in the node list

## 📋 Pull Request Process

### Before Submitting

1. **Ensure Quality**:
   - All tests pass
   - Code is linted and formatted
   - No TypeScript errors
   - Documentation is updated

2. **Test Thoroughly**:
   - Test in local n8n instance
   - Verify all operations work correctly
   - Check error handling

### Pull Request Guidelines

1. **Title**: Use descriptive titles (e.g., "Add Products resource with CRUD operations")
2. **Description**: Explain what the PR adds/fixes
3. **Testing**: Describe how you tested the changes
4. **Breaking Changes**: Note any breaking changes clearly

### Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Ensure CI checks pass
- PR will be merged once approved

## 🐛 Bug Reports

### Reporting Issues

1. **Check Existing Issues**: Search for similar issues first
2. **Use Issue Template**: Fill out all required fields
3. **Provide Details**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error messages/logs

### Issue Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- n8n version:
- Node version:
- OS:
- Pennylane environment:

## Additional Information
Any other relevant details
```

## 💡 Feature Requests

### Suggesting Features

1. **Check Existing Issues**: Search for similar feature requests
2. **Describe Use Case**: Explain why the feature is needed
3. **Provide Examples**: Show how it would be used
4. **Consider Implementation**: Think about complexity and impact

## 📚 Documentation

### Updating Documentation

- **README.md**: Update for new features/resources
- **Code Comments**: Add JSDoc for new methods
- **Examples**: Provide usage examples for new operations
- **Changelog**: Document changes in CHANGELOG.md

## 🤝 Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **n8n Community**: For general n8n help

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the n8n community guidelines

## 🎯 Contribution Ideas

### Areas to Contribute

- **New Resources**: Implement missing Pennylane API resources
- **Enhanced Operations**: Add more operations to existing resources
- **Error Handling**: Improve error messages and handling
- **Testing**: Add more test coverage
- **Documentation**: Improve examples and guides
- **Performance**: Optimize API calls and data handling

### Good First Issues

- Add simple CRUD operations to existing resources
- Implement basic filtering and pagination
- Add unit tests for existing code
- Update documentation and examples

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the n8n community! 🎉
