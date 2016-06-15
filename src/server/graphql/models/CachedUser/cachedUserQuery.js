import {GraphQLNonNull, GraphQLID, GraphQLString} from 'graphql';
import {CachedUser, CachedUserAndToken} from './cachedUserSchema';
import {getUserByUserId} from './helpers';
import {errorObj} from '../utils';

export default {
  getUserByUserId: {
    type: CachedUser,
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The user ID for the desired profile'
      }
    },
    async resolve(source, {userId}) {
      const user = await getUserByUserId(userId);
      if (!user) {
        throw errorObj({_error: 'User ID not found'});
      }
      return user;
    }
  },
  getUserWithAuthToken: {
    type: CachedUserAndToken,
    async resolve(source, args, {authToken}) {
      // TODO ensure authToken.userId matches 
      const userInfo = await auth0Client.tokens.getInfo(authToken);
      // TODO add the userId to the JWT to eliminate call to DB?
      // JWT.sub is the userId, not id, maybe it'll do
      // TODO loginsCount and blockedFor are not a part of this API response
      // const user = await getUserByUserId(userInfo.user_id); // eslint-disable-line camelcase
      // const id = user && user.id;
      const newUserObj = {
        cachedAt: new Date(),
        // TODO set expiry here
        cacheExpiresAt: new Date(),
        // from auth0
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
      const changes = await r.table('CachedUser').insert(newUserObj, {
        conflict: 'update',
        returnChanges: true
      });
      // Did we update an existing cached profile?
      if (changes.replaced > 0) {
        return newUserObj;
      }
      // Let's make a new user profile object and link it to the CachedUser:
      const userProfileId = await createUserProfile();
      await r.table('CachedUser')
        .get(changes.generated_keys[0])
        .update({ userProfileId });
      newUserObj.userProfileId = userProfileId;

      await triggerNewUserEmail(newUserObj);

      return newUserObj;
    }
  }
};
