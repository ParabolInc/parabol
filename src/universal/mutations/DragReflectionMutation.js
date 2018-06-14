import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import getInProxy from 'universal/utils/relay/getInProxy'

type Variables = {
  isDragging: boolean,
  reflectionId: string,
  dropTargetType: string,
  dropTargetId: string
}

graphql`
  fragment DragReflectionMutation_team on DragReflectionPayload {
    reflectionId
    reflectionGroupId
    dragContext {
      draggerUserId
      draggerUser {
        id
        preferredName
      }
    }
    isDragging
    dropTargetType
    dropTargetId
  }
`

const mutation = graphql`
  mutation DragReflectionMutation(
    $isDragging: Boolean!
    $reflectionId: ID!
    $dropTargetType: DragReflectionDropTargetTypeEnum
    $dropTargetId: ID
  ) {
    dragReflection(
      isDragging: $isDragging
      reflectionId: $reflectionId
      dropTargetType: $dropTargetType
      dropTargetId: $dropTargetId
    ) {
      ...DragReflectionMutation_team @relay(mask: false)
    }
  }
`

export const dragReflectionTeamUpdater = (payload, {atmosphere, store}) => {
  // if no drag exists, trust it
  // if this is a drag end & there is no context, ignore!
  // if end & there is context, see if the user is the drag owner. if not, ignore!

  const reflectionId = payload.getValue('reflectionId')
  const reflection = store.get(reflectionId)
  if (!reflection) return
  const isDragging = payload.getValue('isDragging')
  const existingDraggerUserId = getInProxy(reflection, 'dragContext', 'draggerUserId')
  const newDragContext = payload.getLinkedRecord('dragContext')
  const proposedDraggerUserId = newDragContext.getValue('draggerUserId')
  if (isDragging) {
    // this payload could be the first payload we see, so we can't trust any value in the store
    // seems foolish to include all the meeting members in the payload just to check for eg check-in order, so we'll just use IDs
    const acceptNewContext = !existingDraggerUserId || proposedDraggerUserId > existingDraggerUserId
    if (acceptNewContext) {
      reflection.setLinkedRecord(newDragContext, 'dragContext')
    }
    // TODO figure out how to alert the UI that a failure occurred so it can update the coords & pop a toast

    // return true if the new payload won, false if it lost, or undefined if there was no conflict
    return existingDraggerUserId ? acceptNewContext : undefined
  } else if (existingDraggerUserId === proposedDraggerUserId) {
    reflection.setLinkedRecord(newDragContext, 'dragContext')
  }
  return undefined
}

export const dragReflectionTeamOnNext = (payload, context) => {
  const {
    atmosphere: {eventEmitter}
  } = context
  // this is the cleanest pattern i can come up with to communicate in the context of a component
  // any alternative requires passing a callback from a component up to its parent that requests the subscription
  console.log('onNext emitting payload', payload)
  const {
    reflectionGroupId: childId,
    reflectionId: itemId,
    dropTargetType,
    dropTargetId,
    isDragging
  } = payload
  if (!isDragging) {
    eventEmitter.emit('dragReflection', {dropTargetType, dropTargetId, itemId, childId})
  }
}
const DragReflectionMutation = (
  atmosphere: Object,
  variables: Variables,
  onError?: ErrorHandler,
  onCompleted?: CompletedHandler
) => {
  commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('dragReflection')
      if (!payload) return
      dragReflectionTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {isDragging, reflectionId} = variables
      const reflection = store.get(reflectionId)
      if (isDragging) {
        const dragContext = createProxyRecord(store, 'DragContext', {
          draggerUserId: viewerId
        })
        dragContext.setLinkedRecord(store.get(viewerId), 'draggerUser')
        reflection.setLinkedRecord(dragContext, 'dragContext')
        // } else {
        // reflection.setValue(null, 'dragContext')
        // const dragContext = reflection.getLinkedRecord('dragContext')
        // dragContext
        //   .setValue(null, 'draggerUserId')
        //   .setValue(null, 'draggerUser')
        //   .setValue(null, 'dragCoords')
        //   .setValue(true, 'isComplete')
      }
    }
  })
}

export default DragReflectionMutation
