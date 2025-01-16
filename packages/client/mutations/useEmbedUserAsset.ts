import graphql from 'babel-plugin-relay/macro'
import {useMutation, type UseMutationConfig} from 'react-relay'
import {useEmbedUserAssetMutation as TuseEmbedUserAssetMutation} from '../__generated__/useEmbedUserAssetMutation.graphql'

const mutation = graphql`
  mutation useEmbedUserAssetMutation($url: String!) {
    embedUserAsset(url: $url) {
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
