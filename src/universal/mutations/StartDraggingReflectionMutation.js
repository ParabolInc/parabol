import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import getInProxy from 'universal/utils/relay/getInProxy'
import type {Coords2DInput} from 'universal/types/schema.flow'
import addNodeToArray from 'universal/utils/relay/addNodeToArray'

type Variables = {
  reflectionId: string,
  initialCoords: Coords2DInput
}

type Context = {
  initialCursorCoords: Coords2DInput,
  meetingId: string
}

graphql`
  fragment StartDraggingReflectionMutation_team on StartDraggingReflectionPayload {
    meetingId
    reflectionId
    dragContext {
      dragCoords {
        x
        y
      }
      dragUserId
      dragUser {
        id
        preferredName
      }
    }
  }
`

const mutation = graphql`
  mutation StartDraggingReflectionMutation($initialCoords: Coords2DInput!, $reflectionId: ID!) {
    startDraggingReflection(initialCoords: $initialCoords, reflectionId: $reflectionId) {
      ...StartDraggingReflectionMutation_team @relay(mask: false)
    }
  }
`

export const startDraggingReflectionTeamUpdater = (payload, {atmosphere, store}) => {
  const {viewerId} = atmosphere
  const reflectionId = payload.getValue('reflectionId')
  const reflection = store.get(reflectionId)
  if (!reflection) return undefined
  const dragContext = payload.getLinkedRecord('dragContext')
  const dragUserId = dragContext.getValue('dragUserId')
  const isViewerDragging = viewerId === dragUserId
  const existingDragUserId = getInProxy(reflection, 'dragContext', 'dragUserId')

  // if thre's no conflict, or the incoming payload won the conflict, set it
  if (!existingDragUserId || existingDragUserId <= dragUserId) {
    dragContext.setValue(isViewerDragging, 'isViewerDragging')
    dragContext.setValue(false, 'isClosing')
    reflection.setLinkedRecord(dragContext, 'dragContext')
    const meetingId = payload.getValue('meetingId')
    setInFlight(store, meetingId, reflection)
    return true
  }
  // if the incoming payload lost the conflict, ignore
  return false
}

const setInitialCoords = (store, dragContext, initialCoords, initialCursorCoords) => {
  const initialCursorCoordsProxy = createProxyRecord(store, 'Coords2D', initialCursorCoords)
  const initialComponentCoordsProxy = createProxyRecord(store, 'Coords2D', initialCoords)
  dragContext.setLinkedRecord(initialComponentCoordsProxy, 'initialComponentCoords')
  dragContext.setLinkedRecord(initialCursorCoordsProxy, 'initialCursorCoords')
}

const setInFlight = (store, meetingId, reflection) => {
  const meeting = store.get(meetingId)
  if (!meeting) return
  addNodeToArray(reflection, meeting, 'reflectionsInFlight', 'id')
}

const StartDraggingReflectionMutation = (
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
      const payload = store.getRootField('startDraggingReflection')
      if (!payload) return
      const success = startDraggingReflectionTeamUpdater(payload, {atmosphere, store})
      if (!success) return
      const reflection = store.get(payload.getValue('reflectionId'))
      const dragContext = reflection.getLinkedRecord('dragContext')
      setInitialCoords(store, dragContext, variables.initialCoords, context.initialCursorCoords)
      dragContext.setValue(null, 'dragCoords')
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {reflectionId, initialCoords} = variables
      const {initialCursorCoords, meetingId} = context
      const reflection = store.get(reflectionId)
      const dragContext = createProxyRecord(store, 'DragContext', {
        dragUserId: viewerId,
        isViewerDragging: true,
        isClosing: false
      })
      dragContext.setLinkedRecord(store.get(viewerId), 'dragUser')
      setInitialCoords(store, dragContext, initialCoords, initialCursorCoords)
      reflection.setLinkedRecord(dragContext, 'dragContext')
      setInFlight(store, meetingId, reflection)
    }
  })
}

export default StartDraggingReflectionMutation
