import React, {Component} from 'react';
import { StatusNavItem } from 'components';

export default class StatusNav extends Component {
  render() {
    const styles = require('./StatusNav.scss');
    return (
      <div className={styles.nav}>
        <StatusNavItem />
        <StatusNavItem />
        <StatusNavItem />
      </div>
    );
  }
}
