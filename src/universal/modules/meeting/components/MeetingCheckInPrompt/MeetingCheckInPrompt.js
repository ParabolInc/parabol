import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import MeetingCheckInGreeting from 'universal/modules/meeting/components/MeetingCheckInGreeting';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import CheckInQuestion from './CheckInQuestion';

const MeetingCheckinPrompt = (props) => {
  const {
    localPhaseItem,
    team
  } = props;
  const {teamMembers} = team;
  const currentMember = teamMembers[localPhaseItem - 1];
  const heading = (
    <div>
      <MeetingCheckInGreeting currentName={currentMember.preferredName} team={team} />
      <CheckInQuestion team={team} />
    </div>
  );
  return (
    <MeetingPrompt
      avatar={currentMember.picture}
      avatarLarge
      heading={heading}
    />
  );
};

MeetingCheckinPrompt.propTypes = {
  localPhaseItem: PropTypes.number.isRequired,
  team: PropTypes.object.isRequired
};

export default createFragmentContainer(
  MeetingCheckinPrompt,
  graphql`
    fragment MeetingCheckInPrompt_team on Team {
      teamMembers(sortBy: "checkInOrder") {
        preferredName
        picture
      }
      ...CheckInQuestion_team
      ...MeetingCheckInGreeting_team
    }`
);
