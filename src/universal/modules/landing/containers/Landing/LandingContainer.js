import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import {showLock} from 'universal/components/Auth0ShowLock/Auth0ShowLock';
import loginWithToken from 'universal/decorators/loginWithToken/loginWithToken';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import {
  APP_UPGRADE_PENDING_KEY,
  APP_UPGRADE_PENDING_FALSE,
  APP_UPGRADE_PENDING_RELOAD,
  APP_UPGRADE_PENDING_DONE
} from 'universal/utils/constants';
import {connect} from 'react-redux';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const mapStateToProps = (state) => {
  return {
    nextUrl: state.auth.nextUrl
  };
};

@loginWithToken
@connect(mapStateToProps)
@withAtmosphere
export default class LandingContainer extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    auth: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    nextUrl: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {refreshNeeded: false};
  }

  componentWillMount() {
    if (typeof window !== 'undefined' &&
        window.sessionStorage.getItem(APP_UPGRADE_PENDING_KEY) ===
          APP_UPGRADE_PENDING_RELOAD) {
      this.setState({refreshNeeded: true});
    } else {
      injectGlobals(globalStyles);
    }
  }

  componentDidMount() {
    const {
      atmosphere,
      dispatch,
      nextUrl
    } = this.props;
    require.ensure([], (require) => {
      require('auth0-lock');
    });
    if (nextUrl) {
      showLock(atmosphere, dispatch);
    }
    const upgradePendingState = window.sessionStorage.getItem(APP_UPGRADE_PENDING_KEY);
    if (upgradePendingState === APP_UPGRADE_PENDING_RELOAD) {
      window.sessionStorage.setItem(APP_UPGRADE_PENDING_KEY,
        APP_UPGRADE_PENDING_DONE);
      window.location.reload();
    } else if (upgradePendingState === APP_UPGRADE_PENDING_DONE) {
      window.sessionStorage.setItem(APP_UPGRADE_PENDING_KEY,
        APP_UPGRADE_PENDING_FALSE);
      dispatch(showInfo({
        title: 'New stuff!',
        message: 'Parabol has been upgraded, log in to see what’s new.',
        action: {
          label: 'Ok'
        },
        autoDismiss: 0
      }));
    }
    const script1 = document.createElement('script');
    const script2 = document.createElement('script');
    script1.src = '//fast.wistia.com/embed/medias/zoyitx0tkh.jsonp';
    script1.async = true;
    script2.src = '//fast.wistia.com/assets/external/E-v1.js';
    script2.async = true;
    document.body.appendChild(script1);
    document.body.appendChild(script2);
  }

  render() {
    let loginClickHandler;
    if (this.state.refreshNeeded) {
      loginClickHandler = () => window.location.reload();
    } else {
      const {atmosphere, dispatch} = this.props;
      loginClickHandler = () => showLock(atmosphere, dispatch);
    }
    return (
      <div>
        <Helmet title="Parabol" />
        <Landing handleLoginClick={loginClickHandler} {...this.props} />
      </div>
    );
  }
}
