/**
 * The sign-in page.  Hosts 3rd part signin, email/password signin, and
 * also functions as the callback handler for the Auth0 OIDC response.
 *
 * @flow
 */
import type {Dispatch} from 'redux';
import type {RouterHistory, Location} from 'react-router-dom';

import auth0 from 'auth0-js';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import signinAndUpdateToken from 'universal/components/Auth0ShowLock/signinAndUpdateToken';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

import Header from './Header';
import SignIn from './SignIn';
import chunkArray from 'universal/utils/chunkArray';

type Credentials = {
  email: string,
  password: string
};

type ParsedAuthResponse = {
  idToken: string,
  idTokenPayload: Object
};

type Props = {
  atmosphere: Object,
  dispatch: Dispatch<*>,
  hasSession: boolean,
  history: RouterHistory,
  location: Location
};

type State = {
  loggingIn: boolean,
  error: ?Error
};

const containerStyles = {
  display: 'flex',
  flexDirection: 'column'
};

// A naive implementation taking a querystring-formatted string (beginning in '?'),
// and returning an object of the key/value pairs.  Will not work for null-valued
// keys, but works for our own `?redirectTo=/path/to/page` contract.
const parseSearch = (search: string): Object => {
  if (!search) { return {}; }
  const assocArray = chunkArray(search.slice(1).split(/=|&/), 2);
  return assocArray.reduce((acc, [key, val]) => ({...acc, [key]: val}), {});
};

class SignInPage extends Component<Props, State> {
  state = {
    error: null,
    loggingIn: false
  };

  componentWillMount() {
    this.maybeRedirectToApp();
    this.maybeCaptureAuthResponse();
  }

  componentDidUpdate() {
    this.maybeRedirectToApp();
  }

  maybeRedirectToApp = () => {
    if (this.props.hasSession) {
      const parsedSearch = parseSearch(this.props.location.search);
      const pathToVisit = parsedSearch.redirectTo || '/me';
      this.props.history.replace(pathToVisit);
    }
  };

  maybeCaptureAuthResponse = () => {
    // If we've received an auth response, log us in
    const {hash} = this.props.location;
    if (hash) {
      this.setState({loggingIn: true});
      this.parseAuthResponse(hash)
        .then(this.saveTokens);
    }
  };

  parseAuthResponse = (hash: string): Promise<ParsedAuthResponse> => {
    return new Promise((resolve, reject) => {
      this.webAuth.parseHash({hash}, (err, authResult) => {
        if (err) {
          return reject(err);
        }
        return resolve(authResult);
      });
    });
  };

  saveTokens = (response: ParsedAuthResponse): void => {
    signinAndUpdateToken(this.props.atmosphere, this.props.dispatch, null, response.idToken);
  };

  webAuth = new auth0.WebAuth({
    domain: __AUTH0_DOMAIN__,
    clientID: __AUTH0_CLIENT_ID__,
    redirectUri: window.location.href,
    scope: 'openid rol tms bet'
  });

  handleSubmitCredentials = ({email, password}: Credentials) => {
    this.webAuth.login({
      email,
      password,
      realm: 'Username-Password-Authentication', // FIXME: extract this as AUTH0_REALM to .env
      responseType: 'token'
    }, (error) => {
      this.setState({error});
    });
  };

  render() {
    const {loggingIn, error} = this.state;
    return loggingIn ? (
      <LoadingView />
    ) : (
      <div style={containerStyles}>
        <Header />
        {error &&
          <div>An error!</div>
        }
        <SignIn
          authProviders={[{displayName: 'Google'}, {displayName: 'Hooli'}]}
          handleSubmitCredentials={this.handleSubmitCredentials}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  hasSession: Boolean(state.auth.obj.sub)
});

const mapDispatchToProps = (dispatch) => ({
  dispatch
});

export default withAtmosphere(
  withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SignInPage)
  )
);
