import r from 'server/database/rethinkDriver';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {TeamMember, CreateTeamMemberInput} from '../TeamMember/teamMemberSchema';
import {nonnullifyInputThunk} from '../utils';

export const Presence = new GraphQLObjectType({
  name: 'Presence',
  description: 'A connection\'s presence in a team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The socketId representing a single socket connection'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The userId representing 1 or more sockets'}
  })
});

export const Team = new GraphQLObjectType({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team ID'},
    name: {type: GraphQLString, description: 'The name of the team'},
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the team was created'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the team was last updated'
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'All the team members associated who can join this team',
      async resolve({id}) {
        return await r.table('TeamMember').getAll(id, {index: 'teamId'});
      }
    }
  })
});

const teamInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique team ID'},
  name: {type: GraphQLString, description: 'The name of the team'},
  leader: {
    type: CreateTeamMemberInput,
    description: 'Each team must be created with 1 team member, the leader.'
  }
});

export const CreateTeamInput = nonnullifyInputThunk('CreateTeamInput', teamInputThunk, ['id', 'name']);
export const UpdateTeamInput = nonnullifyInputThunk('UpdateTeamInput', teamInputThunk, ['id']);
