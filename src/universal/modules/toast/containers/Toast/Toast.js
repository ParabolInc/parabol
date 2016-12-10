import React, {PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ToastSystem from 'react-notification-system';

import appTheme from 'universal/styles/theme/appTheme';
import * as _toastActions from '../../ducks/toastDuck';

const mapStateToProps = state => ({
  toasts: state.toasts
});

const mapDispatchToProps = dispatch => ({
  toastActions: bindActionCreators(_toastActions, dispatch)
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Toast extends React.Component {
  static propTypes = {
    toasts: PropTypes.array,
    toastActions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      maxNid: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    const {toasts, toastActions} = nextProps;
    const {maxNid} = this.state;

    toasts
      .filter(notification => notification.nid > maxNid)
      .forEach(notification => {
        this.system().addNotification({
          ...notification,
          onRemove: () => {
            toastActions.hide(notification.nid);
          }
        });
        if (notification.nid > maxNid) {
          this.setState({maxNid: maxNid + 1});
        }
      });
  }

  shouldComponentUpdate(nextProps) {
    const {toasts} = nextProps;

    if (toasts.length > 0) {
      const {maxNid} = this.state;
      const nextNid = Math.max.apply(
        Math,
        toasts.map(n => n.nid)
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
      <ToastSystem ref="notify" style={styles} />
    );
  }
}
