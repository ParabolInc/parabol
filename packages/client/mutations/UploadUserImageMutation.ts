import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

const mutation = graphql`
  mutation UploadUserImageMutation($dummy: Int, $test: Int, $file: File) {
    uploadUserImage(dummy: $dummy, test: $test, file: $file) {
      error {
        message
      }
      ...UpdateUserProfileMutation_team @relay(mask: false)
    }
  }
`

const UploadUserImageMutation = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  const {file} = variables
  const uploadables = file ? {file} : undefined
  return commitMutation(atmosphere, {
    mutation,
    variables,
    uploadables,
    onCompleted,
    onError
  })
}

export default UploadUserImageMutation
