/**
 * Reports to both the user and reporting tools when their socket connection gets
 * disconnected / reconnected.
 *
 * Watches the active WebSocket connection by way of redux-socket-cluster.
 *
 * @flow
 */
import raven from 'raven-js';
import { Component } from 'react';
import type { Dispatch } from 'redux';

import { connect } from 'react-redux';
import { showError, showSuccess, hide } from 'universal/modules/toast/ducks/toastDuck';

type ToastOpts = {
  autoDismiss?: number,
  title: string,
  message: string
};

type Props = {
  socketData: ?{
    authState: string,
    error: ?string,
    authError: ?boolean,
    socketState: string
  },
  errorToastId: ?number,
  showError: (opts: ToastOpts) => void,
  showSuccess: (opts: ToastOpts) => void,
  hideError: (errorToastId: number) => void
};

class WebSocketHealthMonitor extends Component<Props> {
  componentDidMount() {
    this.maybeReportErrors();
    this.maybePopToast();
  }

  componentDidUpdate() {
    this.maybeReportErrors();
    this.maybePopToast();
  }

  activeSocketError() {
    const { socketData } = this.props;
    return socketData ? socketData.error || socketData.authError : null;
  }

  hasErrors() {
    const { socketData } = this.props;
    return Boolean(socketData && (socketData.error || socketData.authError));
  }

  isConnected() {
    const { socketData } = this.props;
    if (!socketData) {
      return false;
    }
    const { authState, socketState } = socketData;
    return authState === 'authenticated' && socketState === 'open';
  }

  maybeReportErrors() {
    if (!this.hasErrors()) {
      return;
    }
    if (!this.props.socketData) {
      return;
    }
    const { authState, error, authError, socketState } = this.props.socketData;
    const theError = error || authError;
    const isAuthError = theError === authError;
    raven.captureBreadcrumb({
      category: 'network',
      level: 'error',
      message: isAuthError ? 'WebSocket authentication error' : 'WebSocket error',
      data: { authState, socketState }
    });
    raven.captureException(theError);
  }

  // Shows a toast if there's a new socket error, and hides it (with a "reconnected" toast) when we're reconnected
  maybePopToast() {
    const { socketData, errorToastId, showError, showSuccess, hideError } = this.props; // eslint-disable-line no-shadow
    if (!socketData) {
      return;
    }
    if (this.hasErrors() && !errorToastId) {
      const isAuthError = this.activeSocketError() === socketData.authError;
      showError({
        autoDismiss: 0,
        __isWebSocketError__: true,
        title: 'Network Error',
        message: isAuthError
          ? "We weren't able to create a live connection to our server. Make sure you are logged in to a secure network."
          : "We weren't able to create a live connection to our server. " +
            'You may need to upgrade your browser, or your network administrator may need to enable WebSockets.'
      });
    } else if (!this.hasErrors() && this.isConnected() && errorToastId) {
      hideError(errorToastId);
      showSuccess({
        autoDismiss: 5,
        title: "You're back online!",
        message: "You were offline for a bit, but we've reconnected you."
      });
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  const { socket, toasts } = state;

  const errorToast = toasts.find((toast) => toast.__isWebSocketError__);
  const errorToastId = errorToast ? errorToast.nid : null;

  if (socket) {
    return {
      socketData: {
        authState: socket.authState,
        socketState: socket.socketState,
        error: socket.error,
        authError: socket.authError
      },
      errorToastId
    };
  }

  return { socketData: null, errorToastId };
};

const mapDispatchToProps = <A: { type: string }>(dispatch: Dispatch<A>) => ({
  showError: (opts: ToastOpts) => dispatch(showError(opts)),
  showSuccess: (opts: ToastOpts) => dispatch(showSuccess(opts)),
  hideError: (errorToastId: number) => dispatch(hide(errorToastId))
});

export default connect(mapStateToProps, mapDispatchToProps)(WebSocketHealthMonitor);
