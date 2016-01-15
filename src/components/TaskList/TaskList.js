import React, {Component} from 'react';
import { TaskListItem } from 'components';

export default class TaskList extends Component {
  render() {
    const styles = require('./TaskList.scss');
    return (
      <div className={styles.list}>
        Task List<br />
        <TaskListItem />
        <TaskListItem />
        <TaskListItem />
        <TaskListItem />
        <TaskListItem />
      </div>
    );
  }
}
