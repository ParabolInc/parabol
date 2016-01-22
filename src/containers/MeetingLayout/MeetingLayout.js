import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { MeetingHeader, MeetingNavbar, MeetingSection, UserInput } from 'components';

import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

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

export default class MeetingLayout extends Component {

  componentWillMount() {
    const model = new falcor.Model({source: new HttpDataSource('/api/model.json') });
    model.
      get('greeting').
      then((response) => {
        console.log(response.json.greeting);
      });
  }

  render() {
    const styles = require('./MeetingLayout.scss');

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
      <div className={styles.root}>
        <Helmet title={exampleMeetingName} />
        <MeetingNavbar onLeaveMeetingClick={() => handleOnLeaveMeetingClick()} />
        <div className={styles.main}>
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
