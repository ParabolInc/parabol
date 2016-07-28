import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} from 'graphql';
import {GraphQLURLType} from '../types';
import {Team} from '../Team/teamSchema';
import {User} from '../User/userSchema';
import {nonnullifyInputThunk} from '../utils';
import r from 'server/database/rethinkDriver';

export const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team team this member belongs to'},
    userId: {
      type: GraphQLID,
      description: 'Active user\'s User Id'
    },
    isActive: {type: GraphQLBoolean, description: 'Is user active?'},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    /* denormalized from User */
    picture: {
      type: GraphQLURLType,
      description: 'url of user\'s profile picture'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    /* Ephemeral meeting state */
    checkInOrder: {
      type: GraphQLInt,
      description: 'The place in line for checkin, regenerated every meeting'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if present, false if absent, null before check-in'
    },
    /* GraphQL sugar */
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      async resolve({teamId}) {
        return await r.table('Team').get(teamId);
      }
    },
    user: {
      type: User,
      description: 'The user for the team member',
      async resolve({userId}) {
        return await r.table('User').get(userId);
      }
    }
  })
});

const teamMemberInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique team member ID'},
  teamId: {type: GraphQLID, description: 'The team this member belongs to'},
  userId: {type: GraphQLID, description: 'Active user\'s  id'},
  isActive: {type: GraphQLBoolean, description: 'Is user active?'},
  isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
  isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'}
});

export const CreateTeamMemberInput =
  nonnullifyInputThunk('CreateTeamMemberInput', teamMemberInputThunk, ['id', 'teamId', 'userId']);
