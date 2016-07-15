import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserMutation';
import meeting from './models/Meeting/meetingMutation';
import teamMember from './models/TeamMember/teamMemberMutation';
import userProfile from './models/UserProfile/userProfileMutation';
import invitation from './models/Invitation/invitationMutation';

// import participant from './models/Participant/';

const rootFields = Object.assign(cachedUser, meeting, teamMember, userProfile, invitation);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
