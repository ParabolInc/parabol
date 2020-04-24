/**
 * Creates a reflection for the retrospective meeting.
 *
 */
import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleAddReflectionGroups from './handlers/handleAddReflectionGroups'
import makeEmptyStr from '../utils/draftjs/makeEmptyStr'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {CreateReflectionMutation as TCreateReflectionMutation} from '../__generated__/CreateReflectionMutation.graphql'
import {CreateReflectionMutation_meeting} from '~/__generated__/CreateReflectionMutation_meeting.graphql'

graphql`
  fragment CreateReflectionMutation_meeting on CreateReflectionPayload {
    reflectionGroup {
      meetingId
      sortOrder
      retroPhaseItemId
      ...ReflectionGroupHeader_reflectionGroup @relay(mask: false)
      ...ReflectionGroupVoting_reflectionGroup @relay(mask: false)
      ...ReflectionGroup_reflectionGroup @relay(mask: false)
      ...ReflectionGroupTitleEditor_reflectionGroup @relay(mask: false)
      ...GroupingKanbanColumn_reflectionGroups @relay(mask: false)
      reflections {
        ...DraggableReflectionCard_reflection @relay(mask: false)
      }
      tasks {
        id
      }
      voteCount
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
      ...CreateReflectionMutation_meeting @relay(mask: false)
    }
  }
`

export const createReflectionMeetingUpdater: SharedUpdater<CreateReflectionMutation_meeting> = (
  payload,
  {store}
) => {
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup')
  handleAddReflectionGroups(reflectionGroup, store)
}

const CreateReflectionMutation: StandardMutation<TCreateReflectionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TCreateReflectionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('createReflection')
      if (!payload) return
      createReflectionMeetingUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {input} = variables
      const {viewerId} = atmosphere
      const {meetingId} = input
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
      const meeting = store.get(meetingId)!
      const reflectionNode = createProxyRecord(store, 'RetroReflection', optimisticReflection)
      const phaseItem = store.get(input.retroPhaseItemId)!
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
