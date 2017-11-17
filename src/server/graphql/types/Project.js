import {GraphQLFloat, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import {globalIdField} from 'graphql-relay';
import connectionDefinitions from 'server/graphql/connectionDefinitions';
import {Team} from 'server/graphql/models/Team/teamSchema';
import GitHubProject from 'server/graphql/types/GitHubProject';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import PageInfoDateCursor from 'server/graphql/types/PageInfoDateCursor';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';
import TeamMember from 'server/graphql/types/TeamMember';
import ProjectEditorDetails from 'server/graphql/types/ProjectEditorDetails';
import {toGlobalId} from 'graphql-relay';

const Project = new GraphQLObjectType({
  name: 'Project',
  description: 'A long-term project shared across the team, assigned to a single user ',
  fields: () => ({
    // 'The unique project id, teamId::shortid'
    id: globalIdField('Project', ({id}) => id),
    agendaId: {
      type: GraphQLID,
      description: 'the agenda item that created this project, if any',
      resolve: ({agendaId}) => toGlobalId('AgendaItem', agendaId)
    },
    content: {type: GraphQLString, description: 'The body of the project. If null, it is a new project.'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the project was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the project',
      resolve: ({createdBy}) => toGlobalId('User', createdBy)
    },
    editors: {
      type: new GraphQLList(ProjectEditorDetails),
      description: 'a list of users currently editing the project (fed by a subscription, so queries return null)',
      resolve: ({editors = []}) => {
        return editors;
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
    // TODO make this nonnull again
    status: {
      type: ProjectStatusEnum,
      description: 'The status of the project'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'The tags associated with the project'
    },
    teamId: {
      type: GraphQLID,
      description: 'The id of the team (indexed). Needed for subscribing to archived projects',
      resolve: ({teamId}) => toGlobalId('Team', teamId)
    },
    team: {
      type: Team,
      description: 'The team this project belongs to',
      resolve: ({teamId}, args, {getDataLoader}) => {
        return getDataLoader().teams.load(teamId);
      }
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member that owns this project',
      resolve: ({teamMemberId}, args, {getDataLoader}) => {
        return getDataLoader().teamMembers.load(teamMemberId);
      }
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member assigned to this project, or the creator if content is null',
      resolve: ({teamMemberId}) => toGlobalId('TeamMember', teamMemberId)
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the project was updated'
    },
    userId: {
      type: GraphQLID,
      description: '* The userId, index useful for server-side methods getting all projects under a user',
      resolve: ({userId}) => toGlobalId('User', userId)
    }
  })
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: Project,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
});

export const ProjectConnection = connectionType;
export const ProjectEdge = edgeType;
export default Project;
