import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLEnumType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';

export const TaskType = new GraphQLEnumType({
  name: 'TaskType',
  description: 'The type of task (project or action, long or short-term)',
  values: {
    ACTION: {value: 'ACTION'},
    PROJECT: {value: 'PROJECT'}
  }
});

export const TaskStatus = new GraphQLEnumType({
  name: 'TaskStatus',
  description: 'The status of the task',
  values: {
    ACTIVE: {value: 'ACTIVE'},
    STUCK: {value: 'STUCK'},
    DONE: {value: 'DONE'},
    FUTURE: {value: 'FUTURE'}
  }
});

export const Task = new GraphQLObjectType({
  name: 'Task',
  description: 'A task, either a project (long-term) or an action (short-term) assigned to a user',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique task id'},
    content: {type: new GraphQLNonNull(GraphQLString), description: 'The body of the task'},
    teamMemberId: {type: new GraphQLNonNull(GraphQLID), description: 'The id of the team member assigned to this task'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The id of the user assigned to this task'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was created'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was updated'
    },
    type: {type: new GraphQLNonNull(TaskType), description: 'The type of task (project or action, long or short-term)'},
    status: {type: new GraphQLNonNull(TaskStatus), description: 'The status of the task' },
  })
});
