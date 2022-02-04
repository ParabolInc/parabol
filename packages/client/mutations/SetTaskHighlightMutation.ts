import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {matchPath} from 'react-router-dom'
import {Disposable, RecordSourceProxy} from 'relay-runtime'
import {
  SetTaskHighlightMutation as TSetTaskHighlightMutation,
  SetTaskHighlightMutationVariables
} from '../__generated__/SetTaskHighlightMutation.graphql'
import {LocalHandlers, SharedUpdater} from '../types/relayMutations'
import Atmosphere from '../Atmosphere'
import {SetTaskHighlightMutation_meeting} from '~/__generated__/SetTaskHighlightMutation_meeting.graphql'
import {ITask} from '../types/graphql'
import {ClientNewMeeting} from '~/types/clientSchema'

graphql`
  fragment SetTaskHighlightMutation_meeting on SetTaskHighlightPayload{
    meetingId
    taskId
    isHighlighted
  }
`

const mutation = graphql`
  mutation SetTaskHighlightMutation(
    $taskId: ID!
    $meetingId: ID!
    $isHighlighted: Boolean!
  ) {
    setTaskHighlight(
      taskId: $taskId
      meetingId: $meetingId
      isHighlighted: $isHighlighted
    ) {
      ...SetTaskHighlightMutation_meeting @relay(mask: false)
    }
  }
`

interface UpdaterOptions {
  atmosphere: Atmosphere
  store: RecordSourceProxy
}

// used only by subscription
export const setTaskHighlightUpdater: SharedUpdater<SetTaskHighlightMutation_meeting> = (
  payload,
  {store}: UpdaterOptions
) => {
  const meetingId = payload.getValue('meetingId')
  const {pathname} = window.location
  const meetingRoute = matchPath(pathname, {path: `/meet/${meetingId}`})
  /*
   * Avoid adding task highlights for clients that are not in the meeting
   */
  if (!meetingId || !meetingRoute) {
    return
  }
  const meeting = store.get<ClientNewMeeting>(meetingId)
  if (!meeting) {
    return
  }

  const highlightedTaskId = meeting.getValue('highlightedTaskId')
  const taskId = payload.getValue('taskId')!
  const isHighlighted = payload.getValue('isHighlighted')

  // If we missed the un-highlighting of the previous task, then clear it here.
  if (highlightedTaskId &&
    isHighlighted &&
    highlightedTaskId !== taskId) {
    const task = store.get<ITask>(highlightedTaskId)
    task?.setValue(false, 'isHighlighted')
  }

  const task = store.get<ITask>(taskId)
  if (!task) {
    return
  }
  task.setValue(isHighlighted, 'isHighlighted')
  if (isHighlighted) {
    meeting.setValue(taskId, 'highlightedTaskId')
  }
}

const SetTaskHighlightMutation = (
  atmosphere: Atmosphere,
  variables: SetTaskHighlightMutationVariables,
  {onError, onCompleted}: LocalHandlers = {}
): Disposable => {
  return commitMutation<TSetTaskHighlightMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted,
  })
}

export default SetTaskHighlightMutation
