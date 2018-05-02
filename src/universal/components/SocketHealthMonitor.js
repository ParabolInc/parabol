import PropTypes from 'prop-types';
import {Component} from 'react';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {connect} from 'react-redux';
import popUpgradeAppToast from 'universal/mutations/toasts/popUpgradeAppToast';
import {showError, showSuccess, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import raven from 'raven-js';
import {APP_VERSION_KEY} from 'universal/utils/constants';

class SocketHealthMonitor extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {atmosphere} = this.props;
    atmosphere.eventEmitter.once('newSubscriptionClient', () => {
      const {subscriptionClient} = atmosphere;
      subscriptionClient.eventEmitter.once('socketsDisabled', this.onSocketsDisabled);
      subscriptionClient.onConnected(this.onConnected);
      subscriptionClient.onReconnected(this.onReconnected);
      subscriptionClient.onDisconnected(this.onDisconnected);
    });
  }
  onReconnected = (payload) => {
    const {dispatch} = this.props;
    const {version} = payload;
    const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);
    if (version !== versionInStorage) {
      popUpgradeAppToast({dispatch});
    } else {
      dispatch(showSuccess({
        autoDismiss: 5,
        title: 'You’re back online!',
        message: 'You were offline for a bit, but we’ve reconnected you.'
      }));
    }
  };
  onConnected = (payload) => {
    const {dispatch} = this.props;
    const {version} = payload;
    const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);
    if (version !== versionInStorage) {
      popUpgradeAppToast({dispatch});
    }
  };
  onDisconnected = () => {
    const {atmosphere: {subscriptionClient}, dispatch} = this.props;
    if (!subscriptionClient.reconnecting) {
      dispatch(showWarning({
        autoDismiss: 10,
        title: 'You’re offline!',
        message: 'We’re trying to reconnect you'
      }));
    }
  };

  onSocketsDisabled = () => {
    const {dispatch} = this.props;
    raven.captureBreadcrumb({
      category: 'network',
      level: 'error',
      message: 'WebSockets Disabled'
    });
    dispatch(showError({
      autoDismiss: 0,
      title: 'WebSockets Disabled',
      message: `We weren't able to create a live connection to our server. 
          Ask your network administrator to enable WebSockets.`
    }));
  };

  render() {
    return null;
  }
}

export default connect()(withAtmosphere(SocketHealthMonitor));
