import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleJournal(
  context: IExecuteFunctions,
  transport: any,
  operation: string,
  itemIndex: number
): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;

  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('journalData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/journals',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/journals/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/journals', filters, 50);

    default:
      throw new Error(`Operation '${operation}' is not supported for journals`);
  }
}

export const journalProperties = [
  // Journal ID field
  {
    displayName: 'Journal ID',
    name: 'journalId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['journal'],
        operation: ['get'],
      },
    },
    required: true,
    description: 'The ID of the journal',
  },

  // Journal Data for create
  {
    displayName: 'Journal Data',
    name: 'journalData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['journal'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Code',
        name: 'code',
        type: 'string',
        default: '',
        required: true,
        description: 'Journal code (unique identifier)',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        required: true,
        description: 'Journal name',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Sales', value: 'sales' },
          { name: 'Purchases', value: 'purchases' },
          { name: 'Bank', value: 'bank' },
          { name: 'Cash', value: 'cash' },
          { name: 'Operations', value: 'operations' },
          { name: 'Miscellaneous', value: 'miscellaneous' },
        ],
        default: 'miscellaneous',
        required: true,
        description: 'Journal type',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Journal description',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'journalFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['journal'],
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
          { name: 'Sales', value: 'sales' },
          { name: 'Purchases', value: 'purchases' },
          { name: 'Bank', value: 'bank' },
          { name: 'Cash', value: 'cash' },
          { name: 'Operations', value: 'operations' },
          { name: 'Miscellaneous', value: 'miscellaneous' },
        ],
        default: '',
        description: 'Filter by journal type',
      },
    ],
  },
];
