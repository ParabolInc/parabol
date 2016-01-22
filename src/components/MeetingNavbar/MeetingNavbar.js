import React, {PropTypes, Component} from 'react';

export default class MeetingNavbar extends Component {
  static propTypes = {
    onLeaveMeetingClick: PropTypes.func.isRequired
  }
  render() {
    const styles = require('./MeetingNavbar.scss');
    const props = this.props;
    return (
      <div className={styles.root}>
        <div className={styles.logo}>
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
