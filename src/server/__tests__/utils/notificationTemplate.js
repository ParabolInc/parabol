import {TRIAL_EXPIRES_SOON,TRIAL_EXPIRED, BILLING_LEADER} from 'universal/utils/constants';
import {TRIAL_EXPIRES_SOON_DELAY} from 'server/utils/serverConstants';

const now = new Date();

const billingLeadersOnly = (users, orgId ) => users.reduce((list, user) => {
  const isBillingLeader = user.userOrgs.find((org) => org.id === orgId && org.role === BILLING_LEADER);
  if (isBillingLeader) {
    list.push(user.id);
  }
  return list;
}, []);

export default function notificationTemplate(template) {
  const {type} = template;
  switch (type) {
    case TRIAL_EXPIRES_SOON:
      return {
        type,
        startAt: new Date(now.getTime() + TRIAL_EXPIRES_SOON_DELAY),
        userIds: billingLeadersOnly(this.db.user, this.context.organization.id),
        varList: [this.context.organization.periodEnd]
      };
    case TRIAL_EXPIRED:
      return {
        type,
        startAt: now,
        userIds: billingLeadersOnly(this.db.user, this.context.organization.id),
        varList: [this.context.organization.periodEnd]
      };
    default:
      return {}
  }
}
