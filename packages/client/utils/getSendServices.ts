import type {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import {
  getClientIntegration,
  isTaskClientIntegration,
  listClientIntegrationServices,
  type TaskClientIntegration
} from '../integrations/platform/registry'

interface ServiceConnection {
  readonly service: IntegrationProviderServiceEnum
  readonly isConnected: boolean
}

export const DEFAULT_SEND_SERVICES: readonly TaskClientIntegration[] = ['jira', 'github', 'gitlab']
const MAX_SEND_SERVICES = 3

const getConnectedTaskServices = (services: readonly ServiceConnection[]) =>
  listClientIntegrationServices(services.filter(({isConnected}) => isConnected))
    .map(({integrationService}) => integrationService.service)
    .filter(isTaskClientIntegration)
    .slice(0, MAX_SEND_SERVICES)

export const getSendServices = (viewerServices: readonly ServiceConnection[]) => {
  const viewerTools = getConnectedTaskServices(viewerServices)
  return viewerTools.length > 0 ? viewerTools : DEFAULT_SEND_SERVICES
}

export const getSendToLabel = (services: readonly TaskClientIntegration[]) => {
  const titles = services.map((service) => getClientIntegration(service).title)
  if (titles.length < 2) return `Send to ${titles[0] ?? 'a tool'}`
  return `Send to ${titles.slice(0, -1).join(', ')} or ${titles.at(-1)}`
}
