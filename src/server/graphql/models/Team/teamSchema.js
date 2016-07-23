import r from 'server/database/rethinkDriver';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt
  GraphQLList
} from 'graphql';
import {nonnullifyInputThunk} from '../utils';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {TeamMember, CreateTeamMemberInput} from '../TeamMember/teamMemberSchema';
import {Placeholder} from '../Placeholder/placeholderSchema';

export const Team = new GraphQLObjectType({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team ID'},
    name: {type: GraphQLString, description: 'The name of the team'},
    meetingNumber: {
      type: GraphQLInt,
      description: 'The current or most recent meeting number (also the number of meetings the team has had'
    },
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
    },
    placeholders: {
      type: new GraphQLList(Placeholder),
      description: 'The agenda items for the upcoming or current meeting',
      async resolve({id}) {
        return await r.table('Placeholder').getAll(id, {index: 'teamId'});
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
