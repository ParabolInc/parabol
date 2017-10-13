import {GraphQLInt, GraphQLObjectType} from 'graphql';

const OrgUserCount = new GraphQLObjectType({
  name: 'OrgUserCount',
  fields: () => ({
    inactiveUserCount: {
      type: GraphQLInt,
      description: 'The number of orgUsers who have an inactive flag'
    },
    activeUserCount: {
      type: GraphQLInt,
      description: 'The number of orgUsers who do not have an inactive flag'
    }
  })
});

export default OrgUserCount;
