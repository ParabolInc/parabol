import type {RegisteredServerIntegration} from '../../../integrations/platform/registry'
import type {RemoveIntegrationSearchQueryPayloadResolvers} from '../resolverTypes'
import {makeIntegrationServiceSource} from './IntegrationService'

export type RemoveIntegrationSearchQueryPayloadSource = {
  teamId: string
  userId: string
  service: RegisteredServerIntegration
}

const RemoveIntegrationSearchQueryPayload: RemoveIntegrationSearchQueryPayloadResolvers = {
  service: ({service, teamId, userId}) => makeIntegrationServiceSource(service, teamId, userId)
}

export default RemoveIntegrationSearchQueryPayload
