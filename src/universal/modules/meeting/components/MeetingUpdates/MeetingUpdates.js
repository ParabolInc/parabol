import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withHotkey from 'react-hotkey-hoc';
import Avatar from 'universal/components/Avatar/Avatar';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import makePhaseItemFactory from 'universal/modules/meeting/helpers/makePhaseItemFactory';
import {UPDATES, phaseOrder, MEETING} from 'universal/utils/constants';
import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';
import {withRouter} from 'react-router';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import makeUsername from 'universal/utils/makeUsername';

const MeetingUpdates = (props) => {
  const {
    bindHotkey,
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
  const gotoPrevItem = phaseItemFactory(localPhaseItem - 1);
  bindHotkey(['enter', 'right'], gotoNextItem);
  bindHotkey('left', gotoPrevItem);
  const isLastMember = localPhaseItem === members.length;
  const username = makeUsername(currentTeamMember.preferredName);
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
          <MeetingPrompt
            heading={<span>What’s changed since last week?</span>}
            helpText={<span><b>Keep ‘em quick</b>—discussion time is next!</span>}
          />
        </MeetingSection>
        {/* */}
        <div className={css(styles.layout)}>
          <div className={css(styles.nav)}>
            <div className={css(styles.linkSpacer)}>{' '}</div>
            <div className={css(styles.avatarBlock)}>
              <div className={css(styles.avatar)}>
                <Avatar {...currentTeamMember} size="fill"/>
              </div>
              <div className={css(styles.username)}>@{username}</div>
            </div>
            <div className={css(styles.linkSpacer)}>
              <IconLink
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                label={isLastMember ? 'Move on to the Agenda' : 'Next team member '}
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
  bindHotkey: PropTypes.func.isRequired,
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
    padding: '0 1rem',
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

  avatarBlock: {
    flex: 1,
    textAlign: 'center'
  },

  avatar: {
    display: 'inline-block',
    verticalAlign: 'middle',
    width: '5rem',

    [ui.breakpoint.wider]: {
      width: '7.5rem'
    }
  },

  username: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s5,
    fontWeight: 700,
    marginLeft: '1.5rem',
    verticalAlign: 'middle',

    [ui.breakpoint.wider]: {
      fontSize: appTheme.typography.s6
    }
  },

  linkSpacer: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 1rem 0 0',
    justifyContent: 'center',
    textAlign: 'right',
    width: '12rem'
  }
});

export default withHotkey(
  withRouter(
    withStyles(styleThunk)(MeetingUpdates)
  )
);
