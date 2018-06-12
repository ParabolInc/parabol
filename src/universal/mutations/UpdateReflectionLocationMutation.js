/**
 * Updates a reflection's content for the retrospective meeting.
 *
 */
import {commitMutation} from 'react-relay'
import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord'
import handleAddReflectionGroups from 'universal/mutations/handlers/handleAddReflectionGroups'
import handleRemoveReflectionGroups from 'universal/mutations/handlers/handleRemoveReflectionGroups'
import getInProxy from 'universal/utils/relay/getInProxy'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'
import handleRemoveEmptyReflectionGroup from 'universal/mutations/handlers/handleRemoveEmptyReflectionGroup'
import clientTempId from 'universal/utils/relay/clientTempId'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import handleAddReflectionToGroup from 'universal/mutations/handlers/handleAddReflectionToGroup'
import resetDragContext from 'universal/utils/multiplayerMasonry/resetDragContext'

type Variables = {
  sortOrder: string,
  reflectionId: string,
  reflectionGroupId?: string
}

graphql`
  fragment UpdateReflectionLocationMutation_team on UpdateReflectionLocationPayload {
    meeting {
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
  }
`

const mutation = graphql`
  mutation UpdateReflectionLocationMutation(
    $reflectionGroupId: ID
    $reflectionId: ID
    $sortOrder: Float!
  ) {
    updateReflectionLocation(
      reflectionGroupId: $reflectionGroupId
      reflectionId: $reflectionId
      sortOrder: $sortOrder
    ) {
      error {
        message
      }
      ...UpdateReflectionLocationMutation_team @relay(mask: false)
    }
  }
`

const handleRemoveReflectionFromGroup = (reflectionId, reflectionGroupId, store) => {
  const reflectionGroup = store.get(reflectionGroupId)
  if (!reflectionGroup) return
  safeRemoveNodeFromArray(reflectionId, reflectionGroup, 'reflections')
}

const moveGroupLocation = (reflectionGroupProxy, store) => {
  if (!reflectionGroupProxy) return
  const reflectionGroupId = reflectionGroupProxy.getValue('id')
  const meetingId = reflectionGroupProxy.getValue('meetingId')
  handleRemoveReflectionGroups(reflectionGroupId, meetingId, store)
  handleAddReflectionGroups(reflectionGroupProxy, store)
}

const moveReflectionLocation = (reflection, reflectionGroup, oldReflectionGroupId, store) => {
  moveGroupLocation(reflectionGroup, store)
  if (!reflection) return
  const reflectionId = reflection.getValue('id')
  handleRemoveReflectionFromGroup(reflectionId, oldReflectionGroupId, store)
  handleAddReflectionToGroup(reflection, store)
  handleRemoveEmptyReflectionGroup(oldReflectionGroupId, store)
}

export const updateReflectionLocationTeamUpdater = (payload, {store}) => {
  const reflection = payload.getLinkedRecord('reflection')
  const reflectionGroup = payload.getLinkedRecord('reflectionGroup')
  const oldReflectionGroupId = getInProxy(payload, 'oldReflectionGroup', 'id')
  moveReflectionLocation(reflection, reflectionGroup, oldReflectionGroupId, store)

  resetDragContext(reflection)

  const reflectionGroupId = getInProxy(payload, 'reflectionGroup', 'id')
  if (reflectionGroupId) {
    store.get(reflectionGroupId).setValue(false, 'isExpanded')
  }
  if (oldReflectionGroupId) {
    store.get(oldReflectionGroupId).setValue(false, 'isExpanded')
  }
}

export const updateReflectionLocationTeamOnNext = (payload, context) => {
  const {
    atmosphere: {eventEmitter}
  } = context
  // this is the cleanest pattern i can come up with to communicate in the context of a component
  // any alternative requires passing a callback from a component up to its parent that requests the subscription
  console.log('onNext emitting payload', payload)
  eventEmitter.emit('updateReflectionLocation', payload)
}

type Context = {
  meetingId: string
}

const UpdateReflectionLocationMutation = (
  atmosphere: Object,
  variables: Variables,
  context: Context,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      if (onCompleted) {
        onCompleted(res, errors)
      }
      updateReflectionLocationTeamOnNext(res.updateReflectionLocation, {atmosphere})
    },
    onError,
    updater: (store) => {
      const payload = store.getRootField('updateReflectionLocation')
      if (!payload) return
      updateReflectionLocationTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const nowISO = new Date().toJSON()
      const {reflectionId, reflectionGroupId, sortOrder} = variables
      const {meetingId} = context
      // move an entire group somewhere else
      if (!reflectionId) {
        const reflectionGroupProxy = store.get(reflectionGroupId)
        updateProxyRecord(reflectionGroupProxy, {
          sortOrder
        })
        moveGroupLocation(reflectionGroupProxy, store)
        return
      }

      const reflectionProxy = store.get(reflectionId)
      const oldReflectionGroupId = reflectionProxy.getValue('reflectionGroupId')
      const meeting = store.get(meetingId)
      let reflectionGroupProxy = store.get(reflectionGroupId)
      // move a reflection into its own group
      if (reflectionGroupId === null) {
        updateProxyRecord(reflectionProxy, {sortOrder: 0})
        // create the new group
        const reflectionGroup = {
          id: clientTempId(),
          createdAt: nowISO,
          isActive: true,
          meetingId,
          sortOrder,
          updatedAt: nowISO,
          voterIds: []
        }
        reflectionGroupProxy = createProxyRecord(store, 'RetroReflectionGroup', reflectionGroup)
        reflectionGroupProxy.setLinkedRecords([reflectionProxy], 'reflections')
        reflectionGroupProxy.setLinkedRecord(meeting, 'meeting')
        // const payload = {oldReflectionGroup: {id: oldReflectionGroupId}, reflectionGroup}
        // setTimeout(() => {
        // console.log('calling onNext', reflectionGroup.id)
        //   updateReflectionLocationTeamOnNext(payload, {atmosphere})
        // }, 50)
      } else if (reflectionGroupId === oldReflectionGroupId) {
        // move a card within the same group
        updateProxyRecord(reflectionProxy, {sortOrder})
      } else {
        // move a card into another group
        updateProxyRecord(reflectionProxy, {
          sortOrder,
          reflectionGroupId
        })
        reflectionProxy.setLinkedRecord(reflectionGroupProxy, 'retroReflectionGroup')
        resetDragContext(reflectionProxy)
      }
      moveReflectionLocation(reflectionProxy, reflectionGroupProxy, oldReflectionGroupId, store)
    }
  })
}

export default UpdateReflectionLocationMutation
