import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql';
import {
  requireSU
} from 'server/utils/authorization';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

export default {
  type: GraphQLString,
  description: 'Give someone advanced features in a flag',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'the email of the person to whom you are giving advanced features'
    }
  },
  async resolve(source, {email}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    const user = await r.table('User')
      .filter((doc) => doc('email').downcase().eq(email))
      .nth(0)
      .default(null);
    if (!user) {
      throw new Error(`${email} was not found on the server!`);
    }
    const userId = user.id;

    auth0ManagementClient.users.updateAppMetadata({id: userId}, {bet: 1});

    // TODO send them a new token while they're logged in because we're that good

    // get a fresh token from auth0

    // publish it on the exchange for the user memo channel
    return `${email} has been given access to beta features. Please have them log in again.`;
  }
};
