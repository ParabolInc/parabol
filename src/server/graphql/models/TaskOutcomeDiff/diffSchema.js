import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {TaskStatus} from '../Task/taskSchema';


const ContentDiff = new GraphQLObjectType({
  old: {type: GraphQLString, description: 'The content as it was in the task'},
  new: {type: GraphQLString, description: 'The content that was updated during the meeting'}
});

const IdDiff = new GraphQLObjectType({
  old: {type: GraphQLID, description: 'The id as it was pre-meeting'},
  new: {type: GraphQLID, description: 'The id as it was post-meeting'},
});

const StatusDiff = new GraphQLObjectType({
  old: {type: TaskStatus, description: 'The status as it was in pre-meeting'},
  new: {type: TaskStatus, description: 'The status as it was in post-meeting'},
});

export const TaskOutcomeDiff = new GraphQLObjectType({
  name: 'TaskOutcomeDiff',
  description: `A diff showing the old value (task) and new value (outcome)
    that can be used to calculate how many tasks have been added, updated, completed, and removed.`,
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique task id'},
    content: {
      type: ContentDiff,
      description: 'If present, the content changed and this provides the old and new values for content'
    },
    teamMemberId: {
      type: IdDiff,
      description: 'If present, the teamMemberId changed and this provides the old and new values for it'
    },
    userId: {
      type: IdDiff,
      description: 'If present, the userId changed and this provides the old and new values for it'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the diff was created'
    },
    status: {
      type: StatusDiff,
      description: 'If present, the status changed and this provides the old and new values for it'
    }
  })
});
