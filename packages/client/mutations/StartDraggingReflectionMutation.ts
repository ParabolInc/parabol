import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {matchPath} from 'react-router-dom'
import {Disposable, RecordSourceProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {meetingTypeToSlug} from '../utils/meetings/lookups'
import {
  StartDraggingReflectionMutation as TStartDraggingReflectionMutation,
  StartDraggingReflectionMutationResponse,
  StartDraggingReflectionMutationVariables
} from '../__generated__/StartDraggingReflectionMutation.graphql'
import {MasonryAtmosphere} from '../components/PhaseItemMasonry'
import {MeetingTypeEnum} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import Atmosphere from '../Atmosphere'

// interface Context {
//   initialCursorCoords: Coords
//   meetingId: string
// }

graphql`
  fragment StartDraggingReflectionMutation_team on StartDraggingReflectionPayload {
    meetingId
    reflectionId
    teamId
    user {
      id
      preferredName
    }
  }
`

const mutation = graphql`
  mutation StartDraggingReflectionMutation($reflectionId: ID!) {
    startDraggingReflection(reflectionId: $reflectionId) {
      ...StartDraggingReflectionMutation_team @relay(mask: false)
    }
  }
`

interface UpdaterOptions {
  atmosphere: MasonryAtmosphere
  store: RecordSourceProxy
}

// const setInFlight = (store, meetingId, reflection) => {
//   const meeting = store.get(meetingId)
//   if (!meeting) return
//   addNodeToArray(reflection, meeting, 'reflectionsInFlight', 'id')
// }

export const startDraggingReflectionTeamUpdater = (
  payload,
  {atmosphere, store}: UpdaterOptions
) => {
  const teamId = payload.getValue('teamId')
  const {pathname} = window.location
  const slug = meetingTypeToSlug[MeetingTypeEnum.retrospective]
  const meetingRoute = matchPath(pathname, {path: `/${slug}/${teamId}`})
  const isDemoRoute = matchPath(pathname, {path: `/retrospective-demo`})
  /*
   * Avoid adding reflectionsInFlight on clients that are not in the meeting because
   * we can't call the endDrag handler to remove them because
   * that needs the full context of the grid
   */
  if (!isDemoRoute && !meetingRoute) {
    return
  }
  const {viewerId} = atmosphere
  const reflectionId = payload.getValue('reflectionId')
  const reflection = store.get(reflectionId)
  if (!reflection) return
  const dragUser = payload.getLinkedRecord('user')
  if (!dragUser) return
  const dragUserId = dragUser.getValue('id')
  const dragUserName = dragUser.getValue('preferredName')
  const existingDragUserId = reflection.getValue('dragUserId')
  const isViewerDragging = reflection.getValue('isViewerDragging')
  if (isViewerDragging) {
    if (dragUserId <= viewerId) {
      // end the viewer drag
      // listen to the drag according the the dragUserId
      reflection.setValue(false, 'isViewerDragging')
    } else {
      // ignore the incoming drag
      return
    }
  }
  if (existingDragUserId) {
    if (dragUserId <= existingDragUserId) {
      // new drag wins!
      reflection.setValue(dragUserId, 'dragUserId')
      reflection.setValue(dragUserName, 'dragUserName')
    } else {
      // new drag loses, just ignore the start
      return
    }
  }


  // const existingDragContext = reflection.getLinkedRecord('dragContext')
  // const dragContext = payload.getLinkedRecord('dragContext')
  // const dragUserId = dragContext.getValue('dragUserId')
  // const isViewerDragging = dragContext.getValue('isViewerDragging')
  // const existingDragUserId = getInProxy(existingDragContext, 'dragUserId')
  //
  // REMOVED beccause this broke a quick start, end, start, end.
  // could not reproduce the previous start, start, end, end bug, so I assume that this isn't necessary
  // const dragId = dragContext.getValue('id')
  // const existingDragId = getInProxy(existingDragContext, 'id')
  // if (
  //   // HERE THERE BE DRAGONS. need a smart way to handle start,end,start,end vs start,start,end,end
  //   existingDragContext &&
  //   existingDragUserId === dragUserId &&
  //   // same user in 2 tabs, tab 1 drops on a card, picks it very quickly
  //   dragUserId !== viewerId &&
  //   dragId !== existingDragId &&
  //   !isLocal
  // ) {
  //   // special case when a team member picks up the card twice before dropping it once
  //   // we'll want to reply this startDrag when the first endDrag returns
  //   atmosphere.startDragQueue = atmosphere.startDragQueue || []
  //   atmosphere.startDragQueue.push(() => {
  //     commitLocalUpdate(atmosphere, (store) => {
  //       startDraggingReflectionTeamUpdater(payload, {
  //         atmosphere,
  //         store,
  //         isLocal: true
  //       })
  //     })
  //   })
  // }

  // when conflicts arise, give the win to the person with the smaller userId
  // const acceptIncoming = !existingDragUserId || existingDragUserId >= dragUserId
  // let isViewerConflictLoser = false
  // if (acceptIncoming) {
  //   reflection.setLinkedRecord(dragContext, 'dragContext')
  //   const nextDragContext = reflection.getLinkedRecord('dragContext')
  //   if (!nextDragContext) return
  //   nextDragContext.setValue(isViewerDragging, 'isViewerDragging')
  //   nextDragContext.setValue(false, 'isClosing')
  //   nextDragContext.setValue(false, 'isPendingStartDrag')
  //   const meetingId = payload.getValue('meetingId')
  //   setInFlight(store, meetingId, reflection)
  //   // isViewerDragging is necessary in case 1 viewer has 2 tabs open
  //   if (existingDragUserId === viewerId && isViewerDragging) {
  //     // TODO support multi-client actors, don't relay on viewerId
  //     nextDragContext.setValue(null, 'initialCursorCoords')
  //     nextDragContext.setValue(null, 'initialComponentCoords')
  //     isViewerConflictLoser = true
  //   }
  // } else if (isViewerDragging) {
  //   // the return payload is for the viewer, but the rightful dragger came first
  //   isViewerConflictLoser = true
  // }
  //
  // if (isViewerConflictLoser) {
  //   const name = getInProxy(reflection, 'dragContext', 'dragUser', 'preferredName')
  //   // ideally this wouldn't be in the updater, but i don't wanna touch it because it's finicky MK
  //   atmosphere.eventEmitter.emit('addSnackbar', {
  //     key: `reflectionIntercepted`,
  //     autoDismiss: 5,
  //     message: `Too slow! ${name} stole that reflection right from under your nose!`
  //   })
  //   if (atmosphere.getMasonry) {
  //     const {itemCache} = atmosphere.getMasonry()
  //     // setTimeout required because otherwise it will call the endDrag handler before isViewerDragging is set to false
  //     setTimeout(() => {
  //       const cachedItem = itemCache[reflectionId]
  //       cachedItem && cachedItem.el && cachedItem.el.dispatchEvent(new Event('dragend'))
  //     })
  //   }
  // }
  // return acceptIncoming
}
// const setInitialCoords = (store, dragContext, initialCoords, initialCursorCoords) => {
//   const initialCursorCoordsProxy = createProxyRecord(store, 'Coords2D', initialCursorCoords)
//   const initialComponentCoordsProxy = createProxyRecord(store, 'Coords2D', initialCoords)
//   dragContext.setLinkedRecord(initialComponentCoordsProxy, 'initialComponentCoords')
//   dragContext.setLinkedRecord(initialCursorCoordsProxy, 'initialCursorCoords')
// }

const StartDraggingReflectionMutation = (
  atmosphere: Atmosphere,
  variables: StartDraggingReflectionMutationVariables,
  {onError, onCompleted}: LocalHandlers = {}
): Disposable => {
  return commitMutation<TStartDraggingReflectionMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted,
    updater: (store: RecordSourceSelectorProxy<StartDraggingReflectionMutationResponse>) => {
      const {viewerId} = atmosphere
      const payload = store.getRootField('startDraggingReflection')
      if (!payload) return
      const dragUser = payload.getLinkedRecord('user')
      if (!dragUser) return
      // const dragUserId = dragUser.getValue('id')
      // const dragUserName = dragUser.getValue('preferredName')
      const reflectionId = payload.getValue('reflectionId')!
      const reflection = store.get(reflectionId)
      if (!reflection) return
      const existingDragUserId = reflection.getValue('dragUserId')
      // if there's an existing drag & it's by someone with a smaller ID, the viewer lost the conflict
      if (existingDragUserId && existingDragUserId <= viewerId) return
      reflection.setValue(true, 'isViewerDragging')

      // const {initialCursorCoords} = context
      // const payload = store.getRootField('startDraggingReflection')
      // if (!payload) return
      // payload.getLinkedRecord('dragContext')!.setValue(true, 'isViewerDragging')
      // const acceptIncoming = startDraggingReflectionTeamUpdater(payload, {
      //   atmosphere,
      //   store
      // })
      // if (!acceptIncoming) return
      // const reflection = store.get(payload.getValue('reflectionId'))
      // if (!reflection) return
      // const dragContext = reflection.getLinkedRecord('dragContext')
      // if (!dragContext) return
      // setInitialCoords(store, dragContext, variables.initialCoords, initialCursorCoords)
      // dragContext.setValue(null, 'dragCoords')
    },
    optimisticUpdater: (store) => {
      const {reflectionId} = variables
      const reflection = store.get(reflectionId)
      if (!reflection) return
      reflection.setValue(true, 'isViewerDragging')

      //   const {viewerId} = atmosphere
      //   const {reflectionId, initialCoords} = variables
      //   const {initialCursorCoords, meetingId} = context
      //   const reflection = store.get(reflectionId)
      //   if (!reflection) return
      //   const dragContext = createProxyRecord(store, 'DragContext', {
      //     dragUserId: viewerId,
      //     isViewerDragging: true,
      //     isClosing: false,
      //     isPendingStartDrag: true
      //   })
      //   dragContext.setLinkedRecord(store.getRoot().getLinkedRecord('viewer'), 'dragUser')
      //   setInitialCoords(store, dragContext, initialCoords, initialCursorCoords)
      //   reflection.setLinkedRecord(dragContext, 'dragContext')
      //   setInFlight(store, meetingId, reflection)
    }
  })
}

export default StartDraggingReflectionMutation
