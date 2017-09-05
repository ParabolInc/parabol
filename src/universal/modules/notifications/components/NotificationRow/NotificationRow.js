import PropTypes from 'prop-types';
import React from 'react';
import AsyncComponent from 'universal/components/AsyncComponent';
import typePicker from 'universal/modules/notifications/helpers/typePicker';


const NotificationRow = (props) => {
  const {dispatch, notificationId, orgId, type, varList} = props;
  const fetchMod = typePicker[type];
  return (
    <AsyncComponent
      loadingWidth="inherit"
      loadingHeight="5rem"
      fetchMod={fetchMod}
      dispatch={dispatch}
      orgId={orgId}
      notificationId={notificationId}
      varList={varList}
    />
  );
};

NotificationRow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notificationId: PropTypes.string.isRequired,
  orgId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  varList: PropTypes.array.isRequired
};

export default NotificationRow;
