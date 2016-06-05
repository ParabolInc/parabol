import each from 'lodash/each';
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {ensureState} from 'redux-optimistic-ui';
import NotificationSystem from 'react-notification-system';

import theme from 'universal/styles/theme';
import {hide} from '../../ducks/notifications';

const mapStateToProps = state => {
  const myState = ensureState(state);
  return ({
    notifications: myState.get('notifications').toJS()
  });
};

@connect(mapStateToProps)
export default class Notifications extends React.Component {
  static propTypes = {
    notifications: PropTypes.array
  }

  static contextTypes = {
    store: PropTypes.object
  };

  componentWillReceiveProps(nextProps) {
    const {notifications} = nextProps;

    each(notifications, notification => {
      this.system().addNotification({
        ...notification,
        onRemove: () => {
          this.context.store.dispatch(hide(notification.uid));
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
          backgroundColor: theme.palette.cool20a,
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
