import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import {textOverflow} from 'universal/styles/helpers';
import appTheme from 'universal/styles/theme/appTheme';
import layoutStyle from 'universal/styles/layout';
import actionUIMark from 'universal/styles/theme/images/brand/mark-color.svg';
import {cashay} from 'cashay';
import {CHECKIN, UPDATES, SUMMARY, phaseArray} from 'universal/utils/constants';
import makeMeetingUrl from 'universal/utils/makeMeetingUrl';
import {Link} from 'react-router';
import AgendaListAndInputContainer from 'universal/modules/teamDashboard/containers/AgendaListAndInput/AgendaListAndInputContainer';
import inAgendaGroup from 'universal/modules/meeting/helpers/inAgendaGroup';

const combineStyles = StyleSheet.combineStyles;
const labels = {
  lobby: 'Lobby',
  checkIn: 'Check-In',
  updates: 'Updates',
  agenda: 'Agenda',
  summary: 'Summary',
};

let s = {};

const Sidebar = (props) => {
  const {
    agendaPhaseItem,
    facilitatorPhase,
    isFacilitating,
    localPhase,
    teamName,
    teamId
  } = props;

  const shortUrl = makeMeetingUrl(teamId);
  const facilitatorPhaseItemStyles = combineStyles(s.navListItem, s.navListItemMeetingMarker);
  const activeNavAnchor = combineStyles(s.navListItemLink, s.navListItemLinkActive);

  const checkInLinkStyles = localPhase === CHECKIN ? activeNavAnchor : s.navListItemLink;
  const updatesLinkStyles = localPhase === UPDATES ? activeNavAnchor : s.navListItemLink;
  const requestsLinkStyles = inAgendaGroup(localPhase) ? activeNavAnchor : s.navListItemLink;

  const checkInNavItemStyles = facilitatorPhase === CHECKIN ? facilitatorPhaseItemStyles : s.navListItem;
  const updatesNavItemStyles = facilitatorPhase === UPDATES ? facilitatorPhaseItemStyles : s.navListItem;
  const requestsNavItemStyles = inAgendaGroup(facilitatorPhase) ? facilitatorPhaseItemStyles : s.navListItem;

  const handleLogoClick = (e) => {
    // TODO remove in production, but great for debugging. Just click the logo & it removes the ephemeral meeting state
    e.preventDefault();
    cashay.mutate('killMeeting', {variables: {teamId}});
  };
  return (
    <div className={s.sidebar}>
      <div className={s.sidebarHeader}>
        <a className={s.brandLink} onClick={handleLogoClick}>
          <img className={s.brandLogo} src={actionUIMark}/>
        </a>
        <Link className={s.teamName} to={`/team/${teamId}`}>{teamName}</Link>
        <a className={s.shortUrl} href="/meetingLayout/lobby">{shortUrl}</a>
        {/* TODO: make me respond to props */}
      </div>

      {/* TODO: make me respond to props */}
      <nav className={s.nav}>
        <ul className={s.navList}>
          <li className={checkInNavItemStyles}>
            <Link
              to={`/meeting/${teamId}/checkin`}
              className={checkInLinkStyles}
              title={labels.checkIn}
            >
              <span className={s.bullet}>i.</span>
              <span className={s.label}>{labels.checkIn}</span>
            </Link>
          </li>
          <li className={updatesNavItemStyles}>
            <Link
              className={updatesLinkStyles}
              to={`/meeting/${teamId}/updates`}
              title={labels.updates}
            >
              <span className={s.bullet}>ii.</span>
              <span className={s.label}>{labels.updates}</span>
            </Link>
          </li>
          <li className={requestsNavItemStyles}>
            <Link
              className={requestsLinkStyles}
              to={`/meeting/${teamId}/agenda`}
              title={labels.agenda}
            >
              <span className={s.bullet}>iii.</span>
              <span className={s.label}>{labels.agenda}</span>
            </Link>
          </li>
          {localPhase === SUMMARY &&
            <li className={combineStyles(s.navListItem, s.navListItemLinkActive)}>
              <a
                className={combineStyles(s.navListItemLink, s.navListItemLinkActive)}
                href={`/meeting/${teamId}/summary`}
                title={labels.summary}
              >
                <span className={s.bullet}>{' '}</span>
                <span className={s.label}>{labels.summary}</span>
              </a>
            </li>
          }
        </ul>
        {localPhase !== CHECKIN && localPhase !== SUMMARY &&
          <div className={s.agendaListBlock}>
            <AgendaListAndInputContainer agendaPhaseItem={agendaPhaseItem} isFacilitating={isFacilitating} teamId={teamId}/>
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
  isFacilitating: PropTypes.bool,
  localPhase: PropTypes.oneOf(phaseArray),
  teamName: PropTypes.string,
  teamId: PropTypes.string,
};

s = StyleSheet.create({
  brandLogo: {
    display: 'block',
    height: 'auto',
    width: '100%'
  },

  brandLink: {
    display: 'block',
    height: 'auto',
    left: '1.25rem',
    position: 'absolute',
    width: '1.9375rem'
  },

  bullet: {
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    marginRight: '.75rem',
    textAlign: 'right',
    verticalAlign: 'middle',
    width: '3.25rem'
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
    padding: 0,
  },

  navListItem: {
    fontSize: 0,
    fontWeight: 700,
    lineHeight: '2.5rem'
  },

  navListItemLink: {
    color: appTheme.palette.dark60l,
    textDecoration: 'none',

    ':hover': {
      color: appTheme.palette.dark
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
    backgroundColor: appTheme.palette.dark10l,
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 0 0',
    width: layoutStyle.meetingSidebarWidth
  },

  sidebarHeader: {
    paddingLeft: '4rem',
    position: 'relative'
  },

  shortUrl: {
    ...textOverflow,
    color: appTheme.palette.dark10d,
    display: 'block',
    fontSize: appTheme.typography.s2,
    lineHeight: 'normal',
    marginBottom: '.625rem',
    paddingRight: '.5rem',
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
    lineHeight: 'normal',
    marginBottom: '.5rem'
  },

  timer: {
    color: appTheme.palette.warm,
    fontFamily: appTheme.typography.monospace,
    fontSize: appTheme.typography.s4,
  }
});

export default withStyles(styleThunk)(Sidebar);
