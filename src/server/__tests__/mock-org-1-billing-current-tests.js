import test from 'ava';
import mintToken from './utils/mintToken';

import userQuery from '../graphql/models/User/userQuery';

const USER = 'google-oauth2|112540584686400405659';

test('getUserByUserId', t => {
  const token = mintToken(USER);
  const {resolve} = userQuery.getUserByUserId;
  console.log(resolve);
});
