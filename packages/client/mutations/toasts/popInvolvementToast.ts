import {matchPath} from 'react-router-dom'
import {OnNextHandler, OnNextHistoryContext} from '../../types/relayMutations'
import {MENTIONEE} from '../../utils/constants'
import {TaskInvolves_notification} from '../../__generated__/TaskInvolves_notification.graphql'

const popInvolvementToast: OnNextHandler<TaskInvolves_notification, OnNextHistoryContext> = (
  notification,
  {atmosphere, history}
) => {
  if (!notification) return
  const {
    involvement,
    changeAuthor: {preferredName: changeAuthorName},
    task,
    team
  } = notification
  if (!task) return
  const {id: taskId} = task
  const {id: teamId} = team
  const {pathname} = window.location
  const inMeeting = !!matchPath(pathname, {
    path: '/meet',
    exact: false,
    strict: false
  })
  if (inMeeting) return

  const wording = involvement === MENTIONEE ? 'mentioned you in' : 'assigned you to'
  const message = `${changeAuthorName} ${wording} a task`
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: `taskInvolvement:${taskId}`,
    autoDismiss: 10,
    message,
    action: {
      label: 'Check it out!',
      callback: () => {
        history?.push(`/team/${teamId}`)
      }
    }
  })
}

export default popInvolvementToast
