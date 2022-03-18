import {loadFilesSync} from '@graphql-tools/load-files'
import {mergeSchemas} from '@graphql-tools/schema'
import {GraphQLObjectType, GraphQLSchema} from 'graphql'
import path from 'path'
import {GQLContext} from '../graphql'
import addNewFeature from '../intranetSchema/mutations/addNewFeature'
import autopauseUsers from '../intranetSchema/mutations/autopauseUsers'
import backupOrganization from '../intranetSchema/mutations/backupOrganization'
import checkRethinkPgEquality from '../intranetSchema/mutations/checkRethinkPgEquality'
import connectSocket from '../intranetSchema/mutations/connectSocket'
import disconnectSocket from '../intranetSchema/mutations/disconnectSocket'
import draftEnterpriseInvoice from '../intranetSchema/mutations/draftEnterpriseInvoice'
import dumpHeap from '../intranetSchema/mutations/dumpHeap'
import enableSAMLForDomain from '../intranetSchema/mutations/enableSAMLForDomain'
import endOldMeetings from '../intranetSchema/mutations/endOldMeetings'
import flagConversionModal from '../intranetSchema/mutations/flagConversionModal'
import flagOverLimit from '../intranetSchema/mutations/flagOverLimit'
import hardDeleteUser from '../intranetSchema/mutations/hardDeleteUser'
import lockTeams from '../intranetSchema/mutations/lockTeams'
import loginSAML from '../intranetSchema/mutations/loginSAML'
import messageAllSlackUsers from '../intranetSchema/mutations/messageAllSlackUsers'
import profileCPU from '../intranetSchema/mutations/profileCPU'
import removeAllSlackAuths from '../intranetSchema/mutations/removeAllSlackAuths'
import runScheduledJobs from '../intranetSchema/mutations/runScheduledJobs'
import sendBatchNotificationEmails from '../intranetSchema/mutations/sendBatchNotificationEmails'
import sendUpcomingInvoiceEmails from '../intranetSchema/mutations/sendUpcomingInvoiceEmails'
import setOrganizationDomain from '../intranetSchema/mutations/setOrganizationDomain'
import stripeCreateInvoice from '../intranetSchema/mutations/stripeCreateInvoice'
import stripeFailPayment from '../intranetSchema/mutations/stripeFailPayment'
import stripeInvoiceFinalized from '../intranetSchema/mutations/stripeInvoiceFinalized'
import stripeSucceedPayment from '../intranetSchema/mutations/stripeSucceedPayment'
import stripeUpdateCreditCard from '../intranetSchema/mutations/stripeUpdateCreditCard'
import stripeUpdateInvoiceItem from '../intranetSchema/mutations/stripeUpdateInvoiceItem'
import updateOAuthRefreshTokens from '../intranetSchema/mutations/updateOAuthRefreshTokens'
import updateWatchlist from '../intranetSchema/mutations/updateWatchlist'
import company from '../intranetSchema/queries/company'
import dailyPulse from '../intranetSchema/queries/dailyPulse'
import logins from '../intranetSchema/queries/logins'
import pingActionTick from '../intranetSchema/queries/pingActionTick'
import signups from '../intranetSchema/queries/signups'
import user from '../intranetSchema/queries/user'
import users from '../intranetSchema/queries/users'
import suCountTiersForUser from '../queries/suCountTiersForUser'
import suOrgCount from '../queries/suOrgCount'
import suProOrgInfo from '../queries/suProOrgInfo'
import suUserCount from '../queries/suUserCount'
import rootTypes from '../rootTypes'
import resolverMap from './resolvers'

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
      updateWatchlist,
      updateOAuthRefreshTokens
    } as any)
})

const codeFirstSchema = new GraphQLSchema({query, mutation, types: rootTypes})

const typeDefs = loadFilesSync(
  path.join(__PROJECT_ROOT__, 'packages/server/graphql/private/typeDefs/*.graphql')
)

const schema = mergeSchemas({schemas: [codeFirstSchema], typeDefs, resolvers: resolverMap})
export default schema
