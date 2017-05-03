import Bundle from "universal/components/Bundle/Bundle";
import React from "react";
import resolveDefault from "universal/utils/resolveDefault";
import PropTypes from 'prop-types';

const MeetingSummaryBundle = ({match}) => {
  const promises = {
    component: import('./MeetingSummaryContainer').then(resolveDefault),
  };
  return <Bundle match={match} promises={promises} />;
};

MeetingSummaryBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default MeetingSummaryBundle;
