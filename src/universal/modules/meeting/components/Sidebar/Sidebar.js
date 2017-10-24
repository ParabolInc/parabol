import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import actionUIMark from 'universal/styles/theme/images/brand/mark-color.svg';
import {CHECKIN, UPDATES, FIRST_CALL, AGENDA_ITEMS, SUMMARY, phaseArray} from 'universal/utils/constants';
import makeHref from 'universal/utils/makeHref';
import {Link} from 'react-router-dom';
import AgendaListAndInputContainer from 'universal/modules/teamDashboard/containers/AgendaListAndInput/AgendaListAndInputContainer';
import inAgendaGroup from 'universal/modules/meeting/helpers/inAgendaGroup';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

const Sidebar = (props) => {
  const {
    agendaPhaseItem,
    facilitatorPhase,
    facilitatorPhaseItem,
    gotoItem,
    gotoAgendaItem,
    isFacilitating,
    localPhase,
    localPhaseItem,
    meetingPhase,
    styles,
    teamName,
    teamId
  } = props;

  const relativeLink = `/meeting/${teamId}`;
  const shortUrl = makeHref(relativeLink);
  const canNavigateTo = (phase) => {
    const adjustForFacilitator = isFacilitating ? 1 : 0;
    const phaseInfo = actionMeeting[phase];
    const meetingPhaseInfo = actionMeeting[meetingPhase];
    return Boolean(meetingPhaseInfo.index >= (phaseInfo.index - adjustForFacilitator));
  };
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
    inAgendaGroup(localPhase) && styles.navListItemLinkActive,
    !canNavigateTo(FIRST_CALL) && styles.navListItemLinkDisabled
  );
  const checkInNavItemStyles = css(styles.navListItem, facilitatorPhase === CHECKIN && styles.navListItemMeetingMarker);
  const updatesNavItemStyles = css(styles.navListItem, facilitatorPhase === UPDATES && styles.navListItemMeetingMarker);
  const agendaNavItemStyles = css(styles.navListItem, inAgendaGroup(facilitatorPhase) && styles.navListItemMeetingMarker);
  const agendaListCanNavigate = canNavigateTo(AGENDA_ITEMS);
  const agendaListDisabled = meetingPhase === CHECKIN;
  // Phase labels
  const checkinLabel = actionMeeting.checkin.name;
  const updatesLabel = actionMeeting.updates.name;
  const agendaitemsLabel = actionMeeting.agendaitems.name;
  const summaryLabel = actionMeeting.summary.name;
  return (
    <div className={css(styles.sidebar)}>
      <div className={css(styles.sidebarHeader)}>
        <div className={css(styles.brandBlock)}>
          <img className={css(styles.brandLogo)} src={actionUIMark} />
        </div>
        <Link className={css(styles.teamName)} to={`/team/${teamId}`} title={`Go to the ${teamName} Team Dashboard`}>{teamName}</Link>
        <a className={css(styles.shortUrl)} href={relativeLink}>{shortUrl}</a>
      </div>
      <nav className={css(styles.nav)}>
        <ul className={css(styles.navList)}>
          <li className={checkInNavItemStyles}>
            <div
              className={checkInLinkStyles}
              onClick={() => gotoItem(null, CHECKIN)}
              title={checkinLabel}
            >
              <span className={css(styles.bullet)}>i.</span>
              <span className={css(styles.label)}>{checkinLabel}</span>
            </div>
          </li>
          <li className={updatesNavItemStyles}>
            <div
              className={updatesLinkStyles}
              onClick={() => gotoItem(null, UPDATES)}
              title={updatesLabel}
            >
              <span className={css(styles.bullet)}>ii.</span>
              <span className={css(styles.label)}>{updatesLabel}</span>
            </div>
          </li>
          <li className={agendaNavItemStyles}>
            <div
              className={agendaLinkStyles}
              onClick={() => gotoItem(null, FIRST_CALL)}
              title={agendaitemsLabel}
            >
              <span className={css(styles.bullet)}>iii.</span>
              <span className={css(styles.label)}>{agendaitemsLabel}</span>
            </div>
          </li>
          {localPhase === SUMMARY &&
            <li className={css(styles.navListItem, styles.navListItemLinkActive)}>
              <div
                className={css(styles.navListItemLink, styles.navListItemLinkActive)}
                onClick={() => gotoItem(null, SUMMARY)}
                title={summaryLabel}
              >
                <span className={css(styles.bullet)}>{' '}</span>
                <span className={css(styles.label)}>{summaryLabel}</span>
              </div>
            </li>
          }
        </ul>
        {localPhase !== SUMMARY &&
          <div className={css(styles.agendaListBlock)}>
            <AgendaListAndInputContainer
              agendaPhaseItem={agendaPhaseItem}
              canNavigate={agendaListCanNavigate}
              context={'meeting'}
              disabled={agendaListDisabled}
              facilitatorPhase={facilitatorPhase}
              facilitatorPhaseItem={facilitatorPhaseItem}
              gotoAgendaItem={gotoAgendaItem}
              localPhase={localPhase}
              localPhaseItem={localPhaseItem}
              teamId={teamId}
            />
          </div>
        }
      </nav>
    </div>
  );
};

Sidebar.propTypes = {
  agenda: PropTypes.array,
  agendaPhaseItem: PropTypes.number,
  facilitatorPhase: PropTypes.oneOf(phaseArray),
  facilitatorPhaseItem: PropTypes.number,
  isFacilitating: PropTypes.bool,
  gotoItem: PropTypes.func.isRequired,
  gotoAgendaItem: PropTypes.func.isRequired,
  localPhase: PropTypes.oneOf(phaseArray),
  localPhaseItem: PropTypes.number,
  meetingPhase: PropTypes.oneOf(phaseArray),
  styles: PropTypes.object,
  teamName: PropTypes.string,
  teamId: PropTypes.string
};

const styleThunk = () => ({
  brandLogo: {
    display: 'block',
    height: 'auto',
    width: '100%'
  },

  brandBlock: {
    display: 'block',
    height: 'auto',
    left: '1rem',
    position: 'absolute',
    width: '1.9375rem'
  },

  bullet: {
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    marginRight: '.75rem',
    textAlign: 'right',
    verticalAlign: 'middle',
    width: '3rem'
  },

  label: {
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    verticalAlign: 'middle'
  },

  nav: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    margin: '2rem 0 0',
    width: '100%'
  },

  navList: {
    listStyle: 'none',
    margin: 0,
    padding: 0
  },

  navListItem: {
    fontSize: 0,
    fontWeight: 700,
    lineHeight: '2.5rem'
  },

  navListItemLink: {
    color: appTheme.palette.dark60l,
    cursor: 'pointer',
    textDecoration: 'none',
    userSelect: 'none',

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  navListItemLinkDisabled: {
    color: appTheme.palette.dark60l,
    cursor: 'not-allowed',
    opacity: '.65',

    ':hover': {
      color: appTheme.palette.dark60l
    },
    ':focus': {
      color: appTheme.palette.dark60l
    }
  },

  navListItemMeetingMarker: {
    position: 'relative',

    '::after': {
      backgroundColor: appTheme.palette.warm,
      borderRadius: '100%',
      display: 'block',
      content: '""',
      height: '.75rem',
      marginTop: '-.375rem',
      position: 'absolute',
      right: '-.375rem',
      top: '50%',
      width: '.75rem'
    }
  },

  navListItemLinkActive: {
    color: appTheme.palette.dark
  },

  agendaListBlock: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  sidebar: {
    backgroundColor: appTheme.palette.mid10l,
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 0 0',
    maxWidth: ui.meetingSidebarWidth,
    minWidth: ui.meetingSidebarWidth
  },

  sidebarHeader: {
    paddingLeft: '3.75rem',
    position: 'relative'
  },

  shortUrl: {
    ...textOverflow,
    color: appTheme.palette.dark10d,
    display: 'block',
    fontSize: appTheme.typography.s2,
    lineHeight: appTheme.typography.sBase,
    paddingRight: ui.meetingSidebarGutter,
    textDecoration: 'none',

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  teamName: {
    color: appTheme.palette.cool,
    cursor: 'pointer',
    fontFamily: appTheme.typography.serif,
    fontSize: appTheme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: '1.5'
  }
});

export default withStyles(styleThunk)(Sidebar);
