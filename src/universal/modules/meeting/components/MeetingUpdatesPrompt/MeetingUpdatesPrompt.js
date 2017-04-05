import React, {PropTypes} from 'react';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import makeUsername from 'universal/utils/makeUsername';

const MeetingUpdatesPrompt = (props) => {
  const {
    localPhaseItem,
    members
  } = props;
  const currentTeamMember = members[localPhaseItem - 1];
  const username = makeUsername(currentTeamMember.preferredName);
  const heading = <span>{username}, <i>what’s changed since last week</i>?</span>;
  return (
    <MeetingPrompt
      avatar={currentTeamMember.picture}
      heading={heading}
      helpText={<span><b>Keep ‘em quick</b>—discussion time is next!</span>}
    />
  );
};

MeetingUpdatesPrompt.propTypes = {
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired
};

export default MeetingUpdatesPrompt;
