import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import CheckInControls from 'universal/modules/meeting/components/CheckInControls/CheckInControls';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingFacilitationHint from 'universal/modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';

const MeetingCheckin = (props) => {
  const {
    showCheckInControls,
    gotoNext,
    localPhaseItem,
    members,
    team,
    styles
  } = props;

  const {
    checkInGreeting,
    checkInQuestion,
    facilitatorPhaseItem
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

  const memberIdx = localPhaseItem - 1;
  const currentMember = members[memberIdx];
  const nextMember = memberIdx < members.length && members[memberIdx + 1];
  const currentAvatar = members[localPhaseItem - 1] && members[localPhaseItem - 1].picture;
  const currentName = members[localPhaseItem - 1] && members[localPhaseItem - 1].preferredName;

  const makeGreeting = (greeting) =>
    (<span
      className={css(styles.greeting)}
      title={`${greeting.content} means “hello” in ${greeting.language}`}
    >
      {greeting.content}
    </span>);

  const meetingPromptHeading = () =>
    (<span>
      <span style={{color: appTheme.palette.warm}}>
        {makeGreeting(checkInGreeting)}, {currentName}
      </span>
      <br /><i>{checkInQuestion}</i>?
    </span>);

  return (
    <MeetingMain>
      <MeetingSection flexToFill paddingBottom="1rem">
        <MeetingPrompt
          avatar={currentAvatar}
          avatarLarge
          heading={meetingPromptHeading()}
        />
        <div className={css(styles.base)}>
          {showCheckInControls ?
            <CheckInControls
              checkInPressFactory={makeCheckinPressFactory(currentMember.id)}
              nextMember={nextMember}
            /> :
            <div className={css(styles.hint)}>
              <MeetingFacilitationHint>
                {nextMember ?
                  <span>{'Waiting for'} <b>{currentMember.preferredName}</b> {'to share with the team'}</span> :
                  <span>{'Waiting for'} <b>{getFacilitatorName(team, members)}</b> {'to advance to Updates'}</span>
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
  showCheckInControls: PropTypes.bool,
  localPhaseItem: PropTypes.number,
  members: PropTypes.array,
  onFacilitatorPhase: PropTypes.bool,
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

  greeting: {
    borderBottom: '1px dashed currentColor',
    color: 'inherit',
    cursor: 'help'
  },

  hint: {
    marginTop: '2.5rem'
  }
});

export default withStyles(styleThunk)(MeetingCheckin);
