import {GraphQLObjectType} from 'graphql';
// and thus begins a new era of folder hierarchy
import slackChannelAdded from 'server/graphql/subscriptions/slackChannelAdded';
import slackChannelRemoved from 'server/graphql/subscriptions/slackChannelRemoved';
import providerAdded from 'server/graphql/subscriptions/providerAdded';
import providerRemoved from 'server/graphql/subscriptions/providerRemoved';
import githubRepoAdded from 'server/graphql/subscriptions/githubRepoAdded';
import githubRepoRemoved from 'server/graphql/subscriptions/githubRepoRemoved';
import githubMemberRemoved from 'server/graphql/subscriptions/githubMemberRemoved';
import invoice from './models/Invoice/invoiceSubscription';
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
import projectUpdated from 'server/graphql/subscriptions/projectUpdated';
import projectCreated from 'server/graphql/subscriptions/projectCreated';
import projectDeleted from 'server/graphql/subscriptions/projectDeleted';
import meetingUpdated from 'server/graphql/subscriptions/meetingUpdated';
import teamMemberUpdated from 'server/graphql/subscriptions/teamMemberUpdated';
import teamMemberAdded from 'server/graphql/subscriptions/teamMemberAdded';
import agendaItemAdded from 'server/graphql/subscriptions/agendaItemAdded';
import agendaItemUpdated from 'server/graphql/subscriptions/agendaItemUpdated';
import agendaItemRemoved from 'server/graphql/subscriptions/agendaItemRemoved';
import orgApprovalRemoved from 'server/graphql/subscriptions/orgApprovalRemoved';
import orgApprovalAdded from 'server/graphql/subscriptions/orgApprovalAdded';
import invitationAdded from 'server/graphql/subscriptions/invitationAdded';
import invitationRemoved from 'server/graphql/subscriptions/invitationRemoved';
import invitationUpdated from 'server/graphql/subscriptions/invitationUpdated';
import teamAdded from 'server/graphql/subscriptions/teamAdded';

const rootFields = Object.assign({},
  invoice,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    agendaItemAdded,
    agendaItemRemoved,
    agendaItemUpdated,
    githubMemberRemoved,
    githubRepoAdded,
    githubRepoRemoved,
    integrationJoined,
    integrationLeft,
    invitationAdded,
    invitationRemoved,
    invitationUpdated,
    meetingUpdated,
    newAuthToken,
    notificationsAdded,
    notificationsCleared,
    orgApprovalAdded,
    orgApprovalRemoved,
    organizationAdded,
    organizationUpdated,
    projectCreated,
    projectDeleted,
    projectUpdated,
    slackChannelAdded,
    slackChannelRemoved,
    providerAdded,
    providerRemoved,
    teamAdded,
    teamMembersInvited,
    teamMemberAdded,
    teamMemberUpdated,
    ...rootFields
  })
});
