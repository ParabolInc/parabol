import React, { Component } from 'react';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup2InviteTeam extends Component {
  render() {
    const onInputFocus = (event) => {
      event.preventDefault();
      console.log('SetupField.onInputFocus()');
    };

    return (
      <SetupContent>
        <ProgressDots
          numDots={3}
          numCompleted={2}
          currentDot={2}
        />
        <SetupHeader
          heading="Invite team members"
          subHeading={<span>What’s <i>one outcome</i> each person is working on this week?</span>}
        />
        <SetupField
          inputType="text"
          onInputFocus={onInputFocus}
          placeholderText="Project outcome realized"
        />
        <SetupField
          inputType="text"
          onInputFocus={onInputFocus}
          placeholderText="Project outcome realized"
        />
        <SetupField
          inputType="text"
          onInputFocus={onInputFocus}
          placeholderText="Project outcome realized"
        />
        <SetupField
          inputType="text"
          onInputFocus={onInputFocus}
          placeholderText="Project outcome realized"
        />
      </SetupContent>
    );
  }
}
