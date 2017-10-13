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
import organization from './models/Organization/organizationSubscription';
import orgApproval from './models/OrgApproval/orgApprovalSubscription';
import presence from './models/Presence/presenceSubscription';
import project from './models/Project/projectSubscription';
import team from './models/Team/teamSubscription';
import teamMember from './models/TeamMember/teamMemberSubscription';
import user from './models/User/userSubscription';
import integrationLeft from 'server/graphql/subscriptions/integrationLeft';
import integrationJoined from 'server/graphql/subscriptions/integrationJoined';
import notificationsAdded from 'server/graphql/subscriptions/notificationsAdded';
import notificationsCleared from 'server/graphql/subscriptions/notificationsCleared';
import teamMembersInvited from 'server/graphql/subscriptions/teamMembersInvited';
import newAuthToken from 'server/graphql/subscriptions/newAuthToken';
import organizationAdded from 'server/graphql/subscriptions/organizationAdded';
import organizationUpdated from 'server/graphql/subscriptions/organizationUpdated';

const rootFields = Object.assign({},
  agenda,
  invitation,
  invoice,
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
    newAuthToken,
    notificationsAdded,
    notificationsCleared,
    organizationAdded,
    organizationUpdated,
    slackChannelAdded,
    slackChannelRemoved,
    providerAdded,
    providerRemoved,
    teamMembersInvited,
    ...rootFields
  })
});
