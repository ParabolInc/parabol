import Bundle from '../../../../components/Bundle/Bundle';
import React from 'react';
import resolveDefault from '../../../../utils/resolveDefault';

const UserSettingsBundle = () => {
  const promises = {
    component: import('universal/modules/userDashboard/containers/UserSettings/UserSettingsContainer').then(resolveDefault),
    userDashboardSettings: import('universal/modules/userDashboard/ducks/settingsDuck').then(resolveDefault)
  };
  return (
    <Bundle promises={promises} />
  );
};

export default UserSettingsBundle;
