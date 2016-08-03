import r from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {getRequestedFields} from '../utils';
import {Task} from './taskSchema';
import {requireSUOrTeamMember} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';
import {PROJECT} from 'universal/utils/constants';

export default {
  projects: {
    type: new GraphQLList(Task),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team member ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket, subbedChannelName}, refs) {
      const teamMember = await r.table('TeamMember').get(teamMemberId);
      await requireSUOrTeamMember(authToken, teamMember.teamId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName, {path: 'projects'});
      r.table('Task')
        .getAll(teamMemberId, {index: 'teamMemberId'})
        .filter({type: PROJECT})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
