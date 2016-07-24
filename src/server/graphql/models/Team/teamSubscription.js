import r from '../../../database/rethinkDriver';
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
      requireSUOrTeamMember(authToken, teamId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Team')
        .get(teamId)
        // point changefeeds don't support pluck yet https://github.com/rethinkdb/rethinkdb/issues/3623
        .changes({includeInitial: true})
        .map(row => ({
          new_val: row('new_val').default({}).pluck(requestedFields),
          old_val: row('old_val').default({}).pluck(requestedFields)
        }))
        .run({cursor: true}, changefeedHandler);
    }
  }
};
