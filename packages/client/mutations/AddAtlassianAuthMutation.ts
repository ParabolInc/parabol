import {AddAtlassianAuthMutation as TAddAtlassianAuthMutation} from '../__generated__/AddAtlassianAuthMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import {IAddAtlassianAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment AddAtlassianAuthMutation_team on AddAtlassianAuthPayload {
    user {
      ...AtlassianProviderRow_viewer
      ...TaskFooterIntegrateMenuViewerAtlassianAuth
      # after adding, check for new integrations (populates the menu)
      ...TaskFooterIntegrateMenuViewerSuggestedIntegrations
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
  return commitMutation<TAddAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddAtlassianAuthMutation
