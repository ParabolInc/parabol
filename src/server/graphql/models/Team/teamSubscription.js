import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {Team} from './teamSchema';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';
import {errorObj} from 'server/utils/utils';

export default {
  team: {
    type: Team,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team ID'
      }
    },
    async resolve(source, {teamId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      const {isArchived} = await r.table('Team').get(teamId)
        .do((team) => ({
          isArchived: team('isArchived').default(false)
        }));
      if (isArchived) throw errorObj({_error: 'That team is archived!'});
      // TODO update subscription on the client when a new team gets added. So rare, it's OK to resend all 3-4 docs
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Team')
        .get(teamId)
        .changes({includeInitial: true})
        .map((row) => {
          return {
            new_val: row('new_val').pluck(requestedFields).default(null),
            old_val: row('old_val').pluck(requestedFields).default(null)
          };
        })
        .run({cursor: true}, changefeedHandler);
    }
  }
};
