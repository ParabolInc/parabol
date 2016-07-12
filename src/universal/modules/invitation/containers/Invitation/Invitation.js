import React, {Component, PropTypes} from 'react';
import {push} from 'react-router-redux';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import {auth0} from 'universal/utils/clientOptions';
import {setAuthToken} from 'universal/redux/authDuck';
import {getAuthQueryString, authedOptions} from 'universal/redux/getAuthedUser';
import {setWelcomeActivity} from 'universal/modules/userDashboard/ducks/settingsDuck';

const mapStateToProps = (state, props) => {
  const {params: {id}} = props;
  return {
    authToken: state.authToken,
    inviteToken: id,
    user: cashay.query(getAuthQueryString, authedOptions).data.user,
  };
};

@connect(mapStateToProps)
export default class Invitation extends Component {
  static propTypes = {
    authToken: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    inviteToken: PropTypes.string.isRequired,
    user: PropTypes.object
  };

  componentWillReceiveProps(nextProps) {
    const {authToken, dispatch, user} = nextProps;

    if (authToken) {
      if (user && user.profile.isNew === false) {
        // If user already has an account, let them accept the new team via the UI:
        dispatch(push('/me'));
      } else if (user && user.profile.isNew === true) {
        // If the user is new let's process their invite:
        this.processInvitation();
      }
    }
  }

  showLock = () => {
    // eslint-disable-next-line global-require
    const Auth0Lock = require('auth0-lock');
    const {clientId, account} = auth0;
    const lock = new Auth0Lock(clientId, account);
    lock.show({
      authParams: {
        scope: 'openid rol'
      }
    }, async (error, profile, authToken) => {
      if (error) throw error;
      const {dispatch} = this.props;
      // TODO: stuff this in a utility function:
      dispatch(setAuthToken(authToken));
      cashay.create({transport: new ActionHTTPTransport(authToken)});
      const options = {variables: {authToken}};
      cashay.mutate('updateUserWithAuthToken', options);
    });
  };

  processInvitation = () => {
    const {dispatch, inviteToken} = this.props;
    const options = {
      variables: {
        inviteToken
      }
    };
    cashay.mutate('acceptInvitation', options).then(({data, error}) => {
      if (error) {
        console.warn('unable to accept invitation:');
        console.warn(error);
        // TODO: pop them a toast and tell them what happened?
        dispatch(push('/welcome'));
      } else if (data) {
        const {id} = data.acceptInvitation.team;
        dispatch(setWelcomeActivity(`/team/${id}`));
        dispatch(push('/me/settings'));
      }
    }).catch(console.warn.bind(console));
  };

  renderLogin = () => (
    <div>
      <h1>Hey! Welcome.</h1>
      <h2>We're going to design a landing page here for you soon.</h2>
      {
        /* auth0 lock can't SSR: */
        __CLIENT__ && this.showLock()
      }
    </div>
  );

  render() {
    const {authToken} = this.props;

    if (!authToken) {
      // Authenticate the user, then let's find out what else to do:
      return this.renderLogin();
    }

    // TODO this would be a nice place for a spinner:
    return (<div/>);
  }
}
