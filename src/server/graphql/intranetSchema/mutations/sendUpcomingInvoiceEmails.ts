import {GraphQLList, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import sendEmailPromise from 'server/email/sendEmail'
import {requireSU} from 'server/utils/authorization'
import {UPCOMING_INVOICE_EMAIL_WARNING} from 'server/utils/serverConstants'
import {BILLING_LEADER, PRO} from 'universal/utils/constants'
import {months} from 'universal/utils/makeDateString'
import makeAppLink from 'server/utils/makeAppLink'
import {UpcomingInvoiceEmailProps} from 'universal/modules/email/components/UpcomingInvoiceEmail'

interface Details extends UpcomingInvoiceEmailProps {
  emailStr: string
}

const makePeriodEndStr = (periodEnd: Date) => {
  const date = new Date(periodEnd)
  const month = date.getMonth()
  const day = date.getDate()
  const monthStr = months[month]
  return `${monthStr} ${day}`
}

const getEmailDetails = (organizations) => {
  const details = [] as Details[]
  for (let ii = 0; ii < organizations.length; ii++) {
    const organization = organizations[ii]
    const {id: orgId, billingLeaders, periodEnd} = organization
    const newUsers = organization.newUsers.map((newUser) => ({
      email: newUser.user.email,
      name: newUser.user.preferredName
    }))
    const billingLeaderEmails = billingLeaders.map((billingLeader) => billingLeader.user.email)
    const emailStr = billingLeaderEmails.join(', ')
    details.push({
      emailStr,
      periodEndStr: makePeriodEndStr(periodEnd),
      memberUrl: makeAppLink(`me/organizations/${orgId}/members`),
      newUsers
    })
  }
  return details
}

const sendUpcomingInvoiceEmails = {
  type: new GraphQLList(GraphQLString),
  description:
    'send an email to organizations including all the users that were added in the current billing cycle',
  resolve: async (_source, _args, {authToken}) => {
    requireSU(authToken)
    const r = getRethink()
    const now = new Date()
    const periodEndThresh = new Date(Date.now() + UPCOMING_INVOICE_EMAIL_WARNING)
    const lastSentThresh = new Date(Date.now() - UPCOMING_INVOICE_EMAIL_WARNING)

    const organizations = await r
      .table('Organization')
      .getAll(PRO, {index: 'tier'})
      .filter((organization) =>
        r.and(
          organization('periodEnd')
            .le(periodEndThresh)
            .default(false),
          organization('upcomingInvoiceEmailSentAt')
            .le(lastSentThresh)
            .default(true)
        )
      )
      .coerceTo('array')
      .merge((organization) => ({
        newUsers: r
          .table('OrganizationUser')
          .getAll(organization('id'), {index: 'orgId'})
          .filter((organizationUser) => organizationUser('newUserUntil').ge(now))
          .filter({removedAt: null, role: null})
          .coerceTo('array')
          .merge((organizationUser) => ({
            user: r
              .table('User')
              .get(organizationUser('userId'))
              .pluck('preferredName', 'email')
          }))
      }))
      .filter((organization) =>
        organization('newUsers')
          .count()
          .ge(1)
      )
      .merge((organization) => ({
        billingLeaders: r
          .table('OrganizationUser')
          .getAll(organization('id'), {index: 'orgId'})
          .filter({role: BILLING_LEADER, removedAt: null})
          .coerceTo('array')
          .merge((organizationUser) => ({
            user: r
              .table('User')
              .get(organizationUser('userId'))
              .pluck('preferredName', 'email')
          }))
      }))
      .coerceTo('array')

    if (organizations.length) {
      const details = getEmailDetails(organizations)
      await Promise.all(
        details.map((detail) => {
          const {emailStr, ...props} = detail
          sendEmailPromise(emailStr, 'UpcomingInvoiceEmailTemplate', props).catch()
        })
      )
      const orgIds = organizations.map(({id}) => id)
      await r
        .table('Organization')
        .getAll(r.args(orgIds))
        .update({
          upcomingInvoiceEmailSentAt: now
        })
      return details.map(({emailStr}) => emailStr)
    }
    return []
  }
}

export default sendUpcomingInvoiceEmails
