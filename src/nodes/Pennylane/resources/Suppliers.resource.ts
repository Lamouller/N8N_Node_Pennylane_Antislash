import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleSupplier(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('supplierData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/suppliers',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/suppliers/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/suppliers', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('supplierData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/suppliers/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/suppliers/${id}`,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for suppliers`);
  }
}

export const supplierProperties = [
  // Supplier ID field
  {
    displayName: 'Supplier ID',
    name: 'supplierId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['supplier'],
        operation: ['get', 'update', 'delete'],
      },
    },
    required: true,
    description: 'The ID of the supplier',
  },

  // Supplier Data for create/update
  {
    displayName: 'Supplier Data',
    name: 'supplierData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['supplier'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        required: true,
        description: 'Supplier name',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Supplier email address',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Supplier phone number',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Supplier address',
      },
      {
        displayName: 'Postal Code',
        name: 'postal_code',
        type: 'string',
        default: '',
        description: 'Supplier postal code',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'Supplier city',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'options',
        options: [
          { name: 'France', value: 'FR' },
          { name: 'Belgium', value: 'BE' },
          { name: 'Switzerland', value: 'CH' },
          { name: 'Luxembourg', value: 'LU' },
          { name: 'United Kingdom', value: 'GB' },
          { name: 'Germany', value: 'DE' },
          { name: 'Spain', value: 'ES' },
          { name: 'Italy', value: 'IT' },
          { name: 'United States', value: 'US' },
        ],
        default: 'FR',
        description: 'Supplier country',
      },
      {
        displayName: 'VAT Number',
        name: 'vat_number',
        type: 'string',
        default: '',
        description: 'Supplier VAT number',
      },
      {
        displayName: 'SIRET Number',
        name: 'siret_number',
        type: 'string',
        default: '',
        description: 'Supplier SIRET number (France)',
      },
      {
        displayName: 'Payment Conditions',
        name: 'payment_conditions',
        type: 'options',
        options: [
          { name: 'On Receipt', value: 'on_receipt' },
          { name: '15 Days', value: '15_days' },
          { name: '30 Days', value: '30_days' },
          { name: '45 Days', value: '45_days' },
          { name: '60 Days', value: '60_days' },
        ],
        default: '30_days',
        description: 'Payment conditions',
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
        description: 'Supplier default currency',
      },
      {
        displayName: 'IBAN',
        name: 'iban',
        type: 'string',
        default: '',
        description: 'Supplier IBAN',
      },
      {
        displayName: 'BIC',
        name: 'bic',
        type: 'string',
        default: '',
        description: 'Supplier BIC',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'supplierFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['supplier'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search in supplier name and email',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'options',
        options: [
          { name: 'France', value: 'FR' },
          { name: 'Belgium', value: 'BE' },
          { name: 'Switzerland', value: 'CH' },
          { name: 'Luxembourg', value: 'LU' },
          { name: 'United Kingdom', value: 'GB' },
          { name: 'Germany', value: 'DE' },
          { name: 'Spain', value: 'ES' },
          { name: 'Italy', value: 'IT' },
          { name: 'United States', value: 'US' },
        ],
        default: '',
        description: 'Filter by country',
      },
    ],
  },
];
