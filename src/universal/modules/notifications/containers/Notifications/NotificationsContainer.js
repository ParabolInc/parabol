import React, {PropTypes} from 'react';
import Notifications from 'universal/modules/notifications/components/Notifications/Notifications';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const notificationsQuery = `
query {
  notifications(userId: $userId) @live {
    id
    orgId
    startAt
    type
    varList
  }
}`;

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {notifications} = cashay.query(notificationsQuery, {
    op: 'notificationsContainer',
    key: userId,
    sort: {
      notifications: (a, b) => a.startAt > b.startAt ? 1 : -1
    },
    filter: {
      // on the server, we currently send notifications that will start up to 1 day later,
      // let's filter those out here so we can maintain the illusion of realtime
      notifications: (notification) => notification.startAt < new Date()
    },
    variables: {
      userId
    }
  }).data;
  return {
    notifications
  };
};

const NotificationsContainer = (props) => {
  const {notifications} = props;
  return (
    <Notifications notifications={notifications}/>
  );
};

NotificationsContainer.propTypes = {
  notifications: PropTypes.array.isRequired
};

export default connect(mapStateToProps)(NotificationsContainer);
