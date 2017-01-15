import React, {Component, PropTypes} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import Helmet from 'react-helmet';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';
import injectGlobals from 'universal/styles/hepha';
import auth0Overrides from 'universal/styles/theme/auth0Overrides';
import {showInfo} from 'universal/modules/notifications/ducks/notifications';
import {APP_UPGRADE_PENDING_KEY} from 'universal/utils/constants';

@loginWithToken
export default class LandingContainer extends Component {
  static propTypes = {
    auth: PropTypes.object,
    user: PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.string,
      picture: PropTypes.string,
      preferredName: PropTypes.string
    }),
    dispatch: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {refreshNeeded: false};
  }

  componentWillMount() {
    injectGlobals(auth0Overrides);
  }

  componentDidMount() {
    if (window.sessionStorage.getItem(APP_UPGRADE_PENDING_KEY) === 'true') {
      this.setState({refreshNeeded: true}); // eslint-disable-line react/no-did-mount-set-state
      window.sessionStorage.setItem(APP_UPGRADE_PENDING_KEY, 'false');
      const {dispatch} = this.props;
      dispatch(showInfo({
        title: 'Almost done upgrading!',
        message: 'Just refreshing the page for you :)',
        autoDismiss: 0
      }));
      window.location.reload();
    }
  }

  render() {
    let loginClickHandler;
    if (this.state.refreshNeeded) {
      loginClickHandler = () => window.location.reload();
    } else {
      const {dispatch} = this.props;
      loginClickHandler = () => showLock(dispatch);
    }
    return (
      <div>
        <Helmet title="Welcome to Action" />
        <Landing handleLoginClick={loginClickHandler} {...this.props} />
      </div>
    );
  }
}
