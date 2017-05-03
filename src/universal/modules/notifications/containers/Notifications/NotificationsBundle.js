import Bundle from '../../../../components/Bundle/Bundle';
import React from 'react';
import resolveDefault from '../../../../utils/resolveDefault';

const NotificationsBundle = () => {
  const promises = {
    component: import('universal/modules/notifications/containers/Notifications/NotificationsContainer').then(resolveDefault)
  };
  return (
    <Bundle promises={promises} />
  );
};

export default NotificationsBundle;
