import React, {PropTypes, Component} from 'react';
import Action from '../../components/Action/Action';
import {connect} from 'react-redux';
// TODO: use these variables and remove eslint override
/* eslint-disable no-unused-vars */
import {localStorageVars} from '../../utils/clientOptions';
import loginWithToken from '../../decorators/loginWithToken/loginWithToken';
import {cashay} from 'cashay';

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
};
// TODO: remove eslint override
/* eslint-enable no-unused-vars */
const mapStateToProps = () => ({
  // response: cashay.query(queryString, cashayOptions)
});

// for the decorators
@connect(mapStateToProps)
// eslint-disable-next-line react/prefer-stateless-function
export default class ActionContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };

  render() {
    return <Action {...this.props} />;
  }
}
