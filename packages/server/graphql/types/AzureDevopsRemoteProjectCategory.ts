import {GraphQLNonNull, GraphQLString, GraphQLObjectType} from 'graphql'

const AzureDevopsRemoteProjectCategory = new GraphQLObjectType({
  name: 'AzureDevopsRemoteProjectCategory',
  description: 'A project category fetched from a AzureDevopsRemoteProject',
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

export default AzureDevopsRemoteProjectCategory
