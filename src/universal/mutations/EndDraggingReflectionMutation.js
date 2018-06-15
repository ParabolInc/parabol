import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import getInProxy from 'universal/utils/relay/getInProxy'

type Variables = {
  reflectionId: string,
  dropTargetType: string,
  dropTargetId: string
}

graphql`
  fragment EndDraggingReflectionMutation_team on EndDraggingReflectionPayload {
    meetingId
    reflectionId
    reflectionGroupId
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

export const endDraggingReflectionTeamUpdater = (payload, {atmosphere, store}) => {
  const reflectionId = payload.getValue('reflectionId')
  const reflection = store.get(reflectionId)
  if (!reflection) return
  const userId = payload.getValue('userId')
  const existingDragUserId = getInProxy(reflection, 'dragContext', 'dragUserId')
  if (userId !== existingDragUserId) {
    // this isn't legit. let the onNext cb know to ignore this one
    payload.setValue(null, 'userId')
  }
}

export const endDraggingReflectionTeamOnNext = (payload, context) => {
  const {
    atmosphere: {eventEmitter}
  } = context
  console.log('onNext emitting endDraggingReflection if userId not null', payload)
  const {
    reflectionGroupId: childId,
    reflectionId: itemId,
    dropTargetType,
    dropTargetId,
    userId
  } = payload
  if (userId) {
    eventEmitter.emit('endDraggingReflection', {dropTargetType, dropTargetId, itemId, childId})
  }
}

const EndDraggingReflectionMutation = (
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
      const payload = store.getRootField('endDraggingReflection')
      if (!payload) return
      endDraggingReflectionTeamUpdater(payload, {atmosphere, store})
    }
  })
}

export default EndDraggingReflectionMutation
