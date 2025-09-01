import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleTransaction(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('transactionData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/transactions',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/transactions/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/transactions', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('transactionData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/transactions/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/transactions/${id}`,
      });

    case 'reconcile':
      if (!id) throw new Error('ID is required for reconcile operation');
      const reconcileData = context.getNodeParameter('reconcileData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/transactions/${id}/reconcile`,
        data: reconcileData,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for transactions`);
  }
}

export const transactionProperties = [
  // Transaction ID field
  {
    displayName: 'Transaction ID',
    name: 'transactionId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['get', 'update', 'delete', 'reconcile'],
      },
    },
    required: true,
    description: 'The ID of the transaction',
  },

  // Transaction Data for create/update
  {
    displayName: 'Transaction Data',
    name: 'transactionData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Bank Account ID',
        name: 'bank_account_id',
        type: 'options',
        loadOptionsMethod: 'loadBankAccounts',
        default: '',
        required: true,
        description: 'Bank account for this transaction',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'number',
        default: 0,
        required: true,
        description: 'Transaction amount (positive for credit, negative for debit)',
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'Transaction date',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        required: true,
        description: 'Transaction description',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        description: 'Transaction reference',
      },
      {
        displayName: 'Category ID',
        name: 'category_id',
        type: 'options',
        loadOptionsMethod: 'loadCategories',
        default: '',
        description: 'Transaction category',
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
        description: 'Transaction currency',
      },
    ],
  },

  // Reconcile Data
  {
    displayName: 'Reconcile Data',
    name: 'reconcileData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['reconcile'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Reconciled',
        name: 'reconciled',
        type: 'boolean',
        default: true,
        description: 'Mark transaction as reconciled',
      },
      {
        displayName: 'Reconcile Date',
        name: 'reconcile_date',
        type: 'dateTime',
        default: '',
        description: 'Date of reconciliation',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'transactionFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Bank Account ID',
        name: 'bank_account_id',
        type: 'options',
        loadOptionsMethod: 'loadBankAccounts',
        default: '',
        description: 'Filter by bank account',
      },
      {
        displayName: 'Category ID',
        name: 'category_id',
        type: 'options',
        loadOptionsMethod: 'loadCategories',
        default: '',
        description: 'Filter by category',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        description: 'Filter transactions from this date',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        description: 'Filter transactions to this date',
      },
      {
        displayName: 'Min Amount',
        name: 'min_amount',
        type: 'number',
        default: '',
        description: 'Minimum transaction amount',
      },
      {
        displayName: 'Max Amount',
        name: 'max_amount',
        type: 'number',
        default: '',
        description: 'Maximum transaction amount',
      },
      {
        displayName: 'Reconciled',
        name: 'reconciled',
        type: 'boolean',
        default: '',
        description: 'Filter by reconciliation status',
      },
    ],
  },
];
