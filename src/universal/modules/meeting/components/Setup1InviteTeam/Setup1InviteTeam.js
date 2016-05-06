import React, { Component } from 'react';
import look, { StyleSheet } from 'react-look';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup1InviteTeam extends Component {
  render() {
    return (
      <SetupContent>
        <ProgressDots />
        <SetupHeader
          heading="Invite team members"
          subHeading="Who will be joining you?"
        />
        <SetupField
          buttonIcon="check-circle"
          hasButton
          hasHelpText
          helpText="*You can paste a comma-separated string of multiple emails."
          inputType="text"
          isLarger
          isWider
          onButtonClick={() => console.log('SetupField.onButtonClick')}
          onInputClick={() => console.log('SetupField.onInputClick')}
          placeholderText="Search users or invite by email*"
        />
      </SetupContent>
    );
  }
}
