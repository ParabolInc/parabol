import React from 'react';
import Oy from 'oy-vey';
import {summaryEmailText} from './SummaryEmail';
import SummaryEmailContainer from 'universal/modules/email/containers/SummaryEmail/SummaryEmailContainer';
import makeDateString from 'universal/utils/makeDateString';


export default (props) => {
  const {meeting: {teamName, endedAt}} = props;
  const dateStr = makeDateString(endedAt, false);
  const subject = `${teamName} ${dateStr} Action Meeting Summary`;
  return {
    subject,
    body: summaryEmailText(props),
    html: Oy.renderTemplate(<SummaryEmailContainer {...props} />, {
      title: subject,
      previewText: subject
    })
  };
};
