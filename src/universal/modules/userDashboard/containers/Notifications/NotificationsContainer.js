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

export default class NotificationsContainer extends Component {
  render() {
    const {}
    return (
      <div>
        Notifications: {user}
      </div>
    );
  }
}
