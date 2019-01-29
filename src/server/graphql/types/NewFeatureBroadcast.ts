import {GraphQLObjectType, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'

const NewFeatureBroadcast = new GraphQLObjectType({
  name: 'NewFeatureBroadcast',
  description: 'The latest features released by Parabol',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    copy: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of the new features'
    }
  })
})

export default NewFeatureBroadcast
