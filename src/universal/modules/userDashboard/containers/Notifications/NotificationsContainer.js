import React, {Component, PropTypes} from 'react';
import {TRIAL_EXPIRES_SOON, REQUEST_NEW_USER} from 'universal/utils/constants';
import {NOTIFICATIONS} from 'universal/utils/constants';
import Notifications from 'universal/modules/userDashboard/components/Notifications/Notifications';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

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
  {
    type: TRIAL_EXPIRES_SOON,
    varList: [
      new Date(),
      'org123'
    ]
  },
  {
    type: REQUEST_NEW_USER,
    varList: [
      'Terry',
      'terry123',
      'jordan@foo.co',
      'Team Kickass',
      'team987'
    ]
  }
];

const teamProjectsHeaderQuery = `
query {
  notifications @live {
    id
    isTrial
    activeUserCount
    inactiveUserCount
    name
    picture
  }
}
`;

const mapStateToProps = (state, props) => {
  // const {notifications} = cashay.query(teamProjectsHeaderQuery, {
  //   op: 'organizationsContainer',
  //   sort: {
  //     notifications: (a, b) => a.name > b.name ? 1 : -1
  //   }
  // }).data;
  return {
    // notifications
  };
};

const NotificationsContainer = (props) => {
  // const {notifications} = props;
  return (
    <Notifications notifications={notifications}/>
  );
};

export default connect(mapStateToProps)(NotificationsContainer);

// export default class NotificationsContainer extends Component {
//   render() {
//     return (
//       <UserSettingsWrapper activeTab={NOTIFICATIONS}>
//         <div>
//           Notifications: {notifications.map((notification) =>
//           <NotificationRow
//             key={`notification${notification}`}
//             type={notification.type}
//             varList={notification.varList}
//           />
//         )}
//         </div>
//       </UserSettingsWrapper>
//     );
//   }
// }
