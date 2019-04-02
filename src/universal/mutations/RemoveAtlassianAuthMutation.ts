import {
  RemoveAtlassianAuthMutation,
  RemoveAtlassianAuthMutationResponse
} from '__generated__/RemoveAtlassianAuthMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import Atmosphere from 'universal/Atmosphere'
import {IRemoveAtlassianAuthOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'

graphql`
  fragment RemoveAtlassianAuthMutation_team on RemoveAtlassianAuthPayload {
    authId
    teamId
    updatedProjects {
      isActive
      userIds
      teamMembers {
        id
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

export const removeAtlassianAuthUpdater = (
  _payload: RecordProxy<RemoveAtlassianAuthMutationResponse['removeAtlassianAuth']>,
  _context: {
    store: RecordSourceSelectorProxy<RemoveAtlassianAuthMutationResponse>
    atmosphere: Atmosphere
  }
) => {
  // TODO
}

const RemoveAtlassianAuthMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveAtlassianAuthOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<RemoveAtlassianAuthMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeAtlassianAuth')
      if (!payload) return
      removeAtlassianAuthUpdater(payload, {atmosphere, store})
    },
    onError,
    onCompleted
  })
}

export default RemoveAtlassianAuthMutation
