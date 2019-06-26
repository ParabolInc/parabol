import {RemoveAtlassianAuthMutation as TRemoveAtlassianAuthMutation} from '__generated__/RemoveAtlassianAuthMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'
import {IRemoveAtlassianAuthOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'

graphql`
  fragment RemoveAtlassianAuthMutation_team on RemoveAtlassianAuthPayload {
    user {
      ...AtlassianProviderRowViewer @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation RemoveAtlassianAuthMutation($teamId: ID!) {
    removeAtlassianAuth(teamId: $teamId) {
      error {
        message
      }
      ...RemoveAtlassianAuthMutation_team @relay(mask: false)
    }
  }
`

const RemoveAtlassianAuthMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveAtlassianAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<TRemoveAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted
  })
}

export default RemoveAtlassianAuthMutation
