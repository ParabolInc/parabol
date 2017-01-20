import React, {PropTypes} from 'react';
import {
  DashContent,
  DashHeader,
  DashMain
} from 'universal/components/Dashboard';
import SettingsTabs from 'universal/modules/userDashboard/components/SettingsTabs/SettingsTabs';
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

const mapStateToProps = (state, props) => {
  const {notifications} = cashay.query(notificationsQuery, {
    // identical to the other, so leave it be since we only need the count
    op: 'notificationsContainer',
    sort: {
      notifications: (a, b) => a.startAt > b.startAt ? 1 : -1
    }
  }).data;
  return {
    notificationCount: notifications.length
  };
};

const UserSettings = (props) => {
  const {activeTab, children, notificationCount} = props;
  return (
    <DashMain>
      <DashHeader>
        <SettingsTabs activeTab={activeTab} notificationCount={notificationCount}/>
      </DashHeader>
      <DashContent padding="0 0 0 1rem">
        {children}
      </DashContent>
    </DashMain>

  );
};

UserSettings.propTypes = {
  activeTab: PropTypes.string,
  children: PropTypes.any
};

export default connect(mapStateToProps)(UserSettings);
