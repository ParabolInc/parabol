import Oy from 'oy-vey'
import React from 'react'
import makeAppLink from '../../../utils/makeAppLink'
import NotificationSummaryEmail from './NotificationSummaryEmail'

/*
 * In addition to the provided `props`, we assume the presence of the following mailgun
 * `recipientVariables`, unique per-email address:
 *      `name`, `numNotifications`
 */

const textOnlySummary = () => {
  const dashUrl = makeAppLink('me')
  return `Hi there, %recipient.name%!

You’ve received %recipient.numNotifications% new notification(s) in the last day.

View them on Parabol here: ${dashUrl}

If you ever need anything from us, don’t hesitate to reach out at love@parabol.co.

- The Product Team at Parabol
`
}

export default (props) => {
  const subject = `Your team needs you: %recipient.numNotifications% notification(s) 👀`
  const previewText = 'You have unread notifications — see what your team needs'
  return {
    subject,
    body: textOnlySummary(),
    html: Oy.renderTemplate(<NotificationSummaryEmail {...props} />, {
      title: subject,
      previewText
    })
  }
}
