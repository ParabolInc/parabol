import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import subscriptions from 'universal/subscriptions/subscriptions';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {PRESENCE} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';

const presenceSub = subscriptions.find(sub => sub.channel === PRESENCE);
const presenceSubQuery = presenceSub.string;

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  return {
    presence: cashay.subscribe(presenceSubQuery, presenceSubscriber, {
      key: teamId,
      op: PRESENCE,
      variables: {teamId},
    })
  }
};

export default ComposedComponent => {
  @requireAuth
  @reduxSocket({}, reduxSocketOptions)
  @connect(mapStateToProps)
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
        const presenceChannel = presenceSub.channelfy({teamId});
        const canPublish = presenceChannel === channelName;
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
