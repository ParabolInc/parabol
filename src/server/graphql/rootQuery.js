import {GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: User,
      resolve: (source, args, {authToken}) => ({
        id: authToken.sub
      })
    }
  })
});
