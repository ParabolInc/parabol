import React, {PropTypes} from 'react';
import {
  DashContent,
  DashHeader,
  DashMain
} from 'universal/components/Dashboard';
import SettingsHeader from 'universal/modules/userDashboard/components/SettingsHeader/SettingsHeader';
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

const mapStateToProps = (state) => {
  const {notifications} = cashay.query(notificationsQuery, {
    op: 'userSettingsWrapper',
    sort: {
      notifications: (a, b) => a.startAt > b.startAt ? 1 : -1
    },
    variables: {
      userId: state.auth.obj.sub
    }
  }).data;
  return {
    notificationCount: notifications.length
  };
};

const UserSettings = (props) => {
  const {settingsLocation, children} = props;
  return (
    <DashMain>
      <DashHeader>
        <SettingsHeader location={settingsLocation} />
      </DashHeader>
      <DashContent padding="0 0 0 1rem">
        {children}
      </DashContent>
    </DashMain>

  );
};

UserSettings.propTypes = {
  notificationCount: PropTypes.number,
  settingsLocation: PropTypes.string,
  children: PropTypes.any
};

export default connect(mapStateToProps)(UserSettings);
