import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {reduxSocket} from 'redux-socket-cluster';
import socketCluster from 'socketcluster-client';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import AuthEngine from 'universal/redux/AuthEngine';

export default (ComposedComponent) => {
  const reduxSocketOptions = (props) => ({
    AuthEngine,
    socketCluster,
    onConnect: (options, hocOptions, socket) => {
      // not worth investigating since socket cluster will be gone soon
      if (!props.atmosphere.socket) {
        props.atmosphere.setSocket(socket);
      }
    },
    onDisconnect: () => {
      props.atmosphere.socket = null;
      props.atmosphere.setNet('http');
    },
    keepAlive: 3000
  });

  @withAtmosphere
  @reduxSocket({}, reduxSocketOptions)
  @withRouter
  class SocketWithPresence extends Component {
    static propTypes = {
      dispatch: PropTypes.func,
      match: PropTypes.shape({
        params: PropTypes.shape({
          teamId: PropTypes.string
        })
      }),
      history: PropTypes.object,
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
      }),
      user: PropTypes.object
    };

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  return SocketWithPresence;
};
