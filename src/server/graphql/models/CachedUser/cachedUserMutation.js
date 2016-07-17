import r from 'server/database/rethinkDriver';
import {GraphQLString, GraphQLNonNull} from 'graphql';
import {CachedUser} from './cachedUserSchema';
import {AuthenticationClient} from 'auth0';
import {auth0} from 'universal/utils/clientOptions';
import sendEmail from 'server/email/sendEmail';
import ms from 'ms';

const auth0Client = new AuthenticationClient({
  domain: auth0.account,
  clientId: auth0.clientId
});

export default {
  updateUserWithAuthToken: {
    type: CachedUser,
    description: 'Given a new auth token, grab all the information we can from auth0 about the user',
    args: {
      // even though the token comes with the bearer, we include it here we use it like an arg since the gatekeeper
      // decodes it into an object
      authToken: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The ID Token from auth0, a base64 JWT'
      }
    },
    async resolve(source, {authToken}) {
      // This is the only resolve function where authToken refers to a base64 string and not an object
      const userInfo = await auth0Client.tokens.getInfo(authToken);
      const now = new Date();
      // TODO loginsCount and blockedFor are not a part of this API response
      const newUser = {
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
      const changes = await r.table('CachedUser').insert(newUser, {
        conflict: 'update',
        returnChanges: true
      });
      // Did we update an existing cached profile?
      if (changes.replaced === 0) {
        const emailWelcomed = await sendEmail(newUser.email, 'welcomeEmail', newUser);
        const welcomeSentAt = emailWelcomed ? new Date() : null;
        // must wait for write to UserProfile because a query could follow quickly after
        await r.table('UserProfile').insert({id: newUser.id, welcomeSentAt, isNew: true});
      }
      return newUser;
    }
  }
};
