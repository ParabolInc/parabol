import React, {Component, PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {ORGANIZATIONS} from 'universal/utils/constants';

export default class Organizations extends Component {
  render() {
    return (
      <UserSettingsWrapper activeTab={ORGANIZATIONS}>
        <div>
          Welcome to orgs!
        </div>
      </UserSettingsWrapper>
    );
  }
}
