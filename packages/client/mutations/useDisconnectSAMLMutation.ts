import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useDisconnectSAMLMutation as TDisconnectSAMLMutation} from '../__generated__/useDisconnectSAMLMutation.graphql'

const mutation = graphql`
  mutation useDisconnectSAMLMutation($samlId: ID!) {
    disconnectSAML(samlId: $samlId) {
      saml {
        id
        metadataURL
        scimAuthenticationType
        scimCensoredBearerToken
        scimOAuthClientId
        scimCensoredOAuthClientSecret
      }
    }
  }
`

const useDisconnectSAMLMutation = () => {
  const [commit, submitting] = useMutation<TDisconnectSAMLMutation>(mutation)
  const execute = (config: UseMutationConfig<TDisconnectSAMLMutation>) => {
    return commit({...config})
  }
  return [execute, submitting] as const
}

export default useDisconnectSAMLMutation
