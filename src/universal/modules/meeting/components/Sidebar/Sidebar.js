import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {Link} from 'react-router-dom';
import {LabelHeading, LogoBlock} from 'universal/components';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';
import inAgendaGroup from 'universal/modules/meeting/helpers/inAgendaGroup';
import CopyShortLink from 'universal/modules/meeting/components/CopyShortLink/CopyShortLink';
import AgendaListAndInput from 'universal/modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {AGENDA_ITEMS, CHECKIN, FIRST_CALL, phaseArray, SUMMARY, UPDATES, LAST_CALL} from 'universal/utils/constants';
import makeHref from 'universal/utils/makeHref';

const Sidebar = (props) => {
  const {
    gotoItem,
    gotoAgendaItem,
    inSync,
    isFacilitating,
    localPhase,
    localPhaseItem,
    setAgendaInputRef,
    styles,
    team
  } = props;
  const {teamId, teamName, agendaItems, facilitatorPhase, facilitatorPhaseItem, meetingPhase} = team;

  const relativeLink = `/meeting/${teamId}`;
  const agendaPhaseItem = actionMeeting[meetingPhase].index >= actionMeeting[AGENDA_ITEMS].index ?
    agendaItems.findIndex((a) => a.isComplete === false) + 1 : 0;
  const canNavigateTo = (phase) => {
    const adjustForFacilitator = isFacilitating ? 1 : 0;
    const phaseInfo = actionMeeting[phase];
    const meetingPhaseInfo = actionMeeting[meetingPhase];
    return Boolean(meetingPhaseInfo.index >= (phaseInfo.index - adjustForFacilitator));
  };

  // Nav item bullet states
  const checkInBulletStyles = css(
    styles.navItemBullet,
    facilitatorPhase === CHECKIN && styles.navItemBulletPhase
  );
  const updatesBulletStyles = css(
    styles.navItemBullet,
    facilitatorPhase === UPDATES && styles.navItemBulletPhase
  );
  const agendaBulletStyles = css(
    styles.navItemBullet,
    inAgendaGroup(facilitatorPhase) && styles.navItemBulletPhase
  );

  const checkInLinkStyles = css(
    styles.navListItemLink,
    localPhase === CHECKIN && styles.navListItemLinkActive,
    !canNavigateTo(CHECKIN) && styles.navListItemLinkDisabled
  );
  const updatesLinkStyles = css(
    styles.navListItemLink,
    localPhase === UPDATES && styles.navListItemLinkActive,
    !canNavigateTo(UPDATES) && styles.navListItemLinkDisabled
  );
  const agendaLinkStyles = css(
    styles.navListItemLink,
    localPhase === FIRST_CALL && styles.navListItemLinkActive,
    localPhase === LAST_CALL && styles.navListItemLinkActive,
    !canNavigateTo(FIRST_CALL) && styles.navListItemLinkDisabled
  );

  const agendaListCanNavigate = canNavigateTo(AGENDA_ITEMS);
  const agendaListDisabled = meetingPhase === CHECKIN;
  // Phase labels
  const checkinLabel = actionMeeting.checkin.name;
  const updatesLabel = actionMeeting.updates.name;
  const agendaitemsLabel = actionMeeting.agendaitems.name;

  return (
    <div className={css(styles.sidebar)}>
      <div className={css(styles.sidebarHeader)}>
        <Link
          className={css(styles.teamName)}
          to={`/team/${teamId}`}
          title={`Go to the ${teamName} Team Dashboard`}
        >
          {teamName}
        </Link>
        <CopyShortLink label="Copy Meeting Link" url={makeHref(relativeLink)} />
      </div>
      <div className={css(styles.agendaLabelBlock)}>
        <LabelHeading>{'Action Meeting'}</LabelHeading>
      </div>
      <nav className={css(styles.nav)}>
        <ul className={css(styles.navList)}>
          <li className={css(styles.navListItem)}>
            <div
              className={checkInLinkStyles}
              onClick={() => gotoItem(null, CHECKIN)}
              title={checkinLabel}
            >
              <span className={checkInBulletStyles}>{'1'}</span>
              <span className={css(styles.navItemLabel)}>{checkinLabel}</span>
            </div>
          </li>
          <li className={css(styles.navListItem)}>
            <div
              className={updatesLinkStyles}
              onClick={() => gotoItem(null, UPDATES)}
              title={updatesLabel}
            >
              <span className={updatesBulletStyles}>{'2'}</span>
              <span className={css(styles.navItemLabel)}>{updatesLabel}</span>
            </div>
          </li>
          <li className={css(styles.navListItem)}>
            <div
              className={agendaLinkStyles}
              onClick={() => gotoItem(null, FIRST_CALL)}
              title={agendaitemsLabel}
            >
              <span className={agendaBulletStyles}>{'3'}</span>
              <span className={css(styles.navItemLabel)}>{agendaitemsLabel}</span>
            </div>
          </li>
        </ul>
        {localPhase !== SUMMARY &&
        <div className={css(styles.agendaListBlock)}>
          <div className={css(styles.agendaLabelBlock)}>
            <LabelHeading>{'Agenda Topics'}</LabelHeading>
          </div>
          <AgendaListAndInput
            agendaPhaseItem={agendaPhaseItem}
            canNavigate={agendaListCanNavigate}
            context={'meeting'}
            disabled={agendaListDisabled}
            facilitatorPhase={facilitatorPhase}
            facilitatorPhaseItem={facilitatorPhaseItem}
            gotoAgendaItem={gotoAgendaItem}
            inSync={inSync}
            localPhase={localPhase}
            localPhaseItem={localPhaseItem}
            setAgendaInputRef={setAgendaInputRef}
            team={team}
          />
        </div>
        }
      </nav>
      <LogoBlock variant="primary" />
    </div>
  );
};

Sidebar.propTypes = {
  agenda: PropTypes.array,
  agendaPhaseItem: PropTypes.number,
  facilitatorPhase: PropTypes.oneOf(phaseArray),
  facilitatorPhaseItem: PropTypes.number,
  inSync: PropTypes.bool,
  isFacilitating: PropTypes.bool,
  gotoItem: PropTypes.func.isRequired,
  gotoAgendaItem: PropTypes.func.isRequired,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  meetingPhase: PropTypes.oneOf(phaseArray),
  setAgendaInputRef: PropTypes.func.isRequired,
  styles: PropTypes.object,
  team: PropTypes.object.isRequired
};

const styleThunk = () => ({
  navItemBullet: {
    backgroundColor: appTheme.palette.mid,
    borderRadius: '100%',
    color: ui.palette.white,
    display: 'inline-block',
    fontSize: '.6875rem',
    fontWeight: ui.typeSemiBold,
    height: '1.5rem',
    lineHeight: '1.5rem',
    marginLeft: '1.3125rem',
    marginRight: '.75rem',
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '1.5rem'
  },

  navItemBulletPhase: {
    backgroundImage: ui.gradientWarm
  },

  navItemLabel: {
    display: 'inline-block',
    fontSize: ui.navMenuFontSize,
    verticalAlign: 'middle'
  },

  nav: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },

  navListItem: {
    fontSize: 0,
    fontWeight: 600,
    lineHeight: '2.5rem'
  },

  navListItemLink: {
    borderLeft: `${ui.navMenuLeftBorderWidth} solid transparent`,
    color: ui.colorText,
    cursor: 'pointer',
    textDecoration: 'none',
    userSelect: 'none',

    ':hover': {
      backgroundColor: ui.navMenuLightBackgroundColorHover
    },
    ':focus': {
      backgroundColor: ui.navMenuLightBackgroundColorHover
    }
  },

  navListItemLinkDisabled: {
    cursor: 'not-allowed',

    ':hover': {
      backgroundColor: 'transparent'
    },
    ':focus': {
      backgroundColor: 'transparent'
    }
  },

  navListItemLinkActive: {
    backgroundColor: ui.navMenuLightBackgroundColorActive,
    borderLeftColor: ui.palette.mid,
    color: appTheme.palette.dark,

    ':hover': {
      backgroundColor: ui.navMenuLightBackgroundColorActive
    },
    ':focus': {
      backgroundColor: ui.navMenuLightBackgroundColorActive
    }
  },

  agendaListBlock: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  agendaLabelBlock: {
    borderTop: `.0625rem solid ${ui.palette.light}`,
    margin: '1.25rem 0 0 3.75rem',
    padding: '1rem 0'
  },

  sidebar: {
    backgroundColor: ui.palette.white,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem 0 0',
    maxWidth: ui.meetingSidebarWidth,
    minWidth: ui.meetingSidebarWidth
  },

  sidebarHeader: {
    paddingLeft: '3.75rem',
    position: 'relative'
  },

  teamName: {
    color: ui.copyText,
    cursor: 'pointer',
    fontSize: appTheme.typography.s5,
    fontWeight: 600,
    lineHeight: '1.5'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(Sidebar),
  graphql`
    fragment Sidebar_team on Team {
      teamId: id
      teamName: name
      facilitatorPhase
      facilitatorPhaseItem
      meetingPhase
      agendaItems {
        isComplete
      }
      ...AgendaListAndInput_team
    }
  `
);
