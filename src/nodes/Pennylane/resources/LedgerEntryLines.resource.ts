import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleLedgerEntryLine(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/ledger_entry_lines/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/ledger_entry_lines', filters, 50);

    case 'getLettered':
      if (!id) throw new Error('ID is required for getLettered operation');
      return await transport.getAllPages(`/ledger_entry_lines/${id}/lettered`, {}, 50);

    case 'getCategories':
      if (!id) throw new Error('ID is required for getCategories operation');
      return await transport.getAllPages(`/ledger_entry_lines/${id}/categories`, {}, 50);

    case 'linkCategories':
      if (!id) throw new Error('ID is required for linkCategories operation');
      const categoriesData = context.getNodeParameter('categoriesData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/ledger_entry_lines/${id}/categories`,
        data: categoriesData,
      });

    case 'letter':
      const letterData = context.getNodeParameter('letterData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/ledger_entry_lines/letter',
        data: letterData,
      });

    case 'unletter':
      const unletterData = context.getNodeParameter('unletterData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'DELETE',
        url: '/ledger_entry_lines/unletter',
        data: unletterData,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for ledger entry lines`);
  }
}

export const ledgerEntryLineProperties = [
  // Ledger Entry Line ID field
  {
    displayName: 'Ledger Entry Line ID',
    name: 'ledgerEntryId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['ledgerEntryLine'],
        operation: ['get', 'getLettered', 'getCategories', 'linkCategories'],
      },
    },
    required: true,
    description: 'The ID of the ledger entry line',
  },

  // Categories Data for linkCategories
  {
    displayName: 'Categories Data',
    name: 'categoriesData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['ledgerEntryLine'],
        operation: ['linkCategories'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Categories',
        name: 'categories',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: 'category',
            displayName: 'Category',
            values: [
              {
                displayName: 'Category ID',
                name: 'category_id',
                type: 'options',
                loadOptionsMethod: 'loadCategories',
                default: '',
                required: true,
                description: 'Category to link',
              },
              {
                displayName: 'Amount',
                name: 'amount',
                type: 'number',
                default: 0,
                description: 'Amount to allocate to this category',
              },
            ],
          },
        ],
      },
    ],
  },

  // Letter Data
  {
    displayName: 'Letter Data',
    name: 'letterData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['ledgerEntryLine'],
        operation: ['letter'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Line IDs',
        name: 'line_ids',
        type: 'string',
        default: '',
        required: true,
        description: 'Comma-separated list of ledger entry line IDs to letter together',
      },
      {
        displayName: 'Letter Code',
        name: 'letter_code',
        type: 'string',
        default: '',
        description: 'Optional letter code',
      },
    ],
  },

  // Unletter Data
  {
    displayName: 'Unletter Data',
    name: 'unletterData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['ledgerEntryLine'],
        operation: ['unletter'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Line IDs',
        name: 'line_ids',
        type: 'string',
        default: '',
        required: true,
        description: 'Comma-separated list of ledger entry line IDs to unletter',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'ledgerEntryFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['ledgerEntryLine'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Ledger Account ID',
        name: 'ledger_account_id',
        type: 'options',
        loadOptionsMethod: 'loadLedgerAccounts',
        default: '',
        description: 'Filter by ledger account',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        description: 'Filter lines from this date',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        description: 'Filter lines to this date',
      },
      {
        displayName: 'Lettered',
        name: 'lettered',
        type: 'boolean',
        default: '',
        description: 'Filter by lettered status',
      },
    ],
  },
];
