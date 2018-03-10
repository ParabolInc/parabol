import LoginMutation from 'universal/mutations/LoginMutation';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import {setAuthToken} from 'universal/redux/authDuck';
import callIfErrors from 'universal/utils/relay/callIfErrors';

export default async function signinAndUpdateToken(atmosphere, dispatch, profile, auth0Token) {
  atmosphere.setAuthToken(auth0Token);
  const onError = (err) => {
    console.error('Error logging in', err);
  };
  const onCompleted = (res, errors) => {
    const {login: {user}} = res;
    dispatch(setAuthToken(auth0Token, user));
    SendClientSegmentEventMutation(atmosphere, 'User Login');
    callIfErrors(onError, errors);
  };

  LoginMutation(atmosphere, auth0Token, onError, onCompleted);
}
