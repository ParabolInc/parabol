import PropTypes from 'prop-types';
import React from 'react';
import AsyncComponent from 'universal/components/AsyncComponent';
import typePicker from 'universal/modules/notifications/helpers/typePicker';


const NotificationRow = (props) => {
  const {dispatch, notification} = props;
  const {type} = notification;
  const fetchMod = typePicker[type];
  return (
    <AsyncComponent
      loadingWidth="inherit"
      loadingHeight="5rem"
      fetchMod={fetchMod}
      dispatch={dispatch}
      notification={notification}
    />
  );
};

NotificationRow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    orgId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
    // See the Notification interface for full list
  })
};

export default NotificationRow;
