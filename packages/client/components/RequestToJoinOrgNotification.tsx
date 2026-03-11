import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useLocation, useNavigate} from 'react-router-dom'
import type {RequestToJoinOrgNotification_notification$key} from '~/__generated__/RequestToJoinOrgNotification_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: RequestToJoinOrgNotification_notification$key
}

const RequestToJoinOrgNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const navigate = useNavigate()
  const location = useLocation()
  const notification = useFragment(
    graphql`
      fragment RequestToJoinOrgNotification_notification on NotifyRequestToJoinOrg {
        ...NotificationTemplate_notification
        id
        name
        email
        picture
        requestCreatedBy
        domainJoinRequestId
      }
    `,
    notificationRef
  )
  const {name, email, picture, domainJoinRequestId} = notification

  const onActionClick = () => {
    navigate(`/organization-join-request/${domainJoinRequestId}`, {
      replace: true,
      state: {backgroundLocation: location}
    })
  }

  return (
    <>
      <NotificationTemplate
        avatar={picture}
        message={`${name} has requested to join your organization`}
        action={<NotificationAction label={`Review ${email}`} onClick={onActionClick} />}
        notification={notification}
      />
    </>
  )
}

export default RequestToJoinOrgNotification
