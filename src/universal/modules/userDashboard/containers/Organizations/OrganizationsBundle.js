import Bundle from '../../../../components/Bundle/Bundle';
import React from 'react';
import resolveDefault from '../../../../utils/resolveDefault';

const OrganizationsBundle = () => {
  const promises = {
    component: import('universal/modules/userDashboard/containers/Organizations/OrganizationsContainer').then(resolveDefault)
  };
  return (
    <Bundle promises={promises} />
  );
};

export default OrganizationsBundle;
