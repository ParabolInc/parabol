import LoginMutation from 'universal/mutations/LoginMutation';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import {setAuthToken} from 'universal/redux/authDuck';

export default async function signinAndUpdateToken(atmosphere, dispatch, profile, auth0Token) {
  const onCompleted = (res) => {
    const {updateUserWithAuthToken: {user}} = res;
    dispatch(setAuthToken(auth0Token, user));
    SendClientSegmentEventMutation(atmosphere, 'User Login');
  };
  const onError = (err) => {
    console.error('Error logging in', err);
  };
  LoginMutation(atmosphere, auth0Token, onError, onCompleted);
}
