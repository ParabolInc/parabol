import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import autopauseUsers from './mutations/autopauseUsers'
import endOldMeetings from './mutations/endOldMeetings'
import sendBatchNotificationEmails from './mutations/sendBatchNotificationEmails'
import pingActionTick from './queries/pingActionTick'
import suCountTiersForUser from '../queries/suCountTiersForUser'
import suUserCount from '../queries/suUserCount'
import suProOrgInfo from '../queries/suProOrgInfo'
import suOrgCount from '../queries/suOrgCount'
import sendUpcomingInvoiceEmails from './mutations/sendUpcomingInvoiceEmails'
import addNewFeature from './mutations/addNewFeature'
import user from './queries/user'
import flagOverLimit from './mutations/flagOverLimit'
import runScheduledJobs from './mutations/runScheduledJobs'
import {GQLContext} from '../graphql'
import loginSSO from './mutations/loginSSO'
import draftEnterpriseInvoice from './mutations/draftEnterpriseInvoice'
import githubAddAssignee from './mutations/githubAddAssignee'
import stripeCreateInvoice from './mutations/stripeCreateInvoice'
import stripeFailPayment from './mutations/stripeFailPayment'
import stripeSucceedPayment from './mutations/stripeSucceedPayment'
import stripeInvoiceFinalized from './mutations/stripeInvoiceFinalized'
import stripeUpdateCreditCard from './mutations/stripeUpdateCreditCard'
import stripeUpdateInvoiceItem from './mutations/stripeUpdateInvoiceItem'
import flagConversionModal from './mutations/flagConversionModal'

const query = new GraphQLObjectType<any, GQLContext, any>({
  name: 'Query',
  fields: () => ({
    pingActionTick,
    suCountTiersForUser,
    suUserCount,
    suProOrgInfo,
    suOrgCount,
    user
  })
})

const mutation = new GraphQLObjectType<any, GQLContext, any>({
  name: 'Mutation',
  fields: () => ({
    addNewFeature,
    autopauseUsers,
    draftEnterpriseInvoice,
    endOldMeetings,
    flagConversionModal,
    flagOverLimit,
    githubAddAssignee,
    loginSSO,
    runScheduledJobs,
    sendBatchNotificationEmails,
    sendUpcomingInvoiceEmails,
    stripeCreateInvoice,
    stripeFailPayment,
    stripeSucceedPayment,
    stripeUpdateCreditCard,
    stripeUpdateInvoiceItem,
    stripeInvoiceFinalized,
  })
})

export default new GraphQLSchema({query, mutation})
