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
import resolveEditingByTeam from 'universal/subscriptions/computed/resolveEditingByTeam';

const presenceSubscription = subscriptions.find(sub => sub.channel === PRESENCE);

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  return {
    editing: cashay.computed('editingByTeam', [teamId], resolveEditingByTeam),
    presence: cashay.subscribe(presenceSubscription.string, presenceSubscriber, {
      variables: {teamId},
      op: 'presenceByTeam'
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
