import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class PennylaneOAuth2Api implements ICredentialType {
  name = 'pennylaneOAuth2Api';
  displayName = 'Pennylane OAuth2 API';
  documentationUrl = 'https://pennylane.readme.io/docs/oauth-20-walkthrough';
  extends = ['oAuth2'];
  properties: INodeProperties[] = [
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'string',
      default: 'https://app.pennylane.com/oauth/authorize',
      required: true,
      description: 'Pennylane OAuth2 authorization URL',
    },
    {
      displayName: 'Token URL',
      name: 'tokenUrl',
      type: 'string',
      default: 'https://app.pennylane.com/oauth/token',
      required: true,
      description: 'Pennylane OAuth2 token URL',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      default: 'read write',
      required: true,
      description: 'Space-separated list of scopes. Common scopes: read, write, accounting, invoicing',
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
