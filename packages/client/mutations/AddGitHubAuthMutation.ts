import {AddGitHubAuthMutation as TAddGitHubAuthMutation} from '../__generated__/AddGitHubAuthMutation.graphql'
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import {IAddGitHubAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment AddGitHubAuthMutation_team on AddGitHubAuthPayload {
    user {
      ...GitHubProviderRow_viewer
      ...TaskFooterIntegrateMenuViewerGitHubAuth
      # after adding, check for new integrations (populates the menu)
      ...TaskFooterIntegrateMenuViewerSuggestedIntegrations
    }
  }
`

const mutation = graphql`
  mutation AddGitHubAuthMutation($code: ID!, $teamId: ID!) {
    addGitHubAuth(code: $code, teamId: $teamId) {
      error {
        message
      }
      ...AddGitHubAuthMutation_team @relay(mask: false)
    }
  }
`

const AddGitHubAuthMutation = (
  atmosphere,
  variables: IAddGitHubAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TAddGitHubAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddGitHubAuthMutation
