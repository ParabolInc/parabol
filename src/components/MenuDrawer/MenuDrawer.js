import React, {Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './MenuDrawer.scss';
import { StatusNav } from 'components';

let exampleWorkflowNavItemId = 0;
const exampleWorkflowNavItems = [
  {
    id: exampleWorkflowNavItemId++,
    label: 'Active',
    active: true,
    alerts: '3'
  },
  {
    id: exampleWorkflowNavItemId++,
    label: 'Blocked',
    active: false
  },
  {
    id: exampleWorkflowNavItemId++,
    label: 'Someday',
    active: false
  },
  {
    id: exampleWorkflowNavItemId++,
    label: 'Done',
    active: false
  },
  {
    id: exampleWorkflowNavItemId++,
    label: 'Archive',
    active: false,
    icon: 'trash'
  }
];

let exampleLocationNavItemId = 0;
const exampleLocationNavItems = [
  {
    id: exampleLocationNavItemId++,
    label: 'Meeting History',
    active: false
  },
  {
    id: exampleLocationNavItemId++,
    label: 'Notifications',
    active: false,
    alerts: '4'
  }
];

@cssModules(styles)
export default class MenuDrawer extends Component {
  render() {
    return (
      <div styleName="panel">
        <StatusNav navItems={exampleWorkflowNavItems} />
        <div styleName="hr"></div>
        <StatusNav navItems={exampleLocationNavItems} />
      </div>
    );
  }
}
