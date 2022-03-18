import {UpcomingInvoiceEmailProps} from 'parabol-client/modules/email/components/UpcomingInvoiceEmail'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {months} from 'parabol-client/utils/makeDateString'
import {isNotNull} from 'parabol-client/utils/predicates'
import {Threshold} from '../../../../client/types/constEnums'
import appOrigin from '../../../appOrigin'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import getMailManager from '../../../email/getMailManager'
import UpcomingInvoiceEmailTemplate from '../../../email/UpcomingInvoiceEmailTemplate'
import IUser from '../../../postgres/types/IUser'
import {requireSU} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

interface Details extends UpcomingInvoiceEmailProps {
  emails: string[]
}

interface Organization {
  id: string
  periodEnd: Date
  billingLeaderIds: string[]
  newUserIds: string[]
}

const makePeriodEndStr = (periodEnd: Date) => {
  const date = new Date(periodEnd)
  const month = date.getMonth()
  const day = date.getDate()
  const monthStr = months[month]
  return `${monthStr} ${day}`
}

const getEmailDetails = (organizations: Organization[], userMap: Map<string, IUser>) => {
  const details = [] as Details[]
  organizations.forEach((organization) => {
    const {id: orgId, billingLeaderIds, periodEnd} = organization
    const newUsers = organization.newUserIds
      .map((id) => {
        const newUser = userMap.get(id)
        return (
          newUser && {
            email: newUser.email,
            name: newUser.preferredName
          }
        )
      })
      .filter((newUser) => newUser !== undefined) as {name: string; email: string}[]
    details.push({
      appOrigin,
      emails: billingLeaderIds
        .map((id) => userMap.get(id)?.email)
        .filter((email) => email !== undefined) as string[],
      periodEndStr: makePeriodEndStr(periodEnd),
      memberUrl: makeAppURL(appOrigin, `me/organizations/${orgId}/members`),
      newUsers
    })
  })
  return details
}

const sendUpcomingInvoiceEmails: MutationResolvers['sendUpcomingInvoiceEmails'] = async (
  _source,
  _args,
  {authToken, dataLoader}
) => {
  requireSU(authToken)
  const r = await getRethink()
  const now = new Date()
  const periodEndThresh = new Date(Date.now() + Threshold.UPCOMING_INVOICE_EMAIL_WARNING)
  const lastSentThresh = new Date(Date.now() - Threshold.UPCOMING_INVOICE_EMAIL_WARNING)

  const organizations = (await r
    .table('Organization')
    .getAll('pro', {index: 'tier'})
    .filter((organization) =>
      r.and(
        organization('periodEnd').le(periodEndThresh).default(false),
        organization('upcomingInvoiceEmailSentAt').le(lastSentThresh).default(true)
      )
    )
    .coerceTo('array')
    .merge((organization: RValue) => ({
      newUserIds: r
        .table('OrganizationUser')
        .getAll(organization('id'), {index: 'orgId'})
        .filter((organizationUser) => organizationUser('newUserUntil').ge(now))
        .filter({removedAt: null, role: null})('userId')
        .coerceTo('array')
    }))
    .filter((organization) => organization('newUserIds').count().ge(1))
    .merge((organization: RValue) => ({
      billingLeaderIds: r
        .table('OrganizationUser')
        .getAll(organization('id'), {index: 'orgId'})
        .filter({role: 'BILLING_LEADER', removedAt: null})('userId')
        .coerceTo('array')
    }))
    .coerceTo('array')
    .run()) as Organization[]

  if (organizations.length === 0) return []

  // collect all users to reduce roundtrips to db and do the merging when formatting the data
  const allUserIds = organizations.reduce(
    (prev, cur) => prev.concat(cur.billingLeaderIds, cur.newUserIds),
    [] as string[]
  )
  const allUsers = await Promise.all(
    allUserIds.map((userId) => dataLoader.get('users').load(userId))
  )
  const allUserMap = allUsers.filter(isNotNull).reduce((prev, cur) => {
    prev.set(cur.id, cur)
    return prev
  }, new Map<string, IUser>())

  const details = getEmailDetails(organizations, allUserMap)
  await Promise.all(
    details.map((detail) => {
      const {emails, ...props} = detail
      const {subject, body, html} = UpcomingInvoiceEmailTemplate(props)
      return Promise.all(
        emails.map((to) => {
          return getMailManager().sendEmail({
            to,
            subject,
            body,
            html,
            tags: ['type:upcomingInvoice']
          })
        })
      )
    })
  )
  const orgIds = organizations.map(({id}) => id)
  await r
    .table('Organization')
    .getAll(r.args(orgIds))
    .update({
      upcomingInvoiceEmailSentAt: now
    })
    .run()
  return details.map(({emails}) => emails.join(','))
}

export default sendUpcomingInvoiceEmails
