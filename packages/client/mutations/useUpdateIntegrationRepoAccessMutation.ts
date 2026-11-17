import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateIntegrationRepoAccessMutation as TUpdateIntegrationRepoAccessMutation} from '../__generated__/useUpdateIntegrationRepoAccessMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useUpdateIntegrationRepoAccessMutation(
    $teamId: ID!
    $service: IntegrationProviderServiceEnum!
    $repoAccess: IntegrationRepoAccessEnum!
    $integrationRepoIds: [ID!]!
  ) {
    updateIntegrationRepoAccess(
      teamId: $teamId
      service: $service
      repoAccess: $repoAccess
      integrationRepoIds: $integrationRepoIds
    ) {
      integrationService {
        id
        ...azureDevOpsSharedProjects_service
      }
    }
  }
`

const useUpdateIntegrationRepoAccessMutation = () => {
  const [commit, submitting] = useMutation<TUpdateIntegrationRepoAccessMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpdateIntegrationRepoAccessMutation>) =>
    commit({onError: snackOnError(atmosphere), ...config})
  return [execute, submitting] as const
}

export default useUpdateIntegrationRepoAccessMutation
