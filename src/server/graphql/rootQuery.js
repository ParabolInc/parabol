import {GraphQLObjectType} from 'graphql';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import suCountTiersForUser from 'server/graphql/queries/suCountTiersForUser';
import suOrgCount from 'server/graphql/queries/suOrgCount';
import suProOrgInfo from 'server/graphql/queries/suProOrgInfo';
import suUserCount from 'server/graphql/queries/suUserCount';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    suCountTiersForUser,
    suUserCount,
    suProOrgInfo,
    suOrgCount,
    viewer: {
      type: User,
      resolve: (source, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken);
        return dataLoader.get('users').load(viewerId);
      }
    }
  })
});
