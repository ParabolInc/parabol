import r from 'server/database/rethinkDriver';

export const createUserProfile = async () => {
  const changes = await r.table('UserProfile').insert({
    emailWelcomed: false
  }, { returnChanges: true });
  return changes.generated_keys[0];
};
