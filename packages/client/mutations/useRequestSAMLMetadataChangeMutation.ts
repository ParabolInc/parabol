import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRequestSAMLMetadataChangeMutation as TRequestSAMLMetadataChangeMutation} from '../__generated__/useRequestSAMLMetadataChangeMutation.graphql'

const mutation = graphql`
  mutation useRequestSAMLMetadataChangeMutation($samlId: ID!, $metadataURL: String!) {
    requestSAMLMetadataChange(samlId: $samlId, metadataURL: $metadataURL) {
      signOnURL
    }
  }
`

const useRequestSAMLMetadataChangeMutation = () => {
  const [commit, submitting] = useMutation<TRequestSAMLMetadataChangeMutation>(mutation)
  const execute = (config: UseMutationConfig<TRequestSAMLMetadataChangeMutation>) => {
    return commit({...config})
  }
  return [execute, submitting] as const
}

export default useRequestSAMLMetadataChangeMutation
