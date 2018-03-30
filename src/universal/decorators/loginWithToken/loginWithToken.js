import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import AcceptTeamInviteMutation from 'universal/mutations/AcceptTeamInviteMutation';
import {unSetInviteToken} from 'universal/redux/invitationDuck';

const mapStateToProps = (state) => {
  const {auth, invitation} = state;
  return {
    auth,
    invitation
  };
};

const handleInvitation = (props) => {
  const {atmosphere, dispatch, history, invitation: {inviteToken}} = props;
  const clearInviteToken = () => {
    dispatch(unSetInviteToken(inviteToken));
  };
  AcceptTeamInviteMutation(atmosphere, {inviteToken}, {dispatch, history}, clearInviteToken, clearInviteToken);
};

const handleAuthChange = (props) => {
  const {auth, history, invitation: {inviteToken}, location: {search}} = props;
  const nextUrl = new URLSearchParams(search).get('redirectTo');

  if (auth.obj.sub) {
    // note if you join a team & leave it, tms will be an empty array
    const isNew = !auth.obj.hasOwnProperty('tms');
    if (inviteToken) {
      handleInvitation(props);
      return;
    } if (isNew) {
      history.push('/welcome');
    } else if (nextUrl) {
      history.push(nextUrl);
    } else {
      history.push('/me');
    }
  }
};

export default (ComposedComponent) => {
  @withAtmosphere
  @connect(mapStateToProps)
  @withRouter
  class LoginWithToken extends Component {
    static propTypes = {
      atmosphere: PropTypes.object,
      auth: PropTypes.object,
      dispatch: PropTypes.func,
      history: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired
    };

    componentDidMount() {
      handleAuthChange(this.props);
    }

    componentWillReceiveProps(nextProps) {
      const {auth: {obj: {sub: prevSub}}} = this.props;
      const {auth: {obj: {sub: nextSub}}} = nextProps;
      if (prevSub !== nextSub) {
        handleAuthChange(nextProps);
      }
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  return LoginWithToken;
};
