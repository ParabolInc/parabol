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

const fieldDefault = {
  onChange: onSetupFieldGroupInputChange,
  onBlur: onSetupFieldGroupInputBlur,
  onFocus: onSetupFieldGroupInputFocus,
  placeholder: 'Outcome realized',
  type: 'text'
};

const demoSetupFieldGroup = [
  {
    ...fieldDefault,
    label: 'jordan@parabol.co',
    value: 'Transparency article written'
  },
  {
    ...fieldDefault,
    label: 'matt@parabol.co',
    value: 'UI component state implemented'
  },
  {
    ...fieldDefault,
    label: 'taya@parabol.co',
    value: 'Accounting software researched'
  },
  {
    ...fieldDefault,
    label: 'terry@parabol.co',
    value: ''
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
