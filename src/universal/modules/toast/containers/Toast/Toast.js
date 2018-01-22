import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ToastSystem from 'react-notification-system';
import appTheme from 'universal/styles/theme/appTheme';
import {hide} from 'universal/modules/toast/ducks/toastDuck';

const mapStateToProps = (state) => ({
  toasts: state.toasts
});

@connect(mapStateToProps)
export default class Toast extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    toasts: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.el = null;
    // Maintains a mapping between toast IDs (number) -> 'react-notification-system' IDs (number)
    this.toastToNotification = new Map();
  }

  componentWillReceiveProps(nextProps) {
    const { toasts: currentToasts } = this.props;
    const { dispatch, toasts: nextToasts } = nextProps;

    const nextToastNids = new Set(nextToasts.map(({ nid }) => nid));
    const addedToasts = nextToasts.filter(({ nid }) => !this.toastToNotification.has(nid));
    const removedToasts = currentToasts.filter(({ nid }) => !nextToastNids.has(nid));

    // Show any new notifications
    const newToastToNotification = new Map(
      addedToasts.map((toast) => {
        const notification = this.system().addNotification({
          ...toast,
          onRemove: () => {
            dispatch(hide(toast.nid));
          }
        });
        return [toast.nid, notification.uid];
      })
    );

    // Hide any old notifications
    removedToasts.forEach(({ nid }) => {
      this.system().removeNotification(this.toastToNotification.get(nid));
    });

    // remove old, add new toast -> notification mappings
    this.toastToNotification = newToastToNotification;
  }

  system() {
    return this.el;
  }

  render() {
    /*
     * NOTE: these true inline styles
     */
    const styles = {
      NotificationItem: {
        DefaultStyle: { // Applied to every notification, regardless of the notification level
        },

        success: { // Applied only to the success notification container
          borderTop: `2px solid ${appTheme.palette.cool}`,
          backgroundColor: appTheme.palette.cool20l,
          color: appTheme.palette.cool,
          WebkitBoxShadow: `0 0 1px ${appTheme.palette.cool90a}`,
          MozBoxShadow: `0 0 1px ${appTheme.palette.cool90a}`,
          boxShadow: `0 0 1px ${appTheme.palette.cool90a}`
        }
      },
      Action: {
        DefaultStyle: {
        },
        success: {
          backgroundColor: appTheme.palette.cool
        }
      },
      Dismiss: {
        DefaultStyle: {
        },
        success: {
          color: appTheme.palette.cool20l,
          backgroundColor: appTheme.palette.cool90l
        }
      },
      Title: {
        DefaultStyle: {
        },
        success: {
          color: appTheme.palette.cool
        }
      }
    };

    return (
      <ToastSystem ref={(c) => { this.el = c; }} refstyle={styles} />
    );
  }
}
