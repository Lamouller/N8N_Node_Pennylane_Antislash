import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleCategory(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('categoryData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/categories',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/categories/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/categories', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('categoryData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/categories/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/categories/${id}`,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for categories`);
  }
}

export const categoryProperties = [
  // Category ID field
  {
    displayName: 'Category ID',
    name: 'categorieId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['category'],
        operation: ['get', 'update', 'delete'],
      },
    },
    required: true,
    description: 'The ID of the category',
  },

  // Category Data for create/update
  {
    displayName: 'Category Data',
    name: 'categoryData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['category'],
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
        description: 'Category name',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Category description',
      },
      {
        displayName: 'Parent Category ID',
        name: 'parent_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'loadCategories',
        },
        default: '',
        description: 'Parent category (for subcategories)',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Income', value: 'income' },
          { name: 'Expense', value: 'expense' },
          { name: 'Asset', value: 'asset' },
          { name: 'Liability', value: 'liability' },
          { name: 'Equity', value: 'equity' },
        ],
        default: 'expense',
        description: 'Category type',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'categorieFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['category'],
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
          { name: 'Income', value: 'income' },
          { name: 'Expense', value: 'expense' },
          { name: 'Asset', value: 'asset' },
          { name: 'Liability', value: 'liability' },
          { name: 'Equity', value: 'equity' },
        ],
        default: '',
        description: 'Filter by type',
      },
      {
        displayName: 'Parent Category ID',
        name: 'parent_id',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'loadCategories',
        },
        default: '',
        description: 'Filter by parent category',
      },
    ],
  },
];
