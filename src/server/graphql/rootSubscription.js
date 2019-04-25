import {GraphQLObjectType} from 'graphql'
import agendaItemSubscription from 'server/graphql/subscriptions/agendaItemSubscription'
import newAuthToken from 'server/graphql/subscriptions/newAuthToken'
import notificationSubscription from 'server/graphql/subscriptions/notificationSubscription'
import organizationSubscription from 'server/graphql/subscriptions/organizationSubscription'
import taskSubscription from 'server/graphql/subscriptions/taskSubscription'
import slackChannelAdded from 'server/graphql/subscriptions/slackChannelAdded'
import slackChannelRemoved from 'server/graphql/subscriptions/slackChannelRemoved'
import teamMemberSubscription from 'server/graphql/subscriptions/teamMemberSubscription'
import teamSubscription from 'server/graphql/subscriptions/teamSubscription'
import integrationSubscription from 'server/graphql/subscriptions/integrationSubscription'

export default new GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    agendaItemSubscription,
    integrationSubscription,
    newAuthToken,
    notificationSubscription,
    organizationSubscription,
    taskSubscription,
    slackChannelAdded,
    slackChannelRemoved,
    teamSubscription,
    teamMemberSubscription
  })
})
