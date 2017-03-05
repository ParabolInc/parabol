import mintToken from './mintToken';
import getRethink from '../../database/rethinkDriver';

export default async function refreshAuthToken(userId) {
  const r = getRethink();
  const user = await r.table('User').get(userId).default({tms: null});
  return mintToken(userId, {tms: user.tms});
}
