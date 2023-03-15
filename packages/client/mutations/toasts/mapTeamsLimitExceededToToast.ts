import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapTeamsLimitExceededToToast_notification$data} from '../../__generated__/mapTeamsLimitExceededToToast_notification.graphql'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'
import makeNotificationToastKey from './makeNotificationToastKey'
import {Threshold} from '../../types/constEnums'

graphql`
  fragment mapTeamsLimitExceededToToast_notification on NotifyTeamsLimitExceeded {
    id
    orgName
  }
`

const mapTeamsLimitExceededToToast = (
  notification: mapTeamsLimitExceededToToast_notification$data,
  {history, atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, orgName} = notification

  return {
    autoDismiss: 0,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `"${orgName}" is over the limit of ${Threshold.MAX_STARTER_TIER_TEAMS} free teams. Action is needed.`,
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
