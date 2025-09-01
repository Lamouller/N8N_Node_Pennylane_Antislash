import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleSupplierInvoice(
  context: IExecuteFunctions,
  transport: any,
  operation: string,
  itemIndex: number
): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;

  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter(
        'supplierInvoiceData',
        itemIndex,
        {}
      ) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/supplier_invoices',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/supplier_invoices/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/supplier_invoices', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter(
        'supplierInvoiceData',
        itemIndex,
        {}
      ) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/supplier_invoices/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/supplier_invoices/${id}`,
      });

    case 'markAsPaid':
      if (!id) throw new Error('ID is required for markAsPaid operation');
      const paymentData = context.getNodeParameter('paymentData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/supplier_invoices/${id}/mark_as_paid`,
        data: paymentData,
      });

    case 'uploadFile':
      if (!id) throw new Error('ID is required for uploadFile operation');
      const inputData = context.getInputData();
      const item = inputData[itemIndex];
      if (!item || !item.binary || !item.binary.data) {
        throw new Error('No binary data found for upload');
      }
      const binaryData = item.binary;

      const fileData = binaryData.data!;

      return await transport.uploadFile(
        `/supplier_invoices/${id}/file`,
        fileData.data,
        fileData.fileName || 'invoice.pdf'
      );

    case 'importFromFile':
      const importInputData = context.getInputData();
      const importItem = importInputData[itemIndex];
      if (!importItem || !importItem.binary || !importItem.binary.data) {
        throw new Error('No binary data found for import');
      }
      const importBinaryData = importItem.binary;

      const importFileData = importBinaryData.data!;

      return await transport.uploadFile(
        '/supplier_invoices/import',
        importFileData.data,
        importFileData.fileName || 'invoices.csv'
      );

    default:
      throw new Error(`Operation '${operation}' is not supported for supplier invoices`);
  }
}

export const supplierInvoiceProperties = [
  // Supplier Invoice ID field
  {
    displayName: 'Invoice ID',
    name: 'supplierInvoiceId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['supplierInvoice'],
        operation: ['get', 'update', 'delete', 'markAsPaid', 'uploadFile'],
      },
    },
    required: true,
    description: 'The ID of the supplier invoice',
  },

  // Supplier Invoice Data for create/update
  {
    displayName: 'Supplier Invoice Data',
    name: 'supplierInvoiceData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['supplierInvoice'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Supplier ID',
        name: 'supplier_id',
        type: 'options',
        loadOptionsMethod: 'loadSuppliers',
        default: '',
        required: true,
        description: 'The supplier for this invoice',
      },
      {
        displayName: 'Invoice Number',
        name: 'invoice_number',
        type: 'string',
        default: '',
        required: true,
        description: 'Supplier invoice number',
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        required: true,
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
        displayName: 'Amount (Excluding Tax)',
        name: 'amount_excluding_tax',
        type: 'number',
        default: 0,
        required: true,
        description: 'Total amount excluding tax',
      },
      {
        displayName: 'VAT Amount',
        name: 'vat_amount',
        type: 'number',
        default: 0,
        description: 'Total VAT amount',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Invoice description',
      },
      {
        displayName: 'Category ID',
        name: 'category_id',
        type: 'options',
        loadOptionsMethod: 'loadCategories',
        default: '',
        description: 'Invoice category',
      },
    ],
  },

  // Payment Data for markAsPaid
  {
    displayName: 'Payment Data',
    name: 'supplierInvoicePaymentData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['supplierInvoice'],
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
        description: 'Date when payment was made',
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
      {
        displayName: 'Bank Account ID',
        name: 'bank_account_id',
        type: 'options',
        loadOptionsMethod: 'loadBankAccounts',
        default: '',
        description: 'Bank account used for payment',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'supplierInvoiceFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['supplierInvoice'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Supplier ID',
        name: 'supplier_id',
        type: 'options',
        loadOptionsMethod: 'loadSuppliers',
        default: '',
        description: 'Filter by supplier',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Pending', value: 'pending' },
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
