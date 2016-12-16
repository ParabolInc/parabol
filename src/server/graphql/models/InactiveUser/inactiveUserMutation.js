import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireOrgLeaderOfUser} from '../authorization';
import {errorObj} from '../utils';
import shortid from 'shortid';

export default {
  inactivateUser: {
    type: GraphQLBoolean,
    description: 'Manally inactive a user',
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user that is going away for awhile'
      }
    },
    async resolve(source, {userId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireOrgLeaderOfUser(authToken, userId);
      const isInactive = await r.table('User').get('userId')('inactive');
      if (isInactive) {
        throw errorObj({_error: `${userId} is already inactive. cannot inactivate twice`})
      }

      // RESOLUTION
      const now = new Date();
      await r.table('User')
        .get(userId)
        .update({
          inactive: true,
          updatedAt: now
        })
        .do(() => {
          r.table('InactiveUser')
            .insert({
              id: shortid.generate(),
              userId,
              startAt: now
            })
        });
      return true;
    }
  }
};
