import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import {TRIAL_EXPIRES_SOON_DELAY} from 'server/utils/serverConstants';
import {
  ADD_TO_TEAM,
  BILLING_LEADER,
  DENY_NEW_USER,
  PAYMENT_REJECTED,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE,
  TRIAL_EXPIRED,
  TRIAL_EXPIRES_SOON
} from 'universal/utils/constants';
import * as shortid from 'shortid';

MockDate.set(__now);
const now = new Date();

const newInvitee = () => ({
  email: `invitee@mockTeam+${shortid.generate()}.co`
});

const billingLeadersOnly = (users, orgId) => users.reduce((list, user) => {
  const isBillingLeader = user.userOrgs.find((org) => org.id === orgId && org.role === BILLING_LEADER);
  if (isBillingLeader) {
    list.push(user.id);
  }
  return list;
}, []);

export default function notificationTemplate(template) {
  const {type} = template;
  if (type === ADD_TO_TEAM) {
    return {
      type,
      inviterName: this.db.user[0].preferredName,
      teamName: this.context.team.name,
      teamId: this.context.team.id
    };
  }
  if (type === DENY_NEW_USER) {
    return {
      type,
      reason: 'Do not like them',
      deniedByName: this.context.user[0].preferredName,
      inviteeEmail: newInvitee().email
    }
  }
  if (type === PROMOTE_TO_BILLING_LEADER) {
    return {
      type,
      groupName: this.context.organization.name
    };
  }
  if (type === REQUEST_NEW_USER) {
    const inviter = this.db.user[0];
    return {
      type,
      inviterUserId: inviter.id,
      inviterName: inviter.preferredName,
      inviteeEmail: newInvitee().email,
      teamId: this.context.team.id,
      teamName: this.context.team.name,
      userIds: billingLeadersOnly(this.db.user, this.context.organization.id)
    };
  }
  if (type === TEAM_ARCHIVED) {
    return {
      type,
      teamName: this.context.team.name
    };
  }
  if (type === TEAM_INVITE) {
    return {
      type,
      inviterUserId: this.db.user[0].id,
      inviterName: this.db.user[0].preferredName,
      inviteeEmail: newInvitee().email,
      teamId: this.context.team.id,
      teamName: this.context.team.name
    };
  }
  if (type === TRIAL_EXPIRES_SOON) {
    return {
      type,
      startAt: new Date(now.getTime() + TRIAL_EXPIRES_SOON_DELAY),
      userIds: billingLeadersOnly(this.db.user, this.context.organization.id)
    };
  }
  if (type === TRIAL_EXPIRED) {
    return {
      type,
      startAt: now,
      userIds: billingLeadersOnly(this.db.user, this.context.organization.id)
    };
  }
  if (type === PAYMENT_REJECTED) {
    const {last4, brand} = this.context.organization.creditCard;
    return {
      type,
      startAt: now,
      userIds: billingLeadersOnly(this.db.user, this.context.organization.id),
      last4,
      brand
    };
  }
  return {};
}
