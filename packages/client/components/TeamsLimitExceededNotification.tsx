import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import defaultOrgAvatar from '~/styles/theme/images/avatar-organization.svg'
import {TeamsLimitExceededNotification_notification} from '~/__generated__/TeamsLimitExceededNotification_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'
interface Props {
  notification: TeamsLimitExceededNotification_notification
}

const TeamsLimitExceededNotification = (props: Props) => {
  const {notification} = props
  const {history} = useRouter()
  const {organization} = notification
  const {name: orgName, picture: orgPicture} = organization

  const onActionClick = () => {
    history.push(`/usage`)
  }

  return (
    <NotificationTemplate
      avatar={orgPicture || defaultOrgAvatar}
      message={`Your account is on a roll! Check out "${orgName}" usage`}
      action={<NotificationAction label={'See Usage'} onClick={onActionClick} />}
      notification={notification}
    />
  )
}

export default createFragmentContainer(TeamsLimitExceededNotification, {
  notification: graphql`
    fragment TeamsLimitExceededNotification_notification on NotifyTeamsLimitExceeded {
      ...NotificationTemplate_notification
      id
      organization {
        id
        name
        picture
      }
    }
  `
})
