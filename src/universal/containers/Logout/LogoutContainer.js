import React, {PropTypes, Component} from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';
import {removeAuthToken} from 'universal/redux/authDuck';
import {reset as resetAppState} from 'universal/redux/rootDuck';
import {withRouter} from 'react-router';
import {segmentEvent} from 'universal/redux/segmentActions';
import {cashay} from 'cashay';

const logoutSuccess = {
  title: 'Tootles!',
  message: 'You\'ve been logged out successfully.',
  level: 'success'
};

@connect()
@withRouter
export default class LogoutContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    const {dispatch, router} = this.props;
    dispatch(removeAuthToken());
    /* reset the app state, but preserve any pending notifications: */
    router.replace('/');
    dispatch(resetAppState());
    dispatch(showSuccess(logoutSuccess));
    dispatch(segmentEvent('User Logout'));
    cashay.clear();
    if (typeof window !== 'undefined' && typeof window.analytics !== 'undefined') {
      // inform segment of the logout, wipe state:
      window.analytics.reset();
    }
  }

  render() { return null; }
}
