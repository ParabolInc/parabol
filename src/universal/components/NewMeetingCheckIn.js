// @flow
import * as React from 'react';
import {createFragmentContainer} from 'react-relay';
import type {Match} from 'react-router-dom';
import {Redirect, withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import type {NewMeetingCheckIn_team as Team} from './__generated__/NewMeetingCheckIn.graphql';
import type {MeetingTypeEnum} from 'universal/types/schema.flow';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingCheckInPrompt from 'universal/modules/meeting/components/MeetingCheckInPrompt/MeetingCheckInPrompt';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls';
import MeetingCheckInMutation from 'universal/mutations/MeetingCheckInMutation';
import findStageById from 'universal/utils/meetings/findStageById';
import {meetingTypeToSlug, phaseTypeToSlug} from 'universal/utils/meetings/lookups';
import ui from 'universal/styles/ui';
import styled from 'react-emotion';
import fromStageIdToUrl from 'universal/utils/meetings/fromStageIdToUrl';

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
  const {atmosphere, onError, onCompleted, match: {params: {localPhaseItem}}, meetingType, submitMutation, submitting, team} = props;
  const {newMeeting, teamId} = team;
  const {facilitatorStageId, facilitatorUserId, phases} = newMeeting;
  const makeCheckinPressFactory = (teamMemberId) => (isCheckedIn) => () => {
    if (submitting) return;
    submitMutation();
    MeetingCheckInMutation(atmosphere, teamMemberId, isCheckedIn, onError, onCompleted);
    gotoNext();
  };

  const {teamMembers} = team;
  const memberIdx = localPhaseItem - 1;
  const currentMember = teamMembers[memberIdx];
  if (!currentMember) {
    const to = fromStageIdToUrl(phases, facilitatorStageId);
    return <Redirect to={to} />;
  }
  const facilitator = teamMembers.find((teamMember) => teamMember.userId === facilitatorUserId);
  const {preferredName: facilitatorName} = facilitator;
  const {isSelf: isMyMeetingSection} = currentMember;
  const nextMember = teamMembers[memberIdx + 1];
  const {viewerId} = atmosphere;
  const isFacilitating = facilitatorUserId === viewerId;
  return (
    <React.Fragment>
      <MeetingSection flexToFill paddingBottom="1rem">
        <MeetingCheckInPrompt
          isFacilitating={isFacilitating}
          localPhaseItem={localPhaseItem}
          team={team}
        />
        <CheckIn>
          {!isFacilitating &&
          <Hint>
            <MeetingFacilitationHint showEllipsis={!nextMember || !isMyMeetingSection}>
              {nextMember ?
                <span>
                    {isMyMeetingSection ?
                      <span>{'Share with your teammates!'}</span> :
                      <span>{'Waiting for'} <b>{currentMember.preferredName}</b> {'to share with the team'}</span>
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
          checkInPressFactory={makeCheckinPressFactory(currentMember.id)}
          currentMemberName={currentMember.preferredName}
          nextMemberName={nextMember && nextMember.preferredName}
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
      teamId: id
      teamMembers(sortBy: "checkInOrder") {
        id
        isSelf
        preferredName
        userId
      }
    }
  `
);
