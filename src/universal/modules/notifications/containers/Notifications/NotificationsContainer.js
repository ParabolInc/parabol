import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Notifications from 'universal/modules/notifications/components/Notifications/Notifications';

const NotificationsContainer = (props) => {
  const {dispatch, notifications} = props;
  // to avoid a waterfall we push notifications down the DOMs throat, but here it's worth the wait
  if (!notifications) return null;
  return (
    <Notifications dispatch={dispatch} notifications={notifications} />
  );
};

NotificationsContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notifications: PropTypes.object
};

export default connect()(NotificationsContainer);
