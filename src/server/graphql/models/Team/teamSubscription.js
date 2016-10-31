import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID} from 'graphql';
import {getRequestedFields} from '../utils';
import {Team} from './teamSchema';
import {requireSUOrTeamMember} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

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
      requireSUOrTeamMember(authToken, teamId);
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
          }
        })
        .run({cursor: true}, changefeedHandler);
    }
  }
};
