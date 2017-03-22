import {cashay} from 'cashay';
import {removeAuthToken} from 'universal/redux/authDuck';
import {reset as resetAppState} from 'universal/redux/rootDuck';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import {
  APP_UPGRADE_PENDING_KEY,
  APP_UPGRADE_PENDING_RELOAD
} from 'universal/utils/constants';

const signoutSuccess = {
  title: 'Tootles!',
  message: 'You\'ve been logged out successfully.'
};

export default function signout(dispatch, router) {
  const reloadPendingState = window.sessionStorage.getItem(APP_UPGRADE_PENDING_KEY);
  dispatch(segmentEventTrack('User Logout'));
  dispatch(removeAuthToken());
  /* reset the app state, but preserve any pending notifications: */
  if (router) {
    router.replace('/');
  }
  dispatch(resetAppState());
  if (reloadPendingState !== APP_UPGRADE_PENDING_RELOAD) {
    dispatch(showSuccess(signoutSuccess));
  }
  cashay.clear();
}
