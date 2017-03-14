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
import {GraphQLURLType} from '../../types';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {ProjectStatus} from '../Project/projectSchema';
import TeamMember from '../TeamMember/teamMemberSchema';

const MeetingAction = new GraphQLObjectType({
  name: 'MeetingAction',
  description: 'The action that was created in a meeting',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique action id, meetingId::actionId'
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of the action created during the meeting'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member the action was assigned to during the meeting'
    }
  }),
});

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
      description: 'The description of the action created during the meeting'
    },
    status: {
      type: ProjectStatus,
      description: 'The description of the action created during the meeting'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member the action was assigned to during the meeting'
    }
  }),
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
    actions: {
      type: new GraphQLList(MeetingAction),
      description: `A list of actions that were created in the meeting. 
      These details never change, even if the underlying action does`
    },
    projects: {
      type: new GraphQLList(MeetingProject),
      description: 'A list of immutable projects, as they were created in the meeting'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user\'s profile picture'
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
    actions: {
      type: new GraphQLList(MeetingAction),
      description: `A list of actions that were created in the meeting. 
      These details never change, even if the underlying action does`
    },
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
      type: new GraphQLList(MeetingInvitee),
    },
    meetingNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The auto-incrementing meeting number for the team'
    },
    projects: {
      type: new GraphQLList(MeetingProject),
      description: 'A list of immutable projects, as they were created in the meeting'
    },
    sinceTime: {
      type: GraphQLISO8601Type,
      description: 'The start time used to create the diff (all projectDiffs occurred between this time and the endTime'
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
    },
  })
});

export default Meeting;
