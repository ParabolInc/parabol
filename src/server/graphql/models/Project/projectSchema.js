import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInputObjectType
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';

export const ProjectStatus = new GraphQLEnumType({
  name: 'ProjectStatus',
  description: 'The status of the project',
  values: {
    [ACTIVE]: {},
    [STUCK]: {},
    [DONE]: {},
    [FUTURE]: {}
  }
});

export const Project = new GraphQLObjectType({
  name: 'Project',
  description: 'A long-term project shared across the team, assigned to a single user',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique project id, teamId::shortid'},
    agendaId: {
      type: GraphQLID,
      description: 'the agenda item that created this project, if any'
    },
    content: {type: GraphQLString, description: 'The body of the project. If null, it is a new project.'},
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the project was created'
    },
    createdBy: {
      type: GraphQLID,
      description: 'The userId that created the project'
    },
    cursor: {
      type: GraphQLISO8601Type,
      description: 'the pagination cursor (createdAt)',
      resolve({createdAt}) {
        return createdAt;
      }
    },
    isArchived: {
      type: GraphQLBoolean,
      description: 'true if the project has been archived and will not show up in the main area'
    },
    sortOrder: {
      type: GraphQLFloat,
      description: 'the shared sort order for projects on the team dash & user dash'
    },
    status: {type: new GraphQLNonNull(ProjectStatus), description: 'The status of the project'},
    teamId: {
      type: GraphQLID,
      description: 'The id of the team (indexed). Needed for subscribing to archived projects'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the team member assigned to this project, or the creator if content is null'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the project was updated'
    },
    userId: {
      type: GraphQLID,
      description: '* The userId, index useful for server-side methods getting all projects under a user'
    }
  })
});

export const ProjectInput = new GraphQLInputObjectType({
  name: 'ProjectInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique team ID'},
    agendaId: {type: GraphQLID},
    content: {type: GraphQLString},
    isArchived: {type: GraphQLBoolean},
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {type: GraphQLID, description: 'The unique orginization ID that pays for the team'},
    teamMemberId: {type: GraphQLID},
    sortOrder: {type: GraphQLFloat},
    status: {type: GraphQLString}
  })
});
