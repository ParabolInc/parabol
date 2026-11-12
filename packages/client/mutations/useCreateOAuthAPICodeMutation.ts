import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useCreateOAuthAPICodeMutation as TuseCreateOAuthAPICodeMutation} from '../__generated__/useCreateOAuthAPICodeMutation.graphql'

const mutation = graphql`
  mutation useCreateOAuthAPICodeMutation($request: OAuthAuthorizationRequestInput!) {
    createOAuthAPICode(request: $request) {
      redirectUri
    }
  }
`

export const useCreateOAuthAPICodeMutation = () => {
  const [commit, submitting] = useMutation<TuseCreateOAuthAPICodeMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseCreateOAuthAPICodeMutation>) => {
    return commit({...config})
  }
  return [execute, submitting] as const
}
