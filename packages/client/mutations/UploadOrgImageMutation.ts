import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {UploadableMap} from 'relay-runtime'
import type {UploadOrgImageMutation as TUploadOrgImageMutation} from '../__generated__/UploadOrgImageMutation.graphql'
import type Atmosphere from '../Atmosphere'
import type {BaseLocalHandlers} from '../types/relayMutations'

const mutation = graphql`
  mutation UploadOrgImageMutation($file: File!, $orgId: ID!) {
    uploadOrgImage(file: $file, orgId: $orgId) {
      error {
        message
      }
      organization {
        picture
      }
    }
  }
`

const UploadOrgImageMutation = (
  atmosphere: Atmosphere,
  variables: Omit<TUploadOrgImageMutation['variables'], 'file'>,
  {onCompleted, onError}: BaseLocalHandlers,
  uploadables?: UploadableMap
) => {
  return commitMutation<TUploadOrgImageMutation>(atmosphere, {
    mutation,
    variables: variables as any,
    uploadables,
    onCompleted,
    onError
  })
}

export default UploadOrgImageMutation
