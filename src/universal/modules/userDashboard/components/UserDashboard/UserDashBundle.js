import Bundle from '../../../../components/Bundle/Bundle';
import React from 'react';
import resolveDefault from '../../../../utils/resolveDefault';

const UserDashBundle = () => {
  const promises = {
    component: import('universal/modules/userDashboard/components/UserDashMain/UserDashMain').then(resolveDefault)
  };
  return (
    <Bundle promises={promises} />
  );
};

export default UserDashBundle;
