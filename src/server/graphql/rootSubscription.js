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
import notificationSubscription from 'server/graphql/subscriptions/notificationSubscription';
import organizationAdded from 'server/graphql/subscriptions/organizationAdded';
import organizationUpdated from 'server/graphql/subscriptions/organizationUpdated';
import orgApprovalSubscription from 'server/graphql/subscriptions/orgApprovalSubscription';
import projectSubscription from 'server/graphql/subscriptions/projectSubscription';
import providerAdded from 'server/graphql/subscriptions/providerAdded';
import providerRemoved from 'server/graphql/subscriptions/providerRemoved';
import slackChannelAdded from 'server/graphql/subscriptions/slackChannelAdded';
import slackChannelRemoved from 'server/graphql/subscriptions/slackChannelRemoved';
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
    notificationSubscription,
    orgApprovalSubscription,
    organizationAdded,
    organizationUpdated,
    projectSubscription,
    slackChannelAdded,
    slackChannelRemoved,
    providerAdded,
    providerRemoved,
    teamSubscription,
    teamMemberSubscription,
    ...rootFields
  })
});
