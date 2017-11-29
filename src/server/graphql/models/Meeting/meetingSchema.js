import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import TeamMember from 'server/graphql/types/TeamMember';
import TaskStatusEnum from 'server/graphql/types/TaskStatusEnum';
import GraphQLURLType from 'server/graphql/types/GraphQLURLType';

const MeetingTask = new GraphQLObjectType({
  name: 'MeetingTask',
  description: 'A task that was created in a meeting',
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
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member the action was assigned to during the meeting'
    }
  })
});

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

const MeetingInvitee = new GraphQLObjectType({
  name: 'MeetingInvitee',
  description: 'The user invited to the meeting',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'The teamMemberId of the user invited to the meeting'
    },
    present: {
      type: GraphQLBoolean,
      description: 'true if the invitee was present in the meeting'
    },
    /* RethinkDB sugar */
    tasks: {
      type: new GraphQLList(MeetingTask),
      description: 'A list of immutable tasks, as they were created in the meeting'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user’s profile picture'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    /* GraphQL Sugar */
    membership: {
      type: TeamMember,
      description: 'All of the fields from the team member table',
      resolve({id}) {
        const r = getRethink();
        return r.table('TeamMember')
          .get(id)
          .run();
      }
    }
  })
});

const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A team meeting history for all previous meetings',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting id. shortid.'},
    agendaItemsCompleted: {
      type: GraphQLInt,
      description: 'The number of agenda items completed during the meeting'
    },
    // isActive: {type: GraphQLBoolean, description: 'true if a meeting is currently in progress'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    endedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting officially ended'
    },
    facilitator: {
      type: GraphQLID,
      description: 'The teamMemberId of the person who ended the meeting'
    },
    invitees: {
      type: new GraphQLList(MeetingInvitee)
    },
    meetingNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The auto-incrementing meeting number for the team'
    },
    tasks: {
      type: new GraphQLList(MeetingTask),
      description: 'A list of immutable tasks, as they were created in the meeting'
    },
    sinceTime: {
      type: GraphQLISO8601Type,
      description: 'The start time used to create the diff (all taskDiffs occurred between this time and the endTime'
    },
    successExpression: {
      type: GraphQLString,
      description: 'The happy introductory clause to the summary'
    },
    successStatement: {
      type: GraphQLString,
      description: 'The happy body statement for the summary'
    },
    summarySentAt: {
      type: GraphQLISO8601Type,
      description: 'The time the meeting summary was emailed to the team'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team associated with this meeting'},
    teamName: {type: GraphQLString, description: 'The name as it was when the meeting occurred'},
    /* GraphQL Sugar */
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'All the team members associated who can join this team',
      resolve({teamId}) {
        const r = getRethink();
        return r.table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .run();
      }
    }
  })
});

export default Meeting;
