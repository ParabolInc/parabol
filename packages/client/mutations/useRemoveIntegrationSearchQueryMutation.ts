import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRemoveIntegrationSearchQueryMutation as TRemoveIntegrationSearchQueryMutation} from '../__generated__/useRemoveIntegrationSearchQueryMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

graphql`
  fragment useRemoveIntegrationSearchQueryMutation_success on RemoveIntegrationSearchQuerySuccess {
    service {
      ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useRemoveIntegrationSearchQueryMutation($id: ID!, $teamId: ID!) {
    removeIntegrationSearchQuery(id: $id, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...useRemoveIntegrationSearchQueryMutation_success @relay(mask: false)
    }
  }
`

type Handlers = {
  onSuccess?: () => void
  onError?: () => void
}

const useRemoveIntegrationSearchQueryMutation = () => {
  const [commit, submitting] = useMutation<TRemoveIntegrationSearchQueryMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (
    config: UseMutationConfig<TRemoveIntegrationSearchQueryMutation>,
    handlers?: Handlers
  ) => {
    return commit({
      onCompleted: (res) => {
        const error = res.removeIntegrationSearchQuery.error
        if (!error) {
          handlers?.onSuccess?.()
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'removeIntegrationSearchQueryError'
          })
          handlers?.onError?.()
        }
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useRemoveIntegrationSearchQueryMutation
