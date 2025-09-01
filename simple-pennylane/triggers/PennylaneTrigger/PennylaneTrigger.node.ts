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
          { name: '📄 Customer Invoices', value: 'customer_invoices' },
          { name: '📄 Supplier Invoices', value: 'supplier_invoices' },
          { name: '👥 Customers', value: 'customers' },
          { name: '🏢 Suppliers', value: 'suppliers' },
          { name: '📦 Products', value: 'products' },
          { name: '📊 Ledger Entry Lines', value: 'ledger_entry_lines' },
          { name: '💳 Transactions', value: 'transactions' },
          { name: '💰 Payments (via Transactions)', value: 'payments' },
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
        default: 2,
        description: 'Initial polling interval (will adapt based on activity)',
      },
      {
        displayName: 'Smart Polling',
        name: 'smartPolling',
        type: 'boolean',
        default: true,
        description: 'Enable intelligent polling that adapts to activity levels',
      },
      {
        displayName: 'Max Poll Interval (minutes)',
        name: 'maxPollInterval',
        type: 'number',
        default: 15,
        displayOptions: {
          show: {
            smartPolling: [true],
          },
        },
        description: 'Maximum polling interval when no activity detected',
      },
      {
        displayName: 'Auto-Stop After (hours)',
        name: 'autoStopAfter',
        type: 'number',
        default: 0,
        description: 'Stop polling after X hours of no activity (0 = never stop)',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const resourceType = this.getNodeParameter('resourceType') as string;
    const eventTypes = this.getNodeParameter('eventTypes') as string[];
    const initialPollInterval = this.getNodeParameter('pollInterval') as number;
    const smartPolling = this.getNodeParameter('smartPolling') as boolean;
    const maxPollInterval = this.getNodeParameter('maxPollInterval') as number;
    const autoStopAfter = this.getNodeParameter('autoStopAfter') as number;

    let lastCheckTime = new Date();
    let currentPollInterval = initialPollInterval;
    let consecutiveEmptyChecks = 0;
    let totalEmptyHours = 0;
    let intervalId: NodeJS.Timeout;

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
          case 'payments':
            endpoint = '/changelogs/transactions'; // Les paiements sont inclus dans les transactions
            break;
          default:
            throw new Error(`Unknown resource type: ${resourceType}`);
        }

        // Ajouter le paramètre since pour récupérer les changements récents
        const urlWithParams = `${endpoint}?since=${since}`;
        
        const response = await pennylaneApiRequest.call(this as any, 'GET', urlWithParams);
        
        if (response && response.items && response.items.length > 0) {
          // Filtrer par types d'événements
          let filteredItems = response.items.filter((item: any) => 
            eventTypes.includes(item.event_type)
          );

          // Si on surveille spécifiquement les paiements, filtrer les transactions liées aux paiements
          if (resourceType === 'payments') {
            filteredItems = filteredItems.filter((item: any) => {
              // Filtrer pour ne garder que les transactions qui sont des paiements
              // (par exemple celles qui ont un amount négatif ou positif selon le type)
              const resource = item.resource || {};
              return resource.label && (
                resource.label.toLowerCase().includes('payment') ||
                resource.label.toLowerCase().includes('paiement') ||
                resource.category_type === 'payment' ||
                (resource.amount && Math.abs(resource.amount) > 0)
              );
            });
          }

          if (filteredItems.length > 0) {
            // 🎉 DONNÉES TROUVÉES ! Réinitialiser l'optimisation
            consecutiveEmptyChecks = 0;
            totalEmptyHours = 0;
            
            // Revenir à l'intervalle initial si smart polling est activé
            if (smartPolling && currentPollInterval > initialPollInterval) {
              currentPollInterval = initialPollInterval;
              // Redémarrer l'intervalle avec la nouvelle fréquence
              clearInterval(intervalId);
              intervalId = setInterval(triggerFunction, currentPollInterval * 60 * 1000);
              console.log(`📈 Pennylane Trigger: Activity detected! Reset to ${currentPollInterval}min polling`);
            }

            // Émettre chaque changement comme un item séparé
            this.emit(filteredItems.map((item: any) => ({
              json: {
                event_type: item.event_type,
                resource_type: resourceType === 'payments' ? 'payments' : resourceType,
                resource_id: item.resource_id,
                changed_at: item.changed_at,
                changes: item.changes || {},
                resource_data: item.resource || {},
                webhook_data: {
                  timestamp: now.toISOString(),
                  source: 'pennylane_changelog',
                  original_resource_type: resourceType === 'payments' ? 'transactions' : resourceType,
                  polling_info: {
                    current_interval: currentPollInterval,
                    consecutive_empty: consecutiveEmptyChecks,
                    smart_polling: smartPolling
                  }
                }
              }
            })));
          } else {
            // 😴 AUCUNE DONNÉE - Appliquer l'optimisation
            consecutiveEmptyChecks++;
            
            if (smartPolling) {
              // Calculer le nouvel intervalle (backoff progressif)
              const newInterval = Math.min(
                initialPollInterval * Math.pow(1.5, Math.floor(consecutiveEmptyChecks / 3)),
                maxPollInterval
              );
              
              if (newInterval > currentPollInterval) {
                currentPollInterval = newInterval;
                // Redémarrer l'intervalle avec la nouvelle fréquence
                clearInterval(intervalId);
                intervalId = setInterval(triggerFunction, currentPollInterval * 60 * 1000);
                console.log(`📉 Pennylane Trigger: No activity (${consecutiveEmptyChecks} checks). Slowing to ${currentPollInterval}min`);
              }
            }
            
            // Vérifier auto-stop
            totalEmptyHours += currentPollInterval / 60;
            if (autoStopAfter > 0 && totalEmptyHours >= autoStopAfter) {
              console.log(`⏹️ Pennylane Trigger: Auto-stopping after ${totalEmptyHours.toFixed(1)}h of inactivity`);
              clearInterval(intervalId);
              return;
            }
          }
        }

        lastCheckTime = now;
      } catch (error) {
        // Ne pas faire crasher le trigger, juste logger l'erreur
        console.error('Pennylane Trigger Error:', error);
      }
    };

    // Déclencher immédiatement puis programmer les vérifications périodiques
    intervalId = setInterval(triggerFunction, currentPollInterval * 60 * 1000);

    // Fonction de nettoyage
    const closeFunction = async () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log('🛑 Pennylane Trigger: Stopped');
      }
    };

    // Première vérification immédiate
    console.log(`🚀 Pennylane Trigger: Started monitoring ${resourceType} every ${currentPollInterval}min ${smartPolling ? '(smart polling enabled)' : ''}`);
    await triggerFunction();

    return {
      closeFunction,
    };
  }
}
