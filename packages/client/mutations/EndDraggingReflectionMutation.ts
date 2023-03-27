import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, commitMutation} from 'react-relay'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {EndDraggingReflectionMutation as TEndDraggingReflectionMutation} from '~/__generated__/EndDraggingReflectionMutation.graphql'
import {EndDraggingReflectionMutation_meeting$data} from '~/__generated__/EndDraggingReflectionMutation_meeting.graphql'
import {OnNextHandler, SharedUpdater, SimpleMutation} from '../types/relayMutations'
import dndNoise from '../utils/dndNoise'
import addNodeToArray from '../utils/relay/addNodeToArray'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import safeRemoveNodeFromArray from '../utils/relay/safeRemoveNodeFromArray'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import handleAddReflectionToGroup from './handlers/handleAddReflectionToGroup'
import handleRemoveEmptyReflectionGroup from './handlers/handleRemoveEmptyReflectionGroup'
import handleUpdateSpotlightResults from './handlers/handleUpdateSpotlightResults'

graphql`
  fragment EndDraggingReflectionMutation_meeting on EndDraggingReflectionPayload {
    meeting {
      id
      nextAutoGroupThreshold
      teamId
    }
    reflection {
      ...DraggableReflectionCard_reflection @relay(mask: false)
    }

    reflectionGroup {
      id
      meetingId
      sortOrder
      promptId
      reflections {
        ...DraggableReflectionCard_reflection @relay(mask: false)
      }
      title
      voteCount
    }
    oldReflectionGroup {
      id
      title
    }
    dropTargetType
    dropTargetId
    userId
    remoteDrag {
      id
      dragUserId
      dragUserName
      isSpotlight
    }
  }
`

const mutation = graphql`
  mutation EndDraggingReflectionMutation(
    $reflectionId: ID!
    $dropTargetType: DragReflectionDropTargetTypeEnum
    $dropTargetId: ID
    $dragId: ID
  ) {
    endDraggingReflection(
      reflectionId: $reflectionId
      dropTargetType: $dropTargetType
      dropTargetId: $dropTargetId
      dragId: $dragId
    ) {
      ...EndDraggingReflectionMutation_meeting @relay(mask: false)
    }
  }
`

const handleRemoveReflectionFromGroup = (
  reflectionId: string,
  reflectionGroupId: string,
  store: RecordSourceSelectorProxy
) => {
  const reflectionGroup = store.get(reflectionGroupId)
  if (!reflectionGroup) return
  safeRemoveNodeFromArray(reflectionId, reflectionGroup, 'reflections')
}

const handleAddReflectionGroupToGroups = (
  store: RecordSourceSelectorProxy,
  reflectionGroup: RecordProxy<{meetingId: string}>
) => {
  if (!reflectionGroup) return
  const meetingId = reflectionGroup.getValue('meetingId')
  const meeting = store.get(meetingId)
  if (!meeting) return
  addNodeToArray(reflectionGroup, meeting, 'reflectionGroups', 'sortOrder')
}

export const moveReflectionLocation = (
  reflection: RecordProxy,
  reflectionGroup: RecordProxy<{meetingId: string}>,
  oldReflectionGroupId: string,
  store: RecordSourceSelectorProxy
) => {
  if (!reflection) return
  const reflectionId = reflection.getValue('id') as string

  handleUpdateSpotlightResults(reflection, reflectionGroup, oldReflectionGroupId, store)
  handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store)
  handleAddReflectionToGroup(reflection, store)
  handleRemoveEmptyReflectionGroup(oldReflectionGroupId, store)
  handleAddReflectionGroupToGroups(store, reflectionGroup)
}

export const endDraggingReflectionMeetingUpdater: SharedUpdater<
  EndDraggingReflectionMutation_meeting$data
> = (payload, {store}) => {
  const reflection = payload.getLinkedRecord('reflection')
  if (!reflection) return
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup')
  const oldReflectionGroupId = payload.getLinkedRecord('oldReflectionGroup').getValue('id')
  const existingDrag = reflection.getLinkedRecord('remoteDrag')
  if (!existingDrag) {
    const remoteDrag = payload.getLinkedRecord('remoteDrag')
    const remoteDragId = remoteDrag.getValue('id')
    const existingDragStarts = (reflection.getValue('ignoreDragStarts') as string[]) || []
    const nextDragStarts = existingDragStarts.concat(remoteDragId)
    reflection.setValue(nextDragStarts, 'ignoreDragStarts')
    reflection.setLinkedRecord(remoteDrag, 'remoteDrag')
  }
  moveReflectionLocation(reflection, reflectionGroup, oldReflectionGroupId, store)
}

export const endDraggingReflectionMeetingOnNext: OnNextHandler<
  EndDraggingReflectionMutation_meeting$data
> = (payload, context) => {
  const {atmosphere} = context
  const {reflection} = payload
  if (!reflection) return
  const {id: reflectionId} = reflection
  commitLocalUpdate(atmosphere, (store) => {
    const reflectionProxy = store.get(reflectionId)
    if (!reflectionProxy) return
    reflectionProxy.setValue(true, 'isDropping')
  })
}

const EndDraggingReflectionMutation: SimpleMutation<TEndDraggingReflectionMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TEndDraggingReflectionMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('endDraggingReflection')
      if (!payload) return
      const reflection = payload.getLinkedRecord('reflection')
      if (!reflection) return
      reflection.setValue(false, 'isViewerDragging')
      const reflectionGroup = payload.getLinkedRecord('reflectionGroup')!
      const oldReflectionGroupId = payload.getLinkedRecord('oldReflectionGroup').getValue('id')
      moveReflectionLocation(reflection, reflectionGroup, oldReflectionGroupId, store)
    },
    optimisticUpdater: (store) => {
      const nowISO = new Date().toJSON()
      const {reflectionId, dropTargetId: reflectionGroupId, dropTargetType} = variables
      const reflection = store.get(reflectionId)
      if (!reflection) return
      if (!dropTargetType) {
        reflection.setValue(false, 'isViewerDragging')
        return
      }

      const oldReflectionGroupId = reflection.getValue('reflectionGroupId') as string
      let reflectionGroupProxy: RecordProxy<{meetingId: string}>
      const newReflectionGroupId = clientTempId()
      // move a reflection into its own group
      if (!reflectionGroupId) {
        // create the new group
        const reflectionGroup = {
          id: newReflectionGroupId,
          createdAt: nowISO,
          meetingId: reflection.getValue('meetingId') as string,
          isActive: true,
          sortOrder: 0,
          updatedAt: nowISO,
          voterIds: []
        }
        reflectionGroupProxy = createProxyRecord(store, 'RetroReflectionGroup', reflectionGroup)
        updateProxyRecord(reflection, {sortOrder: 0, reflectionGroupId: newReflectionGroupId})
      } else {
        reflectionGroupProxy = store.get(reflectionGroupId)!
        const reflections = reflectionGroupProxy.getLinkedRecords('reflections')!
        const maxSortOrder = Math.max(
          ...reflections.map((reflection) =>
            reflection ? (reflection.getValue('sortOrder') as number) : -1
          )
        )
        // move a card into another group
        updateProxyRecord(reflection, {
          sortOrder: maxSortOrder + 1 + dndNoise(),
          reflectionGroupId
        })
        reflection.setLinkedRecord(reflectionGroupProxy, 'retroReflectionGroup')
      }
      moveReflectionLocation(reflection, reflectionGroupProxy, oldReflectionGroupId, store)
    }
  })
}

export default EndDraggingReflectionMutation
