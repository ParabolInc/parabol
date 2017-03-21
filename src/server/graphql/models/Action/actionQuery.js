import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';
import {requireSUOrSelf} from 'server/utils/authorization';

export default {
  actionCount: {
    type: GraphQLInt,
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'userId that owns all the actions'
      }
    },
    async resolve(source, {userId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, userId);

      // RESOLUTION
      return r.table('Action')
        .getAll(userId, {index: 'userId'})
        .filter({isComplete: false})
        .count()
        .run();
    }
  }
};
