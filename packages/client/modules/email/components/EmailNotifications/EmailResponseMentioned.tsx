import graphql from 'babel-plugin-relay/macro'
import {EmailResponseMentioned_notification$key} from 'parabol-client/__generated__/EmailResponseMentioned_notification.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import makeAppURL from '../../../../utils/makeAppURL'
import {notificationSummaryUrlParams} from '../NotificationSummaryEmail'
import EmailNotificationTemplate from './EmailNotificationTemplate'

interface Props {
  notificationRef: EmailResponseMentioned_notification$key
  appOrigin: string
}

const EmailResponseMentioned = (props: Props) => {
  const {notificationRef, appOrigin} = props
  const notification = useFragment(
    graphql`
      fragment EmailResponseMentioned_notification on NotifyResponseMentioned {
        ...EmailNotificationTemplate_notification
        response {
          id
          user {
            rasterPicture
            preferredName
          }
        }
        meeting {
          id
          name
        }
      }
    `,
    notificationRef
  )
  const {meeting, response} = notification
  const {rasterPicture: authorPicture, preferredName: authorName} = response.user

  const {id: meetingId, name: meetingName} = meeting

  // :TRICKY: If the URL we navigate to isn't the full URL w/ phase name (e.g. just
  // '/meet/<meetingId>'), the URL will be overwritten and the 'responseId' will be lost.
  const linkUrl = makeAppURL(appOrigin, `/meet/${meetingId}/responses`, {
    searchParams: {
      ...notificationSummaryUrlParams,
      responseId: response.id
    }
  })

  // :TODO: (jmtaber129): Show mention preview.
  return (
    <EmailNotificationTemplate
      avatar={authorPicture}
      message={`${authorName} mentioned you in their response in ${meetingName}.`}
      notificationRef={notification}
      linkLabel={'See their response'}
      linkUrl={linkUrl}
    />
  )
}

export default EmailResponseMentioned
