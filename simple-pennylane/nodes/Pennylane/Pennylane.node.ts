import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
  NodeConnectionType,
} from 'n8n-workflow';

import { pennylaneApiRequest } from './GenericFunctions';

export class Pennylane implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pennylane Simple',
    name: 'pennylaneSimple',
    icon: 'file:pennylane.png',
    group: ['transform'],
    version: 1,
    description: 'Simple Pennylane integration',
    defaults: {
      name: 'Pennylane Simple',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'pennylaneApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          { name: 'Customer', value: 'customer' },
          { name: 'Invoice', value: 'invoice' },
        ],
        default: 'customer',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: { resource: ['customer'] },
        },
        options: [
          { name: 'Get All', value: 'getAll' },
          { name: 'Get', value: 'get' },
        ],
        default: 'getAll',
      },
      {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'string',
        displayOptions: {
          show: { resource: ['customer'], operation: ['get'] },
        },
        default: '',
      },
    ],
  };

  methods = {
    loadOptions: {
      async getCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const response = await pennylaneApiRequest.call(this, 'GET', '/customers');
          const customers = response.items || [];
          return customers.map((customer: any) => ({
            name: customer.name || customer.id,
            value: customer.id,
          }));
        } catch (error) {
          return [];
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        let responseData;

        if (resource === 'customer') {
          if (operation === 'getAll') {
            responseData = await pennylaneApiRequest.call(this, 'GET', '/customers');
          } else if (operation === 'get') {
            const customerId = this.getNodeParameter('customerId', i) as string;
            responseData = await pennylaneApiRequest.call(this, 'GET', `/customers/${customerId}`);
          }
        }

        returnData.push({
          json: responseData || { message: 'No data returned' },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error instanceof Error ? error.message : String(error) },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }
}
