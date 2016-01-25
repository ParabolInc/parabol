import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './UserMenu.scss';

@cssModules(styles)
export default class UserMenu extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    heading: PropTypes.string,
    menuItems: PropTypes.array.isRequired
  }
  render() {
    const props = this.props;
    const menuItem = (id, label) => {
      return (
        <a className={styles.item} href="#" key={id} title={label}>{label}</a>
      );
    };
    const mapMenuItems = (menuItems) => {
      return (
        menuItems.map(item =>
          menuItem(item.id, item.label)
        )
      );
    };
    return (
      <div styleName="main">
        <div styleName="heading">
          {props.heading}
        </div>
        {mapMenuItems(props.menuItems)}
      </div>
    );
  }
}
