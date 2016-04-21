import r from '../../../database/rethinkdriver'; // eslint-disable-line id-length
import {GraphQLString} from 'graphql';
import {CachedUser} from './cachedUserSchema';
import { AuthenticationClient } from 'auth0';
import {auth0} from '../../../../universal/utils/clientOptions';

// TODO this stuff is no good, we need the good server stuff so we don't 401
const auth0Client = new AuthenticationClient({
  domain: auth0.account,
  clientId: auth0.clientId
});

export default {
  updateUserWithIdToken: {
    type: CachedUser,
    args: {
      idToken: {
        type: GraphQLString,
        description: 'The ID Token from auth0, a base64 JWT'
      }
    },
    async resolve(source, {idToken}) {
      const userInfo = await auth0Client.tokens.getInfo(idToken);
      // TODO add the userId to the JWT to eliminate call to DB?
      // JWT.sub is the userId, not id, maybe it'll do
      // TODO loginsCount and blockedFor are not a part of this API response
      // const user = await getUserByUserId(userInfo.user_id); // eslint-disable-line camelcase
      // const id = user && user.id;
      const newUserObj = {
        cachedAt: new Date(),
        // TODO set expiry here
        cacheExpiresAt: new Date(),
        // from auth0
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
      await r.table('CachedUser').insert(newUserObj, {conflict: 'update'});
      return newUserObj;
    }
  }
};
