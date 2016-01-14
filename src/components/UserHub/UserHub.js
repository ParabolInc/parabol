import React, {Component} from 'react';

export default class UserHub extends Component {
  render() {
    const styles = require('./UserHub.scss');
    return (
      <div className={styles.main}>
        <div className={styles.name}>Jerry Seabass</div>
        <a className={styles.link} href="#" title="Settings">Settings</a>
        <a className={styles.link} href="#" title="Log Out">Log Out</a>
      </div>
    );
  }
}
