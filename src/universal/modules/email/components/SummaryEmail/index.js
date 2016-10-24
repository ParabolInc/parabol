import React from 'react';
import Oy from 'oy-vey';
import {summaryEmailText} from './SummaryEmail';
import SummaryEmailContainer from 'universal/modules/email/containers/SummaryEmail/SummaryEmailContainer';


const subject = 'Action Meeting Summary from Parabol';

export default (props) => ({
  subject,
  body: summaryEmailText(props),
  html: Oy.renderTemplate(<SummaryEmailContainer {...props} />, {
    title: subject,
    previewText: subject
  })
});
