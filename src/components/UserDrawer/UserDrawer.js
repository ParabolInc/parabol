import React, {Component} from 'react';
import { UserHub } from 'components';
import { UserMenu } from 'components';

export default class UserDrawer extends Component {
  render() {
    const styles = require('./UserDrawer.scss');
    return (
      <div className={styles.panel}>
        <UserHub />
        <UserMenu />
      </div>
    );
  }
}
