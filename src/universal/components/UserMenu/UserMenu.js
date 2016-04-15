import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './UserMenu.scss';

@cssModules(styles)
// for the decorators
// eslint-disable-next-line react/prefer-stateless-function
export default class UserMenu extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    heading: PropTypes.string,
    menuItems: PropTypes.array.isRequired
  }
  render() {
    const props = this.props;
    // TODO: Not sure why eslint doesn't like this block
    const menuItem = (id, label) => (
      <a className={styles.item} href="#" key={id} title={label}>{label}</a>
    );
    // TODO: Not sure why eslint doesn't like this block
    const mapMenuItems = (menuItems) => (
      menuItems.map(item =>
        menuItem(item.id, item.label)
      )
    );
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
