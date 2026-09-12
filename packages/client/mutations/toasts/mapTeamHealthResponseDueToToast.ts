import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import type {mapTeamHealthResponseDueToToast_notification$data} from '../../__generated__/mapTeamHealthResponseDueToToast_notification.graphql'
import type {Snack} from '../../components/Snackbar'
import type {OnNextNavigateContext} from '../../types/relayMutations'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapTeamHealthResponseDueToToast_notification on NotifyTeamHealthResponseDue {
    id
    meeting {
      id
      name
      scheduledEndTime
    }
  }
`

const mapTeamHealthResponseDueToToast = (
  notification: mapTeamHealthResponseDueToToast_notification$data,
  {navigate}: OnNextNavigateContext
): Snack | null => {
  if (!notification) return null
  const {id: notificationId, meeting} = notification
  const {id: meetingId, name: meetingName, scheduledEndTime} = meeting
  const closesAt = scheduledEndTime ? dayjs(scheduledEndTime).format('ddd h:mm A') : 'soon'

  return {
    key: makeNotificationToastKey(notificationId),
    autoDismiss: 10,
    message: `${meetingName} closes ${closesAt}. Share your responses before the results are revealed.`,
    action: {
      label: 'Share your responses',
      callback: () => {
        navigate(`/meet/${meetingId}`)
      }
    }
  }
}

export default mapTeamHealthResponseDueToToast
