import React, {PropTypes} from 'react';
import UserSettingsWrapper from '../../../userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {NOTIFICATIONS} from '../../../../utils/constants';
import withStyles from '../../../../styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {withRouter} from 'react-router';
import Panel from 'universal/components/Panel/Panel';
import NotificationRow from '../../../userDashboard/components/NotificationRow/NotificationRow';

const Notifications = (props) => {
  const {
    notifications,
    router,
    styles
  } = props;

  return (
    <UserSettingsWrapper activeTab={NOTIFICATIONS}>
      <div className={css(styles.wrapper)}>
        <Panel label="Notifications">
          <div className={css(styles.notificationList)}>
            {notifications.map((notification) =>
              <NotificationRow
                key={`notification${notification.id}`}
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

export default withRouter(withStyles(styleThunk)(Notifications));
