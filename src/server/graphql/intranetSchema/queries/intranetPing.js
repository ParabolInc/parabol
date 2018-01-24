import {GraphQLString} from 'graphql';
import {requireSU} from 'server/utils/authorization';

const intranetPing = {
  type: GraphQLString,
  description: 'Check if this server is alive (an example query).',
  async resolve(source, args, {authToken}) {
    requireSU(authToken);
    return 'pong!';
  }
};

export default intranetPing;
