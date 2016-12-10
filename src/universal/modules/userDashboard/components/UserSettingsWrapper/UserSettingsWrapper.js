import React, {PropTypes} from 'react';
import {
  DashContent,
  DashHeader,
  DashMain
} from 'universal/components/Dashboard';
import SettingsTabs from 'universal/modules/userDashboard/components/SettingsTabs/SettingsTabs';

const UserSettings = (props) => {
  const {activeTab, children} = props;
  return (
    <DashMain>
      <DashHeader>
        <SettingsTabs activeTab={activeTab}/>
      </DashHeader>
      <DashContent padding="0 0 0 1rem">
        {children}
      </DashContent>
    </DashMain>

  );
};

UserSettings.propTypes = {
  activeTab: PropTypes.string,
  children: PropTypes.any
};

export default UserSettings;
