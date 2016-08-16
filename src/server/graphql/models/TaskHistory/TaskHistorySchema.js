import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
GraphQLEnumType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {TaskStatus} from '../Task/taskSchema';
import {USER_DASH, TEAM_DASH, MEETING} from 'universal/utils/constants';

export const ChangeModule = new GraphQLEnumType({
  name: 'ChangeModule',
  description: 'The module where the change occured',
  values: {
    MEETING: {value: MEETING},
    TEAM_DASH: {value: TEAM_DASH},
    USER_DASH: {value: USER_DASH}
  }
});
// const ContentDiff = new GraphQLObjectType({
//   old: {type: GraphQLString, description: 'The content as it was in the task'},
//   new: {type: GraphQLString, description: 'The content that was updated during the meeting'}
// });
//
// const IdDiff = new GraphQLObjectType({
//   old: {type: GraphQLID, description: 'The id as it was pre-meeting'},
//   new: {type: GraphQLID, description: 'The id as it was post-meeting'},
// });
//
// const StatusDiff = new GraphQLObjectType({
//   old: {type: TaskStatus, description: 'The status as it was in pre-meeting'},
//   new: {type: TaskStatus, description: 'The status as it was in post-meeting'},
// });

export const TaskHistory = new GraphQLObjectType({
  name: 'TaskHistory',
  description: 'An up-to-date history of every change to content, ownership, and status for every task.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique historyID, taskId = teamId::shortId. historyId = taskId::shortid'
    },
    taskId: {type: new GraphQLNonNull(GraphQLID), description: 'The underlying taskId that was changed'},
    /* duplicate data from the task itself */
    content: {
      type: GraphQLString,
      description: 'Content, or description of the task'
    },
    teamMemberId: {
      type: GraphQLID,
      description: 'Owner of the task'
    },
    status: {type: new GraphQLNonNull(TaskStatus), description: 'The status of the task'},
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was changed'
    },
    /* meta data */
    changedIn: {
      type: ChangeModule,
      description: 'The module where the user was to change the item'
    },
    meetingId: {
      type: GraphQLID,
      description: 'if changedIn is a meeting, the id of the meeting where it occured'
    },
  })
});
