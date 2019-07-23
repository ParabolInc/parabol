/**
 * Removes a reflection for the retrospective meeting.
 *
 */
import {commitMutation, graphql} from 'react-relay'
import getInProxy from 'universal/utils/relay/getInProxy'
import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups'
import {IRemoveReflectionOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import Atmosphere from 'universal/Atmosphere'

interface Context {
  meetingId: string
}

graphql`
  fragment RemoveReflectionMutation_team on RemoveReflectionPayload {
    meeting {
      id
    }
    reflection {
      id
      reflectionGroupId
    }
    unlockedStages {
      id
      isNavigableByFacilitator
    }
  }
`

const mutation = graphql`
  mutation RemoveReflectionMutation($reflectionId: ID!) {
    removeReflection(reflectionId: $reflectionId) {
      ...RemoveReflectionMutation_team @relay(mask: false)
    }
  }
`

export const removeReflectionTeamUpdater = (payload, store) => {
  const meetingId = getInProxy(payload, 'meeting', 'id')
  const reflectionGroupId = getInProxy(payload, 'reflection', 'reflectionGroupId')
  handleRemoveReflectionGroups(reflectionGroupId, meetingId, store)
}

const RemoveReflectionMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveReflectionOnMutationArguments,
  context: Context,
  onError?: LocalHandlers['onError'],
  onCompleted?: LocalHandlers['onCompleted']
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeReflection')
      if (!payload) return
      removeReflectionTeamUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const {reflectionId} = variables
      const {meetingId} = context
      const reflection = store.get(reflectionId)
      if (!reflection) return
      const reflectionGroupId = reflection.getValue('reflectionGroupId')
      handleRemoveReflectionGroups(reflectionGroupId, meetingId, store)
    },
    onCompleted,
    onError
  })
}

export default RemoveReflectionMutation
