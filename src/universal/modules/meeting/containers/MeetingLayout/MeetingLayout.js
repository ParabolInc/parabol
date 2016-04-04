import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import cssModules from 'react-css-modules';
import styles from './MeetingLayout.scss';
import { connect } from 'react-redux';
import {MeetingHeader} from '../../components/MeetingHeader/MeetingHeader';
import {MeetingNavbar} from '../../components/MeetingNavbar/MeetingNavbar';
import {MeetingSection} from '../../components/MeetingSection/MeetingSection';
import {UserInput} from '../../components/UserInput/UserInput';
import {ensureState} from 'redux-optimistic-ui';
import {reduxSocket} from 'redux-socket-cluster';
import {localStorageVars} from 'universal/utils/clientOptions';


// async function fetchData(getState, dispatch, location, params) { // eslint-disable-line no-unused-vars
//   if (!isMeetingLoaded(getState())) {
//     if (params && params.id) {
//       await dispatch(loadMeeting(params.id));
//     }
//   }
// }

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

// const mapStateToProps = state => ({
//   location: state.router.location.pathname,
//   meeting: state.meeting,
//   socketId: state.socket.id
// });

function mapStateToProps(state) {
  state = ensureState(state);
  const auth = state.get('auth');
  const meeting = state.get('meeting');
  return {
    meeting: meeting && meeting.toJS(),
    userId: auth.getIn(['user', 'id']),
    socketState: state.getIn(['socket', 'socketState']),
    isAuthenticated: auth.get('isAuthenticated')
  };
}

@connect(mapStateToProps)
@reduxSocket({authTokenName: localStorageVars.authTokenName})
@cssModules(styles)
export default class MeetingLayout extends Component {
  // static propTypes = {
  //   location: PropTypes.string.isRequired,
  //   meeting: PropTypes.object.isRequired,
  //   roomJoin: PropTypes.func.isRequired,
  //   roomLeave: PropTypes.func.isRequired,
  //   socketId: PropTypes.string.isRequired,
  //   subscribe: PropTypes.func.isRequired,
  //   unsubscribe: PropTypes.func.isRequired,
  //   updateContent: PropTypes.func.isRequired,
  //   updateEditing: PropTypes.func.isRequired,
  //   pushState: PropTypes.func.isRequired
  // }

  // componentDidMount() {
  //   const { roomJoin, location, subscribe, meeting } = this.props;
  //   roomJoin(location);
  //   subscribe(location, meeting.instance.id);
  // }
  //
  // componentWillUnmount() {
  //   const { roomLeave, location, unsubscribe, meeting } = this.props;
  //   roomLeave(location);
  //   unsubscribe(location, meeting.instance.id);
  // }
  constructor(props) {
    super(props);
    const {dispatch, socketState, meeting} = props;
    if (socketState === 'closed') {
      // TODO this is ugly, but we'll have to use this until i finish building Cashay
      dispatch(loadMeeting(meeting.id));
    }
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

    const handleUserInputChangeMocked = () => {
      console.log('handleUserInputChangeMocked');
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
          <MeetingHeader onMeetingNameChange={handleOnMeetingNameChange} meetingName={exampleMeetingName} />
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
            <UserInput {...exampleInputActive} onUserInputChange={handleUserInputChangeMocked} />
          </MeetingSection>
          <MeetingSection {...exampleSections[2]} key={exampleSections[2].id}>
            <UserInput {...exampleInput} onUserInputChange={handleUserInputChangeMocked} />
          </MeetingSection>
        </div>
      </div>
    );
  }
}
