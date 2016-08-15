import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import subscriptions from 'universal/subscriptions/subscriptions';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {PRESENCE} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';
import presenceSubscriber from './presenceSubscriber';
import presenceEditingHelper from './presenceEditingHelper';

const presenceSubscription = subscriptions.find(sub => sub.channel === PRESENCE);
const mapStateToProps = (state, props) => {
  const presenceSubOptions = {
    variables: {teamId: props.params.teamId},
    op: 'socketWithPresence'
  };
  const presenceSub = cashay.subscribe(
    presenceSubscription.string, presenceSubscriber, presenceSubOptions);
  const editing = presenceEditingHelper(presenceSub.data.presence);
  return {
    presenceSub: {
      ...presenceSub,
      data: {
        ...presenceSub.data,
        editing
      }
    }
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
