import React from 'react';
import Oy from 'oy-vey';
import SummaryEmail, {summaryEmailText} from './SummaryEmail';

const subject = 'You’ve been invited to Action by Parabol';

export default (props) => ({
  subject,
  body: summaryEmailText(props),
  html: Oy.renderTemplate(<SummaryEmail {...props} />, {
    title: subject,
    previewText: subject
  })
});
