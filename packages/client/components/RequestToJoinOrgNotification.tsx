import graphql from 'babel-plugin-relay/macro'
import {useLocation} from 'react-router'
import React from 'react'
import {useFragment} from 'react-relay'
import {RequestToJoinOrgNotification_notification$key} from '~/__generated__/RequestToJoinOrgNotification_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'
import useRouter from '../hooks/useRouter'

interface Props {
  notification: RequestToJoinOrgNotification_notification$key
}

const RequestToJoinOrgNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const {history} = useRouter()
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
    history.replace(`/organization-join-request/${domainJoinRequestId}`, {
      backgroundLocation: location
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
