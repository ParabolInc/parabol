import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserMutation';
import team from './models/Team/teamMutation';
import presence from './models/Presence/presenceMutation';
import teamMember from './models/TeamMember/teamMemberMutation';
import userProfile from './models/UserProfile/userProfileMutation';
import invitation from './models/Invitation/invitationMutation';

const rootFields = Object.assign({},
  cachedUser,
  invitation,
  presence,
  team,
  teamMember,
  userProfile
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
