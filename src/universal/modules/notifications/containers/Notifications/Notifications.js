import each from 'lodash/each';
import React, {PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import NotificationSystem from 'react-notification-system';

import theme from 'universal/styles/theme';
import * as notificationActions from '../../ducks/notifications';

const mapStateToProps = state => ({
  notifications: state.get('notifications').toJS()
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(notificationActions, dispatch)
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Notifications extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    notifications: PropTypes.array
  }

  componentWillReceiveProps(nextProps) {
    const {actions, notifications} = nextProps;

    each(notifications, notification => {
      this.system().addNotification({
        ...notification,
        onRemove: () => {
          actions.hide(notification.uuid);
        }
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    return this.props !== nextProps;
  }

  system() {
    return this.refs.notify;
  }

  render() {
    /*
     * NOTE: these are not react-look styles, but true inline
     *       HTML.
     */
    const styles = {
      NotificationItem: {
        DefaultStyle: { // Applied to every notification, regardless of the notification level
        },

        success: { // Applied only to the success notification container
          borderTop: `2px solid ${theme.palette.cool}`,
          backgroundColor: theme.palette.cool20l,
          color: theme.palette.cool,
          WebkitBoxShadow: `0 0 1px ${theme.palette.cool90a}`,
          MozBoxShadow: `0 0 1px ${theme.palette.cool90a}`,
          boxShadow: `0 0 1px ${theme.palette.cool90a}`
        }
      },
      Action: {
        DefaultStyle: {
        },
        success: {
          backgroundColor: theme.palette.cool
        }
      },
      Dismiss: {
        DefaultStyle: {
        },
        success: {
          color: theme.palette.cool20l,
          backgroundColor: theme.palette.cool90l
        }
      },
      Title: {
        DefaultStyle: {
        },
        success: {
          color: theme.palette.cool
        }
      }
    };

    return (
      <NotificationSystem ref="notify" style={styles} />
    );
  }
}
