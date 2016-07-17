import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {cashay} from 'cashay';
import subscriptions from 'universal/subscriptions/subscriptions';
import presenceSubscriber from './presenceSubscriber';
import reduxSocketOptions from './reduxSocketOptions';
import {PRESENCE} from 'universal/subscriptions/constants';

const presenceSubscription = subscriptions.find(sub => sub.channel === PRESENCE);
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
      dispatch: PropTypes.func,
      params: PropTypes.shape({
        meetingId: PropTypes.string
      })
    };

    constructor(props) {
      super(props);
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
