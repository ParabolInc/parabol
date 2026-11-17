import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TeamsLimitReminderNotification_notification$key} from '~/__generated__/TeamsLimitReminderNotification_notification.graphql'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {Threshold} from '../types/constEnums'
import makeDateString from '../utils/makeDateString'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamsLimitReminderNotification_notification$key
}

const TeamsLimitReminderNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment TeamsLimitReminderNotification_notification on NotifyTeamsLimitReminder {
        ...NotificationTemplate_notification
        id
        scheduledLockAt
        orgId
        orgName
        orgPicture
      }
    `,
    notificationRef
  )
  const navigate = useNavigate()
  const {orgId, orgName, orgPicture, scheduledLockAt} = notification

  const onActionClick = () => {
    navigate(`/me/organizations/${orgId}`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={`"${orgName}" is over the limit of ${
        Threshold.MAX_STARTER_TIER_TEAMS
      } free teams. Your free access will end on ${makeDateString(scheduledLockAt)}`}
      action={<NotificationAction label={'Upgrade'} onClick={onActionClick} />}
      notification={notification}
    />
  )
}

export default TeamsLimitReminderNotification
