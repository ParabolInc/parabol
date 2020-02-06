import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {TeamArchived_notification} from '../__generated__/TeamArchived_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: TeamArchived_notification
}

const TeamArchived = (props: Props) => {
  const {notification} = props
  const {archivor, team} = notification
  const {name: teamName} = team
  const {preferredName: archivorName, picture: archivorPicture} = archivor
  return (
    <NotificationTemplate
      avatar={archivorPicture}
      message={`${archivorName} archived the team ${teamName}`}
      notification={notification}
    />
  )
}

export default createFragmentContainer(TeamArchived, {
  notification: graphql`
    fragment TeamArchived_notification on NotifyTeamArchived {
      ...NotificationTemplate_notification
      id
      archivor {
        picture
        preferredName
      }
      team {
        name
      }
    }
  `
})
