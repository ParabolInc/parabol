import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const StandardMutationError = new GraphQLObjectType<any, GQLContext>({
  name: 'StandardMutationError',
  fields: () => ({
    title: {
      type: GraphQLString,
      description: 'The title of the error'
    },
    message: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The full error'
    }
  })
})

export default StandardMutationError
