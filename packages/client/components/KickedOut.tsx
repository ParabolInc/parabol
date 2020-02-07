import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import NotificationTemplate from './NotificationTemplate'
import {KickedOut_notification} from '__generated__/KickedOut_notification.graphql'

interface Props {
  notification: KickedOut_notification
}

const KickedOut = (props: Props) => {
  const {notification} = props
  const {team, evictor} = notification
  const {name: teamName} = team
  const {preferredName: evictorName, picture: evictorPicture} = evictor
  return (
    <NotificationTemplate
      avatar={evictorPicture}
      message={`${evictorName} removed you from the ${teamName} team`}
      notification={notification}
    />
  )
}

export default createFragmentContainer(KickedOut, {
  notification: graphql`
    fragment KickedOut_notification on NotifyKickedOut {
      ...NotificationTemplate_notification
      evictor {
        picture
        preferredName
      }
      team {
        name
      }
    }
  `
})
