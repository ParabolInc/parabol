import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

const mutation = graphql`
  mutation CreateUserPicturePutUrlMutation(
    $image: ImageMetadataInput!
    $pngVersion: ImageMetadataInput
  ) {
    createUserPicturePutUrl(image: $image, pngVersion: $pngVersion) {
      error {
        message
      }
      url
      pngUrl
    }
  }
`

const CreateUserPicturePutUrlMutation = (environment, variables, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateUserPicturePutUrlMutation
