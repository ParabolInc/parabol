import React, {Component, PropTypes} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import Helmet from 'react-helmet';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import {head} from 'universal/utils/clientOptions';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';
import {injectStyleOnce} from 'aphrodite/lib/inject';
import injectGlobals from 'universal/styles/hepha';
import auth0Overrides from 'universal/styles/theme/auth0Overrides';

export default class LandingContainer extends Component {
  static propTypes = {
    auth: PropTypes.object,
    user: PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.string,
      picture: PropTypes.string,
      preferredName: PropTypes.string
    }),
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    injectGlobals(injectStyleOnce, auth0Overrides);
  }

  render() {
    const {dispatch} = this.props;
    const showLockThunk = () => showLock(dispatch);
    return (
      <div>
        <Helmet title="Welcome to Action" {...head} />
        <Landing handleLoginClick={showLockThunk} {...this.props} />
      </div>
    );
  }
};

export default loginWithToken(LandingContainer);
