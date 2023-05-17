import graphql from 'babel-plugin-relay/macro'
import {Snack} from '../../components/Snackbar'
import {mapRequestToJoinOrgToToast_notification$data} from '../../__generated__/mapRequestToJoinOrgToToast_notification.graphql'
import makeNotificationToastKey from './makeNotificationToastKey'

graphql`
  fragment mapRequestToJoinOrgToToast_notification on NotifyRequestToJoinOrg {
    id
    name
    email
    picture
  }
`

const mapRequestToJoinOrgToToast = (
  notification: mapRequestToJoinOrgToToast_notification$data
): Snack => {
  const {id: notificationId, email} = notification

  return {
    autoDismiss: 0,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `${email} is requesting to join your organization`,
    action: {
      label: 'Review',
      callback: () => {
        // TODO: Implement review window and add segment events
      }
    },
    secondaryAction: {
      label: 'Deny',
      callback: () => {
        // Do nothing
      }
    }
  }
}

export default mapRequestToJoinOrgToToast
