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
import onTeamRoute from 'universal/utils/onTeamRoute'

type Variables = {
  reflectionId: string,
  dropTargetType: string,
  dropTargetId: string,
  dragId: string
}

type Context = {
  meetingId: string
}

graphql`
  fragment EndDraggingReflectionMutation_team on EndDraggingReflectionPayload {
    dragId
    meeting {
      id
      nextAutoGroupThreshold
      teamId
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
    $dragId: ID
  ) {
    endDraggingReflection(
      reflectionId: $reflectionId
      dropTargetType: $dropTargetType
      dropTargetId: $dropTargetId
      dragId: $dragId
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

const handleDragContext = (reflectionId, userId, store) => {
  const reflection = store.get(reflectionId)
  reflection.setValue(undefined, 'isOptimistic')
  const dragContext = reflection.getLinkedRecord('dragContext')
  if (dragContext) {
    handleDragMismatch(store, dragContext, userId)
    dragContext.setValue(true, 'isClosing')
  }
}
export const moveReflectionLocation = (
  reflection,
  reflectionGroup,
  oldReflectionGroupId,
  userId,
  store
) => {
  // moveGroupLocation(reflectionGroup, store)
  if (!reflection) return
  const reflectionId = reflection.getValue('id')
  handleDragContext(reflectionId, userId, store)
  handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store)
  handleAddReflectionToGroup(reflection, store)
  handleRemoveEmptyReflectionGroup(oldReflectionGroupId, store)
  handleAddReflectionGroupToGroups(store, reflectionGroup)
}

const handleDragMismatch = (store, dragContext, userId) => {
  if (!dragContext) return
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
  const reflection = payload.getLinkedRecord('reflection')
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup')
  const oldReflectionGroupId = getInProxy(payload, 'oldReflectionGroup', 'id')
  const userId = payload.getValue('userId')
  moveReflectionLocation(reflection, reflectionGroup, oldReflectionGroupId, userId, store)
}

export const endDraggingReflectionTeamOnNext = (payload, context) => {
  const {
    atmosphere: {eventEmitter},
    location
  } = context
  const {
    dragId,
    reflection: {id: itemId},
    oldReflectionGroup,
    reflectionGroup,
    dropTargetType,
    dropTargetId,
    meeting: {teamId}
  } = payload
  const childId = reflectionGroup && reflectionGroup.id
  const sourceId = oldReflectionGroup && oldReflectionGroup.id
  const {pathname} = location
  if (onTeamRoute(pathname, teamId)) {
    eventEmitter.emit('endDraggingReflection', {
      dropTargetType,
      dropTargetId,
      itemId,
      childId,
      sourceId,
      dragId
    })
  }
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
      const {viewerId} = atmosphere
      const {reflectionId, dropTargetId: reflectionGroupId, dropTargetType} = variables
      const {meetingId, newReflectionGroupId} = context
      const reflectionProxy = store.get(reflectionId)

      if (!dropTargetType) {
        const dragContext = reflectionProxy.getLinkedRecord('dragContext')
        if (dragContext) {
          dragContext.setValue(true, 'isClosing')
        }
        return
      }
      // move an entire group somewhere else
      // if (!reflectionId) {
      //   const reflectionGroupProxy = store.get(reflectionGroupId)
      //   updateProxyRecord(reflectionGroupProxy, {
      //     sortOrder
      //   })
      //   moveGroupLocation(reflectionGroupProxy, store)
      //   return
      // }

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
      moveReflectionLocation(
        reflectionProxy,
        reflectionGroupProxy,
        oldReflectionGroupId,
        viewerId,
        store
      )
      reflectionProxy.setValue(true, 'isOptimistic')
    }
  })
}

export default EndDraggingReflectionMutation
