import r from 'server/database/rethinkDriver';
import {GraphQLString, GraphQLNonNull} from 'graphql';
import {User, UpdateUserInput} from './userSchema';
import {AuthenticationClient} from 'auth0';
import {auth0} from 'universal/utils/clientOptions';
import sendEmail from 'server/email/sendEmail';
import ms from 'ms';
import {requireSUOrSelf} from '../authorization';
import {updatedOrOriginal} from '../utils';

const auth0Client = new AuthenticationClient({
  domain: auth0.account,
  clientId: auth0.clientId
});

export default {
  updateUserWithAuthToken: {
    type: User,
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
      const now = new Date();
      const userInfo = await auth0Client.tokens.getInfo(authToken);
      // const {user_id: userId} = userInfo;
      // const currentUser = await r.table('User').get(userId);

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
      const changes = await r.table('User').insert(newUser, {
        conflict: 'update',
        returnChanges: true
      });
      // Did we update an existing user?
      if (changes.replaced === 0) {
        const emailWelcomed = await sendEmail(newUser.email, 'welcomeEmail', newUser);
        const welcomeSentAt = emailWelcomed ? new Date() : null;
        // must wait for write to UserProfile because a query could follow quickly after
        const newInfo = {welcomeSentAt, isNew: true};
        Object.assign(newUser, newInfo);
        await r.table('User').get(newUser.id).update(newInfo);
      } else {
        // assume the user has at least 1 team
        await r.table('TeamMember')
          .getAll(newUser.id, {index: 'userId'})
          .update({picture: newUser.picture});
      }
      return newUser;
    }
  },
  updateUserProfile: {
    type: User,
    args: {
      updatedUser: {
        type: new GraphQLNonNull(UpdateUserInput),
        description: 'The input object containing the user profile fields that can be changed'
      }
    },
    async resolve(source, {updatedUser}, {authToken}) {
      const {id, ...updatedObj} = updatedUser;
      requireSUOrSelf(authToken, id);
      /*
       * If we really want to be jocky, we can optmize this into a single
       * ReQL query at the expense of readability:
       */
      const hasTeam = await r.table('TeamMember')
        .getAll(id, {index: 'userId'})
        .isEmpty()
        .not();
      const dbProfile = await r.table('User').get(id)
        .update({
          ...updatedObj,
          isNew: !hasTeam,
        }, {returnChanges: true});
      if (hasTeam) {
        // propagate denormalized changes to TeamMember
        await r.table('TeamMember')
          .getAll(id, {index: 'userId'})
          .update({preferredName: updatedUser.preferredName});
      }
      return updatedOrOriginal(dbProfile, updatedUser);
    }
  }
};
