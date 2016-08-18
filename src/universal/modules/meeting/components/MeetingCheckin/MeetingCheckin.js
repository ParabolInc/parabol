import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

import IconLink from 'universal/components/IconLink/IconLink';
import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';
import CheckinCards from 'universal/modules/meeting/components/CheckinCards/CheckinCards';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
import {CHECKIN, UPDATES, phaseOrder} from 'universal/utils/constants';
import makePushURL from 'universal/modules/meeting/helpers/makePushURL';
import {withRouter} from 'react-router';
import withHotkey from 'react-hotkey-hoc';
import {cashay} from 'cashay';

let s = {};

const MeetingCheckin = (props) => {
  const {
    bindHotkey,
    localPhaseItem,
    isFacilitator,
    facilitatorPhaseItem,
    meetingPhase,
    meetingPhaseItem,
    members,
    params,
    router,
  } = props;
  const {teamId} = params;
  const isLastMember = localPhaseItem === members.length - 1;

  const currentName = members[localPhaseItem] && members[localPhaseItem].preferredName;
  const isComplete = phaseOrder(meetingPhase) > phaseOrder(CHECKIN);
  const phaseItemFactory = (nextPhaseItem) => {
    return () => {
      if (nextPhaseItem < 0) return;
      const nextPhase = nextPhaseItem < members.length ? CHECKIN : UPDATES;
      nextPhaseItem = nextPhase === CHECKIN ? nextPhaseItem : 0;
      if (isFacilitator) {
        const options = {variables: {nextPhase, nextPhaseItem, teamId}};
        cashay.mutate('moveMeeting', options);
      }
      const pushURL = makePushURL(teamId, nextPhase, nextPhaseItem);
      router.push(pushURL);
    };
  };
  const gotoNextItem = phaseItemFactory(localPhaseItem+1);
  const gotoPrevItem = phaseItemFactory(localPhaseItem-1);
  bindHotkey(['enter', 'right'], gotoNextItem);
  bindHotkey('left', gotoPrevItem);
  return (
    <MeetingMain>
      {/* */}
      <MeetingSection paddingBottom="2rem" paddingTop=".75rem">
        <ProgressBar
          clickFactory={phaseItemFactory}
          isComplete={isComplete}
          facilitatorPhaseItem={facilitatorPhaseItem}
          meetingPhaseItem={meetingPhaseItem}
          localPhaseItem={localPhaseItem}
          membersCount={members.length}
        />
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
        <CheckinCards members={members} localPhaseItem={localPhaseItem} teamId={teamId} isFacilitator={isFacilitator}/>
        <MeetingSection paddingBottom="2rem">
          <IconLink
            icon="arrow-circle-right"
            iconPlacement="right"
            label={isLastMember ? 'Move on to updates' : 'Next teammate (press enter)'}
            scale="large"
            theme="warm"
            onClick={gotoNextItem}
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
  bindHotkey: PropTypes.func.isRequired,
  facilitatorPhaseItem: PropTypes.number.isRequired,
  isFacilitator: PropTypes.bool,
  localPhaseItem: PropTypes.string,
  members: PropTypes.array,
  meetingPhase: PropTypes.string.isRequired,
  meetingPhaseItem: PropTypes.number.isRequired,
  params: PropTypes.shape({
    teamId: PropTypes.string.isRequired
  }).isRequired,
  router: PropTypes.object.isRequired,
};

s = StyleSheet.create({
  name: {
    color: theme.palette.warm
  }
});

export default withHotkey(withRouter(look(MeetingCheckin)));
