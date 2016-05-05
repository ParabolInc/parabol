import React, { Component } from 'react';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupHeader from '../../components/SetupHeader/SetupHeader';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup1InviteTeam extends Component {
  render() {
    return (
      <div>
        <ProgressDots />
        <SetupHeader
          heading="Invite team members"
          subHeading="Who will be joining you?"
        />
      </div>
    );
  }
}
