import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {cashay} from 'cashay';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import reduxSocketOptions from 'universal/redux/reduxSocketOptions';
import {
  ADD_TO_TEAM,
  JOIN_TEAM,
  KICK_OUT,
  REJOIN_TEAM,
  USER_MEMO,
  NOTIFICATIONS,
  PRESENCE,
  TEAM_MEMBERS
} from 'universal/subscriptions/constants';
import socketCluster from 'socketcluster-client';
import presenceSubscriber from 'universal/subscriptions/presenceSubscriber';
import parseChannel from 'universal/utils/parseChannel';
import {showInfo, showWarning} from 'universal/modules/toast/ducks/toastDuck';
import {withRouter} from 'react-router';
import {
  APP_VERSION_KEY,
  APP_UPGRADE_PENDING_KEY,
  APP_UPGRADE_PENDING_RELOAD
} from 'universal/utils/constants';

const getTeamName = (teamId) => {
  const cashayState = cashay.store.getState().cashay;
  const team = cashayState.entities.Team && cashayState.entities.Team[teamId];
  return team && team.name || teamId;
};

const mapStateToProps = (state) => {
  return {
    tms: state.auth.obj.tms,
    userId: state.auth.obj.sub
  };
};

const tmsSubs = [];

export default (ComposedComponent) => {
  @requireAuth
  @reduxSocket({}, reduxSocketOptions)
  @connect(mapStateToProps)
  @withRouter
  class SocketWithPresence extends Component {
    static propTypes = {
      dispatch: PropTypes.func,
      params: PropTypes.shape({
        teamId: PropTypes.string
      }),
      router: PropTypes.object,
      tms: PropTypes.array,
      user: PropTypes.object,
      userId: PropTypes.string
    };

    componentDidMount() {
      this.subscribeToPresence({tms: []}, this.props);
      this.subscribeToNotifications();
      this.watchForKickout();
      this.listenForVersion();
    }
    componentWillReceiveProps(nextProps) {
      this.subscribeToPresence(this.props, nextProps);
    }

    componentWillUnmount() {
      const socket = socketCluster.connect();
      const {userId} = this.props;
      const userMemoChannel = `${USER_MEMO}/${userId}`;
      socket.off('kickOut', this.kickoutHandler);
      socket.off('version', this.versionHandler);
      socket.unwatch(userMemoChannel, this.memoHandler);
    }

    kickoutHandler = (error, channelName) => {
      const {channel, variableString: teamId} = parseChannel(channelName);
      // important to flag these as unsubscribed so resubs can ocur.
      setTimeout(() => cashay.unsubscribe(channel, teamId), 100);
    };

    memoHandler = (data) => {
      const {type} = data;
      const {dispatch} = this.props;
      if (type === ADD_TO_TEAM) {
        const {teamName} = data;
        dispatch(showInfo({
          title: 'Congratulations!',
          message: `You've been added to team ${teamName}`
        }));
      } else if (type === KICK_OUT) {
        const {teamId, teamName} = data;
        const {router} = this.props;
        const onExTeamRoute = router.isActive(`/team/${teamId}`) || router.isActive(`/meeting/${teamId}`);
        if (onExTeamRoute) {
          router.push('/me');
        }
        dispatch(showWarning({
          title: 'So long!',
          message: `You have been removed from ${teamName}`
        }));
      }
    };

    watchForJoin(teamId) {
      const socket = socketCluster.connect();
      const channelName = `${PRESENCE}/${teamId}`;
      const {dispatch} = this.props;
      socket.watch(channelName, (data) => {
        if (data.type === JOIN_TEAM) {
          const {name} = data;
          const teamName = getTeamName(teamId);
          dispatch(showInfo({
            title: 'Ahoy, a new crewmate!',
            message: `${name} just joined team ${teamName}`
          }));
        } else if (data.type === REJOIN_TEAM) {
          const {name} = data;
          const teamName = getTeamName(teamId);
          dispatch(showInfo({
            title: `${name} is back!`,
            message: `${name} just rejoined team ${teamName}`
          }));
        }
      });
    }

    watchForKickout() {
      const socket = socketCluster.connect();
      socket.on('kickOut', this.kickoutHandler);
    }

    subscribeToNotifications() {
      const {userId} = this.props;
      const socket = socketCluster.connect();
      cashay.subscribe(NOTIFICATIONS, userId);
      const userMemoChannel = `${USER_MEMO}/${userId}`;
      socket.subscribe(userMemoChannel, {waitForAuth: true});
      socket.watch(userMemoChannel, this.memoHandler);
    }

    subscribeToPresence(oldProps, props) {
      const {tms} = props;
      if (!tms) {
        throw new Error('Did not finish the welcome wizard! How did you get here?');
        // TODO redirect?
      }
      if (oldProps.tms.length < tms.length) {
        const socket = socketCluster.connect();
        for (let i = 0; i < tms.length; i++) {
          const teamId = tms[i];
          if (tmsSubs.includes(teamId)) continue;
          tmsSubs.push(teamId);
          cashay.subscribe(PRESENCE, teamId, presenceSubscriber);
          cashay.subscribe(TEAM_MEMBERS, teamId);
          socket.on('subscribe', (channelName) => {
            if (channelName === `${PRESENCE}/${teamId}`) {
              const options = {variables: {teamId}};
              cashay.mutate('soundOff', options);
            }
          });
          this.watchForJoin(teamId);
        }
      } else if (oldProps.tms.length > tms.length) {
        tmsSubs.length = 0;
        tmsSubs.push(...tms);
      }
    }

    versionHandler = (versionOnServer) => {
      const {dispatch, router} = this.props;
      const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY);
      if (versionOnServer !== versionInStorage) {
        dispatch(showWarning({
          title: 'New stuff!',
          message: 'A new version of action is available',
          autoDismiss: 0,
          action: {
            label: 'Log out and upgrade',
            callback: () => {
              router.replace('/signout');
            }
          }
        }));
        window.sessionStorage.setItem(APP_UPGRADE_PENDING_KEY,
          APP_UPGRADE_PENDING_RELOAD);
      }
    };

    listenForVersion() {
      const socket = socketCluster.connect();
      socket.on('version', this.versionHandler);
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }

  }
  return SocketWithPresence;
};
