import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapTeamsLimitExceededToToast_notification} from '../../__generated__/mapTeamsLimitExceededToToast_notification.graphql'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapTeamsLimitExceededToToast_notification on NotifyTeamsLimitExceeded {
    id
    orgName
  }
`

const mapTeamsLimitExceededToToast = (
  notification: mapTeamsLimitExceededToToast_notification,
  {history, atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, orgName} = notification

  return {
    autoDismiss: 0,
    key: makeNotificationToastKey(notificationId),
    message: `Your account is on a roll! Check out "${orgName}"'s usage`,
    onManualDismiss: () => {
      SendClientSegmentEventMutation(atmosphere, 'Snackbar Clicked', {
        snackbarType: 'teamsLimitExceeded'
      })
    },
    action: {
      label: 'See Usage',
      callback: () => {
        history.push(`/usage`)
      }
    }
  }
}

export default mapTeamsLimitExceededToToast
