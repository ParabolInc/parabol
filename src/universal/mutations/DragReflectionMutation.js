import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

type Variables = {
  isDragging: boolean,
  reflectionId: string,
  dropTargetType: string,
  dropTargetId: string
}

graphql`
  fragment DragReflectionMutation_team on DragReflectionPayload {
    reflection {
      id
      dragContext {
        draggerUserId
        draggerUser {
          id
          preferredName
        }
      }
      reflectionGroupId
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
  // const startDragging = Boolean(getInProxy(payload, 'reflection', 'dragContext', 'draggerUserId'))
  // if (!startDragging) {
  // const reflectionId = getInProxy(payload, 'reflection', 'id')
  // if (!reflectionId) return
  // const reflection = store.get(reflectionId)
  // reflection.setValue(null, 'dragContext')
  // const dragContext= reflection.getLinkedRecord('dragContext')
  // dragContext
  //   .setValue(null, 'draggerUserId')
  //   .setValue(null, 'draggerUser')
  //   .setValue(null, 'dragCoords')
  //   .setValue(true, 'isComplete')
  // const dropTargetType = payload.getValue('dropTargetType')
  // const reflectionGroupId = getInProxy(payload, 'reflection', 'reflectionGroupId')
  // atmosphere.eventEmitter.emit(`dragReflection.${reflectionId}`, {dropTargetType, itemId: reflectionId, childId: reflectionGroupId})
  // }
}

export const dragReflectionTeamOnNext = (payload, context) => {
  const {
    atmosphere: {eventEmitter}
  } = context
  // this is the cleanest pattern i can come up with to communicate in the context of a component
  // any alternative requires passing a callback from a component up to its parent that requests the subscription
  console.log('onNext emitting payload', payload)
  const {
    reflection: {id: itemId, reflectionGroupId: childId},
    dropTargetType,
    dropTargetId,
    isDragging
  } = payload
  if (!isDragging) {
    // TODO Fix me for multiplayer
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
      // console.log('opt ctx - ', reflection.getLinkedRecord('dragContext'))
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
