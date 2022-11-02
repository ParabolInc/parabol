import graphql from 'babel-plugin-relay/macro'
import {EmailTeamArchived_notification$key} from 'parabol-client/__generated__/EmailTeamArchived_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import NotificationTemplate from './EmailNotificationTemplate'

interface Props {
  notificationRef: EmailTeamArchived_notification$key
}

const EmailTeamArchived = (props: Props) => {
  const {notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment EmailTeamArchived_notification on NotifyTeamArchived {
        ...EmailNotificationTemplate_notification
        id
        archivor {
          rasterPicture
          preferredName
        }
        team {
          name
        }
      }
    `,
    notificationRef
  )
  const {archivor, team} = notification
  const {name: teamName} = team
  const {preferredName: archivorName, rasterPicture: archivorPicture} = archivor
  return (
    <NotificationTemplate
      avatar={archivorPicture}
      message={`${archivorName} archived the team ${teamName}`}
      notification={notification}
    />
  )
}

export default EmailTeamArchived
