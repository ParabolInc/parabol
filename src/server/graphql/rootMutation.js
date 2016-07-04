import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserMutation';
import meeting from './models/Meeting/meetingMutation';
import team from './models/Team/teamMutation';
import teamMember from './models/TeamMember/teamMemberMutation';
import userProfile from './models/UserProfile/userProfileMutation';
import invitation from './models/Invitation/invitationMutation';
import connection from './models/Connection/connectionMutation';

// import participant from './models/Participant/';

const rootFields = Object.assign(cachedUser, meeting, team, teamMember, userProfile, invitation, connection);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
