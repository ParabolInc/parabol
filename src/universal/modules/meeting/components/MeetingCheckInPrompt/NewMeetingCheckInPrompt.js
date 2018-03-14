// @flow
import * as React from 'react';
import {createFragmentContainer} from 'react-relay';
import NewMeetingCheckInGreeting from 'universal/modules/meeting/components/NewMeetingCheckInGreeting';
import NewMeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/NewMeetingPrompt';
import NewCheckInQuestion from 'universal/modules/meeting/components/MeetingCheckInPrompt/NewCheckInQuestion';

import type {NewCheckInQuestion_team as Team} from './__generated__/NewMeetingCheckInPrompt_team.graphql';
import type {NewCheckInQuestion_team as TeamMember} from './__generated__/NewMeetingCheckInPrompt_teamMember.graphql';

type Props = {
  team: Team,
  teamMember: TeamMember
};

const NewMeetingCheckinPrompt = (props: Props) => {
  const {team, teamMember} = props;
  const {newMeeting: {phases}} = team;
  const checkInPhase = phases.find((phase) => phase.checkInGreeting);
  const {checkInGreeting} = checkInPhase;
  const heading = (
    <React.Fragment>
      <NewMeetingCheckInGreeting
        checkInGreeting={checkInGreeting}
        teamMember={teamMember}
      />
      <NewCheckInQuestion team={team} />
    </React.Fragment>
  );
  return (
    <NewMeetingPrompt
      avatarLarge
      heading={heading}
      teamMember={teamMember}
    />
  );
};

export default createFragmentContainer(
  NewMeetingCheckinPrompt,
  graphql`
    fragment NewMeetingCheckInPrompt_team on Team {
      ...NewCheckInQuestion_team
      newMeeting{
        phases {
          ... on CheckInPhase {
            checkInGreeting {
              ...NewMeetingCheckInGreeting_checkInGreeting
            }
          }
        }
      }
    }
    fragment NewMeetingCheckInPrompt_teamMember on TeamMember {
      ...NewMeetingCheckInGreeting_teamMember
      ...NewMeetingPrompt_teamMember
    }`
);
