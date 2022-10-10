import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {AddGitHubAuthMutation as TAddGitHubAuthMutation} from '../__generated__/AddGitHubAuthMutation.graphql'

graphql`
  fragment AddGitHubAuthMutation_team on AddGitHubAuthPayload {
    teamMember {
      ...ScopePhaseAreaGitHub_teamMember
      integrations {
        github {
          ...TaskFooterIntegrateMenuViewerGitHubIntegration
          ...GitHubProviderRowGitHubIntegration
          ...GitHubScopingSearchBarGitHubIntegration
        }
      }
      # after adding, check for new integrations (populates the menu)
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

const AddGitHubAuthMutation: StandardMutation<TAddGitHubAuthMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddGitHubAuthMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddGitHubAuthMutation
