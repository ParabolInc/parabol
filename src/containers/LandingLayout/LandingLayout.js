import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import { pushState } from 'redux-router';
import * as meetingActions from 'redux/modules/meeting';
import config from '../../../config/config';
import { Landing } from 'containers';

const styles = require('./LandingLayout.scss'); // eslint-disable-line

@connect(
  state => ({
    meeting: state.meeting.instance
  }),
  {...meetingActions, pushState})
export default class LandingLayout extends Component {
  static propTypes = {
    meeting: PropTypes.object,
    create: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  }

  componentWillReceiveProps = (nextProps) => {
    /*
     * If we've just received a new meeting insance,
     * say from the result of handleOnMeetingCreateClick(),
     * navigate to the meeting route:
     */
    if (!(this.props.meeting && this.props.meeting.id) &&
        nextProps.meeting && nextProps.meeting.id) {
      this.props.pushState(null, '/meeting/' + nextProps.meeting.id);
    }
  };

  handleOnMeetingCreateClick = (event) => {
    event.preventDefault();
    this.props.create();
  };

  render() {
    return (
      <div>
        <Helmet {...config.app.head} />
        <Landing onMeetinCreateClick={this.handleOnMeetingCreateClick} />
      </div>
    );
  }
}
