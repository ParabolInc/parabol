import React, {Component} from 'react';

export default class UserMenu extends Component {
  render() {
    const styles = require('./UserMenu.scss');
    return (
      <div className={styles.main}>
        <div className={styles.heading}>My Teams</div>
        <a className={styles.item} href="#" title="Core">Core</a>
        <a className={styles.item} href="#" title="Engineering">Engineering</a>
      </div>
    );
  }
}
