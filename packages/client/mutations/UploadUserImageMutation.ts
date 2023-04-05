import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UploadableMap} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {BaseLocalHandlers} from '../types/relayMutations'
import {UploadUserImageMutation as TUploadUserImageMutation} from '../__generated__/UploadUserImageMutation.graphql'
const mutation = graphql`
  mutation UploadUserImageMutation($file: File!) {
    uploadUserImage(file: $file) {
      error {
        message
      }
      ...UpdateUserProfileMutation_team @relay(mask: false)
    }
  }
`

const UploadUserImageMutation = (
  atmosphere: Atmosphere,
  variables: Omit<TUploadUserImageMutation['variables'], 'file'>,
  {onCompleted, onError}: BaseLocalHandlers,
  uploadables?: UploadableMap
) => {
  return commitMutation<TUploadUserImageMutation>(atmosphere, {
    mutation,
    variables: variables as any,
    uploadables,
    onCompleted,
    onError
  })
}

export default UploadUserImageMutation
