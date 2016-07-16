import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import presenceSubscriber from './presenceSubscriber';
import reduxSocketOptions from './reduxSocketOptions';
import socketCluster from 'socketcluster-client';

const {OPEN, AUTHENTICATED} = socketCluster.SCSocket;
const presenceSubscription = subscriptions.find(sub => sub.channel === 'presence');


// const userSubscriptionString = subscriptions.find(sub => sub.channel === 'user').string;

const mapStateToProps = (state, props) => {
  const presenceSubOptions = {
    variables: {meetingId: props.params.meetingId},
    component: 'socketWithPresence'
  };
  return {
    presenceSub: cashay.subscribe(presenceSubscription.string, presenceSubscriber, presenceSubOptions),
    socketSubs: state.socket.subs
  };
};

export default ComposedComponent => {
  @reduxSocket({}, reduxSocketOptions)
  @connect(mapStateToProps)
  @requireAuth
  class SocketWithPresence extends Component {
    static propTypes = {
      user: PropTypes.object,
      dispatch: PropTypes.func
    };

    constructor(props) {
      super(props);
      const options = {
        variables: {
          meetingId: props.params.meetingId
        }
      };
      this.state = {
        isSubbed: false
      };
    }

    componentWillReceiveProps(newProps) {
      if (!this.state.isSubbed) {
        // The subscribe middleware is async, so we want to listen before we talk (good advice for humans, too)
        const {params: {meetingId}, socketSubs} = newProps;
        const presenceSub = presenceSubscription.channelfy({meetingId});
        const canPublish = socketSubs.find(sub => sub === presenceSub);
        if (canPublish) {
          const options = {variables: {meetingId}};
          cashay.mutate('soundOff', options);
          cashay.mutate('present', options);
          this.setState({isSubbed: true});
        }
      }
    }

    render() {
      return <ComposedComponent {...this.props}/>;
    }
  }
  return SocketWithPresence;
};
