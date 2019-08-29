import {commitLocalUpdate, commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {matchPath} from 'react-router-dom'
import {Disposable, RecordSourceProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {meetingTypeToSlug} from '../utils/meetings/lookups'
import {
  StartDraggingReflectionMutation as TStartDraggingReflectionMutation,
  StartDraggingReflectionMutationResponse,
  StartDraggingReflectionMutationVariables
} from '../__generated__/StartDraggingReflectionMutation.graphql'
import {MeetingTypeEnum} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import Atmosphere from '../Atmosphere'
import {Times} from '../types/constEnums'


graphql`
  fragment StartDraggingReflectionMutation_team on StartDraggingReflectionPayload {
    meetingId
    reflectionId
    teamId
    remoteDrag {
      id
      dragUserId
      dragUserName
    }
  }
`

const mutation = graphql`
  mutation StartDraggingReflectionMutation($reflectionId: ID!, $dragId: ID!) {
    startDraggingReflection(reflectionId: $reflectionId, dragId: $dragId) {
      ...StartDraggingReflectionMutation_team @relay(mask: false)
    }
  }
`

interface UpdaterOptions {
  atmosphere: Atmosphere
  store: RecordSourceProxy
}

export const scheduleStaleDrop = (atmosphere: Atmosphere, reflectionId: string) => {
  const timeout = setTimeout(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const reflection = store.get(reflectionId)
      if (!reflection) return
      reflection.setValue(true, 'isDropping')
    })
  }, Times.REFLECTION_STALE_LIMIT)

  commitLocalUpdate(atmosphere, (store) => {
    const reflection = store.get(reflectionId)
    if (!reflection) return
    const remoteDrag = reflection.getLinkedRecord('remoteDrag')
    if (!remoteDrag) return
    remoteDrag.setValue(timeout, 'timeout')
  })
}

export const clearStaleDrop = (atmosphere: Atmosphere, remoteDragId: string) => {
  commitLocalUpdate(atmosphere, (store) => {
    const remoteDrag = store.get(remoteDragId)
    if (!remoteDrag) return
    const timeout = remoteDrag.getValue('timeout')
    window.clearTimeout(timeout)
  })
}

export const startDraggingReflectionTeamOnNext = (payload, {atmosphere}) => {
  const {reflectionId} = payload
  scheduleStaleDrop(atmosphere, reflectionId)
}

// used only by subscription
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
    if (dragUserId <= viewerId) {
      // if the viewer lost, cancel their drag
      reflection.setValue(false, 'isViewerDragging')
      reflection.setValue(false, 'isDropping')
      reflection.setLinkedRecord(remoteDrag, 'remoteDrag')
    } else {
      // ignore the incoming drag
      return
    }
  }

  // if someone else is dragging & I get a message saying another is too, treat it the same
  if (existingRemoteDrag) {
    const existingDragUserId = existingRemoteDrag.getValue('dragUserId')
    if (dragUserId <= existingDragUserId) {
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
    updater: (store: RecordSourceSelectorProxy<StartDraggingReflectionMutationResponse>) => {
      const {viewerId} = atmosphere
      const payload = store.getRootField('startDraggingReflection')
      if (!payload) return
      const reflectionId = payload.getValue('reflectionId')!
      const reflection = store.get(reflectionId)
      if (!reflection) return
      const remoteDrag = reflection.getLinkedRecord('remoteDrag')
      if (remoteDrag) {
        // if there's an existing drag & it's by someone with a smaller ID, the viewer lost the conflict
        const remoteDragUserId = remoteDrag.getValue('dragUserId')
        if (remoteDragUserId <= viewerId) return
      }
      reflection.setValue(true, 'isViewerDragging')
    },
    optimisticUpdater: (store) => {
      const {reflectionId} = variables
      const reflection = store.get(reflectionId)
      if (!reflection) return
      reflection.setValue(true, 'isViewerDragging')
    }
  })
}

export default StartDraggingReflectionMutation
