import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {PRESENCE} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';


const presenceSubQuery = `
query {
  presence(teamId: $teamId) @live {
    id
    userId
    editing
  }
}`;

const mapStateToProps = (state, props) => {
  const {params: {teamId}} = props;
  return {
    presence: cashay.query(presenceSubQuery, {
      op: 'socketWithPresence',
      key: teamId,
      variables: {teamId},
      subscriber: {presence: presenceSubscriber}
    })
  };
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
      const {teamId} = props.params;
      if (teamId) {
        const socket = socketCluster.connect();
        socket.on('subscribe', channelName => {
          if (channelName === `${PRESENCE}/${teamId}`) {
            const options = {variables: {teamId}};
            cashay.mutate('soundOff', options);
          }
        });
      } else {
        // TODO add a presence listener for the /me route
      }
    }

    render() {
      return <ComposedComponent {...this.props}/>;
    }
  }
  return SocketWithPresence;
};
