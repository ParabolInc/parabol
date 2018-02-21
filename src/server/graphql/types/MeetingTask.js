import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import TaskStatusEnum from 'server/graphql/types/TaskStatusEnum';

const MeetingTask = new GraphQLObjectType({
  name: 'MeetingTask',
  description: 'The task that was created in a meeting',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique action id, meetingId::taskId'
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The stringified Draft-js raw description of the action created during the meeting'
    },
    status: {
      type: TaskStatusEnum,
      description: 'The description of the action created during the meeting'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'The tags associated with the task'
    },
    assigneeId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member the action was assigned to during the meeting'
    }
  })
});

export default MeetingTask;

// TODO use this when we move to more complex reporting
// const HistoricalAction = new GraphQLObjectType({
//   name: 'HistoricalAction',
//   description: 'The action that was created in a meeting',
//   fields: () => ({
//     content: {
//       type: new GraphQLNonNull(GraphQLString),
//       description: 'The description of the action created during the meeting'
//     },
//     id: {
//       type: new GraphQLNonNull(GraphQLID),
//       description: 'The unique action id, actionId::meetingId'
//     },
//     teamMemberId: {
//       type: new GraphQLNonNull(GraphQLID),
//       description: 'The id of the team member the action was assigned to during the meeting'
//     }
//   }),
// });
//
// const HistoricalTask = new GraphQLObjectType({
//   name: 'HistoricalTask',
//   description: 'The old or new version of a task that changed during a meeting',
//   fields: () => ({
//     content: {
//       type: GraphQLString,
//       description: 'The description of the action created during the meeting'
//     },
//     // id: {
//     //   type: new GraphQLNonNull(GraphQLID),
//     //   description: 'The task id, matches the ID in the task table'
//     // },
//     status: {
//       type: TaskStatus,
//       description: 'The description of the action created during the meeting'
//     },
//     teamMemberId: {
//       type: GraphQLID,
//       description: 'The id of the team member the action was assigned to during the meeting'
//     }
//   }),
// });
//
// const TaskDiff = new GraphQLObjectType({
//   name: 'TaskDiff',
//   description: `The previous and post state of a task before and after a meeting.
//   If oldVal is null, then the task was created during the meeting.
//   Otherwise, oldVal should contain the oldVal of any field that was changed.
//   Unchanged fields do not need to be present.`,
//   fields: () => ({
//     id: {
//       type: new GraphQLNonNull(GraphQLID),
//       description: 'The unique diff id: taskId::meetingId'
//     },
//     oldVal: {
//       type: HistoricalTask,
//       description: 'The previous state of the changed fields'
//     },
//     newVal: {
//       type: HistoricalTask,
//       description: 'A snapshot of the current state of the task at taken at the conclusion of the meeting'
//     }
//   }),
// });

