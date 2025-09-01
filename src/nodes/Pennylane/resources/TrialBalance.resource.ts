import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleTrialBalance(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  
  switch (operation) {
    case 'get':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'GET',
        url: '/trial_balance',
        params: filters,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for trial balance`);
  }
}

export const trialBalanceProperties = [
  // Filters for get
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['trialBalance'],
        operation: ['get'],
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
        displayName: 'Ledger Account IDs',
        name: 'ledger_account_ids',
        type: 'string',
        default: '',
        description: 'Comma-separated list of ledger account IDs to include',
      },
      {
        displayName: 'Include Opening Balance',
        name: 'include_opening_balance',
        type: 'boolean',
        default: true,
        description: 'Include opening balance in the trial balance',
      },
      {
        displayName: 'Include Zero Balances',
        name: 'include_zero_balances',
        type: 'boolean',
        default: false,
        description: 'Include accounts with zero balance',
      },
    ],
  },
];
