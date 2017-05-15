import PropTypes from 'prop-types';
import React from 'react';
import SummaryEmail from 'universal/modules/email/components/SummaryEmail/SummaryEmail';
import makeAppLink from 'server/utils/makeAppLink';

const SummaryEmailContainer = (props) => {
  const {meeting} = props;
  const {id, teamId} = meeting;
  const referrerUrl = makeAppLink(`summary/${id}`);
  const meetingUrl = makeAppLink(`meeting/${teamId}`);
  const teamDashUrl = makeAppLink(`team/${teamId}`);
  return (
    <SummaryEmail
      meeting={meeting}
      meetingUrl={meetingUrl}
      referrer="email"
      referrerUrl={referrerUrl}
      teamDashUrl={teamDashUrl}

    />
  );
};

SummaryEmailContainer.propTypes = {
  meeting: PropTypes.object
};

export default SummaryEmailContainer;
