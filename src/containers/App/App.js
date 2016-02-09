import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from 'redux/modules/auth';
import { updateAppUrl } from 'redux/modules/appInfo';
import { pushState } from 'redux-router';
import connectData from 'helpers/connectData';

const styles = require('./App.scss');

async function fetchData(getState, dispatch) {
  if (!isAuthLoaded(getState())) {
    await dispatch(loadAuth());
  }
}

@connectData(fetchData)
@connect(
  state => ({user: state.auth.user}),
  {logout, pushState, updateAppUrl})
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired,
    updateAppUrl: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentDidMount() {
    const { props } = this;
    props.updateAppUrl(window.location.href);
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (typeof window !== 'undefined' && window.location &&
          window.location.href) {
      props.updateAppUrl(window.location.href);
    }
    if (!props.user && nextProps.user) {
      // login
      props.pushState(null, '/loginSuccess');
    } else if (this.props.user && !nextProps.user) {
      // logout
      props.pushState(null, '/');
    }
  }

  handleLogout = (event) => {
    const { props } = this;
    event.preventDefault();
    props.logout();
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
