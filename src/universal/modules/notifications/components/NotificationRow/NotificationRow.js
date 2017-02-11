import React, {Component, PropTypes} from 'react';
import typePicker from 'universal/modules/notifications/helpers/typePicker';

const NotificationRow = (props) => {
  const {notificationId, orgId, type, varList} = props;
  const NotificationType = typePicker[type];
  return <NotificationType orgId={orgId} notificationId={notificationId} varList={varList}/>;
};

export default NotificationRow;

