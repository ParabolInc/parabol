import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const JiraRemoteProjectCategory = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraRemoteProjectCategory',
  description: 'A project category fetched from a JiraRemoteProject',
  fields: () => ({
    self: {
      type: new GraphQLNonNull(GraphQLString)
    },
    id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    description: {
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default JiraRemoteProjectCategory
