import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';

import theme from 'universal/styles/theme/theme';

import actionUIMark from './images/action-ui-mark.svg';

@look
export default class Sidebar extends Component {
  static propTypes = {
    shortUrl: PropTypes.string,
    teamName: PropTypes.string,
    timerValue: PropTypes.string
  }

  render() {
    const { shortUrl, teamName, timerValue } = this.props;

    return (
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <a className={styles.brandMarkLink} href="/action-ui/">
            <img className={styles.brandMark} src={actionUIMark} />
          </a>
          <div className={styles.teamName}>{teamName}</div>
          <a className={styles.shortUrl} href={shortUrl}>{shortUrl}</a>
          { /* TODO: make me respond to props */ }
          <div className={styles.timer}>{timerValue}</div>
        </div>

        { /* TODO: make me respond to props */ }
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navListItem}>
              <a href="/action-ui/set-up/" title="Set-up">
                <span className={styles.bullet}></span>
                <span className={styles.label}>Set-up</span>
              </a>
            </li>
            <li className={styles.navListItem}>
              <a href="/action-ui/check-in/" title="Check-in">
                <span className={styles.bullet}>i.</span>
                <span className={styles.label}>Check-in</span>
              </a>
            </li>
            <li className={styles.navListItem}>
              <a href="/action-ui/project-updates/" title="Project updates">
                <span className={styles.bullet}>ii.</span>
                <span className={styles.label}>Project updates</span>
              </a>
            </li>
            <li className={styles.navListItem}>
              <a href="/action-ui/requests/" title="Requests">
                <span className={styles.bullet}>iii.</span>
                <span className={styles.label}>Requests</span>
              </a>
              <br />
              <br />
              <a href="#" title="Add a request placeholder">
                Press “+” to <br />add a request <br />placeholder
              </a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  brandMark: {
    display: 'block',
    height: 'auto',
    width: '100%'
  },

  brandMarkLink: {
    display: 'block',
    height: 'auto',
    left: '1.25rem',
    position: 'absolute',
    width: '1.9375rem'
  },

  bullet: {
    display: 'inline-block',
    // TODO: font-size: $fs4;
    fontSize: '18px',
    marginRight: '.75rem',
    textAlign: 'right',
    verticalAlign: 'middle',
    width: '3.25rem'
  },

  label: {
    display: 'inline-block',
    // TODO: font-size: $fs4;
    fontSize: '18px',
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

  navListItemActive: {
    color: '#4e495f'
  },

  sidebar: {
    backgroundColor: '#ededef',
    order: 1,
    padding: '2rem 0',
    width: '15rem'
  },

  sidebarHeader: {
    paddingLeft: '4rem',
    position: 'relative'
  },

  shortUrl: {
    color: '#08080a',
    display: 'block',
    // TODO: fontSize: $fs2,
    fontSize: '13px',
    marginBottom: '.625rem',
    textDecoration: 'none'
  },

  teamName: {
    color: theme.a,
    // TODO: fontFamily: $action-ui-serif,
    fontFamily: 'Merriweather,Georgia,"Times New Roman",Times,serif',
    // TODO: fontSize: $fs5,
    fontSize: '20px',
    fontStyle: 'italic',
    fontWeight: 700,
    marginBottom: '.5rem'
  },

  timer: {
    color: theme.b,
    // TODO: fontFamily: $action-ui-monospace;
    fontFamily: 'Menlo,Monaco,Consolas,"Courier New",monospace',
    // TODO: fontSize: $fs4;
    fontSize: "18px"
  }
});
