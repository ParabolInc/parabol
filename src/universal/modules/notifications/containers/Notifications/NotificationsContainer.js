import React, {Component, PropTypes} from 'react';
import Notifications from 'universal/modules/notifications/components/Notifications/Notifications';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const notificationsQuery = `
query {
  notifications(userId: $userId) @live {
    id
    startAt
    type
    varList
  }
}`;
//
// const mapStateToProps = (state) => {
//   const {user} = cashay.query(notificationsQuery, {
//     op: 'notificationsContainer',
//   }).data;
//   return {
//     user
//   }
// };

// const notifications = [
//   {
//     id: '1',
//     type: TRIAL_EXPIRES_SOON,
//     varList: [
//       new Date(),
//       'org123'
//     ]
//   },
//   {
//     id: '2',
//     type: REQUEST_NEW_USER,
//     varList: [
//       'Terry',
//       'terry123',
//       'jordan@foo.co',
//       'Team Kickass',
//       'team987'
//     ]
//   }
// ];

const mapStateToProps = (state, props) => {
  const {notifications} = cashay.query(notificationsQuery, {
    op: 'notificationsContainer',
    sort: {
      notifications: (a, b) => a.startAt > b.startAt ? 1 : -1
    },
    variables: {
      userId: state.auth.obj.sub
    }
  }).data;
  return {
    notifications
  };
};

const NotificationsContainer = (props) => {
  const {notifications} = props;
  console.log('no', notifications);
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
