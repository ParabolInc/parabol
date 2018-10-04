/**
 * Creates a reflection for the retrospective meeting.
 *
 */
import {commitMutation, graphql} from 'react-relay'
import {CompletedHandler, ErrorHandler} from 'universal/types/relayMutations'
import handleAddReflectionGroups from 'universal/mutations/handlers/handleAddReflectionGroups'
import makeEmptyStr from 'universal/utils/draftjs/makeEmptyStr'
import clientTempId from 'universal/utils/relay/clientTempId'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import {ICreateReflectionOnMutationArguments} from 'universal/types/gql'

interface Context {
  meetingId: string
}

graphql`
  fragment CreateReflectionMutation_team on CreateReflectionPayload {
    reflectionGroup {
      meetingId
      sortOrder
      retroPhaseItemId
      reflections {
        ...CompleteReflectionFrag @relay(mask: false)
      }
      tasks {
        id
      }
    }
    unlockedStages {
      id
      isNavigableByFacilitator
    }
  }
`

const mutation = graphql`
  mutation CreateReflectionMutation($input: CreateReflectionInput!) {
    createReflection(input: $input) {
      ...CreateReflectionMutation_team @relay(mask: false)
    }
  }
`

export const createReflectionTeamUpdater = (payload, store) => {
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup')
  handleAddReflectionGroups(reflectionGroup, store)
}

const CreateReflectionMutation = (
  atmosphere,
  variables: ICreateReflectionOnMutationArguments,
  context: Context,
  onError: ErrorHandler,
  onCompleted: CompletedHandler
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('createReflection')
      if (!payload) return
      createReflectionTeamUpdater(payload, store)
    },
    optimisticUpdater: (store) => {
      const {input} = variables
      const {viewerId} = atmosphere
      const {meetingId} = context
      const nowISO = new Date().toJSON()
      const optimisticReflection = {
        id: clientTempId(),
        content: input.content || makeEmptyStr(),
        createdAt: nowISO,
        creatorId: viewerId,
        isActive: true,
        isEditing: true,
        isViewerCreator: true,
        meetingId,
        retroPhaseItemId: input.retroPhaseItemId,
        sortOrder: 0,
        updatedAt: nowISO
      }
      const optimisticGroup = {
        id: clientTempId(),
        createdAt: nowISO,
        isActive: true,
        meetingId,
        retroPhaseItemId: input.retroPhaseItemId,
        sortOrder: input.sortOrder,
        updatedAt: nowISO
      }
      const meeting = store.get(meetingId)
      const reflectionNode = createProxyRecord(store, 'RetroReflection', optimisticReflection)
      const phaseItem = store.get(input.retroPhaseItemId)
      reflectionNode.setLinkedRecord(meeting, 'meeting')
      reflectionNode.setLinkedRecord(phaseItem, 'phaseItem')
      const reflectionGroupNode = createProxyRecord(store, 'RetroReflectionGroup', optimisticGroup)
      reflectionGroupNode.setLinkedRecords([reflectionNode], 'reflections')
      reflectionGroupNode.setLinkedRecord(meeting, 'meeting')
      handleAddReflectionGroups(reflectionGroupNode, store)
    }
  })
}

export default CreateReflectionMutation
