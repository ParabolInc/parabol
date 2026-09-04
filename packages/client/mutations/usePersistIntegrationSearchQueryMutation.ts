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
      ... on JiraSearchQuery {
        isJQL
        projectKeyFilters
      }
    }
  }
`

graphql`
  fragment usePersistIntegrationSearchQueryMutation_success on PersistIntegrationSearchQuerySuccess {
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
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...usePersistIntegrationSearchQueryMutation_success @relay(mask: false)
    }
  }
`

type Handlers = {
  onSuccess?: () => void
  onError?: () => void
}

const usePersistIntegrationSearchQueryMutation = () => {
  const [commit, submitting] = useMutation<TPersistIntegrationSearchQueryMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (
    config: UseMutationConfig<TPersistIntegrationSearchQueryMutation>,
    handlers?: Handlers
  ) => {
    return commit({
      onCompleted: (res) => {
        const error = res.persistIntegrationSearchQuery.error
        if (!error) {
          handlers?.onSuccess?.()
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'persistIntegrationSearchQueryError'
          })
          handlers?.onError?.()
        }
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default usePersistIntegrationSearchQueryMutation
