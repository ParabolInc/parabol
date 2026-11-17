import type {RegisteredServerIntegration} from '../../../integrations/platform/registry'
import type {PersistIntegrationSearchQueryPayloadResolvers} from '../resolverTypes'
import {makeIntegrationServiceSource} from './IntegrationService'

export type PersistIntegrationSearchQueryPayloadSource = {
  teamId: string
  userId: string
  service: RegisteredServerIntegration
}

const PersistIntegrationSearchQueryPayload: PersistIntegrationSearchQueryPayloadResolvers = {
  service: ({service, teamId, userId}) => makeIntegrationServiceSource(service, teamId, userId)
}

export default PersistIntegrationSearchQueryPayload
