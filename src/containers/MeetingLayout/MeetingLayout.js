import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import cssModules from 'react-css-modules';
import styles from './MeetingLayout.scss';
import { connect } from 'react-redux';
import connectData from 'helpers/connectData';
import { pushState } from 'redux-router';
import { isLoaded as isMeetingLoaded,
         load as loadMeeting } from 'redux/modules/meeting';
import { MeetingHeader, MeetingNavbar, MeetingSection, UserInput } from 'components';

async function fetchData(getState, dispatch, location, params) { // eslint-disable-line
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
  value: 'Something was typed here'
};

const exampleInputActive = {
  ...exampleInput,
  active: true,
  value: 'Somebody is typing here…'
};

@connectData(fetchData)
@connect(
  state => ({
    meeting: state.meeting
  }),
  {pushState})
@cssModules(styles)
export default class MeetingLayout extends Component {
  static propTypes = {
    meeting: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired
  }

  componentWillMount() {
  /*
   * This here code is going to hangout as a reference until these patterns
   * are used elsewhere...
   *
    const model = new falcor.Model({source: new HttpDataSource('/api/model.json') });

    model.
      getValue('meetings.length')
      .then((response) => {
        console.log('meetings.length: ' + JSON.stringify(response));
      });

    model.
      get('meetings[0..1]["id", "content"]')
      .then((response) => {
        console.log('meetings[0..1]: ' + JSON.stringify(response));
        const setReq = {
          json: {
            meetingsById: {
              'bd8d468d-a330-4a13-b916-9ff46be54f3e': {
                content: 'this is some new content'
              }
            }
          }
        };
        setReq.json.meetingsById[response.json.meetings['0'].id] = {
          'content': 'whoa!'
        };
        model.
          set(setReq)
          .then((setResponse) => {
            console.log('set(meetings[0]):' + JSON.stringify(setResponse));
          });
      });
    model.
      getValue('meetings.length')
      .then((length) => {
        const rando = Math.floor(Math.random() * (length + 1));
        model.getValue(['meetings', rando, 'id']).then((id) => {
          console.log('meeting[', rando, ']["id"] = ', id);
          model.call('meetingsById.delete', [id]).then((response) => {
            console.log('delete suceeded: ', response);
          })
          .catch( (error) => console.log(error));
        });
      });

    model.
      call('meetings.create', [{
        content: 'snow day today' }],
        ['id', 'content', 'createdAt']
      )
      .then((response) => {
        console.log('meetings.create: ' + JSON.stringify(response));
      })
      .catch((response) => {
        console.log('meetings.create (error): ' + JSON.stringify(response));
      });
  */
  }

  render() {
    const handleOnLeaveMeetingClick = () => {
      console.log('handleOnLeaveMeetingClick');
    };

    const handleUserInputChange = () => {
      console.log('handleUserInputChange');
    };

    const handleOnMeetingNameChange = () => {
      console.log('handleOnMeetingNameChange');
    };

    const exampleMeetingName = 'Core Action Meeting';

    return (
      <div styleName="root">
        <Helmet title={exampleMeetingName} />
        <MeetingNavbar onLeaveMeetingClick={() => handleOnLeaveMeetingClick()} />
        <div styleName="main">
          <MeetingHeader onMeetingNameChange={() => handleOnMeetingNameChange()} meetingName={exampleMeetingName} />
          <MeetingSection {...exampleSections[0]} key={exampleSections[0].id}>
            <UserInput {...exampleInput} onUserInputChange={() => handleUserInputChange()} />
          </MeetingSection>
          <MeetingSection {...exampleSections[1]} key={exampleSections[1].id}>
            <UserInput {...exampleInputActive} onUserInputChange={() => handleUserInputChange()} />
          </MeetingSection>
          <MeetingSection {...exampleSections[2]} key={exampleSections[2].id}>
            <UserInput {...exampleInput} onUserInputChange={() => handleUserInputChange()} />
          </MeetingSection>
        </div>
      </div>
    );
  }
}
