import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {IRemoveGitHubAuthOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import {RemoveGitHubAuthMutation as TRemoveGitHubAuthMutation} from '../__generated__/RemoveGitHubAuthMutation.graphql'

graphql`
  fragment RemoveGitHubAuthMutation_team on RemoveGitHubAuthPayload {
    teamMember {
      integrations {
        github {
          ...GitHubProviderRowGitHubIntegration @relay(mask: false)
        }
      }

    }
  }
`

const mutation = graphql`
  mutation RemoveGitHubAuthMutation($teamId: ID!) {
    removeGitHubAuth(teamId: $teamId) {
      error {
        message
      }
      ...RemoveGitHubAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveGitHubAuthMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveGitHubAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TRemoveGitHubAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveGitHubAuthMutation
