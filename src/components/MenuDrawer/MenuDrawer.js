import React, {Component} from 'react';
import { StatusNav } from 'components';

export default class MenuDrawer extends Component {
  render() {
    const styles = require('./MenuDrawer.scss');
    return (
      <div className={styles.panel}>
        <StatusNav />
        <div className={styles.hr}></div>
        <StatusNav />
      </div>
    );
  }
}
