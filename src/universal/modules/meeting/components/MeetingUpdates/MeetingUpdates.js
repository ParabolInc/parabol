import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

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

const MeetingUpdates = (props) => {
  const {
    localPhaseItem,
    isFacilitating,
    members,
    projects,
    router,
    styles,
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
      <MeetingSection flexToFill>
        {/* */}
        <MeetingSection paddingBottom="2rem">
          <MeetingSectionHeading>
            What’s changed since last week?
          </MeetingSectionHeading>
          <MeetingSectionSubheading>
            Keep ‘em quick—discussion time is next!
          </MeetingSectionSubheading>
        </MeetingSection>
        {/* */}
        <div className={css(styles.layout)}>
          <div className={css(styles.nav)}>
            <div className={css(styles.linkSpacer)}>{' '}</div>
            <div className={css(styles.avatar)}>
              <Avatar {...currentTeamMember} hasLabel labelRight size="large"/>
            </div>
            <div className={css(styles.linkSpacer)}>
              <IconLink
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                label="Next team member"
                onClick={gotoNextItem}
                scale="small"
              />
            </div>
          </div>
        </div>
        <div className={css(styles.body)}>
          <ProjectColumns alignColumns="center" myTeamMemberId={self && self.id} projects={projects} area={MEETING}/>
        </div>
        {/* */}
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

MeetingUpdates.propTypes = {
  isFacilitating: PropTypes.bool,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array,
  meetingPhase: PropTypes.string.isRequired,
  meetingPhaseItem: PropTypes.number.isRequired,
  params: PropTypes.shape({
    teamId: PropTypes.string.isRequired
  }).isRequired,
  projects: PropTypes.object.isRequired,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

const styleThunk = () => ({
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

  body: {
    display: 'flex',
    flex: 1,
    padding: '2rem 1rem 0',
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

export default withRouter(
  withStyles(styleThunk)(MeetingUpdates)
);
