import React, {Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './TaskList.scss';
import {TaskListItem} from 'components';

const exampleItems = [
  {
    id: 0,
    checked: false,
    label: 'Project',
    team: 'Engineering',
    timePassed: '1 month ago',
    title: 'Refactor routes in the app'
  },
  {
    id: 1,
    checked: true,
    label: 'Task',
    team: 'Core',
    timePassed: '2 days ago',
    title: 'Update important policy'
  },
  {
    id: 2,
    checked: false,
    label: 'Project',
    team: 'Design',
    timePassed: '1 hour ago',
    title: 'Create clickable feature prototype'
  }
];

@cssModules(styles)
export default class TaskList extends Component {
  render() {
    const handleCheckboxChanged = (id) => {
      console.log(`Checkbox for item[${id}] was clicked`);
    };
    return (
      <div styleName="list">
        {exampleItems.map(item =>
          <TaskListItem {...item} key={item.id} onCheckboxChanged={() => handleCheckboxChanged(item.id)} />
        )}
      </div>
    );
  }
}
