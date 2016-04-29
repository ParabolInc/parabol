import React, {Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './NotificationBar.scss';

@cssModules(styles)
// for the decorators
// eslint-disable-next-line react/prefer-stateless-function
export default class NotificationBar extends Component {
  render() {
    return (
      <div styleName="bar">
        <div styleName="timer">12:32 left</div>
        <div styleName="name">Active Meeting Name</div>
        <a styleName="link" href="/meeting" title="Join Meeting">Join Meeting</a>
      </div>
    );
  }
}
