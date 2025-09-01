import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleCategoryGroup(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/category_groups/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/category_groups', filters, 50);

    case 'getCategories':
      if (!id) throw new Error('ID is required for getCategories operation');
      const categoryFilters = context.getNodeParameter('categoryFilters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages(`/category_groups/${id}/categories`, categoryFilters, 50);

    default:
      throw new Error(`Operation '${operation}' is not supported for category groups`);
  }
}

export const categoryGroupProperties = [
  // Category Group ID field
  {
    displayName: 'Category Group ID',
    name: 'categoryGroupId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['categoryGroup'],
        operation: ['get', 'getCategories'],
      },
    },
    required: true,
    description: 'The ID of the category group',
  },

  // Category Filters for getCategories
  {
    displayName: 'Category Filters',
    name: 'categoryGroupFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['categoryGroup'],
        operation: ['getCategories'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: '',
        description: 'Filter by active status',
      },
      {
        displayName: 'Parent ID',
        name: 'parent_id',
        type: 'string',
        default: '',
        description: 'Filter by parent category ID',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'categoryGroupGetAllFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['categoryGroup'],
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
          { name: 'Analytical', value: 'analytical' },
          { name: 'Budget', value: 'budget' },
          { name: 'Custom', value: 'custom' },
        ],
        default: '',
        description: 'Filter by group type',
      },
    ],
  },
];
