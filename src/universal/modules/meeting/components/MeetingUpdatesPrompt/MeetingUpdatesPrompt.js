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
    team,
    updateUserHasTasks
  } = props;
  const {teamMembers} = team;
  const currentTeamMember = teamMembers[localPhaseItem - 1];
  const {isSelf: isMyMeetingSection} = currentTeamMember;
  const isCheckedInFalse = currentTeamMember.isCheckedIn === false;
  const question = updateUserHasTasks ? 'what’s changed with your tasks' : 'what are you working on';
  const headingHere = <span>{currentTeamMember.preferredName}, <i>{question}</i>{'?'}</span>;
  const questionNotHere = updateUserHasTasks
    ? `Any updates with ${currentTeamMember.preferredName}’s tasks`
    : `What is ${currentTeamMember.preferredName} working on`;
  const headingNotHere = <span><i>{questionNotHere}</i>{'?'}</span>;
  const heading = (isCheckedInFalse && !isMyMeetingSection) ? headingNotHere : headingHere;

  return (
    <MeetingPrompt
      avatar={currentTeamMember.picture}
      heading={heading}
      helpText={isMyMeetingSection ?
        <HelpTextMyRound
          updateUserHasTasks={updateUserHasTasks}
        /> :
        <HelpTextForTeam
          agendaInputRef={agendaInputRef}
          currentTeamMember={currentTeamMember}
        />}
    />
  );
};

MeetingUpdatesPrompt.propTypes = {
  agendaInputRef: PropTypes.instanceOf(Element),
  localPhaseItem: PropTypes.number.isRequired,
  team: PropTypes.object.isRequired,
  updateUserHasTasks: PropTypes.bool
};

export default createFragmentContainer(
  MeetingUpdatesPrompt,
  graphql`
    fragment MeetingUpdatesPrompt_team on Team {
      teamMembers(sortBy: "checkInOrder") {
        isSelf
        picture
        preferredName
        isCheckedIn
        ...HelpTextForTeam_currentTeamMember
      }
    }`
);
