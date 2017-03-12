import {GraphQLObjectType} from 'graphql';
import action from './models/Action/actionSubscription';
import agenda from './models/AgendaItem/agendaItemSubscription';
import invitation from './models/Invitation/invitationSubscription';
import invoice from './models/Invoice/invoiceSubscription';
import notification from './models/Notification/notificationSubscription';
import orgApproval from './models/OrgApproval/orgApprovalSubscription';
import organization from './models/Organization/organizationSubscription';
import presence from './models/Presence/presenceSubscription';
import project from './models/Project/projectSubscription';
import team from './models/Team/teamSubscription';
import teamMember from './models/TeamMember/teamMemberSubscription';
import user from './models/User/userSubscription';

const rootFields = Object.assign({},
  action,
  agenda,
  invitation,
  invoice,
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
  name: 'RootSubscription',
  fields: () => rootFields
});
