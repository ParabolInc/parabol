import {GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import suActiveProOrgCount from 'server/graphql/queries/suActiveProOrgCount';
import suActiveProUserCount from 'server/graphql/queries/suActiveProUserCount';
import suCountTiersForUser from 'server/graphql/queries/suCountTiersForUser';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    suActiveProOrgCount,
    suActiveProUserCount,
    suCountTiersForUser,
    viewer: {
      type: User,
      resolve: (source, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken);
        return dataLoader.get('users').load(viewerId);
      }
    }
  })
});
