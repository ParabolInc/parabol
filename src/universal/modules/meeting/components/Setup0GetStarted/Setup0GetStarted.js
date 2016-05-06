import React, { Component, PropTypes } from 'react';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import { NAVIGATE_SETUP_1_INVITE_TEAM } from '../../ducks/meeting.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup0GetStarted extends Component {
  static propTypes = {
    dispatch: PropTypes.func
  }
  render() {
    const { dispatch } = this.props;

    const onClick = (event) => {
      event.preventDefault();
      dispatch({ type: NAVIGATE_SETUP_1_INVITE_TEAM });
    };

    return (
      <SetupContent>
        <ProgressDots />
        <SetupHeader
          heading="Let’s get started!"
          subHeadingString="What do you call your team?"
        />
        <SetupField
          buttonIcon="check-circle"
          hasButton
          hasShortcutHint
          inputType="text"
          isLarger
          onButtonClick={() => console.log('SetupField.onButtonClick')}
          onInputFocus={() => console.log('SetupField.onInputFocus')}
          placeholderText="Team name"
          shortcutHint="Press enter"
        />
        <AdvanceLink
          onClick={onClick}
          icon="arrow-circle-right"
          label="Set-up"
        />
      </SetupContent>
    );
  }
}
