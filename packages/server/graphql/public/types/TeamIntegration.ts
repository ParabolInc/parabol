import TeamIntegrationId from '../../../../client/shared/gqlIds/TeamIntegrationId'
import {
  getServerIntegration,
  type RegisteredServerIntegration
} from '../../../integrations/platform/registry'
import type {TeamIntegrationResolvers} from '../resolverTypes'

export type TeamIntegrationSource = {
  service: RegisteredServerIntegration
  teamId: string
  userId: string
}

const TeamIntegration: TeamIntegrationResolvers = {
  id: ({service, teamId, userId}) => TeamIntegrationId.join(service, teamId, userId),
  title: ({service}) => getServerIntegration(service).title,
  isAvailable: ({service, teamId, userId}, _args, {dataLoader}) =>
    getServerIntegration(service).isAvailable({dataLoader, teamId, userId}),
  isConnected: async ({service, teamId, userId}, _args, {dataLoader}) =>
    !!(await getServerIntegration(service).resolveAuth({dataLoader, teamId, userId})),
  capabilities: ({service}) => getServerIntegration(service).getCapabilityKeys()
}

export default TeamIntegration
