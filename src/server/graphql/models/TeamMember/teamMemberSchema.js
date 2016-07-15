import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {Meeting} from '../Meeting/meetingSchema';
import {CachedUser} from '../CachedUser/cachedUserSchema';
import {UserProfile} from '../UserProfile/userProfileSchema';
import {nonnullifyInputThunk} from '../utils';
import r from '../../../database/rethinkDriver';

export const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team meeting',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    meetingId: {type: new GraphQLNonNull(GraphQLID), description: 'The team meeting this member belongs to'},
    userId: {
      type: GraphQLID,
      description: 'Active user\'s CachedUser Id'
    },
    isActive: {type: GraphQLBoolean, description: 'Is user active?'},
    isLead: {type: GraphQLBoolean, description: 'Is user a meeting lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a meeting facilitator?'},
    meeting: {
      type: Meeting,
      description: 'The meeting this team member belongs to',
      async resolve({meetingId}) {
        return await r.table('Meeting').get(meetingId);
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
  meetingId: {type: GraphQLID, description: 'The meeting this member belongs to'},
  userId: {type: GraphQLID, description: 'Active user\'s  id'},
  isActive: {type: GraphQLBoolean, description: 'Is user active?'},
  isLead: {type: GraphQLBoolean, description: 'Is user a meeting lead?'},
  isFacilitator: {type: GraphQLBoolean, description: 'Is user a meeting facilitator?'}
});

export const CreateTeamMemberInput =
  nonnullifyInputThunk('CreateTeamMemberInput', teamMemberInputThunk, ['id', 'meetingId', 'userId']);
