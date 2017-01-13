import path from 'path';
import shortid from 'shortid';
import mime from 'mime-types';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import {GraphQLID, GraphQLInt, GraphQLString, GraphQLNonNull} from 'graphql';
import {User, UpdateUserInput} from './userSchema';
import {AuthenticationClient} from 'auth0';
import {auth0} from 'universal/utils/clientOptions';
import sendEmail from 'server/email/sendEmail';
import {requireAuth, requireSU, requireSUOrSelf} from '../authorization';
import {errorObj, handleSchemaErrors, updatedOrOriginal} from '../utils';
import {
  auth0ManagementClient,
  clientSecret as auth0ClientSecret
} from 'server/utils/auth0Helpers';
import {verify} from 'jsonwebtoken';
import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema';
import tmsSignToken from 'server/graphql/models/tmsSignToken';
import protocolRelativeUrl from 'server/utils/protocolRelativeUrl';
import {s3SignPutObject} from 'server/utils/s3';
import {
  APP_CDN_USER_ASSET_SUBDIR,
  APP_MAX_AVATAR_FILE_SIZE
} from 'universal/utils/constants';
import {GraphQLURLType} from '../types';

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
    async resolve(source, {contentType, contentLength}, {authToken}) {
      // AUTH
      const userId = requireAuth(authToken);

      // VALIDATION
      if (typeof process.env.CDN_BASE_URL === 'undefined') {
        throw errorObj({_error: 'CDN_BASE_URL environment variable is not defined'});
      }
      if (!contentType || !contentType.startsWith('image/')) {
        throw errorObj({_error: 'file must be an image'});
      }
      const ext = mime.extension(contentType);
      if (!ext) {
        throw errorObj({_error: `unable to determine extension for ${contentType}`});
      }
      if (contentLength > APP_MAX_AVATAR_FILE_SIZE) {
        throw errorObj({_error: 'avatar image is too large'});
      }

      // RESOLUTION
      const parsedUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL);
      const pathname = path.join(parsedUrl.pathname,
        APP_CDN_USER_ASSET_SUBDIR,
        `User/${userId}/picture/${shortid.generate()}.${ext}`
      );
      return await s3SignPutObject(
        pathname,
        contentType,
        contentLength,
        'public-read'
      );
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
        type: new GraphQLNonNull(UpdateUserInput),
        description: 'The input object containing the user profile fields that can be changed'
      }
    },
    async resolve(source, {updatedUser}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, updatedUser.id);

      // VALIDATION
      const schema = makeUpdatedUserSchema();
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
