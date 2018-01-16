/**
 * Watches the active WebSocket connection by way of redux-socket-cluster,
 * reporting to both the user and reporting tools when things break.
 *
 * @flow
 */
import raven from 'raven-js';
import React from 'react';
import type { Dispatch } from 'redux';

import { connect } from 'react-redux';
import { showError } from 'universal/modules/toast/ducks/toastDuck';

type ToastOpts = {
  autoDismiss?: ?number,
  title: string,
  message: string
};

type Props = {
  authState: ?string,
  authError: ?Error,
  socketState: ?string,
  error: ?Error,
  showError: (opts: ToastOpts) => void
};

const WebSocketHealthMonitor = (props: Props) => {
  const { authState, authError, socketState, error, showError } = props; // eslint-disable-line no-shadow

  // Toasts the user and sends an error to Sentry
  const handleError = (toastOpts: ToastOpts, ravenBreadcrumbMessage: string, error: Error): void => { // eslint-disable-line no-shadow
    showError({ ...toastOpts, autoDismiss: null });
    raven.captureBreadcrumb({
      message: ravenBreadcrumbMessage,
      data: { authState, socketState },
      category: 'network',
      level: 'error'
    });
    raven.captureException(error);
  };

  if (error) {
    handleError(
      {
        title: 'Network Error',
        message:
          "We weren't able to create a live connection to our server. " +
          'You may need to upgrade your browser, or your network administrator may need to enable WebSockets.'
      },
      'WebSocket error',
      error
    );
  }
  if (authError) {
    handleError(
      {
        title: 'Network Authentication Error',
        message: "We weren't able to create a live connection to our server. Make sure you are logged in to a secure network."
      },
      'WebSocket authentication error',
      authError
    );
  }
  return <div />;
};

const mapStateToProps = (state) => {
  const { socket } = state;
  if (socket) {
    const { authState, authError, socketState, error } = socket;
    return { authState, authError, socketState, error };
  }
  return { authState: null, authError: null, socketState: null, error: null };
};

const mapDispatchToProps = <A>(dispatch: Dispatch<A>) => ({
  showError: (opts: ToastOpts) => dispatch(showError(opts))
});

export default connect(mapStateToProps, mapDispatchToProps)(WebSocketHealthMonitor);
