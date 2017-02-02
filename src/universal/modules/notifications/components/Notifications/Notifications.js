import React, {Component, PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {NOTIFICATIONS} from 'universal/modules/../utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/modules/../styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow';
import {withRouter} from 'react-router';
import cardSection from 'universal/modules/../styles/helpers/cardSection';
import NotificationRow from 'universal/modules/userDashboard/components/NotificationRow/NotificationRow';

const Notifications = (props) => {
  const {notifications, router, styles} = props;
  return (
    <UserSettingsWrapper activeTab={NOTIFICATIONS}>
      <div className={css(styles.wrapper)}>
        <div className={css(styles.notifications)}>
          <div className={css(styles.headerWithBorder)}>
            <div className={css(styles.headerTextBlock)}>
              <span>NOTIFICATIONS</span>
            </div>
          </div>
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
        </div>
      </div>
    </UserSettingsWrapper>
  );
}

const styleThunk = () => ({
  addOrg: {
    fontSize: appTheme.typography.s5,
    color: appTheme.palette.cool,
    cursor: 'pointer'
  },

  addOrgIcon: {
    marginRight: '.5rem'
  },

  notifications: {
    ...cardSection
  },
  headerTextBlock: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: 700,
    justifyContent: 'space-between',
    margin: '1rem'
  },

  headerWithBorder: {
    borderBottom: '1px solid #c3c5d1',
  },

  notificationList: {},
  wrapper: {
    maxWidth: '45rem'
  }
});

export default withRouter(withStyles(styleThunk)(Notifications));
