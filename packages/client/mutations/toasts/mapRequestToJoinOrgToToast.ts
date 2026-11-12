import graphql from 'babel-plugin-relay/macro'
import type {mapRequestToJoinOrgToToast_notification$data} from '../../__generated__/mapRequestToJoinOrgToToast_notification.graphql'
import type {Snack} from '../../components/Snackbar'
import type {OnNextNavigateContext} from '../../types/relayMutations'
import makeNotificationToastKey from './makeNotificationToastKey'
import type {UnmaskedNotification} from './mapNotificationToToast'

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
  notification: UnmaskedNotification<mapRequestToJoinOrgToToast_notification$data>,
  {navigate}: OnNextNavigateContext
): Snack => {
  const {id: notificationId, email, domainJoinRequestId} = notification

  return {
    autoDismiss: 0,
    showDismissButton: true,
    key: makeNotificationToastKey(notificationId),
    message: `${email} is requesting to join your organization`,
    action: {
      label: 'Review',
      callback: () => {
        const {pathname, search, hash} = window.location
        navigate(`/organization-join-request/${domainJoinRequestId}`, {
          state: {backgroundLocation: {pathname, search, hash}}
        })
      }
    },
    secondaryAction: {
      label: 'Deny',
      callback: () => {}
    }
  }
}

export default mapRequestToJoinOrgToToast
