import test from 'ava';
import mintToken from './utils/mintToken';

import userQuery from '../graphql/models/User/userQuery';

const USER = 'auth0|5797eb9712664ba4675745c3';

test('getUserByUserId', async(t) => {
  t.plan(1);
  const authToken = mintToken(USER, { rol: 'su' });
  const {resolve} = userQuery.getUserByUserId;
  const result = await resolve({}, {userId: USER}, {authToken});
  t.is(result.email, 'matt@prbl.co');
});
