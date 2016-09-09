import {GraphQLNonNull, GraphQLString, GraphQLID} from 'graphql';
import {Outcome} from './outcomeSchema';

export default {
  getOutcomeById: {
    type: Outcome,
    description: 'A query for admin to find a user by their id',
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the project or action'
      },
      type: {
        type: new GraphQLNonNull(GraphQLString)
      }
    },
    async resolve(source, {id, type}, {authToken}) {
      requireSU(authToken);
      const outcome = await r.table(type).get(id);
      if (outcome) {
        return outcome;
      }
      throw errorObj({_error: `Outcome ${id} of type ${type} not found`});
    }
  }
};
