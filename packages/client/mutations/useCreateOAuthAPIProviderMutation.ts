import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useCreateOAuthAPIProviderMutation as TCreateOAuthAPIProviderMutation} from '../__generated__/useCreateOAuthAPIProviderMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useCreateOAuthAPIProviderMutation(
    $orgId: ID!
    $name: String!
    $redirectUris: [RedirectURI!]!
    $scopes: [OAuthScopeEnum!]!
  ) {
    createOAuthAPIProvider(
      orgId: $orgId
      name: $name
      redirectUris: $redirectUris
      scopes: $scopes
    ) {
      provider {
        ...OAuthAppFormEdit_oauthProvider
        id
        name
        updatedAt
      }
      clientId
    }
  }
`

const useCreateOAuthAPIProviderMutation = () => {
  const [commit, submitting] = useMutation<TCreateOAuthAPIProviderMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TCreateOAuthAPIProviderMutation>) => {
    return commit({onError: snackOnError(atmosphere), ...config})
  }
  return [execute, submitting] as const
}

export default useCreateOAuthAPIProviderMutation
