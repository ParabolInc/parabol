import r from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {getRequestedFields} from '../utils';
import {Project} from './projectSchema';
import {requireSUOrTeamMember} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  projects: {
    type: new GraphQLList(Project),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team member ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket, subbedChannelName}, refs) {
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Project')
        .getAll(teamMemberId, {index: 'teamMemberId'})
        .filter({isActive: true, isArchived: false})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  // archiveByteam: {
  //   type: new GraphQLList(Project),
  //   args: {
  //     teamId: {
  //       type: new GraphQLNonNull(GraphQLID),
  //       description: 'The team ID for the archived items'
  //     }
  //   }
  // },
  // async resolve(source, {teamId}, {authToken, socket, subbedChannelName}, refs) {
  //   requireSUOrTeamMember(authToken, teamId);
  //   const requestedFields = getRequestedFields(refs);
  //   const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
  //   r.table('Project')
  //     .getAll(teamId, {index: 'teamId'})
  //     .pluck(requestedFields)
  //     .changes({includeInitial: true})
  //     .run({cursor: true}, changefeedHandler);
  // }
};
