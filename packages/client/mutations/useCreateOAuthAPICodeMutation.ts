import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useCreateOAuthAPICodeMutation as TuseCreateOAuthAPICodeMutation} from '../__generated__/useCreateOAuthAPICodeMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useCreateOAuthAPICodeMutation($request: OAuthAuthorizationRequestInput!) {
    createOAuthAPICode(request: $request) {
      redirectUri
    }
  }
`

export const useCreateOAuthAPICodeMutation = () => {
  const [commit, submitting] = useMutation<TuseCreateOAuthAPICodeMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TuseCreateOAuthAPICodeMutation>) => {
    return commit({onError: snackOnError(atmosphere), ...config})
  }
  return [execute, submitting] as const
}
