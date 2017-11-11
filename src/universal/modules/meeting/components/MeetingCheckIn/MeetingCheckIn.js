import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls';
import MeetingCheckInPrompt from 'universal/modules/meeting/components/MeetingCheckInPrompt/MeetingCheckInPrompt';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';
import MeetingCheckInMutation from 'universal/mutations/MeetingCheckInMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {tierSupportsUpdateCheckInQuestion} from 'universal/utils/tierSupportsUpdateCheckInQuestion';

const MeetingCheckin = (props) => {
  const {
    atmosphere,
    gotoNext,
    localPhaseItem,
    members,
    showMoveMeetingControls,
    submitMutation,
    submitting,
    onError,
    onCompleted,
    styles,
    team
  } = props;

  const {
    id: teamId,
    checkInGreeting,
    checkInQuestion,
    facilitatorPhaseItem,
    tier
  } = team;

  if (localPhaseItem > members.length) {
    return (
      <LoadingView>
        {(localPhaseItem > facilitatorPhaseItem) &&
          <div>(Are you sure you have there are that many team members?)</div>
        }
      </LoadingView>
    );
  }

  const makeCheckinPressFactory = (teamMemberId) => (isCheckedIn) => () => {
    if (submitting) return;
    submitMutation();
    MeetingCheckInMutation(atmosphere, teamMemberId, isCheckedIn, onError, onCompleted);
    gotoNext();
  };

  const memberIdx = localPhaseItem - 1;
  const currentMember = members[memberIdx];
  const nextMember = memberIdx < members.length && members[memberIdx + 1];
  const currentAvatar = members[localPhaseItem - 1] && members[localPhaseItem - 1].picture;
  const currentName = members[localPhaseItem - 1] && members[localPhaseItem - 1].preferredName;

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="1rem">
        <MeetingCheckInPrompt
          avatar={currentAvatar}
          checkInQuestion={checkInQuestion}
          canEdit={tierSupportsUpdateCheckInQuestion(tier)}
          currentName={currentName}
          greeting={checkInGreeting}
          teamId={teamId}
        />
        <div className={css(styles.base)}>
          {showMoveMeetingControls ?
            <CheckInControls
              checkInPressFactory={makeCheckinPressFactory(currentMember.id)}
              nextMember={nextMember}
            /> :
            <div className={css(styles.hint)}>
              <MeetingFacilitationHint>
                {nextMember ?
                  <span>{'Waiting for'} <b>{currentMember.preferredName}</b> {'to share with the team'}</span> :
                  <span>{'Waiting for'} <b>{getFacilitatorName(team, members)}</b> {`to advance to ${actionMeeting.updates.name}`}</span>
                }
              </MeetingFacilitationHint>
            </div>
          }
        </div>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingCheckin.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number,
  members: PropTypes.array,
  onFacilitatorPhase: PropTypes.bool,
  showMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object,
  team: PropTypes.object,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

const styleThunk = () => ({
  base: {
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
  },

  hint: {
    marginTop: '2.5rem'
  }
});

export default withAtmosphere(withMutationProps(withStyles(styleThunk)(MeetingCheckin)));
