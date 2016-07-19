import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import actionUIMark from 'universal/styles/theme/images/brand/mark-color.svg';
import PlaceholderList from 'universal/modules/meeting/components/PlaceholderList/PlaceholderList';
import PlaceholderInput from 'universal/modules/meeting/components/PlaceholderInput/PlaceholderInput';

const combineStyles = StyleSheet.combineStyles;

let s = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class Sidebar extends Component {
  static propTypes = {
    shortUrl: PropTypes.string,
    teamName: PropTypes.string,
    timerValue: PropTypes.string
  }

  render() {
    const { shortUrl, teamName, timerValue } = this.props;
    const activeNavAnchor = combineStyles(s.navListItemLink, s.navListItemLinkActive);
    const labels = {
      checkin: 'Check-In',
      updates: 'Updates',
      requests: 'Requests',
    };

    return (
      <div className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <a className={s.brandLink} href="/action-ui/">
            <img className={s.brandLogo} src={actionUIMark} />
          </a>
          <div className={s.teamName}>{teamName}</div>
          <a className={s.shortUrl} href={shortUrl}>{shortUrl}</a>
          {/* TODO: make me respond to props */}
          <div className={s.timer}>{timerValue}</div>
        </div>

        {/* TODO: make me respond to props */}
        <nav className={s.nav}>
          <ul className={s.navList}>
            <li className={s.navListItem}>
              <a className={s.navListItemLink} href="#check-in" title={labels.checkin}>
                <span className={s.bullet}>i.</span>
                <span className={s.label}>{labels.checkin}</span>
              </a>
            </li>
            <li className={s.navListItem}>
              <a
                className={s.navListItemLink} href="#updates" title={labels.updates}
              >
                <span className={s.bullet}>ii.</span>
                <span className={s.label}>{labels.updates}</span>
              </a>
            </li>
            <li className={s.navListItem}>
              <a className={activeNavAnchor} href="#requests" title={labels.requests}>
                <span className={s.bullet}>iii.</span>
                <span className={s.label}>{labels.requests}</span>
              </a>
            </li>
          </ul>
          <PlaceholderList />
          <PlaceholderInput />
        </nav>
      </div>
    );
  }
}

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
    fontSize: theme.typography.s4,
    marginRight: '.75rem',
    textAlign: 'right',
    verticalAlign: 'middle',
    width: '3.25rem'
  },

  label: {
    display: 'inline-block',
    fontSize: theme.typography.s4,
    verticalAlign: 'middle'
  },

  nav: {
    margin: '2rem 0',
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
    color: theme.palette.dark60l,
    textDecoration: 'none',

    ':hover': {
      color: theme.palette.dark
    }
  },

  navListItemLinkActive: {
    color: theme.palette.dark
  },

  sidebar: {
    backgroundColor: theme.palette.dark10l,
    padding: '2rem 0',
    width: '15rem'
  },

  sidebarHeader: {
    paddingLeft: '4rem',
    position: 'relative'
  },

  shortUrl: {
    color: theme.palette.dark10d,
    display: 'block',
    fontSize: theme.typography.s2,
    lineHeight: 'normal',
    marginBottom: '.625rem',
    textDecoration: 'none',

    ':hover': {
      color: theme.palette.dark
    },
    ':focus': {
      color: theme.palette.dark
    }
  },

  teamName: {
    color: theme.palette.cool,
    fontFamily: theme.typography.serif,
    fontSize: theme.typography.s5,
    fontStyle: 'italic',
    fontWeight: 700,
    lineHeight: 'normal',
    marginBottom: '.5rem'
  },

  timer: {
    color: theme.palette.warm,
    fontFamily: theme.typography.monospace,
    fontSize: theme.typography.s4,
  }
});
