import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {matchPath} from 'react-router-dom'
import {Disposable, RecordSourceProxy} from 'relay-runtime'
import {StartDraggingReflectionMutation_meeting} from '~/__generated__/StartDraggingReflectionMutation_meeting.graphql'
import Atmosphere from '../Atmosphere'
import {ClientRetroReflection} from '../types/clientSchema'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import {
  StartDraggingReflectionMutation as TStartDraggingReflectionMutation,
  StartDraggingReflectionMutationVariables
} from '../__generated__/StartDraggingReflectionMutation.graphql'

graphql`
  fragment StartDraggingReflectionMutation_meeting on StartDraggingReflectionPayload {
    meetingId
    reflectionId
    teamId
    remoteDrag {
      id
      dragUserId
      dragUserName
      isSpotlight
    }
  }
`

const mutation = graphql`
  mutation StartDraggingReflectionMutation(
    $reflectionId: ID!
    $dragId: ID!
    $isSpotlight: Boolean
  ) {
    startDraggingReflection(
      reflectionId: $reflectionId
      dragId: $dragId
      isSpotlight: $isSpotlight
    ) {
      ...StartDraggingReflectionMutation_meeting @relay(mask: false)
    }
  }
`

interface UpdaterOptions {
  atmosphere: Atmosphere
  store: RecordSourceProxy
}

// used only by subscription
export const startDraggingReflectionMeetingUpdater: SharedUpdater<
  StartDraggingReflectionMutation_meeting
> = (payload, {atmosphere, store}: UpdaterOptions) => {
  const meetingId = payload.getValue('meetingId')
  const {pathname} = window.location
  const meetingRoute = matchPath(pathname, {path: `/meet/${meetingId}`})
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
  const reflectionId = payload.getValue('reflectionId')!
  const reflection = store.get<ClientRetroReflection>(reflectionId)
  if (!reflection) return
  const remoteDrag = payload.getLinkedRecord('remoteDrag')
  if (!remoteDrag) return
  const remoteDragId = remoteDrag.getValue('id')
  const ignoreDragStarts = reflection.getValue('ignoreDragStarts')
  // if an end arrived before the start, ignore the start
  if (ignoreDragStarts && ignoreDragStarts.includes(remoteDragId)) return
  const dragUserId = remoteDrag.getValue('dragUserId')
  const isViewerDragging = reflection.getValue('isViewerDragging')
  const existingRemoteDrag = reflection.getLinkedRecord('remoteDrag')

  // if I'm dragging & i get a message saying someone else is, whoever has the lower userId wins
  if (isViewerDragging) {
    if (dragUserId! <= viewerId) {
      // if the viewer lost, cancel their drag
      reflection.setValue(false, 'isViewerDragging')
      reflection.setValue(false, 'isDropping')
      reflection.setLinkedRecord(remoteDrag, 'remoteDrag')
      // cancel spotlight, too
      const meeting = meetingId !== null ? store.get(meetingId) : null
      meeting?.setValue(null, 'spotlightReflection')
    } else {
      // viewer wins
      return
    }
  }

  // if someone else is dragging & I get a message saying another is too, treat it the same
  if (existingRemoteDrag) {
    const existingDragUserId = existingRemoteDrag.getValue('dragUserId')!
    if (dragUserId! <= existingDragUserId) {
      // new drag wins!
      reflection.setValue(false, 'isDropping')
      reflection.setLinkedRecord(remoteDrag, 'remoteDrag')
    } else {
      // new drag loses, just ignore the start
      return
    }
  } else {
    reflection.setLinkedRecord(remoteDrag, 'remoteDrag')
  }
}

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
    updater: (store) => {
      const {viewerId} = atmosphere
      const {isSpotlight} = variables
      const payload = store.getRootField('startDraggingReflection')
      if (!payload) return
      const reflectionId = payload.getValue('reflectionId')!
      const reflection = store.get<ClientRetroReflection>(reflectionId)
      if (!reflection) return
      const remoteDrag = reflection.getLinkedRecord('remoteDrag')
      if (remoteDrag) {
        // if there's an existing drag & it's by someone with a smaller ID, the viewer lost the conflict
        const remoteDragUserId = remoteDrag.getValue('dragUserId')!
        if (remoteDragUserId <= viewerId) return
      }
      if (!isSpotlight) {
        // remoteDrag tells subscribers it's in Spotlight; isViewerDragging is false so viewer can drag source
        reflection.setValue(true, 'isViewerDragging')
      }
    },
    optimisticUpdater: (store) => {
      const {reflectionId, isSpotlight} = variables
      const reflection = store.get(reflectionId)
      if (!reflection) return
      if (!isSpotlight) {
        reflection.setValue(true, 'isViewerDragging')
      }
    }
  })
}

export default StartDraggingReflectionMutation
