import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PennylaneTokenApi implements ICredentialType {
  name = 'pennylaneTokenApi';
  displayName = 'Pennylane Token API';
  documentationUrl = 'https://pennylane.readme.io/docs/generating-my-api-token';
  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Pennylane company API token. Generate this in your Pennylane account settings.',
    },
    {
      displayName: 'Company ID',
      name: 'companyId',
      type: 'string',
      default: '',
      required: false,
      description: 'Your Pennylane company ID (optional, can be set per operation)',
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
        },
        {
          name: 'Sandbox',
          value: 'sandbox',
        },
      ],
      default: 'production',
      description: 'Choose between production or sandbox environment',
    },
  ];
}
