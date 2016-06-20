import React, {PropTypes, Component} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import Helmet from 'react-helmet';
import {head, auth0} from 'universal/utils/clientOptions';
import {push} from 'react-router-redux';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import loginWithAuth from 'universal/decorators/loginWithToken/loginWithToken'

@loginWithAuth
export default class LandingContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  };

  handleOnMeetingCreateClick = () => {
    const {dispatch} = this.props;
    const Auth0Lock = require('auth0-lock'); // eslint-disable-line global-require
    const {clientId, account} = auth0;
    const lock = new Auth0Lock(clientId, account);
    lock.show(async(error, profile, authToken) => {
      if (error) throw error;
      cashay.transport = new ActionHTTPTransport(authToken);
      const options = {variables: {authToken}};
      const response = await cashay.mutate('updateUserWithAuthToken', options);
      const hasTeam = response.user.memberships.length > 0;
      if (hasTeam) {
        // TODO make the "createMeeting" CTA big n bold when hitting this route from here 
        dispatch(push('/me'));
      } else {
        dispatch(push('/welcome'));
      }
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
