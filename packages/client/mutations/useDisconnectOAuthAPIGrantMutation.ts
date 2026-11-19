import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useDisconnectOAuthAPIGrantMutation as TDisconnectOAuthAPIGrantMutation} from '../__generated__/useDisconnectOAuthAPIGrantMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useDisconnectOAuthAPIGrantMutation($grantId: ID!) {
    disconnectOAuthAPIGrant(grantId: $grantId) {
      user {
        id
        ...ConnectedApps_viewer
      }
    }
  }
`

const useDisconnectOAuthAPIGrantMutation = () => {
  const [commit, submitting] = useMutation<TDisconnectOAuthAPIGrantMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TDisconnectOAuthAPIGrantMutation>) => {
    const showError = snackOnError(atmosphere, 'disconnectOAuthAPIGrantError')
    return commit({
      onError: showError,
      ...config,
      onCompleted: (res, errors) => {
        const error = errors?.[0]
        if (error) {
          showError(error)
          return
        }
        config.onCompleted?.(res, errors)
      }
    })
  }
  return [execute, submitting] as const
}

export default useDisconnectOAuthAPIGrantMutation
