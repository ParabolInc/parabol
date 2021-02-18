import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {LocalHandlers} from '../types/relayMutations'
import {
  RemoveAtlassianAuthMutation as TRemoveAtlassianAuthMutation,
  RemoveAtlassianAuthMutationVariables
} from '../__generated__/RemoveAtlassianAuthMutation.graphql'

graphql`
  fragment RemoveAtlassianAuthMutation_team on RemoveAtlassianAuthPayload {
    teamMember {
      integrations {
        atlassian {
          ...AtlassianProviderRowAtlassianIntegration @relay(mask: false)
        }
      }
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
  variables: RemoveAtlassianAuthMutationVariables,
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
