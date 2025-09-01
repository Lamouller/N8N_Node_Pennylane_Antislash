import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import FormData from 'form-data';

export async function handleEInvoice(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  
  switch (operation) {
    case 'import':
      const inputData = context.getInputData();
      const item = inputData[itemIndex];
      if (!item || !item.binary || !item.binary.data) {
        throw new Error('No binary data found for e-invoice import');
      }
      const binaryData = item.binary;

      const formData = new FormData();
      const fileData = binaryData.data!;
      
      formData.append('file', fileData.data, fileData.fileName || 'einvoice.xml');
      
      const importData = context.getNodeParameter('importData', itemIndex, {}) as IDataObject;
      if (importData.customer_id) {
        formData.append('customer_id', importData.customer_id as string);
      }
      if (importData.auto_validate) {
        formData.append('auto_validate', importData.auto_validate as string);
      }
      
      return await transport.request({
        method: 'POST',
        url: '/e_invoices/import',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
        typeOptions: {
          loadOptionsMethod: 'loadCustomers',
        },
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
