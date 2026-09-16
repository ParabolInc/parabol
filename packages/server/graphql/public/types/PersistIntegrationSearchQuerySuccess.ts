import type {RegisteredServerIntegration} from '../../../integrations/platform/registry'
import type {PersistIntegrationSearchQuerySuccessResolvers} from '../resolverTypes'
import {makeIntegrationServiceSource} from './IntegrationService'

export type PersistIntegrationSearchQuerySuccessSource = {
  teamId: string
  userId: string
  service: RegisteredServerIntegration
}

const PersistIntegrationSearchQuerySuccess: PersistIntegrationSearchQuerySuccessResolvers = {
  service: ({service, teamId, userId}) => makeIntegrationServiceSource(service, teamId, userId)
}

export default PersistIntegrationSearchQuerySuccess
