import graphql from 'babel-plugin-relay/macro'
import {EmailKickedOut_notification$key} from 'parabol-client/__generated__/EmailKickedOut_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import EmailNotificationTemplate from './EmailNotificationTemplate'

interface Props {
  notificationRef: EmailKickedOut_notification$key
}

const EmailKickedOut = (props: Props) => {
  const {notificationRef} = props

  const notification = useFragment(
    graphql`
      fragment EmailKickedOut_notification on NotifyKickedOut {
        ...EmailNotificationTemplate_notification
        evictor {
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

  const {team, evictor} = notification
  const {name: teamName} = team
  const {preferredName: evictorName, rasterPicture: evictorPicture} = evictor
  return (
    <EmailNotificationTemplate
      avatar={evictorPicture}
      message={`${evictorName} removed you from the ${teamName} team`}
      notificationRef={notification}
    />
  )
}

export default EmailKickedOut
