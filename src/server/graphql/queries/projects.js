import {GraphQLID} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {RelayProjectConnection} from 'server/graphql/types/RelayProject';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  type: RelayProjectConnection,
  args: {
    ...forwardConnectionArgs,
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    teamId: {
      type: GraphQLID,
      description: 'The unique team ID'
    },
    agendaId: {
      type: GraphQLID,
      description: 'The ID of the agenda item'
    }
  },
  async resolve(source, {agendaId, teamId}, {authToken, sharedDataloader, operationId}) {
    // AUTH
    const userId = getUserId(authToken);
    const dataloader = sharedDataloader.get(operationId);
    let projects;
    if (agendaId) {
      const agendaItem = await dataloader.agendaItems.load(agendaId);
      requireSUOrTeamMember(authToken, agendaItem.teamId);
      projects = await dataloader.projectsByAgendaId.load(agendaId);
    } else if (teamId) {
      requireSUOrTeamMember(authToken, teamId);
      projects = await dataloader.projectsByTeamId.load(teamId);
    } else {
      projects = await dataloader.projectsByUserId.load(userId);
    }

    // RESOLUTION
    const nodes = projects.slice();
    const edges = nodes.map((node) => ({
      cursor: node.updatedAt,
      node
    }));
    const firstEdge = edges[0];
    return {
      edges,
      pageInfo: {
        endCursor: firstEdge ? edges[edges.length - 1].cursor : new Date(),
        hasNextPage: projects.length > nodes.length
      }
    };
  }
};
