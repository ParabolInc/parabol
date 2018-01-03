import {GraphQLObjectType} from 'graphql';
import agendaItemSubscription from 'server/graphql/subscriptions/agendaItemSubscription';
import githubMemberRemoved from 'server/graphql/subscriptions/githubMemberRemoved';
import githubRepoAdded from 'server/graphql/subscriptions/githubRepoAdded';
import githubRepoRemoved from 'server/graphql/subscriptions/githubRepoRemoved';
import integrationJoined from 'server/graphql/subscriptions/integrationJoined';
import integrationLeft from 'server/graphql/subscriptions/integrationLeft';
import invitationSubscription from 'server/graphql/subscriptions/invitationSubscription';
import meetingSubscription from 'server/graphql/subscriptions/meetingSubscription';
import newAuthToken from 'server/graphql/subscriptions/newAuthToken';
import notificationSubscription from 'server/graphql/subscriptions/notificationSubscription';
import organizationSubscription from 'server/graphql/subscriptions/organizationSubscription';
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
    agendaItemSubscription,
    githubMemberRemoved,
    githubRepoAdded,
    githubRepoRemoved,
    integrationJoined,
    integrationLeft,
    invitationSubscription,
    meetingSubscription,
    newAuthToken,
    notificationSubscription,
    orgApprovalSubscription,
    organizationSubscription,
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
