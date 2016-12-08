import React, {Component, PropTypes} from 'react';
import {cashay} from 'cashay';

const notificationsQuery = `
query {
  notifications(userId: $userId) @live {
    id
    
  }  
}`;

const mapStateToProps = (state) => {
  const {user} = cashay.query(notificationsQuery, {
    op: 'notificationsContainer',
  }).data;
  return {
    user
  }
};

const notifications = [
  {
    type: 'trialExpiresSoon',
    ranges: [

    ]
  }
]
export default class NotificationsContainer extends Component {
  render() {
    const {}
    return (
      <div>
        Notifications: {notifications.map((notification) =>
          <Notification
            key={`notification${notification}`}
            type={notification.type}
            ranges={notification.ranges}
          />
      )}
      </div>
    );
  }
}
