import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

const mutation = graphql`
  mutation CreateOrgPicturePutUrlMutation(
    $contentType: String!
    $contentLength: Int!
    $orgId: ID!
  ) {
    createOrgPicturePutUrl(
      contentType: $contentType
      contentLength: $contentLength
      orgId: $orgId
    ) {
      error {
        message
      }
      url
    }
  }
`

const CreateOrgPicturePutUrlMutation = (environment, variables, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateOrgPicturePutUrlMutation
