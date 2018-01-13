import {GraphQLNonNull, GraphQLString} from 'graphql';
import {verify} from 'jsonwebtoken';
import getRethink from 'server/database/rethinkDriver';
import sendEmail from 'server/email/sendEmail';
import User from 'server/graphql/types/User';
import {
  auth0AuthenticationClient as auth0Client,
  clientId as auth0ClientId,
  clientSecret as auth0ClientSecret
} from 'server/utils/auth0Helpers';
import segmentIo from 'server/utils/segmentIo';

const updateUserWithAuthToken = {
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
};

export default updateUserWithAuthToken;
