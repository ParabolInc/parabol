import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateIntegrationRepoAccessMutation as TUpdateIntegrationRepoAccessMutation} from '../__generated__/useUpdateIntegrationRepoAccessMutation.graphql'

const mutation = graphql`
  mutation useUpdateIntegrationRepoAccessMutation(
    $teamId: ID!
    $service: IntegrationProviderServiceEnum!
    $integrationRepoIds: [ID!]
  ) {
    updateIntegrationRepoAccess(
      teamId: $teamId
      service: $service
      integrationRepoIds: $integrationRepoIds
    ) {
      integrationService {
        id
        ...AzureDevOpsProjectAccessPanel_service
        ...azureDevOpsSharedProjects_service
      }
    }
  }
`

const useUpdateIntegrationRepoAccessMutation = () => {
  const [commit, submitting] = useMutation<TUpdateIntegrationRepoAccessMutation>(mutation)
  const execute = (config: UseMutationConfig<TUpdateIntegrationRepoAccessMutation>) =>
    commit({...config})
  return [execute, submitting] as const
}

export default useUpdateIntegrationRepoAccessMutation
