import {AddAtlassianAuthMutation} from '__generated__/AddAtlassianAuthMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {IAddAtlassianAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment AddAtlassianAuthMutation_team on AddAtlassianAuthPayload {
    user {
      ...AtlassianProviderRow_viewer
      ...ProviderList_viewer
    }
  }
`

const mutation = graphql`
  mutation AddAtlassianAuthMutation($code: ID!, $teamId: ID!) {
    addAtlassianAuth(code: $code, teamId: $teamId) {
      error {
        message
      }
      ...AddAtlassianAuthMutation_team @relay(mask: false)
    }
  }
`

const AddAtlassianAuthMutation = (
  atmosphere,
  variables: IAddAtlassianAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<AddAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddAtlassianAuthMutation
