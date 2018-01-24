import {GraphQLNonNull, GraphQLString} from 'graphql';
import {verify} from 'jsonwebtoken';
import getRethink from 'server/database/rethinkDriver';
import sendEmail from 'server/email/sendEmail';
import LoginPayload from 'server/graphql/types/LoginPayload';
import {
  auth0AuthenticationClient as auth0Client,
  clientId as auth0ClientId,
  clientSecret as auth0ClientSecret
} from 'server/utils/auth0Helpers';
import {getUserId} from 'server/utils/authorization';
import segmentIo from 'server/utils/segmentIo';

const login = {
  type: LoginPayload,
  description: 'Log in, or sign up if it is a new user',
  args: {
    // even though the token comes with the bearer, we include it here we use it like an arg since the gatekeeper
    // decodes it into an object
    auth0Token: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The ID Token from auth0, a base64 JWT'
    }
  },
  async resolve(source, {auth0Token}, {dataLoader}) {
    const r = getRethink();
    const now = new Date();

    // VALIDATION
    const authToken = verify(auth0Token, Buffer.from(auth0ClientSecret, 'base64'), {audience: auth0ClientId});
    const viewerId = getUserId(authToken);

    // RESOLUTION
    if (authToken.tms) {
      const user = await dataLoader.get('users').load(viewerId);
      // LOGIN
      if (user) {
        return {userId: viewerId};
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
    return {userId: viewerId};
  }
};

export default login;
