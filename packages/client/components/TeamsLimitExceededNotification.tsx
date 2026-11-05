import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TeamsLimitExceededNotification_notification$key} from '~/__generated__/TeamsLimitExceededNotification_notification.graphql'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {Threshold} from '../types/constEnums'
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
        orgId
        orgName
        orgPicture
      }
    `,
    notificationRef
  )
  const navigate = useNavigate()
  const {orgId, orgName, orgPicture} = notification

  const onActionClick = () => {
    navigate(`/me/organizations/${orgId}`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={`"${orgName}" is over the limit of ${Threshold.MAX_STARTER_TIER_TEAMS} free teams.`}
      action={<NotificationAction label={'Upgrade'} onClick={onActionClick} />}
      notification={notification}
    />
  )
}

export default TeamsLimitExceededNotification
