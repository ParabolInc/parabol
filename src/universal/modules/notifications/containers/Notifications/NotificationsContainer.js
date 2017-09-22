import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Notifications from 'universal/modules/notifications/components/Notifications/Notifications';

const NotificationsContainer = (props) => {
  const {dispatch, notifications} = props;
  return (
    <Notifications dispatch={dispatch} notifications={notifications} />
  );
};

NotificationsContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  notifications: PropTypes.object
};

export default connect()(NotificationsContainer);
