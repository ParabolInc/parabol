import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRegenerateOAuthAPIProviderSecretMutation as TRegenerateOAuthAPIProviderSecretMutation} from '../__generated__/useRegenerateOAuthAPIProviderSecretMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useRegenerateOAuthAPIProviderSecretMutation($providerId: ID!) {
    regenerateOAuthAPIProviderSecret(providerId: $providerId) {
      clientSecret
    }
  }
`

const useRegenerateOAuthAPIProviderSecretMutation = () => {
  const [commit, submitting] = useMutation<TRegenerateOAuthAPIProviderSecretMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TRegenerateOAuthAPIProviderSecretMutation>) => {
    return commit({onError: snackOnError(atmosphere), ...config})
  }
  return [execute, submitting] as const
}

export default useRegenerateOAuthAPIProviderSecretMutation
