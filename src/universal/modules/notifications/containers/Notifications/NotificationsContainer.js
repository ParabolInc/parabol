import React, {Component, PropTypes} from 'react';
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

const mapStateToProps = (state, props) => {
  const userId = state.auth.obj.sub;
  const {notifications} = cashay.query(notificationsQuery, {
    op: 'notificationsContainer',
    key: userId,
    sort: {
      notifications: (a, b) => a.startAt > b.startAt ? 1 : -1
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

export default connect(mapStateToProps)(NotificationsContainer);

// export default class NotificationsContainer extends Component {
//   render() {
//     return (
//       <UserSettingsWrapper settingsLocation={NOTIFICATIONS}>
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
