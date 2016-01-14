import React, {Component} from 'react';

export default class StatusNavItem extends Component {
  render() {
    const styles = require('./StatusNavItem.scss');
    return (
      <div className={styles.item}>
        <div className={styles.icon}>
          <i className="fa fa-folder-o"></i>
        </div>
        Meeting History
        <div className={styles.badge}>
          3
        </div>
      </div>
    );
  }
}
