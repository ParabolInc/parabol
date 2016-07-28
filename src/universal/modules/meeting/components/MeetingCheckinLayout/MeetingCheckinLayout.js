import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import AvatarGroup from 'universal/components/AvatarGroup/AvatarGroup';
import IconLink from 'universal/components/IconLink/IconLink';
import ProgressBar from 'universal/components/ProgressBar/ProgressBar';
import CheckinCards from 'universal/modules/meeting/components/CheckinCards/CheckinCards';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
import {phases} from 'universal/utils/constants';

const {CHECKIN} = phases;
// TODO: Reorganize under new folder: /meeting/components/MeetingLayouts (TA)

let s = {};

const onCheckinNextTeammateClick = () => {};
const MeetingCheckinLayout = (props) => {
  const {members, localPhaseItem, meetingPhase, meetingPhaseItem} = props;
  const progressBarCompletion = 100 * meetingPhase === CHECKIN ? meetingPhaseItem / members.length : 1;
  const currentName = members[localPhaseItem] && members[localPhaseItem].preferredName;
  return (
    <MeetingMain>
      {/* */}
      <MeetingSection paddingBottom="2rem" paddingTop="2rem">
        <div className={s.avatars}>
          <AvatarGroup avatars={members} label="Team:" />
          <div className={s.progress}>
            <ProgressBar completed={progressBarCompletion} />
          </div>
        </div>
      </MeetingSection>
      {/* */}
      {/* */}
      <MeetingSection flexToFill paddingBottom="2rem">
        {/* */}
        <MeetingSection paddingBottom="2rem">
          <MeetingSectionHeading>
            Hola <span className={s.name}>{currentName}</span>, ¿por qué no puedes estar completamente enfocado hoy?
          </MeetingSectionHeading>
        </MeetingSection>
        {/* */}
        <CheckinCards cards={members} localPhaseItem={localPhaseItem}/>
        <MeetingSection paddingBottom="2rem">
          <IconLink
            icon="arrow-circle-right"
            iconPlacement="right"
            label="Next teammate (press enter)"
            scale="large"
            theme="warm"
            onClick={onCheckinNextTeammateClick}
          />
        </MeetingSection>
        {/* */}
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

s = StyleSheet.create({
  name: {
    color: theme.palette.warm
  },

  avatars: {
    // Define
  },

  progress: {
    paddingLeft: '5.25rem',
    paddingRight: '.75rem',
    paddingTop: '1rem'
  }
});

MeetingCheckinLayout.propTypes = {
  members: PropTypes.array,
  localPhaseItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  meetingPhase: PropTypes.string,
  meetingPhaseItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default look(MeetingCheckinLayout);
