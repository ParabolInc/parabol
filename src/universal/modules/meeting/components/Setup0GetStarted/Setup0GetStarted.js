import React, { Component, PropTypes } from 'react';
import AdvanceLink from '../../components/AdvanceLink/AdvanceLink';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
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
      <div>
        <ProgressDots />
        <SetupHeader
          heading="Let’s get started!"
          subHeading="What do you call your team?"
        />
        <AdvanceLink
          onClick={onClick}
          icon="arrow-circle-right"
          label="Set-up"
        />
      </div>
    );
  }
}
