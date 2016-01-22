import React, {Component} from 'react';

export default class MeetingNavbar extends Component {
  render() {
    const styles = require('./MeetingNavbar.scss');
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
        <button className="btn btn-primary pull-right" title="Leave Meeting">
          Leave Meeting
        </button>
      </div>
    );
  }
}
