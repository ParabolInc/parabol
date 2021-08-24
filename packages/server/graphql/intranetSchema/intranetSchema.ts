import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import {GQLContext} from '../graphql'
import suCountTiersForUser from '../queries/suCountTiersForUser'
import suOrgCount from '../queries/suOrgCount'
import suProOrgInfo from '../queries/suProOrgInfo'
import suUserCount from '../queries/suUserCount'
import rootTypes from '../rootTypes'
import addNewFeature from './mutations/addNewFeature'
import autopauseUsers from './mutations/autopauseUsers'
import backupOrganization from './mutations/backupOrganization'
import checkRethinkPgEquality from './mutations/checkRethinkPgEquality'
import connectSocket from './mutations/connectSocket'
import disconnectSocket from './mutations/disconnectSocket'
import draftEnterpriseInvoice from './mutations/draftEnterpriseInvoice'
import dumpHeap from './mutations/dumpHeap'
import enableSAMLForDomain from './mutations/enableSAMLForDomain'
import endOldMeetings from './mutations/endOldMeetings'
import flagConversionModal from './mutations/flagConversionModal'
import flagOverLimit from './mutations/flagOverLimit'
import hardDeleteUser from './mutations/hardDeleteUser'
import lockTeams from './mutations/lockTeams'
import loginSAML from './mutations/loginSAML'
import messageAllSlackUsers from './mutations/messageAllSlackUsers'
import profileCPU from './mutations/profileCPU'
import removeAllSlackAuths from './mutations/removeAllSlackAuths'
import runScheduledJobs from './mutations/runScheduledJobs'
import sendBatchNotificationEmails from './mutations/sendBatchNotificationEmails'
import sendUpcomingInvoiceEmails from './mutations/sendUpcomingInvoiceEmails'
import setOrganizationDomain from './mutations/setOrganizationDomain'
import stripeCreateInvoice from './mutations/stripeCreateInvoice'
import stripeFailPayment from './mutations/stripeFailPayment'
import stripeInvoiceFinalized from './mutations/stripeInvoiceFinalized'
import stripeSucceedPayment from './mutations/stripeSucceedPayment'
import stripeUpdateCreditCard from './mutations/stripeUpdateCreditCard'
import stripeUpdateInvoiceItem from './mutations/stripeUpdateInvoiceItem'
import company from './queries/company'
import dailyPulse from './queries/dailyPulse'
import logins from './queries/logins'
import pingActionTick from './queries/pingActionTick'
import signups from './queries/signups'
import user from './queries/user'
import users from './queries/users'
import updateEmail from './mutations/updateEmail'
import updateWatchlist from './mutations/updateWatchlist'

const query = new GraphQLObjectType<any, GQLContext>({
  name: 'Query',
  fields: () =>
    ({
      company,
      dailyPulse,
      pingActionTick,
      suCountTiersForUser,
      suUserCount,
      suProOrgInfo,
      suOrgCount,
      user,
      users,
      logins,
      signups
    } as any)
})

const mutation = new GraphQLObjectType<any, GQLContext>({
  name: 'Mutation',
  fields: () =>
    ({
      addNewFeature,
      autopauseUsers,
      backupOrganization,
      checkRethinkPgEquality,
      connectSocket,
      profileCPU,
      disconnectSocket,
      draftEnterpriseInvoice,
      dumpHeap,
      endOldMeetings,
      flagConversionModal,
      flagOverLimit,
      hardDeleteUser,
      lockTeams,
      loginSAML,
      enableSAMLForDomain,
      messageAllSlackUsers,
      removeAllSlackAuths,
      runScheduledJobs,
      sendBatchNotificationEmails,
      sendUpcomingInvoiceEmails,
      setOrganizationDomain,
      stripeCreateInvoice,
      stripeFailPayment,
      stripeSucceedPayment,
      stripeUpdateCreditCard,
      stripeUpdateInvoiceItem,
      stripeInvoiceFinalized,
      updateEmail,
      updateWatchlist
    } as any)
})

export default new GraphQLSchema({query, mutation, types: rootTypes})
