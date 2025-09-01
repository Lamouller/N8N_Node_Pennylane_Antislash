import { IExecuteFunctions, IDataObject } from 'n8n-workflow';

export async function handleCommercialDocument(
  context: IExecuteFunctions,
  transport: any,
  operation: string,
  itemIndex: number
): Promise<any> {
  const id = context.getNodeParameter('id', itemIndex, '') as string;

  switch (operation) {
    case 'get':
      if (!id) throw new Error('ID is required for get operation');
      return await transport.request({
        method: 'GET',
        url: `/commercial_documents/${id}`,
      });

    case 'getAll':
      const filters = context.getNodeParameter('filters', itemIndex, {}) as IDataObject;
      return await transport.getAllPages('/commercial_documents', filters, 50);

    case 'getInvoiceLineSections':
      if (!id) throw new Error('ID is required for getInvoiceLineSections operation');
      return await transport.getAllPages(
        `/commercial_documents/${id}/invoice_line_sections`,
        {},
        50
      );

    case 'getInvoiceLines':
      if (!id) throw new Error('ID is required for getInvoiceLines operation');
      return await transport.getAllPages(`/commercial_documents/${id}/invoice_lines`, {}, 50);

    case 'getAppendices':
      if (!id) throw new Error('ID is required for getAppendices operation');
      return await transport.getAllPages(`/commercial_documents/${id}/appendices`, {}, 50);

    case 'uploadAppendix':
      if (!id) throw new Error('ID is required for uploadAppendix operation');
      const inputData = context.getInputData();
      const item = inputData[itemIndex];
      if (!item || !item.binary || !item.binary.data) {
        throw new Error('No binary data found for upload');
      }
      const binaryData = item.binary;

      const fileData = binaryData.data!;

      return await transport.uploadFile(
        `/commercial_documents/${id}/appendices`,
        fileData.data,
        fileData.fileName || 'appendix.pdf'
      );

    default:
      throw new Error(`Operation '${operation}' is not supported for commercial documents`);
  }
}

export const commercialDocumentProperties = [
  // Commercial Document ID field
  {
    displayName: 'Commercial Document ID',
    name: 'commercialdocumentId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['commercialDocument'],
        operation: [
          'get',
          'getInvoiceLineSections',
          'getInvoiceLines',
          'getAppendices',
          'uploadAppendix',
        ],
      },
    },
    required: true,
    description: 'The ID of the commercial document',
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'commercialdocumentFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    displayOptions: {
      show: {
        resource: ['commercialDocument'],
        operation: ['getAll'],
      },
    },
    default: {},
    options: [
      {
        displayName: 'Document Type',
        name: 'document_type',
        type: 'options',
        options: [
          { name: 'Invoice', value: 'invoice' },
          { name: 'Quote', value: 'quote' },
          { name: 'Credit Note', value: 'credit_note' },
        ],
        default: '',
        description: 'Filter by document type',
      },
      {
        displayName: 'Customer ID',
        name: 'customer_id',
        type: 'options',
        loadOptionsMethod: 'loadCustomers',
        default: '',
        description: 'Filter by customer',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Finalized', value: 'finalized' },
          { name: 'Sent', value: 'sent' },
          { name: 'Paid', value: 'paid' },
        ],
        default: '',
        description: 'Filter by status',
      },
      {
        displayName: 'Date From',
        name: 'date_from',
        type: 'dateTime',
        default: '',
        description: 'Filter documents from this date',
      },
      {
        displayName: 'Date To',
        name: 'date_to',
        type: 'dateTime',
        default: '',
        description: 'Filter documents to this date',
      },
    ],
  },
];
