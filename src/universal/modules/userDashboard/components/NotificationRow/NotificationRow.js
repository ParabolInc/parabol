import React, {Component, PropTypes} from 'react';
import notificationPicker from 'universal/modules/userDashboard/NotificationButtons/index';

const NotificationRow = (props) => {
  const {notificationId, type, varList} = props;
  const NotificationType = notificationPicker[type];
  return <NotificationType notificationId={notificationId} varList={varList}/>;
};

export default NotificationRow;

