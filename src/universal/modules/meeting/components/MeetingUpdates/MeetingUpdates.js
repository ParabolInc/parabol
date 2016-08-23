import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

import Avatar from 'universal/components/Avatar/Avatar';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import MeetingSectionHeading from 'universal/modules/meeting/components/MeetingSectionHeading/MeetingSectionHeading';
// eslint-disable-next-line max-len
import MeetingSectionSubheading from 'universal/modules/meeting/components/MeetingSectionSubheading/MeetingSectionSubheading';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import {UPDATES, phaseOrder, MEETING} from 'universal/utils/constants';
import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';
import {withRouter} from 'react-router';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';

let s = {};

const MeetingUpdates = (props) => {
  const {
    localPhaseItem,
    isFacilitating,
    members,
    projects,
    router,
    team
  } = props;
  const {id: teamId, meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
  const currentTeamMember = members[localPhaseItem - 1];
  const phaseItemFactory = makePhaseItemFactory(isFacilitating, members.length, router, teamId, UPDATES);
  const self = members.find(m => m.isSelf);
  const isComplete = phaseOrder(meetingPhase) > phaseOrder(UPDATES);
  const gotoNextItem = phaseItemFactory(localPhaseItem + 1);
  return (
    <MeetingMain>
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
      <MeetingSection flexToFill paddingBottom="2rem">
        {/* */}
        <MeetingSection paddingBottom="2rem">
          <MeetingSectionHeading>
            What’s changed since last week?
          </MeetingSectionHeading>
          <MeetingSectionSubheading>
            Keep ‘em quick—discussion is coming up!
          </MeetingSectionSubheading>
        </MeetingSection>
        {/* */}
        <div className={s.layout}>
          <div className={s.nav}>
            <div className={s.linkSpacer}>{' '}</div>
            <div className={s.avatar}>
              <Avatar {...currentTeamMember} hasLabel labelRight size="large"/>
            </div>
            <div className={s.linkSpacer}>
              <IconLink
                icon="arrow-circle-right"
                iconPlacement="right"
                label="Next team member"
                onClick={gotoNextItem}
              />
            </div>
          </div>
        </div>
        <ProjectColumns myTeamMemberId={self && self.id} projects={projects} area={MEETING}/>
        {/* */}
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

s = StyleSheet.create({
  layout: {
    margin: '0 auto',
    maxWidth: '80rem',
    padding: '0 2rem',
    width: '100%'
  },

  nav: {
    display: 'flex !important',
    width: '100%'
  },

  avatar: {
    flex: 1,
    textAlign: 'center'
  },

  linkSpacer: {
    textAlign: 'right',
    width: '9.25rem'
  }
});

MeetingUpdates.propTypes = {
  isFacilitating: PropTypes.bool,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array,
  projects: PropTypes.object,
  router: PropTypes.object.isRequired,
};

export default withRouter(look(MeetingUpdates));

