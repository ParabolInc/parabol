import {GraphQLObjectType, GraphQLNonNull, GraphQLID, GraphQLString, GraphQLEnumType} from 'graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {USER_DASH, TEAM_DASH, MEETING} from 'parabol-client/utils/constants'
import TaskStatusEnum from './TaskStatusEnum'
import {GQLContext} from '../graphql'

export const ChangeModule = new GraphQLEnumType({
  name: 'ChangeModule',
  description: 'The module where the change occured',
  values: {
    [MEETING]: {},
    [TEAM_DASH]: {},
    [USER_DASH]: {}
  }
})
// const ContentDiff = new GraphQLObjectType<any, GQLContext>({
//   old: {type: GraphQLString, description: 'The content as it was in the task'},
//   new: {type: GraphQLString, description: 'The content that was updated during the meeting'}
// });
//
// const IdDiff = new GraphQLObjectType<any, GQLContext>({
//   old: {type: GraphQLID, description: 'The id as it was pre-meeting'},
//   new: {type: GraphQLID, description: 'The id as it was post-meeting'},
// });
//
// const StatusDiff = new GraphQLObjectType<any, GQLContext>({
//   old: {type: TaskStatus, description: 'The status as it was in pre-meeting'},
//   new: {type: TaskStatus, description: 'The status as it was in post-meeting'},
// });

const TaskHistory = new GraphQLObjectType<any, GQLContext>({
  name: 'TaskHistory',
  description:
    'An up-to-date history of every change to content, ownership, and status for every task.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique taskHistoryId: shortid'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The underlying taskId that was changed teamId::shortid'
    },
    /* duplicate data from the task itself */
    content: {
      type: GraphQLString,
      description: 'Content, or description of the task'
    },
    teamMemberId: {
      type: GraphQLID,
      description: 'Owner of the task'
    },
    status: {
      type: new GraphQLNonNull(TaskStatusEnum),
      description: 'The status of the task'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was changed'
    },
    /* meta data */
    area: {
      type: ChangeModule,
      description: 'The area where the user changed the item'
    },
    /* not sure we need this still? */
    meetingId: {
      type: GraphQLID,
      description: 'if changedIn is a meeting, the id of the meeting where it occured'
    }
  })
})

export default TaskHistory
