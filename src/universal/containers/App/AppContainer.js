import React, {PropTypes, Component} from 'react';
import App from '../../components/App/App';
import {connect} from 'react-redux';
import {localStorageVars} from '../../utils/clientOptions';
import loginWithToken from '../../decorators/loginWithToken/loginWithToken';
import {cashay} from 'client/client';

const queryString = `
query {
  profile: updateUserWithAuthToken(authToken: $authToken) {
    id,
    cachedAt,
    cacheExpiresAt,
    createdAt,
    updatedAt,
    userId,
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
}`;

const cashayOptions = {
  component: 'AppContainer',
  variables: {
    
  }
}
const mapStateToProps = () => ({
  response: cashay.query(queryString, cashayOptions)
});

// for the decorators
// eslint-disable-next-line react/prefer-stateless-function
@connect(mapStateToProps)
export default class AppContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };

  render() {
    return <App {...this.props} />;
  }
}
