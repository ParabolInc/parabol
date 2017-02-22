import React, {PropTypes} from 'react';
import typePicker from 'universal/modules/notifications/helpers/typePicker';

const NotificationRow = (props) => {
  const {notificationId, orgId, type, varList} = props;
  const NotificationType = typePicker[type];
  return <NotificationType orgId={orgId} notificationId={notificationId} varList={varList}/>;
};

NotificationRow.propTypes = {
  notificationId: PropTypes.string.isRequired,
  orgId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  varList: PropTypes.array.isRequired,
};

export default NotificationRow;
