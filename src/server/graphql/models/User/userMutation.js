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
  domain: auth0.domain,
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
      // const params = {id: userInfo.user_id};
      // const metadata = {foo: 1};
      // const auth0ManagementClient = new ManagementClient({
      //   domain: auth0.domain,
      //   token: process.env.AUTH0_CLIENT_SECRET
      // });

      // TODO loginsCount and blockedFor are not a part of this API response
      const auth0User = {
        cachedAt: now,
        cacheExpiresAt: new Date(now.valueOf() + ms('30d')),
        // from auth0
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        updatedAt: new Date(userInfo.updated_at),
        picture: userInfo.picture,
        id: userInfo.user_id,
        name: userInfo.name,
        nickname: userInfo.nickname,
        identities: userInfo.identities || [],
        createdAt: new Date(userInfo.created_at),
        tms: userInfo.tms
      };
      const {id: userId, picture} = auth0User;
      const currentUser = await r.table('User').get(userId);
      let returnedUser;
      if (currentUser) {
        if (currentUser.picture !== picture) {
          // if the picture we have is not the same as the one that auth0 has, then invalidate what we have
          await r.table('TeamMember').getAll(userId, {index: 'userId'}).update({picture});
        }
        returnedUser = Object.assign({}, currentUser, auth0User);
        await r.table('User').get(userId).update(auth0User);
      } else {
        // new user activate!
        const emailWelcomed = await sendEmail(auth0User.email, 'welcomeEmail', auth0User);
        const welcomeSentAt = emailWelcomed ? new Date() : null;
        returnedUser = {
          ...auth0User,
          welcomeSentAt
        };
        await r.table('User').insert(returnedUser);
      }
      return returnedUser;
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
      // propagate denormalized changes to TeamMember
      const dbProfile = await r.table('TeamMember')
        .getAll(id, {index: 'userId'})
        .update({preferredName: updatedUser.preferredName})
        .do(() => r.table('User').get(id).update(updatedObj, {returnChanges: true}));
      return updatedOrOriginal(dbProfile, updatedUser);
    }
  }
};
