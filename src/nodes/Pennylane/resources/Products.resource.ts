import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleProduct(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('productData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/products',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/products/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/products', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('productData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/products/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/products/${id}`,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for products`);
  }
}

export const productProperties = [
  // Product ID field
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['get', 'update', 'delete'],
      },
    },
    required: true,
    description: 'The ID of the product',
  },

  // Product Data for create/update
  {
    displayName: 'Product Data',
    name: 'productData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Label',
        name: 'label',
        type: 'string',
        default: '',
        required: true,
        description: 'Product name/label',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Product description',
      },
      {
        displayName: 'Price',
        name: 'price',
        type: 'number',
        default: 0,
        description: 'Product price (excluding tax)',
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
        description: 'Product currency',
      },
      {
        displayName: 'VAT Rate',
        name: 'vat_rate',
        type: 'options',
        options: [
          { name: '0%', value: '0' },
          { name: '5.5%', value: '5.5' },
          { name: '10%', value: '10' },
          { name: '20%', value: '20' },
        ],
        default: '20',
        description: 'VAT rate for this product',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        description: 'Product reference/SKU',
      },
      {
        displayName: 'Category ID',
        name: 'category_id',
        type: 'options',
        loadOptionsMethod: 'loadCategories',
        default: '',
        description: 'Product category',
      },
      {
        displayName: 'Unit',
        name: 'unit',
        type: 'options',
        options: [
          { name: 'Unit', value: 'unit' },
          { name: 'Hour', value: 'hour' },
          { name: 'Day', value: 'day' },
          { name: 'Month', value: 'month' },
          { name: 'Kilogram', value: 'kg' },
          { name: 'Meter', value: 'm' },
        ],
        default: 'unit',
        description: 'Product unit',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'productFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['product'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Category ID',
        name: 'category_id',
        type: 'options',
        loadOptionsMethod: 'loadCategories',
        default: '',
        description: 'Filter by category',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        description: 'Search in product label and description',
      },
    ],
  },
];
