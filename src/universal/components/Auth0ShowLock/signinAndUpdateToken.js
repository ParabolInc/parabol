import {cashay} from 'cashay';
import {setAuthToken} from 'universal/redux/authDuck';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import {PENDING_REDIRECT_KEY} from 'universal/utils/constants';

export default async function signinAndUpdateToken(dispatch, router, profile, authToken) {
  cashay.create({httpTransport: new ActionHTTPTransport(authToken)});
  const options = {variables: {authToken}};
  await cashay.mutate('updateUserWithAuthToken', options);
  /*
   * The Invitation script starts processing the token when auth.sub is truthy
   * That doesn't necessarily mean that the DB has created the new user's
   * account though. Auth0 could take awhile. So, to avoid the race condition,
   * wait for the account be get created, then set the token to accept the
   * token.
   */
  dispatch(setAuthToken(authToken, profile));
  const pendingRedirect = window.sessionStorage.getItem(PENDING_REDIRECT_KEY);
  if (pendingRedirect) {
    router.replace(pendingRedirect);
  }
  dispatch(segmentEventTrack('User Login'));
}
