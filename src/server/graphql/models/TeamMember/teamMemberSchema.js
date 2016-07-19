import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {Team} from '../Team/teamSchema';
import {CachedUser} from '../CachedUser/cachedUserSchema';
import {UserProfile} from '../UserProfile/userProfileSchema';
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
      description: 'Active user\'s CachedUser Id'
    },
    isActive: {type: GraphQLBoolean, description: 'Is user active?'},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      async resolve({teamId}) {
        return await r.table('Team').get(teamId);
      }
    },
    cachedUser: {
      type: CachedUser,
      description: 'The cached user for the team member',
      async resolve({userId}) {
        return await r.table('CachedUser').get(userId);
      }
    },
    userProfile: {
      type: UserProfile,
      description: 'The user profile for the team member',
      async resolve({userId}) {
        return await r.table('UserProfile').get(userId);
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
