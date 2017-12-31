import {GraphQLObjectType} from 'graphql';
import agendaItemAdded from 'server/graphql/subscriptions/agendaItemAdded';
import agendaItemRemoved from 'server/graphql/subscriptions/agendaItemRemoved';
import agendaItemUpdated from 'server/graphql/subscriptions/agendaItemUpdated';
import githubMemberRemoved from 'server/graphql/subscriptions/githubMemberRemoved';
import githubRepoAdded from 'server/graphql/subscriptions/githubRepoAdded';
import githubRepoRemoved from 'server/graphql/subscriptions/githubRepoRemoved';
import integrationJoined from 'server/graphql/subscriptions/integrationJoined';
import integrationLeft from 'server/graphql/subscriptions/integrationLeft';
import invitationSubscription from 'server/graphql/subscriptions/invitationSubscription';
import meetingUpdated from 'server/graphql/subscriptions/meetingUpdated';
import newAuthToken from 'server/graphql/subscriptions/newAuthToken';
import notificationsAdded from 'server/graphql/subscriptions/notificationsAdded';
import notificationsCleared from 'server/graphql/subscriptions/notificationsCleared';
import organizationAdded from 'server/graphql/subscriptions/organizationAdded';
import organizationUpdated from 'server/graphql/subscriptions/organizationUpdated';
import orgApprovalSubscription from 'server/graphql/subscriptions/orgApprovalSubscription';
import projectCreated from 'server/graphql/subscriptions/projectCreated';
import projectDeleted from 'server/graphql/subscriptions/projectDeleted';
import projectUpdated from 'server/graphql/subscriptions/projectUpdated';
import providerAdded from 'server/graphql/subscriptions/providerAdded';
import providerRemoved from 'server/graphql/subscriptions/providerRemoved';
import slackChannelAdded from 'server/graphql/subscriptions/slackChannelAdded';
import slackChannelRemoved from 'server/graphql/subscriptions/slackChannelRemoved';
import teamMembersInvited from 'server/graphql/subscriptions/teamMembersInvited';
import teamMemberSubscription from 'server/graphql/subscriptions/teamMemberSubscription';
import teamSubscription from 'server/graphql/subscriptions/teamSubscription';
import invoice from './models/Invoice/invoiceSubscription';

const rootFields = Object.assign({},
  invoice
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
    invitationSubscription,
    meetingUpdated,
    newAuthToken,
    notificationsAdded,
    notificationsCleared,
    orgApprovalSubscription,
    organizationAdded,
    organizationUpdated,
    projectCreated,
    projectDeleted,
    projectUpdated,
    slackChannelAdded,
    slackChannelRemoved,
    providerAdded,
    providerRemoved,
    teamSubscription,
    teamMembersInvited,
    teamMemberSubscription,
    ...rootFields
  })
});
