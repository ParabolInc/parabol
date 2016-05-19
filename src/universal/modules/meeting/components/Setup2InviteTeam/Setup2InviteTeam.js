import React, { Component, PropTypes } from 'react';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupFieldGroup from '../../components/SetupFieldGroup/SetupFieldGroup';
import SetupHeader from '../../components/SetupHeader/SetupHeader';
import * as _ from 'lodash';
import { removeInvitee } from '../../ducks/meeting.js';

const onSetupFieldGroupInputChange = () => {
  console.log('onSetupFieldGroupInputChange()');
};

const onSetupFieldGroupInputBlur = () => {
  console.log('onSetupFieldGroupInputBlur()');
};

const onSetupFieldGroupInputFocus = () => {
  console.log('onSetupFieldGroupInputFocus()');
};

const fieldInputDefault = {
  onChange: onSetupFieldGroupInputChange,
  onBlur: onSetupFieldGroupInputBlur,
  onFocus: onSetupFieldGroupInputFocus,
  placeholder: 'Outcome realized',
  type: 'text'
};

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup2InviteTeam extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    uiState: PropTypes.object.isRequired
  };

  render() {
    const {dispatch, uiState} = this.props;

    const onInviteeRemove = (label) => {
      dispatch(removeInvitee(label));
    };

    const fieldGroup = _.map(uiState.setup1.emails, (emailItem) => {
      const label = emailItem.name || emailItem.address;
      return ({
        button: {
          onClick: () => onInviteeRemove(label)
        },
        input: {
          ... fieldInputDefault,
          value: ''
        },
        label
      });
    });

    return (
      <SetupContent>
        <ProgressDots
          numDots={3}
          numCompleted={3}
          currentDot={3}
        />
        <SetupHeader
          heading="Invite team members"
          subHeading={<span>What’s <i>one outcome</i> each person is working on this week?</span>}
        />
        <SetupFieldGroup contentLabel="Invited" fields={fieldGroup} fieldLabel="Outcome" />
      </SetupContent>
    );
  }
}
