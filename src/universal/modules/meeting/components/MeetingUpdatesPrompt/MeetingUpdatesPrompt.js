import PropTypes from 'prop-types';
import React from 'react';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import {createFragmentContainer} from 'react-relay';
import {css} from 'aphrodite-local-styles/no-important';
import withStyles from 'universal/styles/withStyles';
import ui from 'universal/styles/ui';

const MeetingUpdatesPrompt = (props) => {
  const {
    localPhaseItem,
    team: {teamMembers},
    meetingNumber,
    // members,
    styles
  } = props;
  const currentTeamMember = teamMembers[localPhaseItem - 1];
  // const heading = <span>{currentTeamMember.preferredName}, <i>what’s changed since our last meeting</i>?</span>;
  const self = teamMembers.find((m) => m.isSelf);
  const myTeamMemberId = self && self.id;
  // const currentTeamMember = teamMembers[localPhaseItem - 1];
  const isMyMeetingSection = myTeamMemberId === currentTeamMember.id;
  const isFirstMeeting = meetingNumber === 1;
  const handleAgendaControl = () => console.log('Focus on agenda input');
  const question = isFirstMeeting ? 'what are you working on for this team' : 'what’s changed since our last meeting';
  const heading = <span>{currentTeamMember.preferredName}, <i>{question}</i>{'?'}</span>;
  const helpTextMyRound = (
    <span className={css(styles.helpText)}>{'(It’s your turn to share. Add cards to track your current work.)'}</span>
  );
  const helpTextForTeam = (
    <span className={css(styles.helpText)}>
      {`(${currentTeamMember.preferredName} is sharing. `}
      <span onClick={handleAgendaControl} className={css(styles.agendaControl)}>{'Add agenda items'}</span>
      {' to discuss new tasks.)'}
    </span>
  );
  const helpTextBlock = isMyMeetingSection ? helpTextMyRound : helpTextForTeam;
  return (
    <MeetingPrompt
      avatar={currentTeamMember.picture}
      heading={heading}
      helpText={helpTextBlock}
    />
  );
};

MeetingUpdatesPrompt.propTypes = {
  localPhaseItem: PropTypes.number.isRequired,
  team: PropTypes.object.isRequired,
  meetingNumber: PropTypes.number.isRequired,
  // members: PropTypes.array.isRequired,
  styles: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withStyles(styleThunk)(MeetingUpdatesPrompt),
  graphql`
    fragment MeetingUpdatesPrompt_team on Team {
      teamMembers(sortBy: "checkInOrder") {
        picture
        preferredName
      }
    }`
);

const styleThunk = () => ({
  helpText: {
    fontWeight: 700,
    userSelect: 'none'
  },

  agendaControl: {
    color: ui.palette.warm,
    cursor: 'pointer',
    ':hover': {
      opacity: .5
    }
  }
});
