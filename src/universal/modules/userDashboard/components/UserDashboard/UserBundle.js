import Bundle from '../../../../components/Bundle/Bundle';
import React from 'react';
import resolveDefault from '../../../../utils/resolveDefault';

const UserBundle = () => {
  const promises = {
    component: import('universal/modules/userDashboard/components/UserDashboard/UserDashboard').then(resolveDefault),
    userDashboard: import('universal/modules/userDashboard/ducks/userDashDuck').then(resolveDefault)
  };
  return (
    <Bundle promises={promises} />
  );
};

export default UserBundle;
