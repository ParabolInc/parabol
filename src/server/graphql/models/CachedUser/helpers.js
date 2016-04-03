import r from '../../../database/rethinkdriver';

export const getUserByUserId = async userId => {
  const users = await r.table('CachedUser').getAll(userId, {index: 'userId'}).limit(1);
  return users[0];
};
