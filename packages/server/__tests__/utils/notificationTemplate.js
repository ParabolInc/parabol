import MockDate from 'mockdate'
import { __now } from '../setup/mockTimes'
import {
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  TEAM_ARCHIVED
} from 'parabol-client/utils/constants'
import { OrgUserRole } from 'parabol-client/types/graphql'

MockDate.set(__now)
const now = new Date()

const billingLeadersOnly = (users, orgId) =>
  users.reduce((list, user) => {
    const isBillingLeader = user.userOrgs.find(
      (org) => org.id === orgId && org.role === OrgUserRole.BILLING_LEADER
    )
    if (isBillingLeader) {
      list.push(user.id)
    }
    return list
  }, [])

export default function notificationTemplate(template) {
  const { type } = template
  if (type === PROMOTE_TO_BILLING_LEADER) {
    return {
      type,
      organization: this.context.organization
    }
  }
  if (type === TEAM_ARCHIVED) {
    return {
      type,
      teamName: this.context.team.name
    }
  }
  if (type === PAYMENT_REJECTED) {
    const { last4, brand } = this.context.organization.creditCard
    return {
      type,
      startAt: now,
      userIds: billingLeadersOnly(this.db.user, this.context.organization.id),
      last4,
      brand
    }
  }
  return {}
}
