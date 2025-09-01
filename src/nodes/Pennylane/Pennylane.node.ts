import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { createTransport } from '../../helpers/transport';
import * as loadOptions from '../../helpers/loadOptions';
import { handleCustomerInvoice, customerInvoiceProperties } from './resources/CustomerInvoices.resource';
import { handleProduct, productProperties } from './resources/Products.resource';
import { handleCustomer, customerProperties } from './resources/Customers.resource';
import { handleSupplier, supplierProperties } from './resources/Suppliers.resource';
import { handleSupplierInvoice, supplierInvoiceProperties } from './resources/SupplierInvoices.resource';
import { handleQuote, quoteProperties } from './resources/Quotes.resource';
import { handleCategory, categoryProperties } from './resources/Categories.resource';
import { handleBankAccount, bankAccountProperties } from './resources/BankAccounts.resource';
import { handleTransaction, transactionProperties } from './resources/Transactions.resource';
import { handleExport, exportProperties } from './resources/Exports.resource';
import { handleUser, userProperties } from './resources/Users.resource';
import { handleFileAttachment, fileAttachmentProperties } from './resources/FileAttachments.resource';

export class Pennylane implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pennylane',
    name: 'pennylane',
    icon: 'file:pennylane.png',
    group: ['transform'],
    version: 1,
    description: 'Interact with Pennylane External API v2',
    defaults: {
      name: 'Pennylane',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'pennylaneTokenApi',
        required: true,
      },
      {
        name: 'pennylaneOAuth2Api',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Customer Invoice',
            value: 'customerInvoice',
            description: 'Manage customer invoices',
          },
          {
            name: 'Supplier Invoice',
            value: 'supplierInvoice',
            description: 'Manage supplier invoices',
          },
          {
            name: 'Customer',
            value: 'customer',
            description: 'Manage customers',
          },
          {
            name: 'Supplier',
            value: 'supplier',
            description: 'Manage suppliers',
          },
          {
            name: 'Product',
            value: 'product',
            description: 'Manage products',
          },
          {
            name: 'Quote',
            value: 'quote',
            description: 'Manage quotes',
          },
          {
            name: 'Category',
            value: 'category',
            description: 'Manage categories',
          },
          {
            name: 'Bank Account',
            value: 'bankAccount',
            description: 'Manage bank accounts',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'Manage transactions',
          },
          {
            name: 'Export',
            value: 'export',
            description: 'Generate and manage exports',
          },
          {
            name: 'User',
            value: 'user',
            description: 'Manage users',
          },
          {
            name: 'File Attachment',
            value: 'fileAttachment',
            description: 'Manage file attachments',
          },
        ],
        default: 'customerInvoice',
      },
      // Customer Invoice operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['customerInvoice'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new customer invoice',
            action: 'Create a new customer invoice',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a customer invoice by ID',
            action: 'Get a customer invoice by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all customer invoices',
            action: 'Get all customer invoices',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a customer invoice',
            action: 'Update a customer invoice',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a customer invoice (draft only)',
            action: 'Delete a customer invoice',
          },
          {
            name: 'Finalize',
            value: 'finalize',
            description: 'Finalize a draft customer invoice',
            action: 'Finalize a customer invoice',
          },
          {
            name: 'Mark as Paid',
            value: 'markAsPaid',
            description: 'Mark a customer invoice as paid',
            action: 'Mark customer invoice as paid',
          },
          {
            name: 'Send Email',
            value: 'sendEmail',
            description: 'Send customer invoice by email',
            action: 'Send customer invoice by email',
          },
          {
            name: 'Upload Appendix',
            value: 'uploadAppendix',
            description: 'Upload appendix file to invoice',
            action: 'Upload appendix to customer invoice',
          },
          {
            name: 'Import from File',
            value: 'importFromFile',
            description: 'Import customer invoices from file',
            action: 'Import customer invoices from file',
          },
        ],
        default: 'getAll',
      },

      // Supplier Invoice operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['supplierInvoice'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new supplier invoice',
            action: 'Create a new supplier invoice',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a supplier invoice by ID',
            action: 'Get a supplier invoice by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all supplier invoices',
            action: 'Get all supplier invoices',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a supplier invoice',
            action: 'Update a supplier invoice',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a supplier invoice',
            action: 'Delete a supplier invoice',
          },
          {
            name: 'Mark as Paid',
            value: 'markAsPaid',
            description: 'Mark a supplier invoice as paid',
            action: 'Mark supplier invoice as paid',
          },
          {
            name: 'Upload File',
            value: 'uploadFile',
            description: 'Upload file to supplier invoice',
            action: 'Upload file to supplier invoice',
          },
          {
            name: 'Import from File',
            value: 'importFromFile',
            description: 'Import supplier invoices from file',
            action: 'Import supplier invoices from file',
          },
        ],
        default: 'getAll',
      },

      // Customer operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['customer'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new customer',
            action: 'Create a new customer',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a customer by ID',
            action: 'Get a customer by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all customers',
            action: 'Get all customers',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a customer',
            action: 'Update a customer',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a customer',
            action: 'Delete a customer',
          },
        ],
        default: 'getAll',
      },

      // Supplier operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['supplier'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new supplier',
            action: 'Create a new supplier',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a supplier by ID',
            action: 'Get a supplier by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all suppliers',
            action: 'Get all suppliers',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a supplier',
            action: 'Update a supplier',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a supplier',
            action: 'Delete a supplier',
          },
        ],
        default: 'getAll',
      },

      // Product operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['product'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new product',
            action: 'Create a new product',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a product by ID',
            action: 'Get a product by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all products',
            action: 'Get all products',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a product',
            action: 'Update a product',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a product',
            action: 'Delete a product',
          },
        ],
        default: 'getAll',
      },

      // Quote operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['quote'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new quote',
            action: 'Create a new quote',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a quote by ID',
            action: 'Get a quote by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all quotes',
            action: 'Get all quotes',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a quote',
            action: 'Update a quote',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a quote',
            action: 'Delete a quote',
          },
          {
            name: 'Accept',
            value: 'accept',
            description: 'Accept a quote',
            action: 'Accept a quote',
          },
          {
            name: 'Refuse',
            value: 'refuse',
            description: 'Refuse a quote',
            action: 'Refuse a quote',
          },
          {
            name: 'Send Email',
            value: 'sendEmail',
            description: 'Send quote by email',
            action: 'Send quote by email',
          },
          {
            name: 'Convert to Invoice',
            value: 'convertToInvoice',
            description: 'Convert quote to invoice',
            action: 'Convert quote to invoice',
          },
        ],
        default: 'getAll',
      },

      // Category operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['category'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new category',
            action: 'Create a new category',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a category by ID',
            action: 'Get a category by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all categories',
            action: 'Get all categories',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a category',
            action: 'Update a category',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a category',
            action: 'Delete a category',
          },
        ],
        default: 'getAll',
      },

      // Bank Account operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['bankAccount'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new bank account',
            action: 'Create a new bank account',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a bank account by ID',
            action: 'Get a bank account by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all bank accounts',
            action: 'Get all bank accounts',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a bank account',
            action: 'Update a bank account',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a bank account',
            action: 'Delete a bank account',
          },
        ],
        default: 'getAll',
      },

      // Transaction operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['transaction'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new transaction',
            action: 'Create a new transaction',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a transaction by ID',
            action: 'Get a transaction by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all transactions',
            action: 'Get all transactions',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a transaction',
            action: 'Update a transaction',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a transaction',
            action: 'Delete a transaction',
          },
          {
            name: 'Reconcile',
            value: 'reconcile',
            description: 'Reconcile a transaction',
            action: 'Reconcile a transaction',
          },
        ],
        default: 'getAll',
      },

      // Export operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['export'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new export',
            action: 'Create a new export',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get an export by ID',
            action: 'Get an export by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all exports',
            action: 'Get all exports',
          },
          {
            name: 'Download',
            value: 'download',
            description: 'Download an export file',
            action: 'Download an export file',
          },
          {
            name: 'Generate FEC',
            value: 'generateFEC',
            description: 'Generate FEC export',
            action: 'Generate FEC export',
          },
          {
            name: 'Generate Trial Balance',
            value: 'generateTrialBalance',
            description: 'Generate trial balance',
            action: 'Generate trial balance',
          },
          {
            name: 'Generate Analytical Ledger',
            value: 'generateAnalyticalLedger',
            description: 'Generate analytical ledger',
            action: 'Generate analytical ledger',
          },
        ],
        default: 'getAll',
      },

      // User operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['user'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new user',
            action: 'Create a new user',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a user by ID',
            action: 'Get a user by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all users',
            action: 'Get all users',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a user',
            action: 'Update a user',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a user',
            action: 'Delete a user',
          },
          {
            name: 'Invite',
            value: 'invite',
            description: 'Invite a new user',
            action: 'Invite a new user',
          },
          {
            name: 'Resend Invitation',
            value: 'resendInvitation',
            description: 'Resend user invitation',
            action: 'Resend user invitation',
          },
        ],
        default: 'getAll',
      },

      // File Attachment operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['fileAttachment'],
          },
        },
        options: [
          {
            name: 'Upload',
            value: 'upload',
            description: 'Upload a file attachment',
            action: 'Upload a file attachment',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a file attachment by ID',
            action: 'Get a file attachment by ID',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all file attachments',
            action: 'Get all file attachments',
          },
          {
            name: 'Download',
            value: 'download',
            description: 'Download a file attachment',
            action: 'Download a file attachment',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a file attachment',
            action: 'Update a file attachment',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a file attachment',
            action: 'Delete a file attachment',
          },
        ],
        default: 'getAll',
      },

      // Common ID field
      {
        displayName: 'ID',
        name: 'id',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['get', 'update', 'delete'],
          },
        },
        required: true,
        description: 'The ID of the resource',
      },

      // Add all resource-specific properties
      ...(customerInvoiceProperties as any),
      ...(supplierInvoiceProperties as any),
      ...(customerProperties as any),
      ...(supplierProperties as any),
      ...(productProperties as any),
      ...(quoteProperties as any),
      ...(categoryProperties as any),
      ...(bankAccountProperties as any),
      ...(transactionProperties as any),
      ...(exportProperties as any),
      ...(userProperties as any),
      ...(fileAttachmentProperties as any),

      // Advanced Settings
      {
        displayName: 'Advanced Settings',
        name: 'advancedSettings',
        type: 'collection',
        placeholder: 'Add Setting',
        default: {},
        options: [
          {
            displayName: 'Requests per Second',
            name: 'requestsPerSecond',
            type: 'number',
            default: 5,
            description: 'Rate limit for API requests (1-10 rps)',
            typeOptions: {
              minValue: 1,
              maxValue: 10,
            },
          },
        ],
      },
    ],
  };

  methods = {
    loadOptions: {
      loadCustomers: loadOptions.loadCustomers,
      loadSuppliers: loadOptions.loadSuppliers,
      loadProducts: loadOptions.loadProducts,
      loadCategories: loadOptions.loadCategories,
      loadTemplates: loadOptions.loadTemplates,
      loadLedgerAccounts: loadOptions.loadLedgerAccounts,
      loadBankAccounts: loadOptions.loadBankAccounts,
      loadJournals: loadOptions.loadJournals,
      loadFiscalYears: loadOptions.loadFiscalYears,
      loadUsers: loadOptions.loadUsers,
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    let transport: any;
    try {
      transport = await createTransport(this, 'pennylaneTokenApi');
    } catch (error) {
      try {
        transport = await createTransport(this, 'pennylaneOAuth2Api');
      } catch (error2) {
        throw new Error('No valid Pennylane credentials found');
      }
    }

    // Set rate limit if specified
    const advancedSettings = this.getNodeParameter('advancedSettings', 0) as any;
    if (advancedSettings.requestsPerSecond) {
      transport.setRateLimit(advancedSettings.requestsPerSecond);
    }

    for (let i = 0; i < items.length; i++) {
      try {
        let result: any;

        switch (resource) {
          case 'customerInvoice':
            result = await handleCustomerInvoice(this, transport, operation, i);
            break;
          case 'supplierInvoice':
            result = await handleSupplierInvoice(this, transport, operation, i);
            break;
          case 'customer':
            result = await handleCustomer(this, transport, operation, i);
            break;
          case 'supplier':
            result = await handleSupplier(this, transport, operation, i);
            break;
          case 'product':
            result = await handleProduct(this, transport, operation, i);
            break;
          case 'quote':
            result = await handleQuote(this, transport, operation, i);
            break;
          case 'category':
            result = await handleCategory(this, transport, operation, i);
            break;
          case 'bankAccount':
            result = await handleBankAccount(this, transport, operation, i);
            break;
          case 'transaction':
            result = await handleTransaction(this, transport, operation, i);
            break;
          case 'export':
            result = await handleExport(this, transport, operation, i);
            break;
          case 'user':
            result = await handleUser(this, transport, operation, i);
            break;
          case 'fileAttachment':
            result = await handleFileAttachment(this, transport, operation, i);
            break;
          default:
            throw new Error(`Resource '${resource}' is not yet implemented`);
        }

        if (Array.isArray(result)) {
          returnData.push(...result.map(item => ({ json: item })));
        } else {
          returnData.push({ json: result });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ 
            json: { 
              error: error instanceof Error ? error.message : 'Unknown error'
            } 
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }

}