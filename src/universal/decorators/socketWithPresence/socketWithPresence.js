import {cashay, Transport} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {reduxSocket} from 'redux-socket-cluster';
import socketCluster from 'socketcluster-client';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import AuthEngine from 'universal/redux/AuthEngine';
import {TEAM_MEMBERS} from 'universal/subscriptions/constants';
import subscriber from 'universal/subscriptions/subscriber';
import parseChannel from 'universal/utils/parseChannel';

const mapStateToProps = (state) => {
  return {
    tms: state.auth.obj.tms,
    userId: state.auth.obj.sub
  };
};

const tmsSubs = [];
const subscribeToPresence = (oldProps, props) => {
  const {tms} = props;
  if (!tms) {
    throw new Error('Did not finish the welcome wizard! How did you get here?');
    // TODO redirect?
  }
  if (oldProps.tms.length < tms.length) {
    for (let i = 0; i < tms.length; i++) {
      const teamId = tms[i];
      if (tmsSubs.includes(teamId)) continue;
      tmsSubs.push(teamId);
      cashay.subscribe(TEAM_MEMBERS, teamId);
    }
  } else if (oldProps.tms.length > tms.length) {
    tmsSubs.length = 0;
    tmsSubs.push(...tms);
  }
};

export default (ComposedComponent) => {
  const reduxSocketOptions = (props) => ({
    AuthEngine,
    socketCluster,
    onConnect: (options, hocOptions, socket) => {
      if (!cashay.priorityTransport) {
        const sendToServer = (request) => {
          return new Promise((resolve) => {
            socket.emit('graphql', request, (error, response) => {
              resolve(response);
            });
          });
        };
        const priorityTransport = new Transport(sendToServer);
        cashay.create({priorityTransport, subscriber});
        props.atmosphere.setSocket(socket);
      }
    },
    onDisconnect: () => {
      cashay.create({priorityTransport: null});
      props.atmosphere.socket = null;
      props.atmosphere.setNet('http');
    },
    keepAlive: 3000
  });

  @withAtmosphere
  @reduxSocket({}, reduxSocketOptions)
  @connect(mapStateToProps)
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
      tms: PropTypes.array,
      user: PropTypes.object,
      userId: PropTypes.string
    };

    componentDidMount() {
      subscribeToPresence({tms: []}, this.props);
      this.watchForKickout();
    }

    componentWillReceiveProps(nextProps) {
      subscribeToPresence(this.props, nextProps);
    }

    componentWillUnmount() {
      const socket = socketCluster.connect();
      socket.off('kickOut', this.kickoutHandler);
      socket.off('version', this.versionHandler);
    }

    kickoutHandler = (error, channelName) => {
      const {channel, variableString: teamId} = parseChannel(channelName);
      // important to flag these as unsubscribed so resubs can ocur.
      setTimeout(() => cashay.unsubscribe(channel, teamId), 100);
    };

    watchForKickout() {
      const socket = socketCluster.connect();
      socket.on('kickOut', this.kickoutHandler);
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  return SocketWithPresence;
};
