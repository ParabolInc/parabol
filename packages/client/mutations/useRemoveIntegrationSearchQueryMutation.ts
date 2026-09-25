import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRemoveIntegrationSearchQueryMutation as TRemoveIntegrationSearchQueryMutation} from '../__generated__/useRemoveIntegrationSearchQueryMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

graphql`
  fragment useRemoveIntegrationSearchQueryMutation_notification on RemoveIntegrationSearchQuerySuccess {
    service {
      ...usePersistIntegrationSearchQueryMutation_service @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useRemoveIntegrationSearchQueryMutation($id: ID!, $teamId: ID!) {
    removeIntegrationSearchQuery(id: $id, teamId: $teamId) {
      ...useRemoveIntegrationSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const useRemoveIntegrationSearchQueryMutation = () => {
  const [commit, submitting] = useMutation<TRemoveIntegrationSearchQueryMutation>(mutation)
  const atmosphere = useAtmosphere()
  const showError = (message: string) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      message,
      autoDismiss: 5,
      key: 'removeIntegrationSearchQueryError'
    })
  }
  const execute = (config: UseMutationConfig<TRemoveIntegrationSearchQueryMutation>) => {
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

export default useRemoveIntegrationSearchQueryMutation
