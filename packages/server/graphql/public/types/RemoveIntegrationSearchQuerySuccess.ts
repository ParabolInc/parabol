import type {RegisteredServerIntegration} from '../../../integrations/platform/registry'
import type {RemoveIntegrationSearchQuerySuccessResolvers} from '../resolverTypes'
import {makeIntegrationServiceSource} from './IntegrationService'

export type RemoveIntegrationSearchQuerySuccessSource = {
  teamId: string
  userId: string
  service: RegisteredServerIntegration
}

const RemoveIntegrationSearchQuerySuccess: RemoveIntegrationSearchQuerySuccessResolvers = {
  service: ({service, teamId, userId}) => makeIntegrationServiceSource(service, teamId, userId)
}

export default RemoveIntegrationSearchQuerySuccess
