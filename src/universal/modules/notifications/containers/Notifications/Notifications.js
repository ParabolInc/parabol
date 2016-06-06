import React, {PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import NotificationSystem from 'react-notification-system';

import theme from 'universal/styles/theme';
import * as _notificationActions from '../../ducks/notifications';

const mapStateToProps = state => ({
  notifications: state.get('notifications').toJS()
});

const mapDispatchToProps = dispatch => ({
  notificationActions: bindActionCreators(_notificationActions, dispatch)
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Notifications extends React.Component {
  static propTypes = {
    notifications: PropTypes.array,
    notificationActions: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      maxNid: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    const {notifications, notificationActions} = nextProps;
    const {maxNid} = this.state;

    notifications
      .filter(notification => notification.nid > maxNid)
      .forEach(notification => {
        this.system().addNotification({
          ...notification,
          onRemove: () => {
            notificationActions.hide(notification.nid);
          }
        });
        if (notification.nid > maxNid) {
          this.setState({maxNid: maxNid + 1});
        }
      });
  }

  shouldComponentUpdate(nextProps) {
    const {notifications} = nextProps;

    if (notifications.length > 0) {
      const {maxNid} = this.state;
      const nextNid = Math.max.apply(
        Math,
        notifications.map(n => n.nid)
      );

      return nextNid > maxNid;
    }

    return false;
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
