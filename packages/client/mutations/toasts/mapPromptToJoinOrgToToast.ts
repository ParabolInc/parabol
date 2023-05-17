import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import {mapPromptToJoinOrgToToast_notification$data} from '../../__generated__/mapPromptToJoinOrgToToast_notification.graphql'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'
import makeNotificationToastKey from './makeNotificationToastKey'
import RequestToJoinDomainMutation from '../RequestToJoinDomainMutation'

graphql`
  fragment mapPromptToJoinOrgToToast_notification on NotifyPromptToJoinOrg {
    id
    activeDomain
  }
`

const mapPromptToJoinOrgToToast = (
  notification: mapPromptToJoinOrgToToast_notification$data,
  {atmosphere}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, activeDomain} = notification

  return {
    autoDismiss: 0,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `Your teammates at ${activeDomain} are loving Parabol! Do you want to join them?`,
    onShow: () => {
      SendClientSegmentEventMutation(atmosphere, 'Snackbar Viewed', {
        snackbarType: 'promptToJoinOrg'
      })
    },
    action: {
      label: 'Request to Join',
      callback: () => {
        RequestToJoinDomainMutation(atmosphere, {})
        SendClientSegmentEventMutation(atmosphere, 'Snackbar Clicked', {
          snackbarType: 'promptToJoinOrg'
        })
      }
    }
  }
}

export default mapPromptToJoinOrgToToast
