import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Panel from 'universal/components/Panel/Panel';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import NotificationRow from 'universal/modules/notifications/components/NotificationRow/NotificationRow';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const Notifications = (props) => {
  const {
    dispatch,
    notifications,
    styles
  } = props;
  return (
    <UserSettingsWrapper>
      <Helmet title="My Notifications | Parabol" />
      <div className={css(styles.wrapper)}>
        <Panel label="Notifications">
          {notifications && notifications.edges.length ?
            <div className={css(styles.notificationList)}>
              {notifications.edges.map(({node}) =>
                (<NotificationRow
                  dispatch={dispatch}
                  key={`notification${node.id}`}
                  notification={node}
                />)
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
  dispatch: PropTypes.func.isRequired,
  notifications: PropTypes.object,
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
