import shortid from 'shortid';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import {GraphQLID, GraphQLInt, GraphQLString, GraphQLNonNull} from 'graphql';
import {User, UserInput} from './userSchema';
import {AuthenticationClient} from 'auth0';
import {auth0} from 'universal/utils/clientOptions';
import sendEmail from 'server/email/sendEmail';
import {requireAuth, requireSU, requireSUOrSelf} from 'server/utils/authorization';
import {errorObj, getS3PutUrl, handleSchemaErrors, updatedOrOriginal, validateAvatarUpload} from 'server/utils/utils';
import {
  auth0ManagementClient,
  clientSecret as auth0ClientSecret
} from 'server/utils/auth0Helpers';
import {verify} from 'jsonwebtoken';
import makeUserServerSchema from 'universal/validation/makeUserServerSchema';
import tmsSignToken from 'server/utils/tmsSignToken';
import {GraphQLURLType} from '../../types';

const auth0Client = new AuthenticationClient({
  domain: auth0.domain,
  clientId: auth0.clientId
});

export default {
  createImposterToken: {
    type: User,
    description: 'for troubleshooting by admins, create a JWT for a given userId',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The target userId to impersonate'
      }
    },
    async resolve(source, {userId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSU(authToken);

      // VALIDATION
      const user = await r.table('User').get(userId).default({tms: null});
      if (user.tms === null) {
        throw errorObj({_error: `User ${userId} does not exist or has no teams`});
      }

      // RESOLUTION
      const newToken = {
        iss: authToken.iss,
        sub: user.id,
        aud: auth0.clientId
      };

      user.jwt = tmsSignToken(newToken, user.tms);

      return user;
    }
  },
  createUserPicturePutUrl: {
    type: GraphQLURLType,
    description: 'Create a PUT URL on the CDN for the currently authenticated user\'s profile picture',
    args: {
      contentType: {
        type: GraphQLString,
        description: 'user-supplied MIME content type'
      },
      contentLength: {
        type: new GraphQLNonNull(GraphQLInt),
        description: 'user-supplied file size'
      }
    },
    async resolve(source, {avatarOwner, contentType, contentLength}, {authToken}) {
      // AUTH
      const userId = requireAuth(authToken);

      // VALIDATION
      const ext = validateAvatarUpload(contentType, contentLength);

      // RESOLUTION
      const partialPath = `User/${userId}/picture/${shortid.generate()}.${ext}`;
      return await getS3PutUrl(contentType, contentLength, partialPath);

    }
  },
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
      const isValid = verify(authToken, Buffer.from(auth0ClientSecret, 'base64'), {audience: auth0.clientId});
      if (!isValid) {
        throw errorObj({_error: 'The provided token is not valid'});
      }

      // RESOLUTION
      const userInfo = await auth0Client.tokens.getInfo(authToken);
      // TODO loginsCount and blockedFor are not a part of this API response
      const auth0User = {
        cachedAt: now,
        cacheExpiresAt: new Date(now + ms('30d')),
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
        type: new GraphQLNonNull(UserInput),
        description: 'The input object containing the user profile fields that can be changed'
      }
    },
    async resolve(source, {updatedUser}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, updatedUser.id);

      // VALIDATION
      const schema = makeUserServerSchema();
      const {data: {id, ...validUpdatedUser}, errors} = schema(updatedUser);
      handleSchemaErrors(errors);

      // RESOLUTION
      // propagate denormalized changes to TeamMember
      const dbWork = r.table('TeamMember')
        .getAll(id, {index: 'userId'})
        .update({
          picture: validUpdatedUser.picture,
          preferredName: validUpdatedUser.preferredName
        })
        .do(() => r.table('User').get(id).update(validUpdatedUser, {returnChanges: true}));
      const asyncPromises = [
        dbWork,
        auth0ManagementClient.users.updateAppMetadata({id}, {preferredName: validUpdatedUser.preferredName})
      ];
      const [dbProfile] = await Promise.all(asyncPromises);
      //
      // If we ever want to delete the previous profile images:
      //
      // const previousProfile = previousValue(dbProfile);
      // if (previousProfile && urlIsPossiblyOnS3(previousProfile.picture)) {
      // // possible remove prior profile image from CDN asynchronously
      //   s3DeleteObject(previousProfile.picture)
      //   .catch(console.warn.bind(console));
      // }
      //
      return updatedOrOriginal(dbProfile, validUpdatedUser);
    }
  }
};
