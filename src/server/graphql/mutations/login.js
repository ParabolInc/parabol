import {GraphQLNonNull, GraphQLString} from 'graphql';
import {verify} from 'jsonwebtoken';
import getRethink from 'server/database/rethinkDriver';
import sendEmail from 'server/email/sendEmail';
import LoginPayload from 'server/graphql/types/LoginPayload';
import {
  auth0MgmtClientBuilder,
  clientId as auth0ClientId,
  clientSecret as auth0ClientSecret
} from 'server/utils/auth0Helpers';
import {getUserId} from 'server/utils/authorization';
import {sendSegmentIdentify} from 'server/utils/sendSegmentEvent';
import makeAuthTokenObj from 'server/utils/makeAuthTokenObj';
import {sendAuth0Error, sendBadAuthTokenError, sendSegmentIdentifyError} from 'server/utils/authorizationErrors';
import encodeAuthTokenObj from 'server/utils/encodeAuthTokenObj';
import ensureDate from 'universal/utils/ensureDate';

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
    let authToken;
    try {
      authToken = verify(auth0Token, Buffer.from(auth0ClientSecret, 'base64'), {audience: auth0ClientId});
    } catch (e) {
      return sendBadAuthTokenError();
    }
    const viewerId = getUserId(authToken);

    // RESOLUTION
    if (authToken.tms) {
      const user = await dataLoader.get('users').load(viewerId);
      // LOGIN
      if (user) {
        /*
         * The segment docs are inconsistent, and warn against sending
         * identify() on each log in. However, calling identify is the
         * only way to synchronize changing user properties with certain
         * services (such as Hubspot). After checking with support
         * and combing the forums, it turns out sending identify()
         * on each login is just fine.
         *
         * See also: https://community.segment.com/t/631m9s/identify-per-signup-or-signin
         */
        await sendSegmentIdentify(user.id);
        return {
          userId: viewerId,
          // create a brand new auth token using the tms in our DB, not auth0s
          authToken: encodeAuthTokenObj(makeAuthTokenObj({...authToken, tms: user.tms}))
        };
      }
      // should never reach this line in production. that means our DB !== auth0 DB
    }

    let userInfo;
    try {
      const auth0ManagementClient = await auth0MgmtClientBuilder();
      userInfo = await auth0ManagementClient.getUser({
        id: authToken.sub
      });
    } catch (e) {
      return sendAuth0Error(authToken, e);
    }

    const newUser = {
      id: userInfo.user_id,
      cachedAt: now,
      email: userInfo.email,
      emailVerified: userInfo.email_verified,
      lastLogin: now,
      updatedAt: ensureDate(userInfo.updated_at),
      picture: userInfo.picture,
      inactive: false,
      name: userInfo.name,
      preferredName: userInfo.nickname,
      identities: userInfo.identities || [],
      createdAt: ensureDate(userInfo.created_at),
      userOrgs: [],
      welcomeSentAt: now
    };
    await r.table('User').insert(newUser);

    try {
      await sendSegmentIdentify(newUser.id);
    } catch (e) {
      return sendSegmentIdentifyError(authToken, e);
    }

    // don't await
    setTimeout(() => sendEmail(newUser.email, 'welcomeEmail', newUser), 0);
    return {
      authToken: auth0Token,
      userId: viewerId
    };
  }
};

export default login;
