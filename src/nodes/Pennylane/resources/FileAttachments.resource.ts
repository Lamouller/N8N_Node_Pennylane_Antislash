import { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import FormData from 'form-data';

export async function handleFileAttachment(context: IExecuteFunctions, transport: any, operation: string, itemIndex: number): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;
  
  switch (operation) {
    case 'upload':
      const inputData = context.getInputData();
      const item = inputData[itemIndex];
      if (!item || !item.binary || !item.binary.data) {
        throw new Error('No binary data found for upload');
      }
      const binaryData = item.binary;

      const uploadData = context.getNodeParameter('uploadData', itemIndex, {}) as IDataObject;
      const formData = new FormData();
      const fileData = binaryData.data!;
      
      formData.append('file', fileData.data, fileData.fileName || 'attachment.pdf');
      formData.append('resource_type', uploadData.resource_type as string);
      formData.append('resource_id', uploadData.resource_id as string);
      if (uploadData.description) {
        formData.append('description', uploadData.description as string);
      }
      
      return await transport.request({
        method: 'POST',
        url: '/file_attachments',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/file_attachments/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/file_attachments', filters, 50);

    case 'download':
      if (!id) throw new Error('ID is required for download operation');
      return await transport.request({
        method: 'GET',
        url: `/file_attachments/${id}/download`,
        responseType: 'blob',
      });

    case 'delete':
      if (!id) throw new Error('ID is required for delete operation');
      return await transport.request({
        method: 'DELETE',
        url: `/file_attachments/${id}`,
      });

    case 'update':
      if (!id) throw new Error('ID is required for update operation');
      const updateData = context.getNodeParameter('updateData', itemIndex, {}) as IDataObject;
      return await transport.request({
        method: 'PUT',
        url: `/file_attachments/${id}`,
        data: updateData,
      });

    default:
      throw new Error(`Operation '${operation}' is not supported for file attachments`);
  }
}

export const fileAttachmentProperties = [
  // File Attachment ID field
  {
    displayName: 'File Attachment ID',
    name: 'id',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['fileAttachment'],
        operation: ['get', 'download', 'delete', 'update'],
      },
    },
    required: true,
    description: 'The ID of the file attachment',
  },

  // Upload Data
  {
    displayName: 'Upload Data',
    name: 'uploadData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['fileAttachment'],
        operation: ['upload'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Resource Type',
        name: 'resource_type',
        type: 'options',
        options: [
          { name: 'Customer Invoice', value: 'customer_invoice' },
          { name: 'Supplier Invoice', value: 'supplier_invoice' },
          { name: 'Quote', value: 'quote' },
          { name: 'Transaction', value: 'transaction' },
          { name: 'Customer', value: 'customer' },
          { name: 'Supplier', value: 'supplier' },
        ],
        default: 'customer_invoice',
        required: true,
        description: 'Type of resource to attach file to',
      },
      {
        displayName: 'Resource ID',
        name: 'resource_id',
        type: 'string',
        default: '',
        required: true,
        description: 'ID of the resource to attach file to',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the file attachment',
      },
    ],
  },

  // Update Data
  {
    displayName: 'Update Data',
    name: 'updateData',
    type: 'collection',
    placeholder: 'Add Field',
    displayOptions: {
      show: {
        resource: ['fileAttachment'],
        operation: ['update'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Updated description of the file attachment',
      },
      {
        displayName: 'File Name',
        name: 'file_name',
        type: 'string',
        default: '',
        description: 'Updated file name',
      },
    ],
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['fileAttachment'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Resource Type',
        name: 'resource_type',
        type: 'options',
        options: [
          { name: 'Customer Invoice', value: 'customer_invoice' },
          { name: 'Supplier Invoice', value: 'supplier_invoice' },
          { name: 'Quote', value: 'quote' },
          { name: 'Transaction', value: 'transaction' },
          { name: 'Customer', value: 'customer' },
          { name: 'Supplier', value: 'supplier' },
        ],
        default: '',
        description: 'Filter by resource type',
      },
      {
        displayName: 'Resource ID',
        name: 'resource_id',
        type: 'string',
        default: '',
        description: 'Filter by resource ID',
      },
      {
        displayName: 'File Type',
        name: 'file_type',
        type: 'options',
        options: [
          { name: 'PDF', value: 'pdf' },
          { name: 'Image', value: 'image' },
          { name: 'Excel', value: 'excel' },
          { name: 'Word', value: 'word' },
          { name: 'CSV', value: 'csv' },
        ],
        default: '',
        description: 'Filter by file type',
      },
    ],
  },
];
