import r from '../../../database/rethinkDriver';
import {GraphQLString} from 'graphql';
import {CachedUserAndToken} from './cachedUserSchema';
import {AuthenticationClient} from 'auth0';
import {auth0} from '../../../../universal/utils/clientOptions';
import sendEmail from '../../../email/sendEmail';
import ms from 'ms';
import {errorObj} from '../utils';

const auth0Client = new AuthenticationClient({
  domain: auth0.account,
  clientId: auth0.clientId
});

export default {
  updateUserWithAuthToken: {
    type: CachedUserAndToken,
    description: 'Given a new auth token, grab all the information we can from auth0 about the user',
    args: {
      // even though the token comes with the bearer, we include it here we use it like an arg
      authToken: {
        type: GraphQLString,
        description: 'The ID Token from auth0, a base64 JWT'
      }
    },
    async resolve(source, {authToken}) {
      // This is the only resolve function where authToken refers to a base64 string and not an object
      if (!authToken) {
        throw errorObj({_error: 'No JWT was provided'});
      }
      const userInfo = await auth0Client.tokens.getInfo(authToken);
      const now = new Date();
      // TODO loginsCount and blockedFor are not a part of this API response
      const newUserObj = {
        cachedAt: now,
        // TODO set expiry here
        cacheExpiresAt: new Date(now.valueOf() + ms('30d')),
        // from auth0
        id: userInfo.user_id,
        createdAt: new Date(userInfo.created_at),
        updatedAt: new Date(userInfo.updated_at),
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
      const emailWelcomed = await sendEmail('newUser', newUserObj);
      const welcomeSentAt = emailWelcomed ? new Date() : null;
      await r.table('UserProfile').insert({id: newUserObj.id, welcomeSentAt, isNew: true});
      // must wait for write to UserProfile because a query could follow quickly after
      return newUserAndToken;
    }
  }
};
