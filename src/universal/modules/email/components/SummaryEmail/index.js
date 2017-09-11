import React from 'react';
import Oy from 'oy-vey';
import {summaryEmailText} from './SummaryEmail';
import SummaryEmailContainer from 'universal/modules/email/containers/SummaryEmail/SummaryEmailContainer';
import makeDateString from 'universal/utils/makeDateString';
import {MEETING_NAME} from 'universal/utils/constants';

export default (props) => {
  const {meeting: {teamName, endedAt}} = props;
  const dateStr = makeDateString(endedAt, false);
  const subject = `${teamName} ${dateStr} ${MEETING_NAME} Summary`;
  return {
    subject,
    body: summaryEmailText(props),
    html: Oy.renderTemplate(<SummaryEmailContainer {...props} />, {
      title: subject,
      previewText: subject
    })
  };
};
