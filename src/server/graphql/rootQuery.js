import {GraphQLObjectType} from 'graphql';
import teamMember from './models/TeamMember/teamMemberQuery';
import user from './models/User/userQuery';
import User from 'server/graphql/types/User';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: User,
      resolve: (source, args, {authToken}) => ({
        id: authToken.sub
      })
    },
    ...teamMember,
    ...user
  })
});
