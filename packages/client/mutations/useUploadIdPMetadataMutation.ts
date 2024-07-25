import graphql from 'babel-plugin-relay/macro'
import {useMutation} from 'react-relay'
import {useUploadIdPMetadataMutation as TuseUploadIdPMetadataMutation} from '../__generated__/useUploadIdPMetadataMutation.graphql'

const mutation = graphql`
  mutation useUploadIdPMetadataMutation($file: File!, $orgId: ID!) {
    uploadIdPMetadata(file: $file, orgId: $orgId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ... on UploadIdPMetadataSuccess {
        url
      }
    }
  }
`
interface TTuseUploadIdPMetadataMutation extends Omit<TuseUploadIdPMetadataMutation, 'variables'> {
  variables: Omit<TuseUploadIdPMetadataMutation['variables'], 'file'>
  uploadables: {file: File}
}

export const useUploadIdPMetadata = () => {
  const [commit, submitting] = useMutation<TTuseUploadIdPMetadataMutation>(mutation)
  type Execute = (
    config: Parameters<typeof commit>[0] & {uploadables: {file: File}}
  ) => ReturnType<typeof commit>

  const execute: Execute = (config) => {
    const {variables} = config
    const {orgId} = variables
    return commit({
      updater: (store) => {
        const org = store.get(orgId)
        org?.setValue(orgId, 'id')
      },
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}
