import type {TaskIntegrationLink_integration$data} from '../../__generated__/TaskIntegrationLink_integration.graphql'
import type {TaskLinkDetails} from './ClientIntegrationDefinition'
import {
  clientIntegrationsByPopularity,
  getClientIntegration,
  isTaskClientIntegration,
  type TaskClientIntegration
} from './registry'

interface TaskLink extends TaskLinkDetails {
  service: TaskClientIntegration
}

const getTaskLink = (integration: TaskIntegrationLink_integration$data): TaskLink | null => {
  for (const service of clientIntegrationsByPopularity) {
    if (!isTaskClientIntegration(service)) continue
    const details = getClientIntegration(service).capabilities.taskLink?.getDetails(integration)
    if (details) return {...details, service}
  }
  return null
}

export default getTaskLink
