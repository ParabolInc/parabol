import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import HelpTextForTeam from 'universal/modules/meeting/components/HelpTextForTeam';
import HelpTextMyRound from 'universal/modules/meeting/components/HelpTextMyRound';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';

const MeetingUpdatesPrompt = (props) => {
  const {
    agendaInputRef,
    localPhaseItem,
    team
  } = props;
  const {meetingNumber, teamMembers} = team;
  const currentTeamMember = teamMembers[localPhaseItem - 1];
  const {isSelf: isMyMeetingSection} = currentTeamMember;
  const isFirstMeeting = meetingNumber === 1;
  const question = isFirstMeeting ? 'what are you working on for this team' : 'what’s changed since our last meeting';
  const heading = <span>{currentTeamMember.preferredName}, <i>{question}</i>{'?'}</span>;

  return (
    <MeetingPrompt
      avatar={currentTeamMember.picture}
      heading={heading}
      helpText={isMyMeetingSection ?
        <HelpTextMyRound /> :
        <HelpTextForTeam
          agendaInputRef={agendaInputRef}
          currentTeamMember={currentTeamMember}
        />}
    />
  );
};

MeetingUpdatesPrompt.propTypes = {
  agendaInputRef: PropTypes.element.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  team: PropTypes.object.isRequired,
  styles: PropTypes.object.isRequired
};

export default createFragmentContainer(
  MeetingUpdatesPrompt,
  graphql`
    fragment MeetingUpdatesPrompt_team on Team {
      meetingNumber
      teamMembers(sortBy: "checkInOrder") {
        isSelf
        picture
        preferredName
        ...HelpTextForTeam_currentTeamMember
      }
    }`
);
