import React, { Component } from 'react';
import look, { StyleSheet } from 'react-look';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup2InviteTeam extends Component {
  render() {
    return (
      <SetupContent>
        <ProgressDots />
        <SetupHeader
          heading="Invite team members"
          subHeadingInnerHTML="What’s <i>one outcome</i> each person is working on this week?"
        />
        <SetupField
          inputType="text"
          onButtonClick={() => console.log('SetupField.onButtonClick')}
          onInputClick={() => console.log('SetupField.onInputClick')}
          placeholderText="Project outcome realized*"
        />
      </SetupContent>
    );
  }
}
