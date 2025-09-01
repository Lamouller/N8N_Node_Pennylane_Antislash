import {
  ITriggerFunctions,
  IDataObject,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  INodePropertyOptions,
  NodeConnectionType,
} from 'n8n-workflow';

import { pennylaneApiRequest } from '../../nodes/Pennylane/GenericFunctions';

export class PennylaneTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Pennylane Trigger',
    name: 'pennylaneTrigger',
    icon: 'file:pennylane.png',
    group: ['trigger'],
    version: 1,
    description: 'Trigger on Pennylane data changes using Changelogs API',
    defaults: {
      name: 'Pennylane Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'pennylaneApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Resource Type',
        name: 'resourceType',
        type: 'options',
        options: [
          { name: 'Customer Invoices', value: 'customer_invoices' },
          { name: 'Supplier Invoices', value: 'supplier_invoices' },
          { name: 'Customers', value: 'customers' },
          { name: 'Suppliers', value: 'suppliers' },
          { name: 'Products', value: 'products' },
          { name: 'Ledger Entry Lines', value: 'ledger_entry_lines' },
          { name: 'Transactions', value: 'transactions' },
        ],
        default: 'customer_invoices',
        description: 'The type of resource to monitor for changes',
      },
      {
        displayName: 'Event Types',
        name: 'eventTypes',
        type: 'multiOptions',
        options: [
          { name: 'Created', value: 'created' },
          { name: 'Updated', value: 'updated' },
          { name: 'Deleted', value: 'deleted' },
        ],
        default: ['created', 'updated'],
        description: 'Types of events to monitor',
      },
      {
        displayName: 'Poll Interval (minutes)',
        name: 'pollInterval',
        type: 'number',
        default: 5,
        description: 'How often to check for changes (in minutes)',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const resourceType = this.getNodeParameter('resourceType') as string;
    const eventTypes = this.getNodeParameter('eventTypes') as string[];
    const pollInterval = this.getNodeParameter('pollInterval') as number;

    let lastCheckTime = new Date();

    const triggerFunction = async () => {
      try {
        // Récupérer les changements depuis la dernière vérification
        const now = new Date();
        const since = lastCheckTime.toISOString();
        
        let endpoint = '';
        switch (resourceType) {
          case 'customer_invoices':
            endpoint = '/changelogs/customer_invoices';
            break;
          case 'supplier_invoices':
            endpoint = '/changelogs/supplier_invoices';
            break;
          case 'customers':
            endpoint = '/changelogs/customers';
            break;
          case 'suppliers':
            endpoint = '/changelogs/suppliers';
            break;
          case 'products':
            endpoint = '/changelogs/products';
            break;
          case 'ledger_entry_lines':
            endpoint = '/changelogs/ledger_entry_lines';
            break;
          case 'transactions':
            endpoint = '/changelogs/transactions';
            break;
          default:
            throw new Error(`Unknown resource type: ${resourceType}`);
        }

        // Ajouter le paramètre since pour récupérer les changements récents
        const urlWithParams = `${endpoint}?since=${since}`;
        
        const response = await pennylaneApiRequest.call(this as any, 'GET', urlWithParams);
        
        if (response && response.items && response.items.length > 0) {
          // Filtrer par types d'événements
          const filteredItems = response.items.filter((item: any) => 
            eventTypes.includes(item.event_type)
          );

          if (filteredItems.length > 0) {
            // Émettre chaque changement comme un item séparé
            this.emit(filteredItems.map((item: any) => ({
              json: {
                event_type: item.event_type,
                resource_type: resourceType,
                resource_id: item.resource_id,
                changed_at: item.changed_at,
                changes: item.changes || {},
                resource_data: item.resource || {},
                webhook_data: {
                  timestamp: now.toISOString(),
                  source: 'pennylane_changelog'
                }
              }
            })));
          }
        }

        lastCheckTime = now;
      } catch (error) {
        // Ne pas faire crasher le trigger, juste logger l'erreur
        console.error('Pennylane Trigger Error:', error);
      }
    };

    // Déclencher immédiatement puis programmer les vérifications périodiques
    const intervalId = setInterval(triggerFunction, pollInterval * 60 * 1000);

    // Fonction de nettoyage
    const closeFunction = async () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    // Première vérification immédiate
    await triggerFunction();

    return {
      closeFunction,
    };
  }
}
