import React, {PropTypes, Component} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import Helmet from 'react-helmet';
import {head, auth0} from 'universal/utils/clientOptions';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';
import {setAuthToken} from 'universal/redux/authDuck';

@loginWithToken
export default class LandingContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    authToken: PropTypes.string,
    user: PropTypes.object
  };

  handleOnMeetingCreateClick = () => {
    // Lock isn't smart enough to run in a SSR context
    const Auth0Lock = require('auth0-lock'); // eslint-disable-line global-require
    const {clientId, account} = auth0;
    const lock = new Auth0Lock(clientId, account);
    lock.show({
      authParams: {
        scope: 'openid rol'
      }
    }, async(error, profile, authToken) => {
      if (error) throw error;
      const {dispatch} = this.props;
      dispatch(setAuthToken(authToken));
      cashay.create({transport: new ActionHTTPTransport(authToken)});
      const options = {variables: {authToken}};
      cashay.mutate('updateUserWithAuthToken', options);
    });
  };

  render() {
    return (
      <div>
        <Helmet title="Welcome to Action" {...head} />
        <Landing onMeetingCreateClick={this.handleOnMeetingCreateClick} {...this.props} />
      </div>
    );
  }
}
