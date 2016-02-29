import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getUserInfo, isTokenLoaded, loadToken,
         setToken, setTokenError } from 'redux/modules/auth';
import { updateAppUrl } from 'redux/modules/appInfo';
import { pushState } from 'redux-router';
import connectData from 'helpers/connectData';
import lock from 'helpers/getAuth0Lock';

const styles = require('./App.scss');

async function fetchData(getState, dispatch) {
  if (!isTokenLoaded(getState())) {
    await dispatch(loadToken());
  }
}

@connectData(fetchData)
@connect(
  state => ({
    token: state.auth.token.value,
    user: state.auth.user
  }),
  {getUserInfo, setToken, setTokenError, pushState, updateAppUrl})
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    token: PropTypes.string,
    user: PropTypes.object,
    getUserInfo: PropTypes.func.isRequired,
    setToken: PropTypes.func.isRequired,
    setTokenError: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    updateAppUrl: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentDidMount() {
    const { props } = this;
    props.updateAppUrl(window.location.href);
    const authHash = lock.parseHash(window.location.hash);
    if (!props.token && authHash) {
      if (authHash.id_token) {
        props.setToken(authHash.id_token);
        props.getUserInfo(authHash.id_token);
        if (authHash.state) {
          // redirect to final location after authenticating:
          this.props.pushState(null, authHash.state);
        }
      }
      if (authHash.error) {
        props.setTokenError(authHash.error);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (typeof window !== 'undefined' && window.location &&
          window.location.href) {
      props.updateAppUrl(window.location.href);
    }
    if (this.props.user && !nextProps.user) {
      // logout
      props.pushState(null, '/');
    }
  }

  render() {
    const {user} = this.props;

    return (
      <div className={styles.viewport} id="viewport">
        <div>
          {user &&
            <p>Logged in as <strong>{user.name}</strong>.</p>}
        </div>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}
