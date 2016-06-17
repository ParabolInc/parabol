import React, {PropTypes, Component} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {head, auth0} from 'universal/utils/clientOptions';
import {push} from 'react-router-redux';
import {cashay} from 'cashay';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import jwtDecode from 'jwt-decode';

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
      currentResponse.cachedUserAndToken = dataFromServer.updateUserWithAuthToken;
      return currentResponse;
    }
  }
};

const cashayOptions = {
  component: 'AppContainer',
  variables: {
    authToken: response => response.cachedUserAndToken.authToken
  },
  mutationHandlers
};

const mapStateToProps = () => {
  return {
    response: cashay.query(queryString, cashayOptions)
  };
};

@connect(mapStateToProps)
export default class LandingContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  };

  componentWillMount() {
    const {response, dispatch} = this.props;
    const {authToken} = response.data.cachedUserAndToken;
    if (authToken) {
      const authTokenObj = jwtDecode(authToken);
      if (authTokenObj.exp > Date.now() / 1000) {
        dispatch(push('/me'));
      } else {
        // TODO how should we handle expired token? Just let it chill in state?
      }
    }
  }

  handleOnMeetingCreateClick = () => {
    const {dispatch} = this.props;
    const Auth0Lock = require('auth0-lock'); // eslint-disable-line global-require
    const {clientId, account} = auth0;
    const lock = new Auth0Lock(clientId, account);
    lock.show(async(error, profile, authToken) => {
      if (error) throw error;
      cashay.transport = new ActionHTTPTransport(authToken);
      const options = {variables: {authToken}};
      await cashay.mutate('updateUserWithAuthToken', options);
      dispatch(push('/welcome'));
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
