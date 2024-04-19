import graphql from 'babel-plugin-relay/macro'
import {mapRequestToJoinOrgToToast_notification$data} from '../../__generated__/mapRequestToJoinOrgToToast_notification.graphql'
import {Snack} from '../../components/Snackbar'
import {OnNextHistoryContext} from '../../types/relayMutations'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapRequestToJoinOrgToToast_notification on NotifyRequestToJoinOrg {
    id
    name
    email
    picture
    domainJoinRequestId
  }
`

const mapRequestToJoinOrgToToast = (
  notification: mapRequestToJoinOrgToToast_notification$data,
  {atmosphere, history}: OnNextHistoryContext
): Snack => {
  const {id: notificationId, email, domainJoinRequestId} = notification

  return {
    autoDismiss: 0,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `${email} is requesting to join your organization`,
    onShow: () => {
      SendClientSideEvent(atmosphere, 'Snackbar Viewed', {
        snackbarType: 'requestToJoinOrg'
      })
    },
    action: {
      label: 'Review',
      callback: () => {
        history.push(`/organization-join-request/${domainJoinRequestId}`, {
          backgroundLocation: history.location
        })
      }
    },
    secondaryAction: {
      label: 'Deny',
      callback: () => {
        SendClientSideEvent(atmosphere, 'Join Request Reviewed', {
          action: 'deny'
        })
      }
    }
  }
}

export default mapRequestToJoinOrgToToast
