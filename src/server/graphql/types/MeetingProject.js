import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';

const MeetingProject = new GraphQLObjectType({
  name: 'MeetingProject',
  description: 'The project that was created in a meeting',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique action id, meetingId::projectId'
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The stringified Draft-js raw description of the action created during the meeting'
    },
    status: {
      type: ProjectStatusEnum,
      description: 'The description of the action created during the meeting'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'The tags associated with the project'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member the action was assigned to during the meeting'
    }
  })
});

export default MeetingProject;

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
// const HistoricalProject = new GraphQLObjectType({
//   name: 'HistoricalProject',
//   description: 'The old or new version of a project that changed during a meeting',
//   fields: () => ({
//     content: {
//       type: GraphQLString,
//       description: 'The description of the action created during the meeting'
//     },
//     // id: {
//     //   type: new GraphQLNonNull(GraphQLID),
//     //   description: 'The project id, matches the ID in the project table'
//     // },
//     status: {
//       type: ProjectStatus,
//       description: 'The description of the action created during the meeting'
//     },
//     teamMemberId: {
//       type: GraphQLID,
//       description: 'The id of the team member the action was assigned to during the meeting'
//     }
//   }),
// });
//
// const ProjectDiff = new GraphQLObjectType({
//   name: 'ProjectDiff',
//   description: `The previous and post state of a project before and after a meeting.
//   If oldVal is null, then the project was created during the meeting.
//   Otherwise, oldVal should contain the oldVal of any field that was changed.
//   Unchanged fields do not need to be present.`,
//   fields: () => ({
//     id: {
//       type: new GraphQLNonNull(GraphQLID),
//       description: 'The unique diff id: projectId::meetingId'
//     },
//     oldVal: {
//       type: HistoricalProject,
//       description: 'The previous state of the changed fields'
//     },
//     newVal: {
//       type: HistoricalProject,
//       description: 'A snapshot of the current state of the project at taken at the conclusion of the meeting'
//     }
//   }),
// });

