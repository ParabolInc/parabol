import React, {Component} from 'react';

export default class NotificationBar extends Component {
  render() {
    const styles = require('./NotificationBar.scss');
    return (
      <div className={styles.bar}>
        <div className={styles.timer}>12:32 left</div>
        <div className={styles.name}>Active Meeting Name</div>
        <a className={styles.link} href="/meeting" title="Join Meeting">Join Meeting</a>
      </div>
    );
  }
}
