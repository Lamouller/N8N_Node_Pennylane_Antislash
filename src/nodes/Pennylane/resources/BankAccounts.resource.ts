import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleBankAccount(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('bankAccountData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/bank_accounts',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/bank_accounts/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/bank_accounts', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('bankAccountData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/bank_accounts/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/bank_accounts/${id}`,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for bank accounts`);
  }
}

export const bankAccountProperties = [
  // Bank Account ID field
  {
    displayName: 'Bank Account ID',
    name: 'bankAccountId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['bankAccount'],
        operation: ['get', 'update', 'delete'],
      },
    },
    required: true,
    description: 'The ID of the bank account',
  },

  // Bank Account Data for create/update
  {
    displayName: 'Bank Account Data',
    name: 'bankAccountData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['bankAccount'],
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
        description: 'Bank account name',
      },
      {
        displayName: 'Bank Name',
        name: 'bank_name',
        type: 'string',
        default: '',
        required: true,
        description: 'Name of the bank',
      },
      {
        displayName: 'IBAN',
        name: 'iban',
        type: 'string',
        default: '',
        description: 'IBAN number',
      },
      {
        displayName: 'BIC',
        name: 'bic',
        type: 'string',
        default: '',
        description: 'BIC/SWIFT code',
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
        description: 'Account currency',
      },
      {
        displayName: 'Account Type',
        name: 'account_type',
        type: 'options',
        options: [
          { name: 'Current Account', value: 'current' },
          { name: 'Savings Account', value: 'savings' },
          { name: 'Business Account', value: 'business' },
          { name: 'Credit Card', value: 'credit_card' },
        ],
        default: 'current',
        description: 'Type of bank account',
      },
      {
        displayName: 'Initial Balance',
        name: 'initial_balance',
        type: 'number',
        default: 0,
        description: 'Initial account balance',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'bankAccountFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['bankAccount'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'options',
        options: [
          { name: 'EUR', value: 'EUR' },
          { name: 'USD', value: 'USD' },
          { name: 'GBP', value: 'GBP' },
        ],
        default: '',
        description: 'Filter by currency',
      },
      {
        displayName: 'Account Type',
        name: 'account_type',
        type: 'options',
        options: [
          { name: 'Current Account', value: 'current' },
          { name: 'Savings Account', value: 'savings' },
          { name: 'Business Account', value: 'business' },
          { name: 'Credit Card', value: 'credit_card' },
        ],
        default: '',
        description: 'Filter by account type',
      },
    ],
  },
];
