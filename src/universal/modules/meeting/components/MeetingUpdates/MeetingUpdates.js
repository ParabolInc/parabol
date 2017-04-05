import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import IconLink from 'universal/components/IconLink/IconLink';
import MeetingMain from 'universal/modules/meeting/components/MeetingMain/MeetingMain';
import MeetingSection from 'universal/modules/meeting/components/MeetingSection/MeetingSection';
import {MEETING} from 'universal/utils/constants';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';

const MeetingUpdates = (props) => {
  const {
    gotoNext,
    localPhaseItem,
    members,
    queryKey,
    projects,
    styles,
    hideMoveMeetingControls
  } = props;
  const self = members.find((m) => m.isSelf);
  const isLastMember = localPhaseItem === members.length;
  return (
    <MeetingMain>
      <MeetingSection flexToFill>
        <div className={css(styles.layout)}>
          <div className={css(styles.nav)}>
            <div className={css(styles.linkSpacer)}>{' '}</div>
            <div className={css(styles.avatarBlock)}>
              {' '}
            </div>
            <div className={css(styles.linkSpacer)}>
              {!hideMoveMeetingControls &&
                <IconLink
                  colorPalette="cool"
                  icon="arrow-circle-right"
                  iconPlacement="right"
                  label={isLastMember ? 'Move on to the Agenda' : 'Next team member '}
                  onClick={gotoNext}
                  scale="small"
                />
              }
            </div>
          </div>
        </div>
        <div className={css(styles.body)}>
          <ProjectColumns alignColumns="center" myTeamMemberId={self && self.id} projects={projects} queryKey={queryKey} area={MEETING} />
        </div>
      </MeetingSection>
    </MeetingMain>
  );
};

MeetingUpdates.propTypes = {
  gotoItem: PropTypes.func.isRequired,
  gotoNext: PropTypes.func.isRequired,
  localPhaseItem: PropTypes.number.isRequired,
  members: PropTypes.array.isRequired,
  onFacilitatorPhase: PropTypes.bool,
  projects: PropTypes.object.isRequired,
  queryKey: PropTypes.string.isRequired,
  styles: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  hideMoveMeetingControls: PropTypes.bool
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
