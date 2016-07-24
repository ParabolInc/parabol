import {GraphQLObjectType} from 'graphql';
import user from './models/User/userMutation';
import team from './models/Team/teamMutation';
import presence from './models/Presence/presenceMutation';
import teamMember from './models/TeamMember/teamMemberMutation';
import invitation from './models/Invitation/invitationMutation';

const rootFields = Object.assign({},
  user,
  invitation,
  presence,
  team,
  teamMember
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
