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
    }
  },
  async resolve(source, {teamId}, {authToken, getDataLoader}) {
    // AUTH
    const userId = getUserId(authToken);
    const dataLoader = getDataLoader();
    let projects;
    if (teamId) {
      requireSUOrTeamMember(authToken, teamId);
      projects = await dataLoader.projectsByTeamId.load(teamId);
    } else {
      projects = await dataLoader.projectsByUserId.load(userId);
    }

    // RESOLUTION
    return connectionFromProjects(projects);
  }
};
