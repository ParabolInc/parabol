import {commitMutation} from 'react-relay'

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
