import React, {Component, PropTypes} from 'react';
import {TRIAL_EXPIRES_SOON, REQUEST_NEW_USER} from 'universal/utils/constants';
import Notification from 'universal/modules/userDashboard/components/Notification/Notification';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {NOTIFICATIONS} from 'universal/utils/constants';

// const notificationsQuery = `
// query {
//   notifications(userId: $userId) @live {
//     id
//
//   }
// }`;
//
// const mapStateToProps = (state) => {
//   const {user} = cashay.query(notificationsQuery, {
//     op: 'notificationsContainer',
//   }).data;
//   return {
//     user
//   }
// };

const notifications = [
  // {
  //   type: TRIAL_EXPIRES_SOON,
  //   varList: [
  //     new Date(),
  //     'org123'
  //   ]
  // }
];

export default class NotificationsContainer extends Component {
  render() {
    return (
      <UserSettingsWrapper activeTab={NOTIFICATIONS}>
        <div>
          Notifications: {notifications.map((notification) =>
          <Notification
            key={`notification${notification}`}
            type={notification.type}
            varList={notification.varList}
          />
        )}
        </div>
      </UserSettingsWrapper>
    );
  }
}
