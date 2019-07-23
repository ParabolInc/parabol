import {RemoveGitHubAuthMutation as TRemoveGitHubAuthMutation} from '__generated__/RemoveGitHubAuthMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'
import {IRemoveGitHubAuthOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'

graphql`
  fragment RemoveGitHubAuthMutation_team on RemoveGitHubAuthPayload {
    user {
      ...GitHubProviderRowViewer @relay(mask: false)
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
