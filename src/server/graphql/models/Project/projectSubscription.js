import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {Project} from './projectSchema';
import {requireSUOrTeamMember, requireTeamIsPaid} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';

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
      const r = getRethink();

      // AUTH
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      await requireTeamIsPaid(teamId);

      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const removalFields = ['id', 'isArchived', 'teamMemberId'];
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName, {removalFields});
      r.table('Project')
        .getAll(teamMemberId, {index: 'teamMemberId'})
        .filter({isArchived: false})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  archivedProjects: {
    type: new GraphQLList(Project),
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team ID'
      }
    },
    async resolve(source, {teamId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();
      requireSUOrTeamMember(authToken, teamId);
      const requestedFields = getRequestedFields(refs);
      const removalFields = ['id', 'isArchived'];
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName, {removalFields});
      r.table('Project')
        // use a compound index so we can easily paginate later
        .between([teamId, r.minval], [teamId, r.maxval], {index: 'teamIdCreatedAt'})
        .filter({isArchived: true})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
