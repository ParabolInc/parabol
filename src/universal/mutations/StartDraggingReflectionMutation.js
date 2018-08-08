import type {CompletedHandler, ErrorHandler} from 'universal/types/relay'
import {commitLocalUpdate, commitMutation} from 'react-relay'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import getInProxy from 'universal/utils/relay/getInProxy'
import type {Coords2DInput} from 'universal/types/schema.flow'
import addNodeToArray from 'universal/utils/relay/addNodeToArray'
import {showInfo} from 'universal/modules/toast/ducks/toastDuck'
import {matchPath} from 'react-router-dom'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {RETROSPECTIVE} from 'universal/utils/constants'

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
    teamId
  }
`

const mutation = graphql`
  mutation StartDraggingReflectionMutation($initialCoords: Coords2DInput!, $reflectionId: ID!) {
    startDraggingReflection(initialCoords: $initialCoords, reflectionId: $reflectionId) {
      ...StartDraggingReflectionMutation_team @relay(mask: false)
    }
  }
`

export const startDraggingReflectionTeamUpdater = (
  payload,
  {atmosphere, dispatch, store, isLocal}
) => {
  const {pathname} = window.location
  const slug = meetingTypeToSlug[RETROSPECTIVE]
  const meetingRoute = matchPath(pathname, {path: `/${slug}/:teamId`})
  /*
   * Avoid adding reflectionsInFlight on clients that are not in the meeting because
   * we can't call the endDrag handler to remove them because
   * that needs the full context of the grid
   */
  if (!meetingRoute || meetingRoute.params.teamId !== payload.getValue('teamId')) {
    return undefined
  }
  const {viewerId} = atmosphere
  const reflectionId = payload.getValue('reflectionId')
  const reflection = store.get(reflectionId)
  if (!reflection) return undefined
  const existingDragContext = reflection.getLinkedRecord('dragContext')
  const dragContext = payload.getLinkedRecord('dragContext')
  const dragUserId = dragContext.getValue('dragUserId')
  const isViewerDragging = dragContext.getValue('isViewerDragging')
  const existingDragUserId = getInProxy(existingDragContext, 'dragUserId')

  if (
    existingDragContext &&
    existingDragUserId === dragUserId &&
    // same user in 2 tabs, tab 1 drops on a card, picks it very quickly
    dragUserId !== viewerId &&
    !isLocal
  ) {
    // special case when a team member picks up the card twice before dropping it once
    // we'll want to reply this startDrag when the first endDrag returns
    atmosphere.startDragQueue = atmosphere.startDragQueue || []
    atmosphere.startDragQueue.push(() => {
      commitLocalUpdate(atmosphere, (store) => {
        startDraggingReflectionTeamUpdater(payload, {
          atmosphere,
          dispatch,
          store,
          isLocal: true
        })
      })
    })
  }

  // when conflicts arise, give the win to the person with the smaller userId
  const acceptIncoming = !existingDragUserId || existingDragUserId >= dragUserId
  let isViewerConflictLoser = false
  if (acceptIncoming) {
    reflection.setLinkedRecord(dragContext, 'dragContext')
    const nextDragContext = reflection.getLinkedRecord('dragContext')
    nextDragContext.setValue(isViewerDragging, 'isViewerDragging')
    nextDragContext.setValue(false, 'isClosing')
    nextDragContext.setValue(false, 'isPendingStartDrag')
    const meetingId = payload.getValue('meetingId')
    setInFlight(store, meetingId, reflection)
    // isViewerDragging is necessary in case 1 viewer has 2 tabs open
    if (existingDragUserId === viewerId && isViewerDragging) {
      // TODO support multi-client actors, don't relay on viewerId
      nextDragContext.setValue(null, 'initialCursorCoords')
      nextDragContext.setValue(null, 'initialComponentCoords')
      isViewerConflictLoser = true
    }
  } else if (isViewerDragging) {
    // the return payload is for the viewer, but the rightful dragger came first
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
