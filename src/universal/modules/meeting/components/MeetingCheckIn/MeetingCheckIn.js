import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {tierSupportsUpdateCheckInQuestion} from 'universal/utils/tierSupportsUpdateCheckInQuestion';
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls';
import MeetingCheckInPrompt from 'universal/modules/meeting/components/MeetingCheckInPrompt/MeetingCheckInPrompt';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import ui from 'universal/styles/ui';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

const MeetingCheckin = (props) => {
  const {
    gotoNext,
    isFacilitating,
    localPhaseItem,
    members,
    showMoveMeetingControls,
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
    const options = {
      variables: {
        isCheckedIn,
        teamMemberId
      }
    };
    cashay.mutate('checkIn', options);
    gotoNext();
  };

  const self = members.find((m) => m.isSelf);
  const currentTeamMember = members[localPhaseItem - 1] || {};
  const myTeamMemberId = self && self.id;
  const isMyMeetingSection = myTeamMemberId === currentTeamMember.id;
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
          isFacilitating={isFacilitating}
          teamId={teamId}
        />
        <div className={css(styles.base)}>
          {showMoveMeetingControls ?
            <CheckInControls
              checkInPressFactory={makeCheckinPressFactory(currentMember.id)}
              nextMember={nextMember}
            /> :
            <div className={css(styles.hint)}>
              <MeetingFacilitationHint showEllipsis={!nextMember || !isMyMeetingSection}>
                {nextMember ?
                  <span>
                    {isMyMeetingSection ?
                      <span>{'Share with your teammates!'}</span> :
                      <span>{'Waiting for'} <b>{currentMember.preferredName}</b> {'to share with the team'}</span>
                    }
                  </span> :
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
  gotoNext: PropTypes.func.isRequired,
  isFacilitating: PropTypes.bool,
  localPhaseItem: PropTypes.number,
  members: PropTypes.array,
  onFacilitatorPhase: PropTypes.bool,
  showMoveMeetingControls: PropTypes.bool,
  styles: PropTypes.object,
  team: PropTypes.object
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

export default withStyles(styleThunk)(MeetingCheckin);
