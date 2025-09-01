import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import FormData from 'form-data';

export async function handleCustomerInvoice(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('customerInvoiceData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/customer_invoices',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/customer_invoices/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/customer_invoices', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('customerInvoiceData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/customer_invoices/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/customer_invoices/${id}`,
      });

    case 'finalize':
      if (!id) throw new Error('ID is required for finalize operation');
      return await transport.request({
        method: 'PUT',
        url: `/customer_invoices/${id}/finalize`,
      });

    case 'markAsPaid':
      if (!id) throw new Error('ID is required for markAsPaid operation');
      const paymentData = context.getNodeParameter('paymentData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/customer_invoices/${id}/mark_as_paid`,
        data: paymentData,
      });

    case 'sendEmail':
      if (!id) throw new Error('ID is required for sendEmail operation');
      const emailData = context.getNodeParameter('emailData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: `/customer_invoices/${id}/send`,
        data: emailData,
      });

    case 'uploadAppendix':
      if (!id) throw new Error('ID is required for uploadAppendix operation');
      const inputData = context.getInputData();
      const item = inputData[itemIndex];
      if (!item || !item.binary || !item.binary.data) {
        throw new Error('No binary data found for upload');
      }
      const binaryData = item.binary;
      
      const formData = new FormData();
      const fileData = binaryData.data!;
      formData.append('appendix', fileData.data, fileData.fileName || 'appendix.pdf');
      
      return await transport.request({
        method: 'PUT',
        url: `/customer_invoices/${id}/appendix`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

    case 'importFromFile':
      const importInputData = context.getInputData();
      const importItem = importInputData[itemIndex];
      if (!importItem || !importItem.binary || !importItem.binary.data) {
        throw new Error('No binary data found for import');
      }
      const importBinaryData = importItem.binary;
      
      const importFormData = new FormData();
      const importFileData = importBinaryData.data!;
      importFormData.append('file', importFileData.data, importFileData.fileName || 'invoices.csv');
      
      return await transport.request({
        method: 'POST',
        url: '/customer_invoices/import',
        data: importFormData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for customer invoices`);
  }
}

export const customerInvoiceProperties = [
  // Customer Invoice ID field
  {
    displayName: 'Invoice ID',
    name: 'customerInvoiceId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['customerInvoice'],
        operation: ['get', 'update', 'delete', 'finalize', 'markAsPaid', 'sendEmail', 'uploadAppendix'],
      },
    },
    required: true,
    description: 'The ID of the customer invoice',
  },

  // Customer Invoice Data for create/update
  {
    displayName: 'Customer Invoice Data',
    name: 'customerInvoiceData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['customerInvoice'],
        operation: ['create', 'update'],
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
        description: 'The customer for this invoice',
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        description: 'Invoice date',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'dateTime',
        default: '',
        description: 'Due date for payment',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'options',
        options: [
          { name: 'EUR', value: 'EUR' },
          { name: 'USD', value: 'USD' },
          { name: 'GBP', value: 'GBP' },
        ],
        default: 'EUR',
        description: 'Invoice currency',
      },
      {
        displayName: 'Special Mention',
        name: 'special_mention',
        type: 'string',
        default: '',
        description: 'Special mention for the invoice',
      },
      {
        displayName: 'Invoice Lines',
        name: 'line_items',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: 'line',
            displayName: 'Line Item',
            values: [
              {
                displayName: 'Product ID',
                name: 'product_id',
                type: 'options',
                typeOptions: {
                  loadOptionsMethod: 'loadProducts',
                },
                default: '',
                description: 'Product for this line',
              },
              {
                displayName: 'Label',
                name: 'label',
                type: 'string',
                default: '',
                description: 'Line item description',
              },
              {
                displayName: 'Quantity',
                name: 'quantity',
                type: 'number',
                default: 1,
                description: 'Quantity',
              },
              {
                displayName: 'Unit Price',
                name: 'unit_price',
                type: 'number',
                default: 0,
                description: 'Unit price (excluding tax)',
              },
              {
                displayName: 'VAT Rate',
                name: 'vat_rate',
                type: 'options',
                options: [
                  { name: '0%', value: '0' },
                  { name: '5.5%', value: '5.5' },
                  { name: '10%', value: '10' },
                  { name: '20%', value: '20' },
                ],
                default: '20',
                description: 'VAT rate',
              },
            ],
          },
        ],
      },
    ],
  },

  // Payment Data for markAsPaid
  {
    displayName: 'Payment Data',
    name: 'customerInvoicePaymentData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['customerInvoice'],
        operation: ['markAsPaid'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Payment Date',
        name: 'payment_date',
        type: 'dateTime',
        default: '',
        description: 'Date when payment was received',
      },
      {
        displayName: 'Payment Method',
        name: 'payment_method',
        type: 'options',
        options: [
          { name: 'Bank Transfer', value: 'bank_transfer' },
          { name: 'Check', value: 'check' },
          { name: 'Cash', value: 'cash' },
          { name: 'Credit Card', value: 'credit_card' },
        ],
        default: 'bank_transfer',
        description: 'Payment method used',
      },
    ],
  },

  // Email Data for sendEmail
  {
    displayName: 'Email Data',
    name: 'customerInvoiceEmailData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['customerInvoice'],
        operation: ['sendEmail'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Email Template',
        name: 'template',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'loadTemplates',
        },
        default: '',
        description: 'Email template to use',
      },
      {
        displayName: 'Additional Recipients',
        name: 'additional_recipients',
        type: 'string',
        default: '',
        description: 'Additional email addresses (comma-separated)',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'customerInvoiceFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['customerInvoice'],
        operation: ['getAll'],
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
        description: 'Filter by customer',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Finalized', value: 'finalized' },
          { name: 'Paid', value: 'paid' },
          { name: 'Cancelled', value: 'cancelled' },
        ],
        default: '',
        description: 'Filter by status',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        description: 'Filter invoices from this date',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        description: 'Filter invoices to this date',
      },
    ],
  },
];
