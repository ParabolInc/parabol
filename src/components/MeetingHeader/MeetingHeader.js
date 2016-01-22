import React, {Component} from 'react';
import { MeetingLink } from 'components';

export default class MeetingHeader extends Component {
  render() {
    const styles = require('./MeetingHeader.scss');
    return (
      <div className={styles.root}>
        <div className={styles.linkBlock}>
          <MeetingLink />
        </div>
        <div className={styles.label}>
          Action Meeting
        </div>
        <input className={styles.name} placeholder="Meeting Name" type="text" value="Meeting Name" />
      </div>
    );
  }
}
