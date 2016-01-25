import React, {Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './UserDrawer.scss';
import { UserHub, UserMenu } from 'components';

const exampleUser = {
  name: 'Jerry Seabass'
};

let exampleMenuId = 0;
let exampleMenu1ItemId = 0;
let exampleMenu2ItemId = 0;
const exampleMenus = [
  {
    id: exampleMenuId++,
    heading: 'My Teams',
    menuItems: [
      {
        id: exampleMenu1ItemId++,
        label: 'Core'
      },
      {
        id: exampleMenu1ItemId++,
        label: 'Engineering'
      }
    ]
  },
  {
    id: exampleMenuId++,
    heading: 'Another Menu',
    menuItems: [
      {
        id: exampleMenu2ItemId++,
        label: 'Another menu item'
      },
      {
        id: exampleMenu2ItemId++,
        label: 'And yet another menu item'
      }
    ]
  }
];

@cssModules(styles)
export default class UserDrawer extends Component {
  render() {
    return (
      <div styleName="panel">
        <UserHub {...exampleUser} />
        {exampleMenus.map(menu =>
          <UserMenu {...menu} key={menu.id} />
        )}
      </div>
    );
  }
}
