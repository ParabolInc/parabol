import React from 'react';
import Oy from 'oy-vey';
import TeamInvite, {teamInviteText} from './TeamInvite';

const subject = 'You’ve been invited to PARABOL';

export default (props) => ({
  subject,
  body: teamInviteText(props),
  html: Oy.renderTemplate(<TeamInvite {...props} />, {
    title: subject,
    previewText: subject
  })
});
