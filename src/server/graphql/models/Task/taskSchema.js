import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLEnumType,
  GraphQLFloat
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {ACTIVE, STUCK, DONE, FUTURE, ACTION, PROJECT} from 'universal/utils/constants';
import {nonnullifyInputThunk} from '../utils';

export const TaskType = new GraphQLEnumType({
  name: 'TaskType',
  description: 'The type of task (project or action, long or short-term)',
  values: {
    ACTION: {value: ACTION},
    PROJECT: {value: PROJECT}
  }
});

export const TaskStatus = new GraphQLEnumType({
  name: 'TaskStatus',
  description: 'The status of the task',
  values: {
    ACTIVE: {value: ACTIVE},
    STUCK: {value: STUCK},
    DONE: {value: DONE},
    FUTURE: {value: FUTURE}
  }
});

export const Task = new GraphQLObjectType({
  name: 'Task',
  description: 'A task, either a project (long-term) or an action (short-term) assigned to a user',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique task id'},
    content: {type: GraphQLString, description: 'The body of the task. If null, it is a new task.'},
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member assigned to this task, or the creator if content is null'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The teamMemberID that created this task'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the task was updated'
    },
    type: {type: new GraphQLNonNull(TaskType), description: 'The type of task (project or action, long or short-term)'},
    status: {type: new GraphQLNonNull(TaskStatus), description: 'The status of the task'},
    teamSort: {
      type: GraphQLFloat,
      description: 'the per-status sort order for the team dashboard'
    },
    userSort: {
      type: GraphQLFloat,
      description: 'the per-status sort order for the user dashboard'
    }
  })
});

const taskInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique task ID'},
  content: {type: GraphQLString, description: 'The body of the task. If null, it is a new task.'},
  type: {type: GraphQLString, description: 'The task type (project or action)'},
  status: {type: GraphQLID, description: 'The status of the task created'},
  teamMemberId: {type: GraphQLID, description: 'The team member ID of the person creating the task'},
  /*
   * teamSort and userSort are floats because GraphQLInt is a
   * signed 32-bit int, and we want more range.
   */
  teamSort: {
    type: GraphQLFloat,
    description: 'the per-status sort order for the team dashboard'
  },
  userSort: {
    type: GraphQLFloat,
    description: 'the per-status sort order for the user dashboard'
  }
});

export const CreateTaskInput =
  nonnullifyInputThunk('CreateTaskInput', taskInputThunk, ['id', 'type', 'status', 'teamMemberId']);
export const UpdateTaskInput = nonnullifyInputThunk('UpdateTaskInput', taskInputThunk, ['id']);
