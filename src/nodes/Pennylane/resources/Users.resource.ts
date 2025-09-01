import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleUser(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'create':
      const createData = context.getNodeParameter('userData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/users',
        data: createData,
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/users/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/users', filters, 50);

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('userData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/users/${id}`,
        data: updateData,
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/users/${id}`,
      });

    case 'invite':
      const inviteData = context.getNodeParameter('inviteData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'POST',
        url: '/users/invite',
        data: inviteData,
      });

    case 'resendInvitation':
      if (!id) throw new Error('ID is required for resendInvitation operation');
      return await transport.request({
        method: 'POST',
        url: `/users/${id}/resend_invitation`,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for users`);
  }
}

export const userProperties = [
  // User ID field
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['get', 'update', 'delete', 'resendInvitation'],
      },
    },
    required: true,
    description: 'The ID of the user',
  },

  // User Data for create/update
  {
    displayName: 'User Data',
    name: 'userData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['create', 'update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        required: true,
        description: 'User email address',
      },
      {
        displayName: 'First Name',
        name: 'first_name',
        type: 'string',
        default: '',
        required: true,
        description: 'User first name',
      },
      {
        displayName: 'Last Name',
        name: 'last_name',
        type: 'string',
        default: '',
        required: true,
        description: 'User last name',
      },
      {
        displayName: 'Role',
        name: 'role',
        type: 'options',
        options: [
          { name: 'Admin', value: 'admin' },
          { name: 'Manager', value: 'manager' },
          { name: 'Accountant', value: 'accountant' },
          { name: 'Viewer', value: 'viewer' },
        ],
        default: 'viewer',
        description: 'User role',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'User phone number',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the user is active',
      },
    ],
  },

  // Invite Data
  {
    displayName: 'Invite Data',
    name: 'inviteData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['invite'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        required: true,
        description: 'Email address to invite',
      },
      {
        displayName: 'Role',
        name: 'role',
        type: 'options',
        options: [
          { name: 'Admin', value: 'admin' },
          { name: 'Manager', value: 'manager' },
          { name: 'Accountant', value: 'accountant' },
          { name: 'Viewer', value: 'viewer' },
        ],
        default: 'viewer',
        required: true,
        description: 'Role for the invited user',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        description: 'Custom invitation message',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'userFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Role',
        name: 'role',
        type: 'options',
        options: [
          { name: 'Admin', value: 'admin' },
          { name: 'Manager', value: 'manager' },
          { name: 'Accountant', value: 'accountant' },
          { name: 'Viewer', value: 'viewer' },
        ],
        default: '',
        description: 'Filter by role',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: '',
        description: 'Filter by active status',
      },
    ],
  },
];
