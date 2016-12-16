import {cashay} from 'cashay';
import {removeAuthToken} from 'universal/redux/authDuck';
import {reset as resetAppState} from 'universal/redux/rootDuck';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import {showSuccess} from 'universal/modules/notifications/ducks/notifications';

const signoutSuccess = {
  title: 'Tootles!',
  message: 'You\'ve been logged out successfully.'
};

export default function signout(dispatch, router) {
  dispatch(segmentEventTrack('User Logout'));
  dispatch(removeAuthToken());
  /* reset the app state, but preserve any pending notifications: */
  if (router) {
    router.replace('/');
  }
  dispatch(resetAppState());
  dispatch(showSuccess(signoutSuccess));
  cashay.clear();
  if (typeof window !== 'undefined' && typeof window.analytics !== 'undefined') {
    // inform segment of the signout, wipe state:
    window.analytics.reset();
  }
}
