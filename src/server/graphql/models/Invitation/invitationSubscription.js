import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {getRequestedFields} from '../utils';
import {Invitation} from './invitationSchema';
import {requireSUOrTeamMember} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  invitations: {
    type: new GraphQLList(Invitation),
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
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Invitation')
        .getAll(teamId, {index: 'teamId'})
        .filter({isAccepted: false})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
