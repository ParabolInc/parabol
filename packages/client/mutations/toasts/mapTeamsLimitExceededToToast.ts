import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapTeamsLimitExceededToToast_notification} from '../../__generated__/mapTeamsLimitExceededToToast_notification.graphql'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'

graphql`
  fragment mapTeamsLimitExceededToToast_notification on NotifyTeamsLimitExceeded {
    id
    organization {
      id
      name
    }
  }
`

const mapTeamsLimitExceededToToast = (
  notification: mapTeamsLimitExceededToToast_notification,
  {history, atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, organization} = notification
  const {name: orgName} = organization

  return {
    autoDismiss: 0,
    key: `newNotification:${notificationId}`,
    message: `Your account is on a roll! Check out "${orgName}"'s usage`,
    action: {
      label: 'See Usage',
      callback: () => {
        history.push(`/usage`)
        SendClientSegmentEventMutation(atmosphere, 'Clicked usage snackbar CTA')
      }
    }
  }
}

export default mapTeamsLimitExceededToToast
