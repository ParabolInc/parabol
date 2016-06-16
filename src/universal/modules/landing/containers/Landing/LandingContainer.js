import React, {PropTypes, Component} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {head, auth0} from 'universal/utils/clientOptions';
import {push} from 'react-router-redux';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'client/ActionHTTPTransport';
import {localStorageVars} from '../../../../utils/clientOptions';

const queryString = `
query {
  cachedUserAndToken: getUserWithAuthToken(authToken: $authToken) {
    authToken,
    user {
      id,
      cachedAt,
      cacheExpiresAt,
      createdAt,
      updatedAt,
      email,
      emailVerified,
      picture,
      name,
      nickname,
      identities {
        connection,
        userId,
        provider,
        isSocial,
      }
      loginsCount,
      blockedFor {
        identifier,
        id,
      }
    }
  }
}`;

const mutationHandlers = {
  updateUserWithAuthToken(optimisticVariables, dataFromServer, currentResponse) {
    if (dataFromServer) {
      // TODO: modifing params by reference is stylisitically problematic,
      //       can interface be pure and return new value intead?
      // eslint-disable-next-line no-param-reassign
      currentResponse.cachedUserAndToken = dataFromServer.updateUserWithAuthToken;
      return currentResponse;
    }
    return undefined;
  }
};

const cashayOptions = {
  component: 'AppContainer',
  variables: {
    authToken: response => response.cachedUserAndToken.authToken
  },
  mutationHandlers
};

const mapStateToProps = () => ({
  response: cashay.query(queryString, cashayOptions)
});

@connect(mapStateToProps)
export default class LandingContainer extends Component {
  static propTypes = {
    // children: PropTypes.element,
    isAuthenticated: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    userId: PropTypes.string
  };

  handleOnMeetingCreateClick = () => {
    const {isAuthenticated, dispatch, userId} = this.props;
    if (isAuthenticated && userId) {
      dispatch(push(`/me/${userId}`));
    } else {
      if (__CLIENT__) {
        // TODO handle auth0 css files in webpack build to make it work on server?
        const Auth0Lock = require('auth0-lock'); // eslint-disable-line global-require
        const {clientId, account} = auth0;
        const lock = new Auth0Lock(clientId, account);
        lock.show(async (error, profile, authToken) => {
          if (error) throw error;
          cashay.transport = new ActionHTTPTransport(authToken);
          const options = {variables: {authToken}};
          const cachedUserAndToken = await cashay.mutate('updateUserWithAuthToken', options);
          const {profileName, authTokenName} = localStorageVars;
          localStorage.setItem(authTokenName, authToken);
          localStorage.setItem(profileName,
            cachedUserAndToken.data.updateUserWithAuthToken.profile);
          dispatch(push('/welcome'));
        });
      }
    }
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
