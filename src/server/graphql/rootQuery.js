import {GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import suActiveProUserCount from 'server/graphql/queries/suActiveProUserCount';
import suCountTiersForUser from 'server/graphql/queries/suCountTiersForUser';
import suProOrgCount from 'server/graphql/queries/suProOrgCount';
import suProOrgInfo from 'server/graphql/queries/suProOrgInfo';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    suActiveProUserCount,
    suCountTiersForUser,
    suProOrgCount,
    suProOrgInfo,
    viewer: {
      type: User,
      resolve: (source, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken);
        return dataLoader.get('users').load(viewerId);
      }
    }
  })
});
