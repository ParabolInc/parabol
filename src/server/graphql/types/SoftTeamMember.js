import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import connectionFromProjects from 'server/graphql/queries/helpers/connectionFromProjects';
import {resolveTeam} from 'server/graphql/resolvers';
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';
import PossibleTeamMember from 'server/graphql/types/PossibleTeamMember';
import {ProjectConnection} from 'server/graphql/types/Project';
import Team from 'server/graphql/types/Team';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';
import Assignee from 'server/graphql/types/Assignee';

const SoftTeamMember = new GraphQLObjectType({
  name: 'SoftTeamMember',
  description: 'A member of a team',
  interfaces: () => [PossibleTeamMember, Assignee],
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'An ID for the teamMember. userId::teamId'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    teamId: {
      type: GraphQLID,
      description: 'foreign key to Team table'
    },
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      resolve: resolveTeam
    },
    projects: {
      type: ProjectConnection,
      description: 'Projects owned by the team member',
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      resolve: async ({teamId, id: assigneeId, userId}, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken);
        const allProjects = await dataLoader.get('projectsByTeamId').load(teamId);
        const projectsForUserId = allProjects.filter((project) => project.assigneeId === assigneeId);
        const publicProjectsForUserId = viewerId === userId ? projectsForUserId :
          projectsForUserId.filter((project) => !project.tags.includes('private'));
        return connectionFromProjects(publicProjectsForUserId);
      }
    }
  })
});

export default SoftTeamMember;
