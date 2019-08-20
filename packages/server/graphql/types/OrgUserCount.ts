import {GraphQLInt, GraphQLObjectType, GraphQLNonNull} from 'graphql'

const OrgUserCount = new GraphQLObjectType({
  name: 'OrgUserCount',
  fields: () => ({
    inactiveUserCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of orgUsers who have an inactive flag'
    },
    activeUserCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of orgUsers who do not have an inactive flag'
    }
  })
})

export default OrgUserCount
