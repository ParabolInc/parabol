import React, {Component, PropTypes} from 'react';
import notificationPicker from 'universal/modules/userDashboard/NotificationButtons/index';

const NotificationRow = (props) => {
  const {type, styles, varList} = props;
  const NotificationType = notificationPicker[type];
  return <NotificationType varList={varList}/>;
};

export default NotificationRow;

