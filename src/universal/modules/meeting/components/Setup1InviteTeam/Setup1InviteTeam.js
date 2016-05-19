import React, { Component, PropTypes } from 'react';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupField from '../../components/SetupField/SetupField';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import {
  NAVIGATE_SETUP_2_INVITE_TEAM,
  addInvitesFromInvitesField,
  updateInvitesField
} from '../../ducks/meeting.js';

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup1InviteTeam extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uiState: PropTypes.object.isRequired
  }
  render() {
    const { dispatch, uiState } = this.props;

    const handleNavigateToNextStep = (event) => {
      event.preventDefault();
      dispatch({ type: NAVIGATE_SETUP_2_INVITE_TEAM });
    };

    const onChangeInvites = (event) => {
      event.preventDefault();
      dispatch(updateInvitesField(event.target.value));
    };

    const onSubmitInvites = (event, emails) => {
      event.preventDefault();
      dispatch(addInvitesFromInvitesField(emails));
      handleNavigateToNextStep(event);
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
          subHeading={<span>Who will be joining you?</span>}
        />
        <SetupField
          buttonIcon="check-circle"
          hasButton
          hasHelpText
          helpText="*You can paste a comma-separated string of multiple emails."
          type="text"
          isLarger
          isWider
          onButtonClick={(event) => onSubmitInvites(event, uiState.setup1.invitesField)}
          onChange={onChangeInvites}
          onFocus={() => console.log('SetupField.onFocus')}
          placeholder="Search users or invite by email*"
          value={uiState.setup1.invitesField}
        />
      </SetupContent>
    );
  }
}
