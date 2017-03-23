import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields';
import OrgApproval from './orgApprovalSchema';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';

export default {
  orgApprovals: {
    type: new GraphQLList(OrgApproval),
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the teamId curious about why someone hasn\'t received an invite yet'
      }
    },
    async resolve(source, {teamId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('OrgApproval')
        .getAll(teamId, {index: 'teamId'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
