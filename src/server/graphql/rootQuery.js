import {GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import activeProUserCount from 'server/graphql/queries/activeProUserCount';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    activeProUserCount,
    viewer: {
      type: User,
      resolve: (source, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken);
        return dataLoader.get('users').load(viewerId);
      }
    }
  })
});
