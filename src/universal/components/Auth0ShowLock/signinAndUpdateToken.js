import {cashay} from 'cashay';
import {setAuthToken} from 'universal/redux/authDuck';
import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';

export default async function signinAndUpdateToken(atmosphere, dispatch, profile, auth0Token) {
  cashay.create({httpTransport: new ActionHTTPTransport(auth0Token)});
  const options = {variables: {auth0Token}};
  /*
   * We must await this mutation in order to wait for the server to
   * acknowledge that a possibly new User has been written to the DB.
   */
  await cashay.mutate('updateUserWithAuthToken', options);
  dispatch(setAuthToken(auth0Token));
  SendClientSegmentEventMutation(atmosphere, 'User Login');
}
