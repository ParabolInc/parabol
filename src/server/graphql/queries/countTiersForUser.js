import {GraphQLID, GraphQLNonNull} from 'graphql';
import UserTiersCount from 'server/graphql/types/UserTiersCount';
import {requireSU} from 'server/utils/authorization';
import countTiersForUserId from 'server/graphql/queries/helpers/countTiersForUserId';

export default {
  type: UserTiersCount,
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user for which you want the count of tier membership'
    }
  },
  async resolve(source, args, {authToken}) {
    const {userId} = args;

    // AUTH
    requireSU(authToken);

    // RESOLUTION
    return ({
      ...await countTiersForUserId(userId),
      userId
    });
  }
};
