import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleCustomerInvoiceTemplate(
  context: IExecuteFunctions,
  transport: any,
  operation: string,
  itemIndex: number
): Promise<any> {
  switch (operation) {
    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/customer_invoice_templates', filters, 50);

    default:
      throw new Error(`Operation '${operation}' is not supported for customer invoice templates`);
  }
}

export const customerInvoiceTemplateProperties = [
  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'customerTemplateFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['customerInvoiceTemplate'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: '',
        description: 'Filter by active status',
      },
      {
        displayName: 'Default',
        name: 'default',
        type: 'boolean',
        default: '',
        description: 'Filter by default template status',
      },
    ],
  },
];
