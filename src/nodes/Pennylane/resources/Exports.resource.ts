import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleExport(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('exportData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/exports',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/exports/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/exports', filters, 50);

    case 'download':
      if (!id) throw new Error('ID is required for download operation');
      return await transport.request({
        method: 'GET',
        url: `/exports/${id}/download`,
        responseType: 'blob',
      });

    case 'generateFEC':
      const fecData = context.getNodeParameter('fecData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/exports/fec',
        data: fecData,
      });

    case 'generateTrialBalance':
      const trialBalanceData = context.getNodeParameter('trialBalanceData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/exports/trial_balance',
        data: trialBalanceData,
      });

    case 'generateAnalyticalLedger':
      const analyticalLedgerData = context.getNodeParameter('analyticalLedgerData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/exports/analytical_ledger',
        data: analyticalLedgerData,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for exports`);
  }
}

export const exportProperties = [
  // Export ID field
  {
    displayName: 'Export ID',
    name: 'exportId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['export'],
        operation: ['get', 'download'],
      },
    },
    required: true,
    description: 'The ID of the export',
  },

  // Export Data for create
  {
    displayName: 'Export Data',
    name: 'exportData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['export'],
        operation: ['create'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Customer Invoices', value: 'customer_invoices' },
          { name: 'Supplier Invoices', value: 'supplier_invoices' },
          { name: 'Transactions', value: 'transactions' },
          { name: 'Customers', value: 'customers' },
          { name: 'Suppliers', value: 'suppliers' },
          { name: 'Products', value: 'products' },
        ],
        default: 'customer_invoices',
        required: true,
        description: 'Type of data to export',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'CSV', value: 'csv' },
          { name: 'Excel', value: 'excel' },
          { name: 'PDF', value: 'pdf' },
        ],
        default: 'csv',
        description: 'Export format',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        description: 'Start date for export',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        description: 'End date for export',
      },
    ],
  },

  // FEC Data
  {
    displayName: 'FEC Data',
    name: 'fecData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['export'],
        operation: ['generateFEC'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Fiscal Year',
        name: 'fiscal_year',
        type: 'options',
        loadOptionsMethod: 'loadFiscalYears',
        default: '',
        required: true,
        description: 'Fiscal year for FEC generation',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'CSV', value: 'csv' },
          { name: 'TXT', value: 'txt' },
        ],
        default: 'csv',
        description: 'FEC file format',
      },
    ],
  },

  // Trial Balance Data
  {
    displayName: 'Trial Balance Data',
    name: 'trialBalanceData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['export'],
        operation: ['generateTrialBalance'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'Start date for trial balance',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'End date for trial balance',
      },
      {
        displayName: 'Include Opening Balance',
        name: 'include_opening_balance',
        type: 'boolean',
        default: true,
        description: 'Include opening balance in the report',
      },
    ],
  },

  // Analytical Ledger Data
  {
    displayName: 'Analytical Ledger Data',
    name: 'analyticalLedgerData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['export'],
        operation: ['generateAnalyticalLedger'],
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
        description: 'Category for analytical ledger',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'Start date for analytical ledger',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'End date for analytical ledger',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'exportFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['export'],
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
          { name: 'Customer Invoices', value: 'customer_invoices' },
          { name: 'Supplier Invoices', value: 'supplier_invoices' },
          { name: 'Transactions', value: 'transactions' },
          { name: 'FEC', value: 'fec' },
          { name: 'Trial Balance', value: 'trial_balance' },
          { name: 'Analytical Ledger', value: 'analytical_ledger' },
        ],
        default: '',
        description: 'Filter by export type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Pending', value: 'pending' },
          { name: 'Processing', value: 'processing' },
          { name: 'Completed', value: 'completed' },
          { name: 'Failed', value: 'failed' },
        ],
        default: '',
        description: 'Filter by status',
      },
    ],
  },
];
