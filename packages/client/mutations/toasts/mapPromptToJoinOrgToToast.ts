import graphql from 'babel-plugin-relay/macro'
import {mapPromptToJoinOrgToToast_notification$data} from '../../__generated__/mapPromptToJoinOrgToToast_notification.graphql'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import RequestToJoinDomainMutation from '../RequestToJoinDomainMutation'
import makeNotificationToastKey from './makeNotificationToastKey'

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
      SendClientSideEvent(atmosphere, 'Snackbar Viewed', {
        snackbarType: 'promptToJoinOrg'
      })
    },
    action: {
      label: 'Request to Join',
      callback: () => {
        RequestToJoinDomainMutation(atmosphere, {})
        SendClientSideEvent(atmosphere, 'Snackbar Clicked', {
          snackbarType: 'promptToJoinOrg'
        })
      }
    }
  }
}

export default mapPromptToJoinOrgToToast
