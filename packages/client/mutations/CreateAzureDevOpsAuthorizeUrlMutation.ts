import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {OptionalHandlers, StandardMutation} from '../types/relayMutations'
import {CreateAzureDevOpsAuthorizeUrlMutation as TCreateAzureDevOpsAuthorizeUrlMutation} from '../__generated__/CreateAzureDevOpsAuthorizeUrlMutation.graphql'

const mutation = graphql`
  mutation CreateAzureDevOpsAuthorizeUrlMutation(
    $providerId: ID!
    $teamId: ID!
    $providerState: String!
    $redirect: String!
    $code: String!
  ) {
    createAzureDevOpsAuthorizeUrl(
      providerId: $providerId
      teamId: $teamId
      providerState: $providerState
      redirect: $redirect
      code: $code
    ) {
      url
      error {
        title
        message
      }
    }
  }
`

const CreateAzureDevOpsAuthorizeUrlMutation: StandardMutation<
  TCreateAzureDevOpsAuthorizeUrlMutation,
  OptionalHandlers
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TCreateAzureDevOpsAuthorizeUrlMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateAzureDevOpsAuthorizeUrlMutation
