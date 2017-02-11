import {GraphQLObjectType} from 'graphql';
import action from 'server/graphql/models/Action/actionMutation';
import agenda from 'server/graphql/models/AgendaItem/agendaItemMutation';
import invitation from 'server/graphql/models/Invitation/invitationMutation';
import meeting from 'server/graphql/models/Meeting/meetingMutation';
import notification from 'server/graphql/models/Notification/notificationMutation';
import orgApproval from 'server/graphql/models/OrgApproval/orgApprovalMutation';
import organization from 'server/graphql/models/Organization/organizationMutation';
import presence from 'server/graphql/models/Presence/presenceMutation';
import project from 'server/graphql/models/Project/projectMutation';
import team from 'server/graphql/models/Team/teamMutation';
import teamMember from 'server/graphql/models/TeamMember/teamMemberMutation';
import user from 'server/graphql/models/User/userMutation';

const rootFields = Object.assign({},
  action,
  agenda,
  invitation,
  meeting,
  notification,
  orgApproval,
  organization,
  presence,
  project,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'RootMutation',
  fields: () => rootFields
});
