import PropTypes from 'prop-types';
import React from 'react';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';

const MeetingUpdatesPrompt = (props) => {
  const {
    localPhaseItem,
    members
  } = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const heading = <span>{currentTeamMember.preferredName}, <i>what’s changed since last week</i>?</span>;
  return (
    <MeetingPrompt
      avatar={currentTeamMember.picture}
      heading={heading}
      helpText={<span><b>Quick updates only, please.</b></span>}
    />
  );
};

MeetingUpdatesPrompt.propTypes = {
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired
};

export default MeetingUpdatesPrompt;
