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
import {CHECKIN, UPDATES, phaseOrder} from 'universal/utils/constants';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {withRouter} from 'react-router';


let s = {};


const MeetingCheckinLayout = (props) => {
  const {
    localPhaseItem,
    dispatch,
    facilitatorPhase,
    facilitatorPhaseItem,
    meetingPhase,
    meetingPhaseItem,
    members,
    params,
    router,
    teamName,
  } = props;
  const {teamId} = params;
  const onCheckinNextTeammateClick = () => {
    let pushURL;
    if (localPhaseItem < members.length - 1) {
      pushURL = makePushURL(teamId, CHECKIN, localPhaseItem + 1);
    } else {
      pushURL = makePushURL(teamId, UPDATES, 0);
    }
    router.push(pushURL);
  };
  const progressBarCompletion = 100 * phaseOrder(meetingPhase) > phaseOrder(CHECKIN) ? 1 : meetingPhaseItem / members.length;
  const currentName = members[localPhaseItem] && members[localPhaseItem].preferredName;
  return (
    <MeetingMain>
      {/* */}
      <MeetingSection paddingBottom="2rem" paddingTop="2rem">
        <div className={s.avatars}>
          <AvatarGroup avatars={members} label="Team:"/>
          <div className={s.progress}>
            <ProgressBar completed={progressBarCompletion}/>
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
        <CheckinCards members={members} localPhaseItem={localPhaseItem} teamId={teamId}/>
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
  teamId: PropTypes.string,
  localPhaseItem: PropTypes.number,
  meetingPhase: PropTypes.string,
  meetingPhaseItem: PropTypes.string
};

export default withRouter(look(MeetingCheckinLayout));
