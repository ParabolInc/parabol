import React, {Component} from 'react';

export default class TaskListItem extends Component {
  render() {
    const styles = require('./TaskListItem.scss');
    return (
      <div className={styles.item}>
        Project—Team—Title—Timestamp
      </div>
    );
  }
}
