import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

const mutation = graphql`
  mutation UploadUserImageMutation($dummy: Int, $test: Int, $file: FileStream) {
    uploadUserImage(dummy: $dummy, test: $test, file: $file)
  }
`

const UploadUserImageMutation = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  const {file} = variables
  const uploadables = file ? {file} : undefined
  console.log('file in mutation:', file)
  return commitMutation(atmosphere, {
    mutation,
    variables,
    uploadables,
    onCompleted,
    onError
  })
}

export default UploadUserImageMutation
