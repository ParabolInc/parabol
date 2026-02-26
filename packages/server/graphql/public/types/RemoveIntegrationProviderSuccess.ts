import type {RemoveIntegrationProviderSuccessResolvers} from '../resolverTypes'
import type {OrgIntegrationProvidersSource} from './OrgIntegrationProviders'
import type {TeamMemberIntegrationsSource} from './TeamMemberIntegrations'

export type RemoveIntegrationProviderSuccessSource = {
  providerId: string
  orgIntegrationProviders: OrgIntegrationProvidersSource | null
  teamMemberIntegrations: TeamMemberIntegrationsSource | null
}

const RemoveIntegrationProviderSuccess: RemoveIntegrationProviderSuccessResolvers = {
  orgIntegrationProviders: (source) => source.orgIntegrationProviders,
  teamMemberIntegrations: (source) => source.teamMemberIntegrations
}

export default RemoveIntegrationProviderSuccess
