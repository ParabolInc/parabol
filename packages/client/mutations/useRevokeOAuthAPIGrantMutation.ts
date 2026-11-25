import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRevokeOAuthAPIGrantMutation as TuseRevokeOAuthAPIGrantMutation} from '../__generated__/useRevokeOAuthAPIGrantMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useRevokeOAuthAPIGrantMutation($grantId: ID!) {
    revokeOAuthAPIGrant(grantId: $grantId) {
      user {
        ...ConnectedApps_viewer
      }
    }
  }
`

export const useRevokeOAuthAPIGrantMutation = () => {
  const [commit, submitting] = useMutation<TuseRevokeOAuthAPIGrantMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TuseRevokeOAuthAPIGrantMutation>) => {
    return commit({onError: snackOnError(atmosphere), ...config})
  }
  return [execute, submitting] as const
}
