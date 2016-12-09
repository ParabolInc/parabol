import React, {Component, PropTypes} from 'react';
import {cashay} from 'cashay';
import {TRIAL_EXPIRES_SOON, APPROVE_TO_ORG} from 'universal/modules/notifications/notificationList';

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
    varList: [
      new Date(),
      'org123'
    ]
  }
];

export default class NotificationsContainer extends Component {
  render() {
    const {}
    return (
      <div>
        Notifications: {notifications.map((notification) =>
          <Notification
            key={`notification${notification}`}
            type={notification.type}
            varList={notification.varList}
          />
      )}
      </div>
    );
  }
}
