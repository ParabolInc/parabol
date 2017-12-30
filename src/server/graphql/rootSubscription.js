import {GraphQLObjectType} from 'graphql';
import agendaItemAdded from 'server/graphql/subscriptions/agendaItemAdded';
import agendaItemRemoved from 'server/graphql/subscriptions/agendaItemRemoved';
import agendaItemUpdated from 'server/graphql/subscriptions/agendaItemUpdated';
import githubMemberRemoved from 'server/graphql/subscriptions/githubMemberRemoved';
import githubRepoAdded from 'server/graphql/subscriptions/githubRepoAdded';
import githubRepoRemoved from 'server/graphql/subscriptions/githubRepoRemoved';
import integrationJoined from 'server/graphql/subscriptions/integrationJoined';
import integrationLeft from 'server/graphql/subscriptions/integrationLeft';
import invitationAdded from 'server/graphql/subscriptions/invitationAdded';
import invitationRemoved from 'server/graphql/subscriptions/invitationRemoved';
import invitationUpdated from 'server/graphql/subscriptions/invitationUpdated';
import meetingUpdated from 'server/graphql/subscriptions/meetingUpdated';
import newAuthToken from 'server/graphql/subscriptions/newAuthToken';
import notificationsAdded from 'server/graphql/subscriptions/notificationsAdded';
import notificationsCleared from 'server/graphql/subscriptions/notificationsCleared';
import organizationAdded from 'server/graphql/subscriptions/organizationAdded';
import organizationUpdated from 'server/graphql/subscriptions/organizationUpdated';
import orgApprovalAdded from 'server/graphql/subscriptions/orgApprovalAdded';
import orgApprovalRemoved from 'server/graphql/subscriptions/orgApprovalRemoved';
import projectCreated from 'server/graphql/subscriptions/projectCreated';
import projectDeleted from 'server/graphql/subscriptions/projectDeleted';
import projectUpdated from 'server/graphql/subscriptions/projectUpdated';
import providerAdded from 'server/graphql/subscriptions/providerAdded';
import providerRemoved from 'server/graphql/subscriptions/providerRemoved';
import slackChannelAdded from 'server/graphql/subscriptions/slackChannelAdded';
import slackChannelRemoved from 'server/graphql/subscriptions/slackChannelRemoved';
import teamAdded from 'server/graphql/subscriptions/teamAdded';
import teamMembersInvited from 'server/graphql/subscriptions/teamMembersInvited';
import teamMemberSubscription from 'server/graphql/subscriptions/teamMemberSubscription';
import teamUpdated from 'server/graphql/subscriptions/teamUpdated';
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
    teamUpdated,
    teamMembersInvited,
    teamMemberSubscription,
    ...rootFields
  })
});
