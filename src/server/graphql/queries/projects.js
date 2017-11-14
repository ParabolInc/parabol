import {GraphQLID} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {ProjectConnection} from 'server/graphql/types/Project';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import connectionFromProjects from 'server/graphql/queries/helpers/connectionFromProjects';

export default {
  type: ProjectConnection,
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
    return connectionFromProjects(projects);

  }
};
