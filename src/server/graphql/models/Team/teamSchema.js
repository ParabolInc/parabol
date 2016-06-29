import r from '../../../database/rethinkDriver';
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';
import {TeamMember, CreateTeamMemberInput} from '../TeamMember/teamMemberSchema';
import GraphQLISO8601Type from 'graphql-custom-datetype';
import {nonnullifyInputThunk} from '../utils';

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
      description: 'The datetime the team was last updated (not including members)'
    },
    meetingSlug: {type: GraphQLString, description: 'The slug for the meeting uri'},
    members: {
      type: new GraphQLList(TeamMember),
      description: 'All the team members associated with this team',
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
