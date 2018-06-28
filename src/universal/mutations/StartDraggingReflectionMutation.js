import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitMutation} from 'react-relay'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import getInProxy from 'universal/utils/relay/getInProxy'
import type {Coords2DInput} from 'universal/types/schema.flow'
import addNodeToArray from 'universal/utils/relay/addNodeToArray'
import {showInfo} from 'universal/modules/toast/ducks/toastDuck'

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
      id
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

export const startDraggingReflectionTeamUpdater = (payload, {atmosphere, dispatch, store}) => {
  const {viewerId} = atmosphere
  const reflectionId = payload.getValue('reflectionId')
  const reflection = store.get(reflectionId)
  if (!reflection) return undefined
  const dragContext = payload.getLinkedRecord('dragContext')
  const dragUserId = dragContext.getValue('dragUserId')
  const isViewerDragging = dragContext.getValue('isViewerDragging')
  const existingDragContext = reflection.getLinkedRecord('dragContext')
  const existingDragUserId = getInProxy(existingDragContext, 'dragUserId')

  // when conflicts arise, give the win to the person with the smaller userId
  const acceptIncoming = !existingDragUserId || existingDragUserId >= dragUserId
  let isViewerConflictLoser = false
  if (acceptIncoming) {
    reflection.setLinkedRecord(dragContext, 'dragContext')
    dragContext.setValue(isViewerDragging, 'isViewerDragging')
    dragContext.setValue(false, 'isClosing')
    dragContext.setValue(false, 'isPendingStartDrag')
    const meetingId = payload.getValue('meetingId')
    setInFlight(store, meetingId, reflection)
    if (existingDragUserId === viewerId) {
      dragContext.setValue(null, 'initialCursorCoords')
      dragContext.setValue(null, 'initialComponentCoords')
      isViewerConflictLoser = true
    }
  } else if (isViewerDragging) {
    isViewerConflictLoser = true
  }

  if (isViewerConflictLoser) {
    const name = getInProxy(reflection, 'dragContext', 'dragUser', 'preferredName')
    dispatch(
      showInfo({
        autoDismiss: 5,
        title: 'Interception!',
        message: `${name} stole that reflection right from under your nose!`
      })
    )
    const {itemCache} = atmosphere.getMasonry()
    // setTimeout required because otherwise it will call the endDrag handler before isViewerDragging is set to false
    setTimeout(() => {
      itemCache[reflectionId].el.dispatchEvent(new window.Event('dragend'))
    })
  }
  return acceptIncoming
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
      const {dispatch, initialCursorCoords} = context
      const payload = store.getRootField('startDraggingReflection')
      if (!payload) return
      payload.getLinkedRecord('dragContext').setValue(true, 'isViewerDragging')
      const acceptIncoming = startDraggingReflectionTeamUpdater(payload, {
        atmosphere,
        dispatch,
        store
      })
      if (!acceptIncoming) return
      const reflection = store.get(payload.getValue('reflectionId'))
      const dragContext = reflection.getLinkedRecord('dragContext')
      setInitialCoords(store, dragContext, variables.initialCoords, initialCursorCoords)
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
        isClosing: false,
        isPendingStartDrag: true
      })
      dragContext.setLinkedRecord(store.get(viewerId), 'dragUser')
      setInitialCoords(store, dragContext, initialCoords, initialCursorCoords)
      reflection.setLinkedRecord(dragContext, 'dragContext')
      setInFlight(store, meetingId, reflection)
    }
  })
}

export default StartDraggingReflectionMutation
