// @flow
import * as React from 'react';
import {createFragmentContainer} from 'react-relay';
import type {Match} from 'react-router-dom';
import {Redirect, withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import type {NewMeetingCheckIn_team as Team} from './__generated__/NewMeetingCheckIn_team.graphql';
import type {MeetingTypeEnum} from 'universal/types/schema.flow';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls';
import MeetingCheckInMutation from 'universal/mutations/MeetingCheckInMutation';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';
import NewMeetingCheckInPrompt from 'universal/modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt';
import findStageAfterId from 'universal/utils/meetings/findStageAfterId';
import {CHECKIN} from 'universal/utils/constants';
import getMeetingPathParams from 'universal/utils/meetings/getMeetingPathParams';

const CheckIn = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '1rem 0',
  width: '100%',

  [ui.breakpoint.wide]: {
    padding: '2rem 0'
  },

  [ui.breakpoint.wider]: {
    padding: '3rem 0'
  },

  [ui.breakpoint.widest]: {
    padding: '4rem 0'
  }
});

const Hint = styled('div')({
  marginTop: '2.5rem'
});


type Props = {
  atmosphere: Object,
  match: Match,
  meetingType: MeetingTypeEnum,
  team: Team,
  ...MutationProps
};

const NewMeetingCheckIn = (props: Props) => {
  const {atmosphere, gotoNext, onError, onCompleted, submitMutation, submitting, team} = props;
  const {newMeeting} = team;
  if (!newMeeting) {
    const {teamId, meetingSlug} = getMeetingPathParams();
    if (!teamId || !meetingSlug) return null;
    return <Redirect to={`/${meetingSlug}/${teamId}`} />;
  }
  const {facilitator: {facilitatorName, facilitatorUserId}, localStage: {localStageId, teamMember}, phases} = newMeeting;
  const makeCheckinPressFactory = (teamMemberId) => (isCheckedIn) => () => {
    if (submitting) return;
    submitMutation();
    MeetingCheckInMutation(atmosphere, teamMemberId, isCheckedIn, onError, onCompleted);
    gotoNext(localStageId);
  };
  const {isSelf: isMyMeetingSection} = teamMember;
  const nextStageRes = findStageAfterId(phases, localStageId);
  // in case the checkin in the last phase of the meeting
  if (!nextStageRes) return null;
  const {stage: nextStage, phase: nextPhase} = nextStageRes;
  const lastCheckInStage = nextPhase.phaseType !== CHECKIN;
  const nextMemberName = nextStage && nextStage.teamMember && nextStage.teamMember.preferredName || '';
  const {viewerId} = atmosphere;
  const isFacilitating = facilitatorUserId === viewerId;
  return (
    <React.Fragment>
      <MeetingSection flexToFill paddingBottom="1rem">
        <NewMeetingCheckInPrompt
          team={team}
          teamMember={teamMember}
        />
        <CheckIn>
          {!isFacilitating &&
          <Hint>
            <MeetingFacilitationHint showEllipsis={lastCheckInStage || !isMyMeetingSection}>
              {!lastCheckInStage ?
                <span>
                  {isMyMeetingSection ?
                    <span>{'Share with your teammates!'}</span> :
                    <span>{'Waiting for'} <b>{teamMember.preferredName}</b> {'to share with the team'}</span>
                  }
                </span> :
                <span>{'Waiting for'} <b>{facilitatorName}</b> {`to advance to ${actionMeeting.updates.name}`}</span>
              }
            </MeetingFacilitationHint>
          </Hint>
          }
        </CheckIn>
      </MeetingSection>
      {isFacilitating &&
      <MeetingControlBar>
        <CheckInControls
          checkInPressFactory={makeCheckinPressFactory(teamMember.id)}
          currentMemberName={teamMember.preferredName}
          nextMemberName={nextMemberName}
        />
      </MeetingControlBar>
      }
    </React.Fragment>
  );
};

export default createFragmentContainer(
  withRouter(withAtmosphere(withMutationProps(NewMeetingCheckIn))),
  graphql`
    fragment NewMeetingCheckIn_team on Team {
      ...NewMeetingCheckInPrompt_team
      newMeeting {
        facilitatorStageId
        facilitator {
          facilitatorUserId: id
          facilitatorName: preferredName
        }
        localStage {
          localStageId: id
          ... on CheckInStage {
            teamMember {
              id
              isSelf
              preferredName
              userId
              ...NewMeetingCheckInPrompt_teamMember
            }
          }
        }
        phases {
          phaseType
          stages {
            id
            ... on CheckInStage {
              teamMember {
                id
                isSelf
                preferredName
                userId
              }
            }
          }
        }
      }
      teamId: id
    }
  `
);
