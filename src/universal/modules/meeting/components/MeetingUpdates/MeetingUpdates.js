import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import Avatar from 'universal/components/Avatar/Avatar';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingPrompt from 'universal/modules/meeting/components/MeetingPrompt/MeetingPrompt';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import {UPDATES, phaseOrder, MEETING} from 'universal/utils/constants';
import ProgressBarContainer from 'universal/modules/meeting/containers/ProgressBarContainer/ProgressBarContainer';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';
import makeUsername from 'universal/utils/makeUsername';

const MeetingUpdates = (props) => {
  const {
    gotoItem,
    gotoNext,
    localPhaseItem,
    members,
    queryKey,
    projects,
    styles,
    team
  } = props;
  const {meetingPhase, facilitatorPhaseItem, meetingPhaseItem} = team;
  const currentTeamMember = members[localPhaseItem - 1];
  const self = members.find((m) => m.isSelf);
  const isComplete = phaseOrder(meetingPhase) > phaseOrder(UPDATES);
  const isLastMember = localPhaseItem === members.length;
  const username = makeUsername(currentTeamMember.preferredName);
  return (
    <MeetingMain>
      <MeetingSection>
        <ProgressBarContainer
          gotoItem={gotoItem}
          isComplete={isComplete}
          facilitatorPhaseItem={facilitatorPhaseItem}
          localPhaseItem={localPhaseItem}
          meetingPhaseItem={meetingPhaseItem}
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
                <Avatar {...currentTeamMember} size="fill" />
              </div>
              <div className={css(styles.username)}>@{username}</div>
            </div>
            <div className={css(styles.linkSpacer)}>
              <IconLink
                colorPalette="cool"
                icon="arrow-circle-right"
                iconPlacement="right"
                label={isLastMember ? 'Move on to the Agenda' : 'Next team member '}
                onClick={gotoNext}
                scale="small"
              />
            </div>
          </div>
        </div>
        <div className={css(styles.body)}>
          <ProjectColumns alignColumns="center" myTeamMemberId={self && self.id} projects={projects} queryKey={queryKey} area={MEETING} />
        </div>
        {/* */}
        {/* */}
      </MeetingSection>
      {/* */}
    </MeetingMain>
  );
};

MeetingUpdates.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  projects: PropTypes.object.isRequired,
  queryKey: PropTypes.string.isRequired,
  styles: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
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
    padding: '2px 1rem 0 0',
    justifyContent: 'center',
    textAlign: 'right',
    width: '12rem',

    [ui.breakpoint.wider]: {
      paddingTop: '4px'
    }
  }
});

export default withStyles(styleThunk)(MeetingUpdates);
