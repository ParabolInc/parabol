import shortid from 'shortid';
import getRethink from 'server/database/rethinkDriver';
import {GraphQLID, GraphQLInt, GraphQLString, GraphQLNonNull} from 'graphql';
import sendEmail from 'server/email/sendEmail';
import {requireAuth, requireSU, requireSUOrSelf} from 'server/utils/authorization';
import {errorObj, handleSchemaErrors, updatedOrOriginal, validateAvatarUpload} from 'server/utils/utils';
import getS3PutUrl from 'server/utils/getS3PutUrl';
import {
  auth0AuthenticationClient as auth0Client,
  clientId as auth0ClientId,
  clientSecret as auth0ClientSecret
} from 'server/utils/auth0Helpers';
import {verify} from 'jsonwebtoken';
import makeUserServerSchema from 'universal/validation/makeUserServerSchema';
import tmsSignToken from 'server/utils/tmsSignToken';
import segmentIo from 'server/utils/segmentIo';
import addFeatureFlag from './addFeatureFlag/addFeatureFlag';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import UpdateUserProfileInput from 'server/graphql/types/UpdateUserProfileInput';
import User from 'server/graphql/types/User';

export default {
  addFeatureFlag,
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
      return {
        ...user,
        jwt: tmsSignToken({sub: user.id}, user.tms)
      };
    }
  },
  createUserPicturePutUrl: {
    type: GraphQLURLType,
    description: 'Create a PUT URL on the CDN for the currently authenticated user’s profile picture',
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
    resolve(source, {contentType, contentLength}, {authToken}) {
      // AUTH
      const userId = requireAuth(authToken);

      // VALIDATION
      const ext = validateAvatarUpload(contentType, contentLength);

      // RESOLUTION
      const partialPath = `User/${userId}/picture/${shortid.generate()}.${ext}`;
      return getS3PutUrl(contentType, contentLength, partialPath);
    }
  },
  updateUserWithAuthToken: {
    type: User,
    description: 'Given an auth0 auth token, return basic user profile info',
    args: {
      // even though the token comes with the bearer, we include it here we use it like an arg since the gatekeeper
      // decodes it into an object
      auth0Token: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The ID Token from auth0, a base64 JWT'
      }
    },
    async resolve(source, {auth0Token}) {
      const r = getRethink();
      const now = new Date();

      // VALIDATION
      const authToken = verify(auth0Token, Buffer.from(auth0ClientSecret, 'base64'), {audience: auth0ClientId});

      // RESOLUTION
      if (authToken.tms) {
        const user = await r.table('User').get(authToken.sub);
        if (user) {
          return user;
        }
        // should never reach this line in production. that means our DB !== auth0 DB
      }
      const userInfo = await auth0Client.tokens.getInfo(auth0Token);
      // TODO loginsCount and blockedFor are not a part of this API response
      const newUser = {
        id: userInfo.user_id,
        cachedAt: now,
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        lastLogin: now,
        updatedAt: new Date(userInfo.updated_at),
        picture: userInfo.picture,
        inactive: false,
        name: userInfo.name,
        preferredName: userInfo.nickname,
        identities: userInfo.identities || [],
        createdAt: new Date(userInfo.created_at),
        userOrgs: [],
        welcomeSentAt: now
      };
      await r.table('User').insert(newUser);
      /*
       * From segment docs:
       *
       * We recommend calling identify a single time when the
       * user’s account is first created, and only identifying
       * again later when their traits change.
       *
       * see: https://segment.com/docs/sources/server/node/
       */
      segmentIo.identify({
        userId: newUser.id,
        traits: {
          avatar: newUser.picture,
          createdAt: newUser.createdAt,
          email: newUser.email,
          name: newUser.preferredName
        }
      });
      // don't await
      setTimeout(() => sendEmail(newUser.email, 'welcomeEmail', newUser), 0);
      return newUser;
    }
  },
  updateUserProfile: {
    type: User,
    args: {
      updatedUser: {
        type: new GraphQLNonNull(UpdateUserProfileInput),
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
      const dbProfileChanges = await r.table('TeamMember')
        .getAll(id, {index: 'userId'})
        .update(validUpdatedUser)
        .do(() => {
          return r.table('User')
            .get(id)
            .update(validUpdatedUser, {returnChanges: 'always'});
        });
      //
      // If we ever want to delete the previous profile images:
      //
      // const previousProfile = previousValue(dbProfileChanges);
      // if (previousProfile && urlIsPossiblyOnS3(previousProfile.picture)) {
      // // possible remove prior profile image from CDN asynchronously
      //   s3DeleteObject(previousProfile.picture)
      //   .catch(console.warn.bind(console));
      // }
      //
      const dbProfile = updatedOrOriginal(dbProfileChanges);
      segmentIo.identify({
        userId: dbProfile.id,
        traits: {
          avatar: dbProfile.picture,
          createdAt: dbProfile.createdAt,
          email: dbProfile.email,
          name: dbProfile.preferredName
        }
      });
      return dbProfile;
    }
  }
};
