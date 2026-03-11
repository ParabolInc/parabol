import {matchPath} from 'react-router-dom'
import type {TaskInvolves_notification$data} from '../../__generated__/TaskInvolves_notification.graphql'
import type {OnNextHandler, OnNextNavigateContext} from '../../types/relayMutations'
import {MENTIONEE} from '../../utils/constants'

const popInvolvementToast: OnNextHandler<TaskInvolves_notification$data, OnNextNavigateContext> = (
  notification,
  {atmosphere, navigate}
) => {
  if (!notification) return
  const {
    involvement,
    changeAuthor: {
      user: {preferredName: changeAuthorName}
    },
    task,
    team
  } = notification
  if (!task) return
  const {id: taskId} = task
  const {id: teamId} = team
  const {pathname} = window.location
  const inMeeting = !!matchPath({path: '/meet', end: false}, pathname)
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
        navigate?.(`/team/${teamId}`)
      }
    }
  })
}

export default popInvolvementToast
