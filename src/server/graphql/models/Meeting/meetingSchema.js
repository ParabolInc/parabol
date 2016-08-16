import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {TaskStatus} from 'server/graphql/models/Task/taskSchema';

const HistoricalAction = new GraphQLObjectType({
  name: 'HistoricalAction',
  description: 'The action that was created in a meeting',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The action id, matches the ID in the action table'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member the action was assigned to during the meeting'
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The description of the action created during the meeting'
    }
  }),
});

const HistoricalProject = new GraphQLObjectType({
  name: 'HistoricalProject',
  description: 'The old or new version of a project that changed during a meeting',
  fields: () => ({
    teamMemberId: {
      type: GraphQLID,
      description: 'The id of the team member the action was assigned to during the meeting'
    },
    content: {
      type: GraphQLString,
      description: 'The description of the action created during the meeting'
    },
    status: {
      type: TaskStatus,
      description: 'The description of the action created during the meeting'
    }
  }),
});

const ProjectDiff = new GraphQLObjectType({
  name: 'ProjectDiff',
  description: `The previous and post state of a project before and after a meeting.
  If oldVal is null, then the project was created during the meeting.
  Otherwise, oldVal should contain the oldVal of any field that was changed.
  Unchanged fields do not need to be present.`,
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The action id, matches the ID in Project table'
    },
    oldVal: {
      type: HistoricalProject,
      description: 'The previous state of the changed fields'
    },
    newVal: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'A snapshot of the current state of the project at taken at the conclusion of the meeting'
    }
  }),
});

export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A team meeting history for all previous meetings',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting id'},
    meetingNumber: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The auto-incrementing meeting number for the team'
    },
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team associated with this meeting'},
    // isActive: {type: GraphQLBoolean, description: 'true if a meeting is currently in progress'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    endedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting officially ended'
    },
    actions: {
      type: new GraphQLList(HistoricalAction),
      description: `A list of actions that were created in the meeting. 
      These details never change, even if the underlying action does`
    },
    projects: {
      type: new GraphQLList(ProjectDiff)
    }
  })
});
