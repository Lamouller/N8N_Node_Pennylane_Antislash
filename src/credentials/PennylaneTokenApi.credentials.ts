import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class PennylaneTokenApi implements ICredentialType {
  name = 'pennylaneTokenApi';
  displayName = 'Pennylane API';
  documentationUrl = 'https://pennylane.readme.io/';
  properties: INodeProperties[] = [
    {
      displayName: 'Authentication Type',
      name: 'authType',
      type: 'options',
      options: [
        {
          name: 'API Token (Recommended for personal use)',
          value: 'token',
        },
        {
          name: 'OAuth2 (For integrations & apps)',
          value: 'oauth2',
        },
      ],
      default: 'token',
      description: 'Choose your authentication method',
    },

    // API Token fields
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      displayOptions: {
        show: {
          authType: ['token'],
        },
      },
      default: '',
      required: true,
      description:
        'Your Pennylane company API token. Generate this in your Pennylane account settings.',
    },
    {
      displayName: 'Company ID',
      name: 'companyId',
      type: 'string',
      displayOptions: {
        show: {
          authType: ['token'],
        },
      },
      default: '',
      required: false,
      description: 'Your Pennylane company ID (optional, can be set per operation)',
    },

    // OAuth2 fields
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'string',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      default: 'https://app.pennylane.com/oauth/authorize',
      required: true,
      description: 'Pennylane OAuth2 authorization URL',
    },
    {
      displayName: 'Token URL',
      name: 'tokenUrl',
      type: 'string',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      default: 'https://app.pennylane.com/oauth/token',
      required: true,
      description: 'Pennylane OAuth2 token URL',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      default: '',
      required: true,
      description: 'OAuth2 Client ID from your Pennylane app',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      default: '',
      required: true,
      description: 'OAuth2 Client Secret from your Pennylane app',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      default: 'accounting',
      required: true,
      description: 'OAuth2 scope (space-separated list)',
    },
    {
      displayName: 'OAuth2 Company ID',
      name: 'oauthCompanyId',
      type: 'string',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      default: '',
      required: false,
      description: 'Your Pennylane company ID for OAuth2 (optional)',
    },

    // Common environment field
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
