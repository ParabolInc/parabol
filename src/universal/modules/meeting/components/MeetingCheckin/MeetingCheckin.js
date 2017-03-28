import React, {PropTypes} from 'react';
import IconLink from 'universal/components/IconLink/IconLink';
import ProgressBarContainer from 'universal/modules/meeting/containers/ProgressBarContainer/ProgressBarContainer';
import CheckinCards from 'universal/modules/meeting/components/CheckinCards/CheckinCards';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import {CHECKIN} from 'universal/utils/constants';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import appTheme from 'universal/styles/theme/appTheme';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

const MeetingCheckin = (props) => {
  const {
    gotoItem,
    gotoNext,
    localPhaseItem,
    members,
    onFacilitatorPhase,
    team,
    hideMoveMeetingControls
  } = props;

  const {
    checkInGreeting,
    checkInQuestion,
    facilitatorPhaseItem,
    meetingPhase,
    meetingPhaseItem
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

  // 1-indexed
  const isLastMember = localPhaseItem === members.length;
  const currentName = members[localPhaseItem - 1] && members[localPhaseItem - 1].preferredName;
  const isComplete = actionMeeting[meetingPhase].index > actionMeeting[CHECKIN].index;
  return (
    <MeetingMain>
      {/* */}
      <MeetingSection>
        <ProgressBarContainer
          gotoItem={gotoItem}
          isComplete={isComplete}
          facilitatorPhaseItem={facilitatorPhaseItem}
          localPhaseItem={localPhaseItem}
          meetingPhaseItem={meetingPhaseItem}
          membersCount={members.length}
          onFacilitatorPhase={onFacilitatorPhase}
        />
      </MeetingSection>
      <MeetingSection flexToFill paddingBottom="1rem">
        <MeetingSection paddingBottom=".5rem">
          <MeetingPrompt
            heading={<span><span style={{color: appTheme.palette.warm}}>{checkInGreeting}, {currentName}</span>—{checkInQuestion}?</span>}
          />
        </MeetingSection>
        {/* */}
        <CheckinCards
          gotoItem={gotoItem}
          gotoNext={gotoNext}
          localPhaseItem={localPhaseItem}
          members={members}
        />
        <MeetingSection paddingTop=".75rem">
          {!hideMoveMeetingControls &&
            <IconLink
              colorPalette="cool"
              icon="arrow-circle-right"
              iconPlacement="right"
              label={isLastMember ? 'Move on to Updates' : 'Next teammate (press enter)'}
              scale="large"
              onClick={gotoNext}
            />
          }
        </MeetingSection>
        {/* */}
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

MeetingCheckin.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number,
  members: PropTypes.array,
  onFacilitatorPhase: PropTypes.bool,
  team: PropTypes.object,
  hideMoveMeetingControls: PropTypes.bool
};

export default MeetingCheckin;
