import graphql from 'babel-plugin-relay/macro'
import {useMutation} from 'react-relay'
import type {useUploadIdPMetadataMutation as TuseUploadIdPMetadataMutation} from '../__generated__/useUploadIdPMetadataMutation.graphql'

const mutation = graphql`
  mutation useUploadIdPMetadataMutation($file: File!, $samlId: ID!) {
    uploadIdPMetadata(file: $file, samlId: $samlId) {
      url
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

  const execute: Execute = (config) => commit(config)
  return [execute, submitting] as const
}
