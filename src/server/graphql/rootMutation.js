import {GraphQLObjectType} from 'graphql';
import invitation from './models/Invitation/invitationMutation';
import presence from './models/Presence/presenceMutation';
import task from './models/Task/taskMutation';
import team from './models/Team/teamMutation';
import teamMember from './models/TeamMember/teamMemberMutation';
import user from './models/User/userMutation';

const rootFields = Object.assign({},
  invitation,
  presence,
  task,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
