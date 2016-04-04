import React, {PropTypes, Component} from 'react';
import cssModules from 'react-css-modules';
import styles from './MeetingNavbar.scss';

@cssModules(styles)
export default class MeetingNavbar extends Component {
  static propTypes = {
    onLeaveMeetingClick: PropTypes.func.isRequired
  }
  render() {
    const props = this.props;
    return (
      <div styleName="root">
        <div styleName="logo">
          ACTION
        </div>
        {/*
          * Bootstrap button, using base style configuration
          * Todo: Style refactor (TA)
          *
          */}
        <button className="btn btn-primary pull-right"
                onClick={() => props.onLeaveMeetingClick()}
                title="Leave Meeting">
          Leave Meeting
        </button>
      </div>
    );
  }
}
