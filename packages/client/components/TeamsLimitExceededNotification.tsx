import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {TeamsLimitExceededNotification_notification$key} from '~/__generated__/TeamsLimitExceededNotification_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamsLimitExceededNotification_notification$key
}

const TeamsLimitExceededNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const atmosphere = useAtmosphere()
  const notification = useFragment(
    graphql`
      fragment TeamsLimitExceededNotification_notification on NotifyTeamsLimitExceeded {
        ...NotificationTemplate_notification
        id
        organization {
          id
          name
          picture
        }
      }
    `,
    notificationRef
  )
  const {history} = useRouter()
  const {organization} = notification
  const {name: orgName, picture: orgPicture} = organization

  const onActionClick = () => {
    SendClientSegmentEventMutation(atmosphere, 'Notification Clicked', {
      notificationType: 'TEAMS_LIMIT_EXCEEDED'
    })
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
