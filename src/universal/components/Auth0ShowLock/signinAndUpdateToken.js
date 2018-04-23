import LoginMutation from 'universal/mutations/LoginMutation';
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation';
import getGraphQLError from 'universal/utils/relay/getGraphQLError';

export default async function signinAndUpdateToken(atmosphere, dispatch, history, location, auth0Token) {
  atmosphere.setAuthToken(auth0Token);
  const onError = (err) => {
    console.error('Error logging in', err);
  };
  const onCompleted = (res, errors) => {
    const serverError = getGraphQLError(res, errors);
    if (serverError) {
      onError(serverError.message);
      return;
    }
    const {login: {authToken, user: {tms}}} = res;
    atmosphere.setAuthToken(authToken);
    const nextUrl = new URLSearchParams(location.search).get('redirectTo') || tms ? '/me' : '/welcome';
    history.push(nextUrl);
    SendClientSegmentEventMutation(atmosphere, 'User Login');
  };

  LoginMutation(atmosphere, auth0Token, onError, onCompleted);
}
