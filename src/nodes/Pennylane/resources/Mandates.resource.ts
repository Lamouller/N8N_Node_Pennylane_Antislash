import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleMandate(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  const mandateType = context.getNodeParameter('mandateType', itemIndex, 'sepa') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('mandateData', itemIndex, {}) as IDataObject;
      const createUrl = mandateType === 'sepa' ? '/sepa_mandates' : '/gocardless_mandates';
      return await transport.request({
        method: 'POST',
        url: createUrl,
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      const getUrl = mandateType === 'sepa' ? `/sepa_mandates/${id}` : `/gocardless_mandates/${id}`;
      return await transport.request({
        method: 'GET',
        url: getUrl,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      const getAllUrl = mandateType === 'sepa' ? '/sepa_mandates' : '/gocardless_mandates';
      return await transport.getAllPages(getAllUrl, filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('mandateData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/sepa_mandates/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/sepa_mandates/${id}`,
      });

    case 'sendGoCardlessEmail':
      const emailData = context.getNodeParameter('emailData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/gocardless_mandates/send_email',
        data: emailData,
      });

    case 'associateGoCardless':
      if (!id) throw new Error('ID is required for associateGoCardless operation');
      const associateData = context.getNodeParameter('associateData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: `/gocardless_mandates/${id}/associate`,
        data: associateData,
      });

    case 'cancelGoCardless':
      if (!id) throw new Error('ID is required for cancelGoCardless operation');
      return await transport.request({
        method: 'POST',
        url: `/gocardless_mandates/${id}/cancel`,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for mandates`);
  }
}

export const mandateProperties = [
  // Mandate Type selector
  {
    displayName: 'Mandate Type',
    name: 'mandateType',
    type: 'options',
    options: [
      { name: 'SEPA Mandate', value: 'sepa' },
      { name: 'GoCardless Mandate', value: 'gocardless' },
    ],
    default: 'sepa',
    displayOptions: {
      show: {
        resource: ['mandate'],
      },
    },
    description: 'Type of mandate to manage',
  },

  // Mandate ID field
  {
    displayName: 'Mandate ID',
    name: 'mandateId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['mandate'],
        operation: ['get', 'update', 'delete', 'associateGoCardless', 'cancelGoCardless'],
      },
    },
    required: true,
    description: 'The ID of the mandate',
  },

  // Mandate Data for create/update
  {
    displayName: 'Mandate Data',
    name: 'mandateData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['mandate'],
        operation: ['create', 'update'],
        mandateType: ['sepa'],
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
        description: 'Customer for this mandate',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        required: true,
        description: 'Mandate reference',
      },
      {
        displayName: 'IBAN',
        name: 'iban',
        type: 'string',
        default: '',
        required: true,
        description: 'Customer IBAN',
      },
      {
        displayName: 'BIC',
        name: 'bic',
        type: 'string',
        default: '',
        description: 'Customer BIC',
      },
      {
        displayName: 'Signature Date',
        name: 'signature_date',
        type: 'dateTime',
        default: '',
        description: 'Date when mandate was signed',
      },
    ],
  },

  // GoCardless Email Data
  {
    displayName: 'Email Data',
    name: 'mandateEmailData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['mandate'],
        operation: ['sendGoCardlessEmail'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Customer Email',
        name: 'customer_email',
        type: 'string',
        default: '',
        required: true,
        description: 'Customer email address',
      },
      {
        displayName: 'Language',
        name: 'language',
        type: 'options',
        options: [
          { name: 'French', value: 'fr' },
          { name: 'English', value: 'en' },
        ],
        default: 'fr',
        description: 'Email language',
      },
    ],
  },

  // Associate Data for GoCardless
  {
    displayName: 'Associate Data',
    name: 'associateData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['mandate'],
        operation: ['associateGoCardless'],
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
        description: 'Customer to associate with mandate',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'mandateFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['mandate'],
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
          { name: 'Active', value: 'active' },
          { name: 'Inactive', value: 'inactive' },
          { name: 'Cancelled', value: 'cancelled' },
        ],
        default: '',
        description: 'Filter by status',
      },
    ],
  },
];
