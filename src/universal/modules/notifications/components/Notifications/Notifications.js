import PropTypes from 'prop-types';
import React from 'react';
import Atmosphere from 'universal/Atmosphere';
import Helmet from 'react-helmet';
import {requiresAction} from 'universal/types/notification';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import NotificationRow from 'universal/modules/notifications/components/NotificationRow/NotificationRow';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import styled from 'react-emotion';
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';

const ClearAllButtonBlock = styled('div')({
  alignSelf: 'center',
  minWidth: '5.75rem'
});

const NotificationListBlock = styled('div')({
  width: '100%'
});

const NotificationsEmptyBlock = styled('div')({
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
});

const Notifications = (props) => {
  const {
    atmosphere,
    dispatch,
    notifications,
    submitMutation,
    onCompleted,
    onError,
    submitting
  } = props;

  const clearableNotifs = notifications.edges.filter(({node}) => node && !requiresAction(node));
  const clearAllNotifications = () => {
    submitMutation();
    clearableNotifs.forEach(({node}) => {
      ClearNotificationMutation(atmosphere, node.id, onError, onCompleted);
    });
  };

  const clearAllButton = () => (
    <ClearAllButtonBlock>
      <Button
        aria-label="Clear all notifications"
        buttonSize="small"
        buttonStyle="flat"
        colorPalette="dark"
        icon="check"
        iconPlacement="right"
        isBlock
        label="Clear All"
        onClick={clearAllNotifications}
        title="Clear all notifications"
      />
    </ClearAllButtonBlock>
  );

  return (
    <UserSettingsWrapper>
      <Helmet title="My Notifications | Parabol" />
      <SettingsWrapper>
        <Panel
          compact
          label="Notifications"
          controls={!submitting && clearableNotifs.length > 0 && clearAllButton()}
        >
          {notifications && notifications.edges.length ? (
            <NotificationListBlock>
              {notifications.edges
                .filter(({node}) => Boolean(node))
                .map(({node}) => (
                  <NotificationRow
                    dispatch={dispatch}
                    key={`notification${node.id}`}
                    notification={node}
                  />
                ))}
            </NotificationListBlock>
          ) : (
            <NotificationsEmptyBlock>
              {'Hey there! You’re all caught up! 💯'}
            </NotificationsEmptyBlock>
          )}
        </Panel>
      </SettingsWrapper>
    </UserSettingsWrapper>
  );
};

Notifications.propTypes = {
  atmosphere: PropTypes.instanceOf(Atmosphere),
  dispatch: PropTypes.func.isRequired,
  notifications: PropTypes.object,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitMutation: PropTypes.func.isRequired
};

export default withAtmosphere(withMutationProps(Notifications));
