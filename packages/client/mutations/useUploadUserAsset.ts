import graphql from 'babel-plugin-relay/macro'
import {useMutation} from 'react-relay'
import {useUploadUserAssetMutation as TuseUploadUserAssetMutation} from '../__generated__/useUploadUserAssetMutation.graphql'

const mutation = graphql`
  mutation useUploadUserAssetMutation($file: File!) {
    uploadUserAsset(file: $file) {
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
interface TTuseUploadUserAssetMutation extends Omit<TuseUploadUserAssetMutation, 'variables'> {
  variables: Omit<TuseUploadUserAssetMutation['variables'], 'file'>
  uploadables: {file: File}
}

export const useUploadUserAsset = () => {
  const [commit, submitting] = useMutation<TTuseUploadUserAssetMutation>(mutation)
  type Execute = (
    config: Parameters<typeof commit>[0] & {uploadables: {file: File}}
  ) => ReturnType<typeof commit>

  const execute: Execute = (config) => {
    return commit({
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}
