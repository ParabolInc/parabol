import {GraphQLInt, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import serviceToProvider from 'server/utils/serviceToProvider';

export default {
  type: GraphQLInt,
  description: 'Remove a user from an integration',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the teamMember calling it.'
    },
    service: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the service like slack or github'
    }
  },
  async resolve(source, {teamMemberId, service}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const [userId, teamId] = teamMemberId.split('::');
    requireSUOrSelf(authToken, userId);
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    const table = serviceToProvider[service];
    return r.table(table)
      .getAll(teamId, {index: 'teamId'})
      .filter({service})
      .count()
      .run();
  }
};

