import {RemoveSlackAuthMutation} from '__generated__/RemoveSlackAuthMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'
import {IRemoveSlackAuthOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'

graphql`
  fragment RemoveSlackAuthMutation_team on RemoveSlackAuthPayload {
    user {
      ...SlackProviderRowViewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveSlackAuthMutation($teamId: ID!) {
    removeSlackAuth(teamId: $teamId) {
      error {
        message
      }
      ...RemoveSlackAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveSlackAuthMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveSlackAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<RemoveSlackAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveSlackAuthMutation
