// @flow
import * as React from 'react';
import {createFragmentContainer} from 'react-relay';
import type {RouterHistory} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {PRO} from 'universal/utils/constants';
import type {NewMeetingCheckIn_team as Team} from './__generated__/NewMeetingCheckIn.graphql';
import type {MeetingTypeEnum} from 'universal/types/schema.flow';
import StartNewMeetingMutation from 'universal/mutations/StartNewMeetingMutation';
import {css} from 'aphrodite-local-styles/no-important';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingCheckInPrompt from 'universal/modules/meeting/components/MeetingCheckInPrompt/MeetingCheckInPrompt';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls';
import MeetingCheckInMutation from 'universal/mutations/MeetingCheckInMutation';

type Props = {
  atmosphere: Object,
  history: RouterHistory,
  meetingType: MeetingTypeEnum,
  team: Team,
  ...MutationProps
};

const NewMeetingCheckIn = (props: Props) => {
  const {atmosphere, history, onError, onCompleted, meetingType, submitMutation, submitting, team} = props;
  const {meetingSettings: {meetingsOffered, meetingsRemaining}, newMeeting, teamId, teamName, tier} = team;
  const {facilitatorUserId} = newMeeting;
  const onStartMeetingClick = () => {
    submitMutation();
    StartNewMeetingMutation(atmosphere, {teamId, meetingType}, {history}, onError, onCompleted);
  };
  const isPro = tier === PRO;
  const canStartMeeting = isPro || meetingsRemaining > 0;
  const makeCheckinPressFactory = (teamMemberId) => (isCheckedIn) => () => {
    if (submitting) return;
    submitMutation();
    MeetingCheckInMutation(atmosphere, teamMemberId, isCheckedIn, onError, onCompleted);
    gotoNext();
  };

  const {teamMembers} = team;
  const memberIdx = localPhaseItem - 1;
  const currentMember = teamMembers[memberIdx];
  const facilitator = teamM
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
        <div className={css(styles.base)}>
          {!showMoveMeetingControls &&
          <div className={css(styles.hint)}>
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
          </div>
          }
        </div>
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
      teamMembers(sortBy: "checkInOrder") {
        id
        isSelf
        preferredName
      }
    }
  `
);
