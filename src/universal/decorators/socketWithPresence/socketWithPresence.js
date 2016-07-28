import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import presenceSubscriber from './presenceSubscriber';
import reduxSocketOptions from './reduxSocketOptions';
import {PRESENCE} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';

const presenceSubscription = subscriptions.find(sub => sub.channel === PRESENCE);
const mapStateToProps = (state, props) => {
  const presenceSubOptions = {
    variables: {teamId: props.params.teamId},
    component: 'socketWithPresence'
  };
  return {
    presenceSub: cashay.subscribe(presenceSubscription.string, presenceSubscriber, presenceSubOptions)
  };
};

export default ComposedComponent => {
  @reduxSocket({}, reduxSocketOptions)
  @connect(mapStateToProps)
  @requireAuth
  class SocketWithPresence extends Component {
    static propTypes = {
      user: PropTypes.object,
      dispatch: PropTypes.func,
      params: PropTypes.shape({
        teamId: PropTypes.string
      })
    };

    constructor(props) {
      super(props);
      const socket = socketCluster.connect();
      socket.on('subscribe', channelName => {
        const {teamId} = props.params;
        const presenceSub = presenceSubscription.channelfy({teamId});
        const canPublish = presenceSub === channelName;
        if (canPublish) {
          const options = {variables: {teamId}};
          cashay.mutate('soundOff', options);
        }
      });
    }

    render() {
      return <ComposedComponent {...this.props}/>;
    }
  }
  return SocketWithPresence;
};
