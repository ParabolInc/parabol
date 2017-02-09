import React, {Component, PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {NOTIFICATIONS} from 'universal/modules/../utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import NotificationRow from 'universal/modules/notifications/components/NotificationRow/NotificationRow';
import Panel from 'universal/components/Panel/Panel';

const Notifications = (props) => {
  const {
    notifications,
    styles
  } = props;

  return (
    <UserSettingsWrapper settingsLocation={NOTIFICATIONS}>
      <div className={css(styles.wrapper)}>
        <Panel label="Notifications">
          <div className={css(styles.notificationList)}>
            {notifications.map((notification) =>
              <NotificationRow
                key={`notification${notification.id}`}
                orgId={notification.orgId}
                notificationId={notification.id}
                type={notification.type}
                varList={notification.varList}
              />
            )}
          </div>
        </Panel>
      </div>
    </UserSettingsWrapper>
  );
};

Notifications.propTypes = {
  notifications: PropTypes.array,
  router: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  notificationList: {
    // Define
  },

  wrapper: {
    maxWidth: '40rem'
  }
});

export default withStyles(styleThunk)(Notifications);
