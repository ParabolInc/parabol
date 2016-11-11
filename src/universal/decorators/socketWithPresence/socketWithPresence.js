import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {PRESENCE, TEAM_MEMBERS} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import parseChannel from 'universal/utils/parseChannel';
import {TEAM} from 'universal/subscriptions/constants';
import {showWarning} from 'universal/modules/notifications/ducks/notifications';
import {withRouter} from 'react-router';

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
  @withRouter
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
      this.watchForKickout();
    }
    componentWillReceiveProps(nextProps) {
      this.subscribeToPresence(this.props, nextProps);
    }

    watchForKickout() {
      const socket = socketCluster.connect();
      socket.on('kickOut', (error, channelName) => {
        const {channel, variableString: teamId} = parseChannel(channelName);
        if (channel === TEAM) {
          const cashayState = cashay.store.getState().cashay;
          const team = cashayState.entities.Team && cashayState.entities.Team[teamId];
          const teamName = team && team.name || teamId;
          cashay.store.dispatch(showWarning({
            title: 'So long!',
            message: `You have been removed from ${teamName}`
          }));
          const {router} = this.props;
          const onExTeamRoute = router.isActive(`/team/${teamId}`) || router.isActive(`/meeting/${teamId}`);
          if (onExTeamRoute) {
            router.push('/me');
          }
        }
      });
    }
    subscribeToPresence(oldProps, props) {
      const {tms} = props;
      if (!tms) {
        throw new Error('Did not finish the welcome wizard! How did you get here?');
        // TODO redirect?
      }
      if (oldProps.tms !== props.tms) {
        const socket = socketCluster.connect();
        window.socket = socket;
        for (let i = 0; i < tms.length; i++) {
          const teamId = tms[i];
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
