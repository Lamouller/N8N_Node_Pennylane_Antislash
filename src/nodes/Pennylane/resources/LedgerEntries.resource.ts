import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleLedgerEntry(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('ledgerEntryData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/ledger_entries',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/ledger_entries/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/ledger_entries', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('ledgerEntryData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/ledger_entries/${id}`,
        data: updateData,
      });

    case 'getLines':
      if (!id) throw new Error('ID is required for getLines operation');
      return await transport.getAllPages(`/ledger_entries/${id}/lines`, {}, 50);

    default:
      throw new Error(`Operation '${operation}' is not supported for ledger entries`);
  }
}

export const ledgerEntryProperties = [
  // Ledger Entry ID field
  {
    displayName: 'Ledger Entry ID',
    name: 'ledgerentrieId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['ledgerEntry'],
        operation: ['get', 'update', 'getLines'],
      },
    },
    required: true,
    description: 'The ID of the ledger entry',
  },

  // Ledger Entry Data for create/update
  {
    displayName: 'Ledger Entry Data',
    name: 'ledgerEntryData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['ledgerEntry'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Journal ID',
        name: 'journal_id',
        type: 'options',
        loadOptionsMethod: 'loadJournals',
        default: '',
        required: true,
        description: 'The journal for this entry',
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'Entry date',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        description: 'Entry reference',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        required: true,
        description: 'Entry description',
      },
      {
        displayName: 'Lines',
        name: 'lines',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: 'line',
            displayName: 'Line',
            values: [
              {
                displayName: 'Ledger Account ID',
                name: 'ledger_account_id',
                type: 'options',
                loadOptionsMethod: 'loadLedgerAccounts',
                default: '',
                required: true,
                description: 'Ledger account for this line',
              },
              {
                displayName: 'Debit Amount',
                name: 'debit_amount',
                type: 'number',
                default: 0,
                description: 'Debit amount (leave 0 for credit)',
              },
              {
                displayName: 'Credit Amount',
                name: 'credit_amount',
                type: 'number',
                default: 0,
                description: 'Credit amount (leave 0 for debit)',
              },
              {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Line description',
              },
            ],
          },
        ],
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'ledgerentrieFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['ledgerEntry'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Journal ID',
        name: 'journal_id',
        type: 'options',
        loadOptionsMethod: 'loadJournals',
        default: '',
        description: 'Filter by journal',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        description: 'Filter entries from this date',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        description: 'Filter entries to this date',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        description: 'Filter by reference',
      },
    ],
  },
];
