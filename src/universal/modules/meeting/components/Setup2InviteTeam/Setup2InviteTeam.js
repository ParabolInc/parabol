import React, { Component } from 'react';
import ProgressDots from '../../components/ProgressDots/ProgressDots';
import SetupContent from '../../components/SetupContent/SetupContent';
import SetupFieldGroup from '../../components/SetupFieldGroup/SetupFieldGroup';
import SetupHeader from '../../components/SetupHeader/SetupHeader';

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

const demoSetupFieldGroup = [
  {
    label: 'jordan@parabol.co',
    input: {
      ...fieldInputDefault,
      value: 'Transparency article written'
    }
  },
  {
    label: 'matt@parabol.co',
    input: {
      ...fieldInputDefault,
      value: 'UI component state implemented'
    }
  },
  {
    label: 'taya@parabol.co',
    input: {
      ...fieldInputDefault,
      value: 'Accounting software researched'
    }
  },
  {
    label: 'ackernaut@longdomainname.com',
    input: {
      ...fieldInputDefault,
      value: ''
    }
  }
];

// eslint-disable-next-line react/prefer-stateless-function
export default class Setup2InviteTeam extends Component {
  render() {
    return (
      <SetupContent>
        <ProgressDots
          numDots={3}
          numCompleted={1}
          currentDot={1}
        />
        <SetupHeader
          heading="Invite team members"
          subHeading={<span>What’s <i>one outcome</i> each person is working on this week?</span>}
        />
        <SetupFieldGroup contentLabel="Invited" fields={demoSetupFieldGroup} fieldLabel="Outcome" />
      </SetupContent>
    );
  }
}
