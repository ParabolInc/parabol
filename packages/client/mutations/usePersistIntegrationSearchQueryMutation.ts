import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {usePersistIntegrationSearchQueryMutation as TPersistIntegrationSearchQueryMutation} from '../__generated__/usePersistIntegrationSearchQueryMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

graphql`
  fragment usePersistIntegrationSearchQueryMutation_service on IntegrationService {
    id
    searchQueries {
      id
      queryString
      lastUsedAt
      meta
    }
  }
`

graphql`
  fragment usePersistIntegrationSearchQueryMutation_notification on PersistIntegrationSearchQuerySuccess {
    service {
      ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation usePersistIntegrationSearchQueryMutation(
    $teamId: ID!
    $providerId: ID!
    $queryString: String!
    $meta: String
  ) {
    persistIntegrationSearchQuery(
      teamId: $teamId
      providerId: $providerId
      queryString: $queryString
      meta: $meta
    ) {
      ...usePersistIntegrationSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const usePersistIntegrationSearchQueryMutation = () => {
  const [commit, submitting] = useMutation<TPersistIntegrationSearchQueryMutation>(mutation)
  const atmosphere = useAtmosphere()
  const showError = (message: string) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      message,
      autoDismiss: 5,
      key: 'persistIntegrationSearchQueryError'
    })
  }
  const execute = (config: UseMutationConfig<TPersistIntegrationSearchQueryMutation>) => {
    return commit({
      onCompleted: (_res, errors) => {
        const error = errors?.[0]
        if (error) showError(error.message)
      },
      onError: (error) => showError(error.message),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default usePersistIntegrationSearchQueryMutation
