import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleLedgerAccount(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('ledgerAccountData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/ledger_accounts',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/ledger_accounts/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/ledger_accounts', filters, 50);

    default:
      throw new Error(`Operation '${operation}' is not supported for ledger accounts`);
  }
}

export const ledgerAccountProperties = [
  // Ledger Account ID field
  {
    displayName: 'Ledger Account ID',
    name: 'id',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['ledgerAccount'],
        operation: ['get'],
      },
    },
    required: true,
    description: 'The ID of the ledger account',
  },

  // Ledger Account Data for create
  {
    displayName: 'Ledger Account Data',
    name: 'ledgerAccountData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['ledgerAccount'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Number',
        name: 'number',
        type: 'string',
        default: '',
        required: true,
        description: 'Account number (e.g., 411000)',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        required: true,
        description: 'Account name',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Asset', value: 'asset' },
          { name: 'Liability', value: 'liability' },
          { name: 'Equity', value: 'equity' },
          { name: 'Income', value: 'income' },
          { name: 'Expense', value: 'expense' },
        ],
        default: 'asset',
        required: true,
        description: 'Account type',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Account description',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the account is active',
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
        resource: ['ledgerAccount'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Asset', value: 'asset' },
          { name: 'Liability', value: 'liability' },
          { name: 'Equity', value: 'equity' },
          { name: 'Income', value: 'income' },
          { name: 'Expense', value: 'expense' },
        ],
        default: '',
        description: 'Filter by account type',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: '',
        description: 'Filter by active status',
      },
      {
        displayName: 'Number Starts With',
        name: 'number_starts_with',
        type: 'string',
        default: '',
        description: 'Filter accounts by number prefix (e.g., "41" for customer accounts)',
      },
    ],
  },
];
