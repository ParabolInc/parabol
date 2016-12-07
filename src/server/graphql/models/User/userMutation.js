import getRethink from 'server/database/rethinkDriver';
import {GraphQLString, GraphQLNonNull} from 'graphql';
import {User, UpdateUserInput} from './userSchema';
import {AuthenticationClient} from 'auth0';
import {auth0} from 'universal/utils/clientOptions';
import sendEmail from 'server/email/sendEmail';
import ms from 'ms';
import {requireSUOrSelf} from '../authorization';
import {errorObj, handleSchemaErrors, updatedOrOriginal} from '../utils';
import {auth0ManagementClient, clientSecret} from 'server/utils/auth0Helpers';
import {verify} from 'jsonwebtoken';
import makeStep1Schema from 'universal/validation/makeStep1Schema';

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
      const r = getRethink();

      // VALIDATION
      // This is the only resolve function where authToken refers to a base64 string and not an object
      const now = new Date();
      const isValid = verify(authToken, Buffer.from(clientSecret, 'base64'), {audience: auth0.clientId});
      if (!isValid) {
        throw errorObj({_error: 'The provided token is not valid'});
      }

      // RESOLUTION
      const userInfo = await auth0Client.tokens.getInfo(authToken);
      // TODO loginsCount and blockedFor are not a part of this API response
      const auth0User = {
        cachedAt: now,
        cacheExpiresAt: new Date(now.valueOf() + ms('30d')),
        // from auth0
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        lastLogin: now,
        updatedAt: new Date(userInfo.updated_at),
        picture: userInfo.picture,
        id: userInfo.user_id,
        name: userInfo.name,
        nickname: userInfo.nickname,
        preferredName: userInfo.preferredName || userInfo.nickname,
        identities: userInfo.identities || [],
        createdAt: new Date(userInfo.created_at),
        tms: userInfo.tms
      };
      const {email, id: userId, picture, preferredName} = auth0User;
      const currentUser = await r.table('User').get(userId);
      if (currentUser) {
        // invalidate the email/picture/preferredName where it is denormalized
        const dbWork = r.table('User').get(userId).update(auth0User)
          .do(() => {
            return r.table('TeamMember').getAll(userId, {index: 'userId'}).update({
              email,
              picture,
              preferredName
            });
          });

        const asyncPromises = [
          dbWork,
          auth0ManagementClient.users.updateAppMetadata({id: userId}, {preferredName})
        ];
        await Promise.all(asyncPromises);
        return {...currentUser, ...auth0User};
      }
      // new user activate!
      const emailWelcomed = await sendEmail(auth0User.email, 'welcomeEmail', auth0User);
      const welcomeSentAt = emailWelcomed ? new Date() : null;
      const returnedUser = {
        ...auth0User,
        lastLogin: now,
        notificationFlags: 0,
        welcomeSentAt
      };
      const asyncPromises = [
        r.table('User').insert(returnedUser),
        auth0ManagementClient.users.updateAppMetadata({id: userId}, {preferredName})
      ];
      await Promise.all(asyncPromises);
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
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, updatedUser.id);
      // const {id, ...updatedObj} = updatedUser;

      // VALIDATION
      const schema = makeStep1Schema();
      const {data: {id, ...validUpdatedUser}, errors} = schema(updatedUser);
      handleSchemaErrors(errors);
      // propagate denormalized changes to TeamMember
      const dbWork = r.table('TeamMember')
        .getAll(id, {index: 'userId'})
        .update({preferredName: validUpdatedUser.preferredName})
        .do(() => r.table('User').get(id).update(validUpdatedUser, {returnChanges: true}));
      const asyncPromises = [
        dbWork,
        auth0ManagementClient.users.updateAppMetadata({id}, {preferredName: validUpdatedUser.preferredName})
      ];
      const [dbProfile] = await Promise.all(asyncPromises);
      return updatedOrOriginal(dbProfile, validUpdatedUser);
    }
  }
};
