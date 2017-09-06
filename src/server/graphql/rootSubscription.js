import {GraphQLObjectType} from 'graphql';
// and thus begins a new era of folder hierarchy
import slackChannelAdded from 'server/graphql/subscriptions/slackChannelAdded';
import slackChannelRemoved from 'server/graphql/subscriptions/slackChannelRemoved';
import providerAdded from 'server/graphql/subscriptions/providerAdded';
import providerRemoved from 'server/graphql/subscriptions/providerRemoved';
import githubRepoAdded from 'server/graphql/subscriptions/githubRepoAdded';
import githubRepoRemoved from 'server/graphql/subscriptions/githubRepoRemoved';
import githubMemberRemoved from 'server/graphql/subscriptions/githubMemberRemoved';
import agenda from './models/AgendaItem/agendaItemSubscription';
import invitation from './models/Invitation/invitationSubscription';
import invoice from './models/Invoice/invoiceSubscription';
import notification from './models/Notification/notificationSubscription';
import organization from './models/Organization/organizationSubscription';
import orgApproval from './models/OrgApproval/orgApprovalSubscription';
import presence from './models/Presence/presenceSubscription';
import project from './models/Project/projectSubscription';
import team from './models/Team/teamSubscription';
import teamMember from './models/TeamMember/teamMemberSubscription';
import user from './models/User/userSubscription';
import integrationLeft from 'server/graphql/subscriptions/integrationLeft';
import integrationJoined from 'server/graphql/subscriptions/integrationJoined';
import userMemo from 'server/graphql/subscriptions/userMemo';

const rootFields = Object.assign({},
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
  name: 'Subscription',
  fields: () => ({
    githubMemberRemoved,
    githubRepoAdded,
    githubRepoRemoved,
    integrationJoined,
    integrationLeft,
    slackChannelAdded,
    slackChannelRemoved,
    providerAdded,
    providerRemoved,
    userMemo,
    ...rootFields
  })
});
