import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import getInProxy from 'universal/utils/relay/getInProxy'
import handleAddReflectionToGroup from 'universal/mutations/handlers/handleAddReflectionToGroup'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'
import handleRemoveEmptyReflectionGroup from 'universal/mutations/handlers/handleRemoveEmptyReflectionGroup'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord'
import dndNoise from 'universal/utils/dndNoise'
import addNodeToArray from 'universal/utils/relay/addNodeToArray'

type Variables = {
  reflectionId: string,
  dropTargetType: string,
  dropTargetId: string
}

type Context = {
  meetingId: string
}

graphql`
  fragment EndDraggingReflectionMutation_team on EndDraggingReflectionPayload {
    meeting {
      id
      nextAutoGroupThreshold
    }
    reflection {
      ...CompleteReflectionFrag @relay(mask: false)
    }

    reflectionGroup {
      id
      meetingId
      sortOrder
      reflections {
        ...CompleteReflectionFrag @relay(mask: false)
      }
      title
      tasks {
        id
      }
    }
    oldReflectionGroup {
      id
      title
    }
    dropTargetType
    dropTargetId
    userId
  }
`

const mutation = graphql`
  mutation EndDraggingReflectionMutation(
    $reflectionId: ID!
    $dropTargetType: DragReflectionDropTargetTypeEnum
    $dropTargetId: ID
  ) {
    endDraggingReflection(
      reflectionId: $reflectionId
      dropTargetType: $dropTargetType
      dropTargetId: $dropTargetId
    ) {
      ...EndDraggingReflectionMutation_team @relay(mask: false)
    }
  }
`

const handleRemoveReflectionFromGroup = (reflectionId, reflectionGroupId, store) => {
  const reflectionGroup = store.get(reflectionGroupId)
  if (!reflectionGroup) return
  safeRemoveNodeFromArray(reflectionId, reflectionGroup, 'reflections')
}

// const moveGroupLocation = (reflectionGroupProxy, store) => {
//   if (!reflectionGroupProxy) return
//   const reflectionGroupId = reflectionGroupProxy.getValue('id')
//   const meetingId = reflectionGroupProxy.getValue('meetingId')
//   handleRemoveReflectionGroups(reflectionGroupId, meetingId, store)
//   handleAddReflectionGroups(reflectionGroupProxy, store)
// }

const handleAddReflectionGroupToGroups = (store, reflectionGroup) => {
  if (!reflectionGroup) return
  const meetingId = reflectionGroup.getValue('meetingId')
  const meeting = store.get(meetingId)
  if (!meeting) return
  addNodeToArray(reflectionGroup, meeting, 'reflectionGroups', 'sortOrder')
}

export const moveReflectionLocation = (
  reflection,
  reflectionGroup,
  oldReflectionGroupId,
  store
) => {
  // moveGroupLocation(reflectionGroup, store)
  if (!reflection) return
  const reflectionId = reflection.getValue('id')
  handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store)
  handleAddReflectionToGroup(reflection, store)
  handleRemoveEmptyReflectionGroup(oldReflectionGroupId, store)
  handleAddReflectionGroupToGroups(store, reflectionGroup)
}

const handleDragMismatch = (store, dragContext, userId) => {
  // if an endDrag message comes in, we MUST trust it, because it was validated by the server & represents what is in the DB
  const existingDragUserId = dragContext.getValue('dragUserId')
  if (existingDragUserId !== userId) {
    dragContext.setValue(userId, 'dragUserId')
    const cachedDragUser = store.get(userId)
    if (cachedDragUser) {
      dragContext.setLinkedRecord(cachedDragUser, 'dragUser')
    } else {
      const nextUser = createProxyRecord(store, 'User', {
        preferredName: 'Unknown',
        id: userId
      })
      dragContext.setLinkedRecord(nextUser, 'dragUser')
    }
  }
}

export const endDraggingReflectionTeamUpdater = (payload, {atmosphere, store}) => {
  const userId = payload.getValue('userId')
  const reflection = payload.getLinkedRecord('reflection')
  const reflectionId = reflection.getValue('id')
  const storedReflection = store.get(reflectionId)
  const dragContext = storedReflection.getLinkedRecord('dragContext')
  if (!dragContext) return
  handleDragMismatch(store, dragContext, userId)

  const reflectionGroup = payload.getLinkedRecord('reflectionGroup')
  const oldReflectionGroupId = getInProxy(payload, 'oldReflectionGroup', 'id')
  moveReflectionLocation(reflection, reflectionGroup, oldReflectionGroupId, store)
}

export const endDraggingReflectionTeamOnNext = (payload, context) => {
  const {
    atmosphere: {eventEmitter}
  } = context
  const {
    reflection: {id: itemId},
    oldReflectionGroup,
    reflectionGroup,
    dropTargetType,
    dropTargetId
  } = payload
  const childId = reflectionGroup && reflectionGroup.id
  const sourceId = oldReflectionGroup && oldReflectionGroup.id
  eventEmitter.emit('endDraggingReflection', {
    dropTargetType,
    dropTargetId,
    itemId,
    childId,
    sourceId
  })
}

const EndDraggingReflectionMutation = (
  atmosphere: Object,
  variables: Variables,
  context: Context,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('endDraggingReflection')
      if (!payload) return
      endDraggingReflectionTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const nowISO = new Date().toJSON()
      const {reflectionId, dropTargetId: reflectionGroupId, dropTargetType} = variables
      const {meetingId, newReflectionGroupId} = context
      if (!dropTargetType) return
      // move an entire group somewhere else
      // if (!reflectionId) {
      //   const reflectionGroupProxy = store.get(reflectionGroupId)
      //   updateProxyRecord(reflectionGroupProxy, {
      //     sortOrder
      //   })
      //   moveGroupLocation(reflectionGroupProxy, store)
      //   return
      // }

      const reflectionProxy = store.get(reflectionId)
      const oldReflectionGroupId = reflectionProxy.getValue('reflectionGroupId')
      const meeting = store.get(meetingId)
      let reflectionGroupProxy = store.get(reflectionGroupId)
      // move a reflection into its own group
      if (reflectionGroupId === null) {
        // create the new group
        const reflectionGroup = {
          id: newReflectionGroupId,
          createdAt: nowISO,
          isActive: true,
          meetingId,
          sortOrder: 0,
          updatedAt: nowISO,
          voterIds: []
        }
        reflectionGroupProxy = createProxyRecord(store, 'RetroReflectionGroup', reflectionGroup)
        reflectionGroupProxy.setLinkedRecord(meeting, 'meeting')
        updateProxyRecord(reflectionProxy, {sortOrder: 0, reflectionGroupId: newReflectionGroupId})

        // } else if (reflectionGroupId === oldReflectionGroupId) {
        // move a card within the same group
        // updateProxyRecord(reflectionProxy, {sortOrder: 0})
      } else {
        const reflections = reflectionGroupProxy.getLinkedRecords('reflections')
        const maxSortOrder = Math.max(
          ...reflections.map((reflection) => reflection.getValue('sortOrder'))
        )
        // move a card into another group
        updateProxyRecord(reflectionProxy, {
          sortOrder: maxSortOrder + 1 + dndNoise(),
          reflectionGroupId
        })
        reflectionProxy.setLinkedRecord(reflectionGroupProxy, 'retroReflectionGroup')
      }
      moveReflectionLocation(reflectionProxy, reflectionGroupProxy, oldReflectionGroupId, store)
    }
  })
}

export default EndDraggingReflectionMutation
