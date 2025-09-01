import { IExecuteFunctions, IDataObject } from 'n8n-workflow';


export async function handleEInvoice(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  
  switch (operation) {
    case 'import':
      const inputData = context.getInputData();
      const item = inputData[itemIndex];
      if (!item || !item.binary || !item.binary.data) {
        throw new Error('No binary data found for e-invoice import');
      }
      const binaryData = item.binary;

      const fileData = binaryData.data!;
      
      const importData = context.getNodeParameter('importData', itemIndex, {}) as IDataObject;
      const additionalFields: Record<string, any> = {};
      
      if (importData.customer_id) {
        additionalFields.customer_id = importData.customer_id as string;
      }
      if (importData.auto_validate) {
        additionalFields.auto_validate = importData.auto_validate as string;
      }
      
      return await transport.uploadFile(
        '/e_invoices/import',
        fileData.data,
        fileData.fileName || 'einvoice.xml',
        additionalFields
      );

    default:
      throw new Error(`Operation '${operation}' is not supported for e-invoices`);
  }
}

export const eInvoiceProperties = [
  // Import Data for e-invoice
  {
    displayName: 'Import Data',
    name: 'importData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['eInvoice'],
        operation: ['import'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Customer ID',
        name: 'customer_id',
        type: 'options',
        loadOptionsMethod: 'loadCustomers',
        default: '',
        description: 'Customer to associate with the e-invoice (optional)',
      },
      {
        displayName: 'Auto Validate',
        name: 'auto_validate',
        type: 'boolean',
        default: false,
        description: 'Automatically validate the e-invoice after import',
      },
    ],
  },
];
