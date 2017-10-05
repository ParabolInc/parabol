import {GraphQLFloat, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GitHubProject from 'server/graphql/types/GitHubProject';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';

const Project = new GraphQLObjectType({
  name: 'Project',
  description: 'A long-term project shared across the team, assigned to a single user',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique project id, teamId::shortid'},
    agendaId: {
      type: GraphQLID,
      description: 'the agenda item that created this project, if any'
    },
    content: {type: GraphQLString, description: 'The body of the project. If null, it is a new project.'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the project was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the project'
    },
    cursor: {
      type: GraphQLISO8601Type,
      description: 'the pagination cursor (createdAt)',
      resolve({createdAt}) {
        return createdAt;
      }
    },
    integration: {
      // TODO replace this with ProjectIntegration when we remove cashay. it doens't handle intefaces well
      type: GitHubProject
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'the shared sort order for projects on the team dash & user dash'
    },
    status: {type: new GraphQLNonNull(ProjectStatusEnum), description: 'The status of the project'},
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'The tags associated with the project'
    },
    teamId: {
      type: GraphQLID,
      description: 'The id of the team (indexed). Needed for subscribing to archived projects'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member assigned to this project, or the creator if content is null'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the project was updated'
    },
    userId: {
      type: GraphQLID,
      description: '* The userId, index useful for server-side methods getting all projects under a user'
    }
  })
});

export default Project;
