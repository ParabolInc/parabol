// @flow

/**
 * Defines the js-land type of a Notification, and functions to operate on them.
 */

import {
  ADD_TO_TEAM,
  DENY_NEW_USER,
  INVITEE_APPROVED,
  KICKED_OUT,
  PAYMENT_REJECTED,
  PROJECT_INVOLVES,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_ARCHIVED,
  TEAM_INVITE
} from '../utils/constants';

type Notification = {
  id: string,
  orgId: string,
  startAt: Date,
  teamId?: string,
  type:
    | ADD_TO_TEAM
    | DENY_NEW_USER
    | INVITEE_APPROVED
    | KICKED_OUT
    | PAYMENT_REJECTED
    | PROJECT_INVOLVES
    | PROMOTE_TO_BILLING_LEADER
    | REQUEST_NEW_USER
    | TEAM_ARCHIVED
    | TEAM_INVITE,
  userIds: string[]
};

// Note: this is a conservative estimate; not all of these notifications "require" action,
// but they all offer an action other than to clear the notification.
const NOTIFICATION_TYPES_REQUIRING_ACTION = new Set([
  PAYMENT_REJECTED,
  PROJECT_INVOLVES,
  PROMOTE_TO_BILLING_LEADER,
  REQUEST_NEW_USER,
  TEAM_INVITE
]);

export const requiresAction = (n: Notification): bool =>
  NOTIFICATION_TYPES_REQUIRING_ACTION.has(n.type);
