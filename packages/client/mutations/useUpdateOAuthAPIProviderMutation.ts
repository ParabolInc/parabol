import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateOAuthAPIProviderMutation as TUpdateOAuthAPIProviderMutation} from '../__generated__/useUpdateOAuthAPIProviderMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useUpdateOAuthAPIProviderMutation(
    $providerId: ID!
    $name: String
    $redirectUris: [RedirectURI!]
    $scopes: [OAuthScopeEnum!]
  ) {
    updateOAuthAPIProvider(
      providerId: $providerId
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
      organization {
        id
      }
    }
  }
`

const useUpdateOAuthAPIProviderMutation = () => {
  const [commit, submitting] = useMutation<TUpdateOAuthAPIProviderMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TUpdateOAuthAPIProviderMutation>) => {
    return commit({onError: snackOnError(atmosphere), ...config})
  }
  return [execute, submitting] as const
}

export default useUpdateOAuthAPIProviderMutation
