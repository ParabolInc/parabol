import {AddSlackAuthMutation} from '__generated__/AddSlackAuthMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {IAddSlackAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment AddSlackAuthMutation_team on AddSlackAuthPayload {
    user {
      ...SlackProviderRow_viewer
    }
  }
`

const mutation = graphql`
  mutation AddSlackAuthMutation($code: ID!, $teamId: ID!) {
    addSlackAuth(code: $code, teamId: $teamId) {
      error {
        message
      }
      ...AddSlackAuthMutation_team @relay(mask: false)
    }
  }
`

const AddSlackAuthMutation = (
  atmosphere,
  variables: IAddSlackAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<AddSlackAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddSlackAuthMutation
