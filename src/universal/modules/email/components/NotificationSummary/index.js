import React from 'react';
import Oy from 'oy-vey';

import makeDateString from 'universal/utils/makeDateString';
import makeAppLink from 'server/utils/makeAppLink';

import NotificationSummaryEmail from './NotificationSummaryEmail';

/*
 * In addition to the provided `props`, we assume the presence of the following mailgun
 * `recipientVariables`, unique per-email address:
 *      `name`, `numNotifications`
 */

const textOnlySummary = () => {
  const notificationPageUrl = makeAppLink('me/notifications');
  return `Hi there, %recipient.name%!

You have received %recipient.numNotifications% new notification(s) in the last day.

View them on Parabol here: ${notificationPageUrl}

- The Product Team at Parabol

P.S. Help us make our software better!
Email us at love@parabol.co and tell us the good, the bad, and the Ugly!
Or better yet, pick a time on our calendar for a video chat with our core product team: https://calendly.com/parabol/
`;
};

export default (props) => {
  const {date} = props;
  const subject = `Parabol notifications for ${makeDateString(date)}`;
  return {
    subject,
    body: textOnlySummary(props),
    html: Oy.renderTemplate(<NotificationSummaryEmail {...props} />, {
      title: subject,
      previewText: subject
    })
  };
};
