import PropTypes from 'prop-types';
import React from 'react';
import {DashContent, DashHeader, DashMain} from 'universal/components/Dashboard';
import SettingsHeader from 'universal/modules/userDashboard/components/SettingsHeader/SettingsHeader';
import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const SettingsContentBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  maxWidth: ui.settingsPanelMaxWidth,
  width: '100%'
});

const UserSettingsWrapper = (props) => {
  const {children} = props;
  return (
    <DashMain>
      <DashHeader area="userSettings">
        <SettingsHeader />
      </DashHeader>
      <DashContent padding="0 0 0 1rem">
        <SettingsContentBlock>
          {children}
        </SettingsContentBlock>
      </DashContent>
    </DashMain>

  );
};

UserSettingsWrapper.propTypes = {
  children: PropTypes.any
};

export default UserSettingsWrapper;
