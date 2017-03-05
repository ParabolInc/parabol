import React, {PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {NOTIFICATIONS} from 'universal/modules/../utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
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
          {notifications.length ?
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
            </div> :
            <div className={css(styles.notificationsEmpty)}>
              {'Hey there! You’re all caught up! 💯'}
            </div>
          }
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

  notificationsEmpty: {
    alignItems: 'center',
    borderTop: `1px solid ${ui.rowBorderColor}`,
    color: appTheme.palette.dark,
    display: 'flex',
    fontSize: appTheme.typography.s5,
    height: '4.8125rem',
    justifyContent: 'center',
    lineHeight: '1.5',
    padding: ui.rowGutter,
    textAlign: 'center',
    width: '100%'
  },

  wrapper: {
    maxWidth: '40rem'
  }
});

export default withStyles(styleThunk)(Notifications);
