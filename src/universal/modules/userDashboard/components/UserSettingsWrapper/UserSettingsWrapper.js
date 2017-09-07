import PropTypes from 'prop-types';
import React from 'react';
import {DashContent, DashHeader, DashMain} from 'universal/components/Dashboard';
import SettingsHeader from 'universal/modules/userDashboard/components/SettingsHeader/SettingsHeader';


const UserSettingsWrapper = (props) => {
  const {children} = props;
  return (
    <DashMain>
      <DashHeader>
        <SettingsHeader />
      </DashHeader>
      <DashContent padding="0 0 0 1rem">
        {children}
      </DashContent>
    </DashMain>

  );
};

UserSettingsWrapper.propTypes = {
  children: PropTypes.any
};

export default UserSettingsWrapper;
