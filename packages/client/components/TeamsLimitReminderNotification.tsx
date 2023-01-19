import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {TeamsLimitReminderNotification_notification$key} from '~/__generated__/TeamsLimitReminderNotification_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamsLimitReminderNotification_notification$key
}

const TeamsLimitReminderNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const atmosphere = useAtmosphere()
  const notification = useFragment(
    graphql`
      fragment TeamsLimitReminderNotification_notification on NotifyTeamsLimitReminder {
        ...NotificationTemplate_notification
        id
        organization {
          id
          name
          picture
          scheduledLockAt
        }
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {organization} = notification
  const {name: orgName, picture: orgPicture, scheduledLockAt} = organization

  const onActionClick = () => {
    SendClientSegmentEventMutation(atmosphere, 'Notification Clicked', {
      notificationType: 'TEAMS_LIMIT_REMINDER'
    })
    history.push(`/usage`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={`"${orgName}" is over the limit of 2 Free Teams. Your free access will end on ${scheduledLockAt}`}
      action={<NotificationAction label={'See Usage'} onClick={onActionClick} />}
      notification={notification}
    />
  )
}

export default TeamsLimitReminderNotification
