import {GraphQLObjectType} from 'graphql';
import action from './models/Action/actionMutation';
import agenda from './models/AgendaItem/agendaItemMutation';
import invitation from './models/Invitation/invitationMutation';
import meeting from './models/Meeting/meetingMutation';
import organization from './models/Organization/organizationMutation';
import presence from './models/Presence/presenceMutation';
import project from './models/Project/projectMutation';
import team from './models/Team/teamMutation';
import teamMember from './models/TeamMember/teamMemberMutation';
import user from './models/User/userMutation';
const rootFields = Object.assign({},
  action,
  agenda,
  invitation,
  meeting,
  organization,
  presence,
  project,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
