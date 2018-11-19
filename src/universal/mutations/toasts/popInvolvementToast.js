import {matchPath} from 'react-router-dom'
import {MENTIONEE} from 'universal/utils/constants'

const popInvolvementToast = (notification, {atmosphere, history}) => {
  if (!notification) return
  const {
    involvement,
    changeAuthor: {preferredName: changeAuthorName}
  } = notification
  const {pathname} = history.location
  const inMeeting =
    Boolean(
      matchPath(pathname, {
        path: '/meeting',
        exact: false,
        strict: false
      })
    ) ||
    matchPath(pathname, {
      path: '/retro',
      exact: false,
      strict: false
    })
  if (inMeeting) return

  const wording = involvement === MENTIONEE ? 'mentioned you in' : 'assigned you to'
  const message = `${changeAuthorName} ${wording} a task`
  atmosphere.eventEmitter.emit('addToast', {
    level: 'info',
    autoDismiss: 10,
    title: 'Fresh work!',
    message,
    action: {
      label: 'Check it out!',
      callback: () => {
        history.push('/me/notifications')
      }
    }
  })
}

export default popInvolvementToast
