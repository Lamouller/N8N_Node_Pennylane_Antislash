import { ITriggerFunctions, INodeType, INodeTypeDescription, IDataObject, ITriggerResponse } from 'n8n-workflow';
import { createTransport } from '../../helpers/transport';

export class PennylaneTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pennylane Trigger',
    name: 'pennylaneTrigger',
    icon: 'file:pennylanetrigger.png',
    group: ['trigger'],
    version: 1,
    description: 'Trigger workflows when data changes in Pennylane',
    defaults: {
      name: 'Pennylane Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'pennylaneTokenApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource to Watch',
        name: 'resourceToWatch',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Customer Invoices',
            value: 'customer_invoices',
            description: 'Watch for changes in customer invoices',
          },
          {
            name: 'Supplier Invoices',
            value: 'supplier_invoices',
            description: 'Watch for changes in supplier invoices',
          },
          {
            name: 'Customers',
            value: 'customers',
            description: 'Watch for changes in customers',
          },
          {
            name: 'Suppliers',
            value: 'suppliers',
            description: 'Watch for changes in suppliers',
          },
          {
            name: 'Products',
            value: 'products',
            description: 'Watch for changes in products',
          },
          {
            name: 'Ledger Entry Lines',
            value: 'ledger_entry_lines',
            description: 'Watch for changes in ledger entry lines',
          },
          {
            name: 'Transactions',
            value: 'transactions',
            description: 'Watch for changes in bank transactions',
          },
        ],
        default: 'customer_invoices',
        required: true,
      },
      {
        displayName: 'Since',
        name: 'since',
        type: 'dateTime',
        default: '',
        description: 'Start watching from this timestamp (defaults to 24 hours ago if not set)',
        required: false,
      },
      {
        displayName: 'Page Size',
        name: 'pageSize',
        type: 'number',
        default: 50,
        description: 'Number of items to fetch per page (max 100)',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        required: false,
      },
      {
        displayName: 'Polling Interval',
        name: 'pollingInterval',
        type: 'options',
        options: [
          {
            name: 'Every 30 seconds',
            value: 30,
          },
          {
            name: 'Every minute',
            value: 60,
          },
          {
            name: 'Every 5 minutes',
            value: 300,
          },
          {
            name: 'Every 15 minutes',
            value: 900,
          },
          {
            name: 'Every hour',
            value: 3600,
          },
        ],
        default: 300,
        description: 'How often to check for changes',
        required: true,
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            displayName: 'Status Filter',
            name: 'status',
            type: 'options',
            options: [
              { name: 'All', value: '' },
              { name: 'Active', value: 'active' },
              { name: 'Inactive', value: 'inactive' },
              { name: 'Draft', value: 'draft' },
              { name: 'Sent', value: 'sent' },
              { name: 'Paid', value: 'paid' },
              { name: 'Overdue', value: 'overdue' },
              { name: 'Cancelled', value: 'cancelled' },
              { name: 'Pending', value: 'pending' },
              { name: 'Validated', value: 'validated' },
            ],
            default: '',
            description: 'Filter by status (if applicable to the resource)',
          },
          {
            displayName: 'Customer ID',
            name: 'customer_id',
            type: 'string',
            default: '',
            description: 'Filter by customer ID (if applicable)',
          },
          {
            displayName: 'Supplier ID',
            name: 'supplier_id',
            type: 'string',
            default: '',
            description: 'Filter by supplier ID (if applicable)',
          },
          {
            displayName: 'Max Items per Poll',
            name: 'maxItems',
            type: 'number',
            default: 1000,
            description: 'Maximum number of items to process per polling cycle',
            typeOptions: {
              minValue: 1,
              maxValue: 10000,
            },
          },
        ],
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const resourceToWatch = this.getNodeParameter('resourceToWatch', 0) as string;
    const since = this.getNodeParameter('since', 0) as string;
    const pageSize = this.getNodeParameter('pageSize', 0) as number;
    const pollingInterval = this.getNodeParameter('pollingInterval', 0) as number;
    const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

    let transport: any;
    try {
      transport = await createTransport(this, 'pennylaneTokenApi');
    } catch (error) {
      throw new Error('Unable to connect to Pennylane API. Please check your credentials.');
    }

    // Set rate limit for trigger operations
    transport.setRateLimit(2); // Lower rate limit for triggers

    // Initialize since timestamp
    let sinceTimestamp = since;
    if (!sinceTimestamp) {
      // Default to 24 hours ago
      const now = new Date();
      now.setHours(now.getHours() - 24);
      sinceTimestamp = now.toISOString();
    }

    // Get the latest timestamp from the last execution
    const lastExecutionTime = this.getWorkflowStaticData('node').lastExecutionTime as string;
    if (lastExecutionTime) {
      sinceTimestamp = lastExecutionTime;
    }

    const executeTrigger = async () => {
      try {
        // Build query parameters
        const params: Record<string, any> = {
          since: sinceTimestamp,
          limit: pageSize,
        };

        // Add additional filters
        if (additionalFields.status) params.status = additionalFields.status;
        if (additionalFields.customer_id) params.customer_id = additionalFields.customer_id;
        if (additionalFields.supplier_id) params.supplier_id = additionalFields.supplier_id;

        // Fetch changelog data
        const changelogData = await transport.getAllPages(
          `/changelogs/${resourceToWatch}`,
          params,
          additionalFields.maxItems as number || 1000
        );

        if (changelogData.length > 0) {
          // Update the last execution time to the latest change timestamp
          const latestTimestamp = changelogData[changelogData.length - 1].updated_at;
          this.getWorkflowStaticData('node').lastExecutionTime = latestTimestamp;

          // Emit each change as a separate item
          for (const change of changelogData) {
            this.emit([{
              json: {
                ...change,
                _triggerResource: resourceToWatch,
                _triggerTimestamp: new Date().toISOString(),
              },
            }] as any);
          }
        }
      } catch (error) {
        // Log error but don't fail the trigger
        console.error('Pennylane Trigger Error:', error);
      }
    };

    // Execute immediately on first run
    await executeTrigger();

    // Set up polling interval
    const intervalId = setInterval(executeTrigger, pollingInterval * 1000);

    // Return cleanup function
    return {
      closeFunction: () => {
        clearInterval(intervalId);
      },
    } as any;
  }
}
