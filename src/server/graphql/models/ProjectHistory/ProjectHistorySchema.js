import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLEnumType
} from 'graphql';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {USER_DASH, TEAM_DASH, MEETING} from 'universal/utils/constants';
import ProjectStatusEnum from 'server/graphql/types/ProjectStatusEnum';

export const ChangeModule = new GraphQLEnumType({
  name: 'ChangeModule',
  description: 'The module where the change occured',
  values: {
    [MEETING]: {},
    [TEAM_DASH]: {},
    [USER_DASH]: {}
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
//   old: {type: ProjectStatus, description: 'The status as it was in pre-meeting'},
//   new: {type: ProjectStatus, description: 'The status as it was in post-meeting'},
// });

export const ProjectHistory = new GraphQLObjectType({
  name: 'ProjectHistory',
  description: 'An up-to-date history of every change to content, ownership, and status for every project.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'A unique projectHistoryId: shortid'
    },
    projectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The underlying projectId that was changed teamId::shortid'
    },
    /* duplicate data from the project itself */
    content: {
      type: GraphQLString,
      description: 'Content, or description of the task'
    },
    teamMemberId: {
      type: GraphQLID,
      description: 'Owner of the task'
    },
    status: {type: new GraphQLNonNull(ProjectStatusEnum), description: 'The status of the task'},
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
});
