import r from '../../../database/rethinkDriver';
import {GraphQLString} from 'graphql';
import {CachedUserAndToken} from './cachedUserSchema';
import {AuthenticationClient} from 'auth0';
import {auth0} from '../../../../universal/utils/clientOptions';
import {triggerNewUserEmail} from './helpers';
import {createUserProfile} from '../UserProfile/helpers';

// TODO this stuff is no good, we need the good server stuff so we don't 401
const auth0Client = new AuthenticationClient({
  domain: auth0.account,
  clientId: auth0.clientId
});

export default {
  updateUserWithAuthToken: {
    type: CachedUserAndToken,
    args: {
      authToken: {
        type: GraphQLString,
        description: 'The ID Token from auth0, a base64 JWT'
      }
    },
    async resolve(source, {authToken}) {
      const userInfo = await auth0Client.tokens.getInfo(authToken);
      // TODO loginsCount and blockedFor are not a part of this API response
      const newUserObj = {
        cachedAt: new Date(),
        // TODO set expiry here
        cacheExpiresAt: new Date(),
        // from auth0
        id: userInfo.user_id,
        createdAt: userInfo.created_at,
        updatedAt: userInfo.updated_at,
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        picture: userInfo.picture,
        name: userInfo.name,
        nickname: userInfo.nickname,
        identities: userInfo.identities || [],
        loginsCount: userInfo.logins_count,
        blockedFor: userInfo.blocked_for || []
      };
      const newUserAndToken = {
        user: newUserObj,
        authToken
      };
      const changes = await r.table('CachedUser').insert(newUserObj, {
        conflict: 'update',
        returnChanges: true
      });
      // Did we update an existing cached profile?
      if (changes.replaced > 0) {
        return newUserAndToken;
      }
      // Let's make a new user profile object and link it to the CachedUser
      // TODO promise.all this since they can run in parallel
      await r.table('UserProfile').insert({id: newUserObj.id, emailWelcomed: false});
      await triggerNewUserEmail(newUserObj);

      return newUserAndToken;
    }
  }
};
