import {GraphQLID, GraphQLObjectType} from 'graphql';
import {resolveUser} from 'server/graphql/resolvers';
import User from 'server/graphql/types/User';
import tmsSignToken from 'server/utils/tmsSignToken';

const CreateImposterTokenPayload = new GraphQLObjectType({
  name: 'CreateImposterTokenPayload',
  fields: () => ({
    authToken: {
      type: GraphQLID,
      description: 'The new JWT',
      resolve: async (source, args, context) => {
        const user = await resolveUser(source, args, context);
        const {userId} = source;
        const {tms} = user;
        return tmsSignToken({sub: userId}, tms);
      }
    },
    user: {
      type: User,
      description: 'The user you have assumed',
      resolve: resolveUser
    }
  })
});

export default CreateImposterTokenPayload;
