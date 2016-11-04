import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {PRESENCE, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';

const mapStateToProps = (state) => {
  return {
    tms: state.auth.obj.tms,
  };
};

const tmsSubs = [];

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
      }),
      tms: PropTypes.array
    };

    componentDidMount() {
      this.subscribeToPresence({}, this.props);
    }
    componentWillReceiveProps(nextProps) {
      this.subscribeToPresence(this.props, nextProps);
    }

    subscribeToPresence(oldProps, props) {
      const {params, tms} = props;
      const teamIds = params.teamId ? [params.teamId] : tms;
      if (!teamIds) {
        throw new Error(`Did not finish the welcome wizard! ${params} ${tms}`);
        // TODO redirect?
      }
      if (oldProps.tms !== props.tms) {
        const socket = socketCluster.connect();
        for (let i = 0; i < teamIds.length; i++) {
          const teamId = teamIds[i];
          if (tmsSubs.includes(teamId)) continue;
          tmsSubs.push(teamId);
          cashay.subscribe(PRESENCE, teamId, presenceSubscriber);
          cashay.subscribe(TEAM_MEMBERS, teamId);
          socket.on('subscribe', channelName => {
            if (channelName === `${PRESENCE}/${teamId}`) {
              const options = {variables: {teamId}};
              cashay.mutate('soundOff', options);
            }
          });
        }
      }
    }

    render() {
      return <ComposedComponent {...this.props}/>;
    }
  }
  return SocketWithPresence;
};
