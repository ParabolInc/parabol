import {
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import PageInfoDateCursor from './PageInfoDateCursor'
import TaskEditorDetails from './TaskEditorDetails'
import TaskStatusEnum from './TaskStatusEnum'
import Team from './Team'
import TaskIntegration from './TaskIntegration'
import AgendaItem from './AgendaItem'
import TeamMember from './TeamMember'
import {GQLContext} from '../graphql'

const Task = new GraphQLObjectType<any, GQLContext, any>({
  name: 'Task',
  description: 'A long-term task shared across the team, assigned to a single user ',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    agendaId: {
      type: GraphQLID,
      description: 'the agenda item that created this task, if any'
    },
    agendaItem: {
      type: AgendaItem,
      description: 'The agenda item that the task was created in, if any',
      resolve: ({agendaId}, _args, {dataLoader}) => {
        return agendaId ? dataLoader.get('agendaItems').load(agendaId) : null
      }
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The body of the task. If null, it is a new task.'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the task was created'
    },
    createdBy: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The userId that created the task'
    },
    createdByUser: {
      type: GraphQLNonNull(require('./User').default),
      description: 'The user that created the card',
      resolve: ({createdBy}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(createdBy)
      }
    },
    dueDate: {
      type: GraphQLISO8601Type,
      description: 'a user-defined due date'
    },
    editors: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TaskEditorDetails))),
      description:
        'a list of users currently editing the task (fed by a subscription, so queries return null)',
      resolve: ({editors = []}) => {
        return editors
      }
    },
    integration: {
      type: TaskIntegration
    },
    meetingId: {
      type: GraphQLID,
      description: 'the foreign key for the meeting the task was created in'
    },
    doneMeetingId: {
      type: GraphQLID,
      description: 'the foreign key for the meeting the task was marked as complete'
    },
    reflectionGroupId: {
      type: GraphQLID,
      description: 'the foreign key for the retrospective reflection group this was created in'
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the shared sort order for tasks on the team dash & user dash'
    },
    status: {
      type: new GraphQLNonNull(TaskStatusEnum),
      description: 'The status of the task'
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      description: 'The tags associated with the task'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team (indexed). Needed for subscribing to archived tasks'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team this task belongs to',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    assignee: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member that owns this task',
      resolve: ({assigneeId}, _args, {dataLoader}) => {
        return dataLoader.get('teamMembers').load(assigneeId)
      }
    },
    assigneeId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member (or soft team member) assigned to this task'
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the task was updated'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        '* The userId, index useful for server-side methods getting all tasks under a user'
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: Task.name,
  nodeType: Task,
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
})

export const TaskConnection = connectionType
export const TaskEdge = edgeType
export default Task
