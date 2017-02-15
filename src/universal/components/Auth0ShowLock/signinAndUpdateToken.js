import {cashay} from 'cashay';
import {setAuthToken} from 'universal/redux/authDuck';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import {segmentEventIdentify, segmentEventTrack} from 'universal/redux/segmentActions';

export default async function signinAndUpdateToken(dispatch, profile, auth0Token) {
  cashay.create({httpTransport: new ActionHTTPTransport(auth0Token)});
  const options = {variables: {auth0Token}};
  cashay.mutate('updateUserWithAuthToken', options)
    .then(() => {
      // need to wait for the user profile to come back
      dispatch(segmentEventIdentify());
      dispatch(segmentEventTrack('User Login'));
    });
  /*
   * The Invitation script starts processing the token when auth.sub is truthy
   * That doesn't necessarily mean that the DB has created the new user's
   * account though. Auth0 could take awhile. So, to avoid the race condition,
   * wait for the account be get created, then set the token to accept the
   * token.
   */
  dispatch(setAuthToken(auth0Token));
}
