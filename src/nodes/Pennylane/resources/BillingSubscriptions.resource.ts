import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleBillingSubscription(
  context: IExecuteFunctions,
  transport: any,
  operation: string,
  itemIndex: number
): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;

  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('subscriptionData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/billing_subscriptions',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/billing_subscriptions/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/billing_subscriptions', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('subscriptionData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/billing_subscriptions/${id}`,
        data: updateData,
      });

    case 'getInvoiceLines':
      if (!id) throw new Error('ID is required for getInvoiceLines operation');
      return await transport.getAllPages(`/billing_subscriptions/${id}/invoice_lines`, {}, 50);

    case 'getInvoiceLineSections':
      if (!id) throw new Error('ID is required for getInvoiceLineSections operation');
      return await transport.getAllPages(
        `/billing_subscriptions/${id}/invoice_line_sections`,
        {},
        50
      );

    default:
      throw new Error(`Operation '${operation}' is not supported for billing subscriptions`);
  }
}

export const billingSubscriptionProperties = [
  // Billing Subscription ID field
  {
    displayName: 'Billing Subscription ID',
    name: 'billingSubscriptionId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['billingSubscription'],
        operation: ['get', 'update', 'getInvoiceLines', 'getInvoiceLineSections'],
      },
    },
    required: true,
    description: 'The ID of the billing subscription',
  },

  // Subscription Data for create/update
  {
    displayName: 'Subscription Data',
    name: 'subscriptionData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['billingSubscription'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Customer ID',
        name: 'customer_id',
        type: 'options',
        loadOptionsMethod: 'loadCustomers',
        default: '',
        required: true,
        description: 'Customer for this subscription',
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        required: true,
        description: 'Subscription name',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Subscription description',
      },
      {
        displayName: 'Start Date',
        name: 'start_date',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'Subscription start date',
      },
      {
        displayName: 'End Date',
        name: 'end_date',
        type: 'dateTime',
        default: '',
        description: 'Subscription end date (leave empty for unlimited)',
      },
      {
        displayName: 'Billing Frequency',
        name: 'billing_frequency',
        type: 'options',
        options: [
          { name: 'Monthly', value: 'monthly' },
          { name: 'Quarterly', value: 'quarterly' },
          { name: 'Yearly', value: 'yearly' },
        ],
        default: 'monthly',
        required: true,
        description: 'How often to bill',
      },
      {
        displayName: 'Next Billing Date',
        name: 'next_billing_date',
        type: 'dateTime',
        default: '',
        description: 'Next billing date',
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
        description: 'Subscription currency',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the subscription is active',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'billingSubscriptionFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['billingSubscription'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Customer ID',
        name: 'customer_id',
        type: 'options',
        loadOptionsMethod: 'loadCustomers',
        default: '',
        description: 'Filter by customer',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: '',
        description: 'Filter by active status',
      },
      {
        displayName: 'Billing Frequency',
        name: 'billing_frequency',
        type: 'options',
        options: [
          { name: 'Monthly', value: 'monthly' },
          { name: 'Quarterly', value: 'quarterly' },
          { name: 'Yearly', value: 'yearly' },
        ],
        default: '',
        description: 'Filter by billing frequency',
      },
    ],
  },
];
