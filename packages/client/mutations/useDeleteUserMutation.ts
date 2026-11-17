import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useDeleteUserMutation as TDeleteUserMutation} from '../__generated__/useDeleteUserMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useDeleteUserMutation($userId: ID!, $reason: String) {
    deleteUser(userId: $userId, reason: $reason) {
      error {
        message
      }
    }
  }
`

const useDeleteUserMutation = () => {
  const [commit, submitting] = useMutation<TDeleteUserMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TDeleteUserMutation>) => {
    return commit({
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useDeleteUserMutation
