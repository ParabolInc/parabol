import PropTypes from 'prop-types';
import React from 'react';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import {createFragmentContainer} from 'react-relay';

const MeetingUpdatesPrompt = (props) => {
  const {
    localPhaseItem,
    team: {teamMembers}
  } = props;
  const currentTeamMember = teamMembers[localPhaseItem - 1];
  const heading = <span>{currentTeamMember.preferredName}, <i>what’s changed since our last meeting</i>?</span>;
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
  team: PropTypes.object.isRequired
};

export default createFragmentContainer(
  MeetingUpdatesPrompt,
  graphql`
    fragment MeetingUpdatesPrompt_team on Team {
      teamMembers(sortBy: "checkInOrder") {
        picture
        preferredName
      }
    }`
);
