import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {KickedOut_notification$key} from '~/__generated__/KickedOut_notification.graphql'
import NotificationTemplate from './NotificationTemplate'

interface Props {
  notification: KickedOut_notification$key
}

const KickedOut = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
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
    `,
    notificationRef
  )
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

export default KickedOut
