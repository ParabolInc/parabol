import {GraphQLFloat, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import GitHubTask from 'server/graphql/types/GitHubTask';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import TaskStatusEnum from 'server/graphql/types/TaskStatusEnum';
import connectionDefinitions from 'server/graphql/connectionDefinitions';
import PageInfoDateCursor from 'server/graphql/types/PageInfoDateCursor';
import {globalIdField} from 'graphql-relay';
import TeamMember from 'server/graphql/types/TeamMember';
import getRethink from 'server/database/rethinkDriver';

const RelayTask = new GraphQLObjectType({
  name: 'RelayTask',
  description: `A long-term task shared across the team, assigned to a single user ' +
  '-- RelayTask is a temporary fix while Task uses cashay`,

  fields: () => ({
    // 'The unique task id, teamId::shortid'
    id: globalIdField('Task', ({id}) => id),
    agendaId: {
      type: GraphQLID,
      description: 'the agenda item that created this task, if any'
    },
    content: {type: GraphQLString, description: 'The body of the task. If null, it is a new task.'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the task'
    },
    integration: {
      // TODO replace this with TaskIntegration when we remove cashay. it doens't handle intefaces well
      type: GitHubTask
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'the shared sort order for tasks on the team dash & user dash'
    },
    status: {type: new GraphQLNonNull(TaskStatusEnum), description: 'The status of the task'},
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'The tags associated with the task'
    },
    teamId: {
      type: GraphQLID,
      description: 'The id of the team (indexed). Needed for subscribing to archived tasks'
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member that owns this task',
      resolve: async (source) => {
        const r = getRethink();
        const {teamMember, teamMemberId} = source;
        if (!teamMember && teamMemberId) {
          return r.table('TeamMember').get(teamMemberId).run();
        }
        return undefined;
      }
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member assigned to this task, or the creator if content is null'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was updated'
    },
    userId: {
      type: GraphQLID,
      description: '* The userId, index useful for server-side methods getting all tasks under a user'
    }
  })
});

const {connectionType, edgeType} = connectionDefinitions({
  nodeType: RelayTask,
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

export const RelayTaskConnection = connectionType;
export const RelayTaskEdge = edgeType;
export default RelayTask;
