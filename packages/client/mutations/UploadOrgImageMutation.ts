import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UploadableMap} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {BaseLocalHandlers} from '../types/relayMutations'
import {UploadOrgImageMutation as TUploadOrgImageMutation} from '../__generated__/UploadOrgImageMutation.graphql'

const mutation = graphql`
  mutation UploadOrgImageMutation($file: File!, $orgId: ID!) {
    uploadOrgImage(file: $file, orgId: $orgId) {
      error {
        message
      }
      ...UpdateOrgMutation_organization @relay(mask: false)
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
