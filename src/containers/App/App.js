import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from 'redux/modules/auth';
import { addPathHelpers } from 'redux/modules/appInfo';
import { pushState } from 'redux-router';
import connectData from 'helpers/connectData';

const styles = require('./App.scss');

function fetchData(getState, dispatch) {
  const promises = [];
  // Path helpers (hostname, port)
  // Gets app info available server side and pushes to state,
  // making it available when client state is rehydrated.
  const hostname = process.env.HOST || 'localhost';
  const port = process.env.PORT;
  if (!isAuthLoaded(getState())) {
    promises.push(dispatch(loadAuth()));
  }
  if (hostname && port) {
    promises.push(dispatch(addPathHelpers(hostname, port)));
  }
  return Promise.all(promises);
}

@connectData(fetchData)
@connect(
  state => ({user: state.auth.user}),
  {logout, pushState})
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // login
      this.props.pushState(null, '/loginSuccess');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState(null, '/');
    }
  }

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
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
