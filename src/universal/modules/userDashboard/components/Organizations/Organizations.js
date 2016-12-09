import React, {Component, PropTypes} from 'react';
import {
  DashContent,
  DashHeader,
  DashMain
} from 'universal/components/Dashboard';
import SettingsTabs from 'universal/modules/userDashboard/components/SettingsTabs/SettingsTabs';

export default class Organizations extends Component {
  render() {
    return (
      <DashMain>
        <DashHeader>
          <SettingsTabs activeIdx={1}/>
        </DashHeader>
        <DashContent padding="0">
          Welcome to orgs!
        </DashContent>
      </DashMain>
    );
  }
}
