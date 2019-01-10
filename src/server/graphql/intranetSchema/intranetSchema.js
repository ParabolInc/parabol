import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import autopauseUsers from 'server/graphql/intranetSchema/mutations/autopauseUsers'
import endOldMeetings from 'server/graphql/intranetSchema/mutations/endOldMeetings'
import sendBatchNotificationEmails from 'server/graphql/intranetSchema/mutations/sendBatchNotificationEmails'
import pingActionTick from 'server/graphql/intranetSchema/queries/pingActionTick'
import suCountTiersForUser from 'server/graphql/queries/suCountTiersForUser'
import suUserCount from 'server/graphql/queries/suUserCount'
import suProOrgInfo from 'server/graphql/queries/suProOrgInfo'
import suOrgCount from 'server/graphql/queries/suOrgCount'
import sendUpcomingInvoiceEmails from 'server/graphql/intranetSchema/mutations/sendUpcomingInvoiceEmails'

const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    pingActionTick,
    suCountTiersForUser,
    suUserCount,
    suProOrgInfo,
    suOrgCount
  })
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    autopauseUsers,
    endOldMeetings,
    sendBatchNotificationEmails,
    sendUpcomingInvoiceEmails
  })
})

export default new GraphQLSchema({query, mutation})
