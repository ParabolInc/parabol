import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './UserHub.scss';

@cssModules(styles)
export default class UserHub extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired
  }
  render() {
    const props = this.props;
    return (
      <div styleName="main">
        <div styleName="name">
          {props.name}
        </div>
        <a styleName="link" href="#" title="Settings">Settings</a>
        <a styleName="link" href="#" title="Log Out">Log Out</a>
      </div>
    );
  }
}
