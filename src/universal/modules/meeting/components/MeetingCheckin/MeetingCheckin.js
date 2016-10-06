import React, {PropTypes} from 'react';
import IconLink from 'universal/components/IconLink/IconLink';
import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';
import CheckInCards from 'universal/modules/meeting/components/CheckInCards/CheckInCards';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import {CHECKIN, phaseOrder} from 'universal/utils/constants';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import Type from 'universal/components/Type/Type';

const MeetingCheckin = (props) => {
  const {
    gotoItem,
    gotoNext,
    localPhaseItem,
    members,
    team
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
  const isComplete = phaseOrder(meetingPhase) > phaseOrder(CHECKIN);
  return (
    <MeetingMain>
      {/* */}
      <MeetingSection paddingBottom="2rem" paddingTop=".75rem">
        <ProgressBar
          gotoItem={gotoItem}
          isComplete={isComplete}
          facilitatorPhaseItem={facilitatorPhaseItem}
          meetingPhaseItem={meetingPhaseItem}
          localPhaseItem={localPhaseItem}
          membersCount={members.length}
        />
      </MeetingSection>
      <MeetingSection flexToFill paddingBottom="2rem">
        <MeetingSection paddingBottom="2rem">
          <Type align="center" bold family="serif" scale="s6" colorPalette="warm">
            {checkInGreeting}, {currentName}—{checkInQuestion}?
          </Type>
        </MeetingSection>
        {/* */}
        <CheckInCards
          gotoItem={gotoItem}
          localPhaseItem={localPhaseItem}
          members={members}
        />
        <MeetingSection paddingBottom="2rem">
          <IconLink
            colorPalette="cool"
            icon="arrow-circle-right"
            iconPlacement="right"
            label={isLastMember ? 'Move on to Updates' : 'Next teammate (press enter)'}
            scale="large"
            onClick={gotoNext}
          />
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
  team: PropTypes.object
};

export default MeetingCheckin;
