import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {mapRequestToJoinOrgToToast_notification$data} from '../../__generated__/mapRequestToJoinOrgToToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'
import {OnNextHistoryContext} from '../../types/relayMutations'
import SendClientSegmentEventMutation from '../SendClientSegmentEventMutation'

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
      SendClientSegmentEventMutation(atmosphere, 'Snackbar Viewed', {
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
        SendClientSegmentEventMutation(atmosphere, 'Join Request Reviewed', {
          action: 'deny'
        })
      }
    }
  }
}

export default mapRequestToJoinOrgToToast
