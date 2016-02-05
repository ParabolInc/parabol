import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import cssModules from 'react-css-modules';
import styles from './MeetingLayout.scss';
import { connect } from 'react-redux';
import connectData from 'helpers/connectData';
import { pushState } from 'redux-router';
import { isLoaded as isMeetingLoaded,
         load as loadMeeting } from 'redux/modules/meeting';
import * as socketActions from 'redux/modules/socket';
import * as meetingActions from 'redux/modules/meeting';
import { MeetingHeader, MeetingNavbar, MeetingSection, UserInput } from 'components';

async function fetchData(getState, dispatch, location, params) { // eslint-disable-line no-unused-vars
  if (!isMeetingLoaded(getState())) {
    if (params && params.id) {
      await dispatch(loadMeeting(params.id));
    }
  }
}

const exampleSections = [
  {
    id: 0,
    active: false,
    position: 'I.',
    heading: 'Check-In',
    description: 'The facilitator announces, “check-in round!” and asks each participant, “what’s on your mind that might keep you from being fully present?”'
  },
  {
    id: 1,
    active: true,
    position: 'II.',
    heading: 'Project Updates',
    description: 'For each project, the owner gives an update only on what’s changed since last meeting. New agenda items can be added by anyone.'
  },
  {
    id: 2,
    active: false,
    position: 'III.',
    heading: 'Agenda',
    description: 'Process each agenda item into new projects and actions. Assign items using @Mentions. Remember: an action can be completed quickly, while a project may live for multiple Action meetings until it’s completed.'
  }
];

const exampleInput = {
  active: false,
  activeLabelMessage: '@User is editing',
  placeholder: 'Type something here',
  type: 'text',
  value: ''
};

const exampleInputActive = {
  ...exampleInput,
  active: true,
  value: 'Somebody is typing here…'
};

@connectData(fetchData)
@connect(
  state => ({
    location: state.router.location.pathname,
    meeting: state.meeting,
    socketId: state.socket.id
  }),
  {...socketActions, ...meetingActions, pushState})
@cssModules(styles)
export default class MeetingLayout extends Component {
  static propTypes = {
    location: PropTypes.string.isRequired,
    meeting: PropTypes.object.isRequired,
    roomJoin: PropTypes.func.isRequired,
    roomLeave: PropTypes.func.isRequired,
    socketId: PropTypes.string.isRequired,
    subscribe: PropTypes.func.isRequired,
    unsubscribe: PropTypes.func.isRequired,
    updateContent: PropTypes.func.isRequired,
    updateEditing: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { roomJoin, location, subscribe, meeting } = this.props;
    roomJoin(location);
    subscribe(location, meeting.instance.id);
  }

  componentWillUnmount() {
    const { roomLeave, location, unsubscribe, meeting } = this.props;
    roomLeave(location);
    unsubscribe(location, meeting.instance.id);
  }

  render() {
    const { props } = this;
    const handleOnLeaveMeetingClick = () => {
      console.log('handleOnLeaveMeetingClick');
    };

    const handleUserInputFocus = () => {
      const { updateEditing, meeting, socketId } = this.props;
      updateEditing(meeting.instance.id, true, socketId);
    };

    const handleUserInputBlur = () => {
      const { updateEditing, meeting, socketId } = this.props;
      updateEditing(meeting.instance.id, false, socketId);
    };

    const handleUserInputChange = (event) => {
      const { updateContent, meeting, socketId } = this.props;
      updateContent(meeting.instance.id, event.target.value, socketId);
    };

    const handleOnMeetingNameChange = () => {
      console.log('handleOnMeetingNameChange');
    };

    const exampleMeetingName = 'Core Action Meeting';

    return (
      <div styleName="root">
        <Helmet title={exampleMeetingName} />
        <MeetingNavbar onLeaveMeetingClick={handleOnLeaveMeetingClick} />
        <div styleName="main">
          <MeetingHeader onMeetingNameChange={handleOnMeetingNameChange} meetingName={exampleMeetingName} meetingLocation={props.location} />
          <MeetingSection {...exampleSections[0]} key={exampleSections[0].id}>
            <UserInput {...exampleInput}
              active={props.meeting.otherEditing}
              value={props.meeting.instance.content}
              onUserInputChange={handleUserInputChange}
              onUserInputFocus={handleUserInputFocus}
              onUserInputBlur={handleUserInputBlur}
            />
          </MeetingSection>
          <MeetingSection {...exampleSections[1]} key={exampleSections[1].id}>
            <UserInput {...exampleInputActive} onUserInputChange={handleUserInputChange} />
          </MeetingSection>
          <MeetingSection {...exampleSections[2]} key={exampleSections[2].id}>
            <UserInput {...exampleInput} onUserInputChange={handleUserInputChange} />
          </MeetingSection>
        </div>
      </div>
    );
  }
}
