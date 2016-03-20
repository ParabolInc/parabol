import Database from './database';
import { AuthenticationClient } from 'auth0';
import config from '../../config/config';

const type = Database.type;
const auth0 = new AuthenticationClient({
  domain: config.auth0.domain,
  clientId: config.auth0.audience,
});

export const CachedUser = Database.createModel('CachedUser', {
  // locally set:
  id: type.string(),
  cachedAt: type.date(),
  cacheExpiresAt: type.date().default(Database.r.now()),
  // from auth0:
  createdAt: type.date(),
  updatedAt: type.date(),
  userId: type.string(),
  email: type.string().email(),
  emailVerified: type.boolean().default(false),
  picture: type.string(),
  name: type.string(),
  nickname: type.string(),
  identities: type.array().default([]),
  loginsCount: type.number(),
  blockedFor: type.array().default([])
});

CachedUser.ensureIndex('userId');

function getUserByUserId(userId) {
  return new Promise( (resolve, reject) => {
    CachedUser.getAll(userId, { index: 'userId'}).limit(1)
    .then((result) => {
      // TODO: handle cache expiration here
      resolve(result[0]);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

CachedUser.defineStatic('getUserByUserId', getUserByUserId);

async function updateWithToken(idToken) {
  const userInfo = await auth0.tokens.getInfo(idToken);
  let aUser = await CachedUser.getUserByUserId(userInfo.user_id);

  const fieldData = {
    createdAt: userInfo.created_at,
    updatedAt: userInfo.updated_at,
    userId: userInfo.user_id,
    email: userInfo.email,
    emailVerified: userInfo.email_verified,
    picture: userInfo.picture,
    name: userInfo.name,
    nickname: userInfo.nickname,
    identities: userInfo.identities,
    loginsCount: userInfo.logins_count,
    blockedFor: userInfo.blocked_for
  };

  if (!aUser) {
    aUser = new CachedUser(fieldData);
  } else {
    await aUser.merge(fieldData);
  }
  await aUser.save();

  return aUser;
}

CachedUser.defineStatic('updateWithToken', updateWithToken);
