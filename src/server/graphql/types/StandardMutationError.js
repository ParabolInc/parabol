import {GraphQLObjectType, GraphQLNonNull, GraphQLString} from 'graphql';

const StandardMutationError = new GraphQLObjectType({
  name: 'StandardMutationError',
  fields: () => ({
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the error'
    },
    message: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The full error'
    }
  })
});

export default StandardMutationError;
