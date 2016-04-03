import r from '../../../database/rethinkdriver';
import {GraphQLString} from 'graphql';
import {CachedUser} from './meetingSchema';
import {getUserByUserId} from './helpers';
import { AuthenticationClient } from 'auth0';
import {auth0} from '../../../../universal/utils/clientOptions';

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
      //TODO if it isn't already, add the userId to the JWT to eliminate call to DB
      const user = await getUserByUserId(userInfo.user_id); //eslint-disable-line camelcase
      const id = user && user.id;
      const newUserObj = {
        cachedAt: r.now(),
        //TODO set expiry here
        cacheExpiresAt: r.now(),
        //from auth0
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
      await r.table('CachedUser').get(id).insert(newUserObj, {conflict: 'update'});
      return newUserObj;
    }
  }
};
