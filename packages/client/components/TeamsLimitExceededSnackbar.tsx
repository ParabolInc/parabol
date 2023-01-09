import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import {TeamsLimitExceededSnackbar_notification$key} from '~/__generated__/TeamsLimitExceededSnackbar_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import SetNotificationStatusMutation from '../mutations/SetNotificationStatusMutation'

interface Props {
  notification: TeamsLimitExceededSnackbar_notification$key
}

const TeamsLimitExceededSnackbar = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment TeamsLimitExceededSnackbar_notification on NotifyTeamsLimitExceeded {
        id
        organization {
          id
          name
        }
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  const {id: notificationId, organization} = notification
  const {name: orgName} = organization

  useEffect(() => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 0,
      key: `newNotification:${notificationId}`,
      message: `Your account is on a roll! Check out "${orgName}"'s usage`,
      onDismiss: () => {
        SetNotificationStatusMutation(atmosphere, {notificationId, status: 'CLICKED'}, {})
      },
      action: {
        label: 'See Usage',
        callback: () => {
          history.push(`/usage`)
          SendClientSegmentEventMutation(atmosphere, 'Clicked usage snackbar CTA')
        }
      }
    })
  }, [])

  return null
}

export default TeamsLimitExceededSnackbar
