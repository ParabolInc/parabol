import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {TeamsLimitExceededNotification_notification$key} from '~/__generated__/TeamsLimitExceededNotification_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamsLimitExceededNotification_notification$key
}

const TeamsLimitExceededNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment TeamsLimitExceededNotification_notification on NotifyTeamsLimitExceeded {
        ...NotificationTemplate_notification
        id
        orgName
        orgPicture
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {orgName, orgPicture} = notification

  const onActionClick = () => {
    history.push(`/usage`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={`Your account is on a roll! Check out "${orgName}"'s usage`}
      action={<NotificationAction label={'See Usage'} onClick={onActionClick} />}
      notification={notification}
    />
  )
}

export default TeamsLimitExceededNotification
