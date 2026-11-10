import type {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import {
  getClientIntegration,
  isTaskClientIntegration,
  listClientIntegrationServices,
  type TaskClientIntegration
} from '../integrations/platform/registry'

interface OrgTaskCount {
  readonly service: TaskServiceEnum
  readonly taskCount: number
}

interface ServiceConnection {
  readonly service: IntegrationProviderServiceEnum
  readonly isConnected: boolean
}

export const SUGGESTED_SEND_SERVICES: readonly TaskClientIntegration[] = [
  'jira',
  'github',
  'gitlab'
]
const MAX_SEND_SERVICES = 3

const getTitles = (services: readonly TaskClientIntegration[]) =>
  services.map((service) => getClientIntegration(service).title)

export const getSendServices = (viewerServices: readonly ServiceConnection[]) =>
  listClientIntegrationServices(viewerServices.filter(({isConnected}) => isConnected))
    .map(({integrationService}) => integrationService.service)
    .filter(isTaskClientIntegration)
    .slice(0, MAX_SEND_SERVICES)

export const getSendToLabel = (services: readonly TaskClientIntegration[]) => {
  const titles = getTitles(services)
  if (titles.length < 2) return `Send to ${titles[0] ?? 'a tool'}`
  return `Send to ${titles.slice(0, -1).join(', ')} or ${titles.at(-1)}`
}

export const getOrgSendServices = (orgTaskCounts: readonly OrgTaskCount[]) =>
  orgTaskCounts
    .filter(({taskCount}) => taskCount > 0)
    .toSorted((a, b) => b.taskCount - a.taskCount)
    .map(({service}) => service)
    .filter(isTaskClientIntegration)
    .slice(0, MAX_SEND_SERVICES)

export const getConnectLabel = (services: readonly TaskClientIntegration[]) =>
  `Connect ${getTitles(services).join(', ')} or another tool to send this task`
