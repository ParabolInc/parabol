import graphql from 'babel-plugin-relay/macro'
import {EmailMeetingStageTimeLimitEnd_notification$key} from 'parabol-client/__generated__/EmailMeetingStageTimeLimitEnd_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'

interface Props {
  notificationRef: EmailMeetingStageTimeLimitEnd_notification$key
  appOrigin: string
}

const EmailMeetingStageTimeLimitEnd = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailMeetingStageTimeLimitEnd_notification on NotificationMeetingStageTimeLimitEnd {
        ...EmailNotificationTemplate_notification
        id
        meeting {
          id
          name
          team {
            name
          }
        }
      }
    `,
    notificationRef
  )
  const {meeting} = notification
  const {id: meetingId, name: meetingName, team} = meeting
  const {name: teamName} = team

  const linkUrl = makeAppURL(appOrigin, `/meet/${meetingId}`, {
    searchParams: notificationSummaryUrlParams
  })

  return (
    <EmailNotificationTemplate
      message={`Your meeting ${meetingName} with ${teamName} is ready to move forward`}
      notificationRef={notification}
      linkLabel={'Go to meeting'}
      linkUrl={linkUrl}
    />
  )
}

export default EmailMeetingStageTimeLimitEnd
