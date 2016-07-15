import React from 'react';
import Oy from 'oy-vey';
import MeetingInvite, {meetingInviteText} from './MeetingInvite';

const subject = 'You’ve been invited to Action by Parabol';

export default (props) => ({
  subject,
  body: meetingInviteText(props),
  html: Oy.renderTemplate(<MeetingInvite {...props} />, {
    title: subject,
    previewText: subject
  })
});
