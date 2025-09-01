import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { createTransport } from '../../helpers/transport';
import * as loadOptions from '../../helpers/loadOptions';

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
          case 'product':
            result = await handleProduct(this, transport, operation, i);
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

async function handleCustomerInvoice(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  switch (operation) {
    case 'get':
      const id = context.getNodeParameter('id', itemIndex) as string;
      const response = await transport.request({
        method: 'GET',
        url: `/customer_invoices/${id}`,
      });
      return response.data;
    
    case 'getAll':
      const allResponse = await transport.getAllPages('/customer_invoices', {}, 50);
      return allResponse;
    
    default:
      return { message: `Operation ${operation} not yet implemented for customer invoices` };
  }
}

async function handleProduct(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  switch (operation) {
    case 'get':
      const id = context.getNodeParameter('id', itemIndex) as string;
      const response = await transport.request({
        method: 'GET',
        url: `/products/${id}`,
      });
      return response.data;
    
    case 'getAll':
      const allResponse = await transport.getAllPages('/products', {}, 50);
      return allResponse;
    
    default:
      return { message: `Operation ${operation} not yet implemented for products` };
  }
}