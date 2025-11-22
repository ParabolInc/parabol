import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useEmbedUserAssetMutation as TuseEmbedUserAssetMutation} from '../__generated__/useEmbedUserAssetMutation.graphql'

const mutation = graphql`
  mutation useEmbedUserAssetMutation($url: String!, $scope: AssetScopeEnum!, $scopeKey: ID!) {
    embedUserAsset(url: $url, scope: $scope, scopeKey: $scopeKey) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UploadUserAssetSuccess {
        url
      }
    }
  }
`

export const useEmbedUserAsset = () => {
  const [commit, submitting] = useMutation<TuseEmbedUserAssetMutation>(mutation)

  const execute = (config: UseMutationConfig<TuseEmbedUserAssetMutation>) => {
    return commit(config)
  }
  return [execute, submitting] as const
}
