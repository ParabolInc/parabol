import type {RemoveIntegrationProviderPayloadResolvers} from '../resolverTypes'
import type {OrgIntegrationProvidersSource} from './OrgIntegrationProviders'
import type {TeamMemberIntegrationsSource} from './TeamMemberIntegrations'

export type RemoveIntegrationProviderPayloadSource = {
  providerId: string
  orgIntegrationProviders: OrgIntegrationProvidersSource | null
  teamMemberIntegrations: TeamMemberIntegrationsSource | null
}

const RemoveIntegrationProviderPayload: RemoveIntegrationProviderPayloadResolvers = {
  orgIntegrationProviders: (source) => source.orgIntegrationProviders,
  teamMemberIntegrations: (source) => source.teamMemberIntegrations
}

export default RemoveIntegrationProviderPayload
