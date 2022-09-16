import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const NewFeatureBroadcast = new GraphQLObjectType<any, GQLContext>({
  name: 'NewFeatureBroadcast',
  description: 'The latest feature released by Parabol',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    actionButtonCopy: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The text of the action button in the snackbar'
    },
    snackbarMessage: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of the new feature'
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The permalink to the blog post describing the new feature'
    }
  })
})

export default NewFeatureBroadcast
