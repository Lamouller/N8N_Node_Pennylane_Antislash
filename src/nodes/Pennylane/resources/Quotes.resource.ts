import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleQuote(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('quoteData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/quotes',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/quotes/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/quotes', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('quoteData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/quotes/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/quotes/${id}`,
      });

    case 'accept':
      if (!id) throw new Error('ID is required for accept operation');
      return await transport.request({
        method: 'PUT',
        url: `/quotes/${id}/accept`,
      });

    case 'refuse':
      if (!id) throw new Error('ID is required for refuse operation');
      return await transport.request({
        method: 'PUT',
        url: `/quotes/${id}/refuse`,
      });

    case 'sendEmail':
      if (!id) throw new Error('ID is required for sendEmail operation');
      const emailData = context.getNodeParameter('emailData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: `/quotes/${id}/send`,
        data: emailData,
      });

    case 'convertToInvoice':
      if (!id) throw new Error('ID is required for convertToInvoice operation');
      return await transport.request({
        method: 'POST',
        url: `/quotes/${id}/convert_to_invoice`,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for quotes`);
  }
}

export const quoteProperties = [
  // Quote ID field
  {
    displayName: 'Quote ID',
    name: 'id',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['quote'],
        operation: ['get', 'update', 'delete', 'accept', 'refuse', 'sendEmail', 'convertToInvoice'],
      },
    },
    required: true,
    description: 'The ID of the quote',
  },

  // Quote Data for create/update
  {
    displayName: 'Quote Data',
    name: 'quoteData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['quote'],
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
        required: true,
        description: 'The customer for this quote',
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        description: 'Quote date',
      },
      {
        displayName: 'Valid Until',
        name: 'valid_until',
        type: 'dateTime',
        default: '',
        description: 'Quote validity date',
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
        description: 'Quote currency',
      },
      {
        displayName: 'Special Mention',
        name: 'special_mention',
        type: 'string',
        default: '',
        description: 'Special mention for the quote',
      },
      {
        displayName: 'Quote Lines',
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

  // Email Data for sendEmail
  {
    displayName: 'Email Data',
    name: 'emailData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['quote'],
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
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['quote'],
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
          { name: 'Sent', value: 'sent' },
          { name: 'Accepted', value: 'accepted' },
          { name: 'Refused', value: 'refused' },
          { name: 'Expired', value: 'expired' },
        ],
        default: '',
        description: 'Filter by status',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        description: 'Filter quotes from this date',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        description: 'Filter quotes to this date',
      },
    ],
  },
];
