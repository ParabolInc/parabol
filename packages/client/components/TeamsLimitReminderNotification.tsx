import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {TeamsLimitReminderNotification_notification$key} from '~/__generated__/TeamsLimitReminderNotification_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {Threshold} from '../types/constEnums'
import makeDateString from '../utils/makeDateString'
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
        scheduledLockAt
        orgId
        orgName
        orgPicture
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {orgId, orgName, orgPicture, scheduledLockAt} = notification

  useEffect(() => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Viewed', {
      upgradeCTALocation: 'teamsLimitReminderNotification',
      orgId
    })
  }, [])

  const onActionClick = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'teamsLimitReminderNotification'
    })
    history.push(`/me/organizations/${orgId}`)
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
