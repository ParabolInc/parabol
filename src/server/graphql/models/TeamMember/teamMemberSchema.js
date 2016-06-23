import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInputObjectType
} from 'graphql';
import {Team} from '../Team/teamSchema';
import {CachedUser} from '../CachedUser/cachedUserSchema';
import {UserProfile} from '../UserProfile/userProfileSchema';

export const TeamMemberInput = new GraphQLInputObjectType({
  name: 'TeamMemberInput',
  description: 'The input object for a team member',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team this member belongs to'},
    isActive: {type: GraphQLBoolean, description: 'Is user active?'},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'}
  })
});

export const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    teamId: {type: new GraphQLNonNull(GraphQLID), description: 'The team this member belongs to'},
    cachedUserId: {
      type: GraphQLID,
      description: 'Active user\'s CachedUser ID. Will be blank if invitee has not accepted'
    },
    isActive: {type: GraphQLBoolean, description: 'Is user active?'},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    team: {
      type: Team,
      description: 'The team this team member belongs to'
    },
    cachedUser: {
      type: CachedUser,
      description: 'The cached user for the team member'
    },
    userProfile: {
      type: UserProfile,
      description: 'The user profile for the team member'
    }
  })
});
