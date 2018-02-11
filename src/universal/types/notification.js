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
  TASK_INVOLVES,
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
    | TASK_INVOLVES
    | PROMOTE_TO_BILLING_LEADER
    | REQUEST_NEW_USER
    | TEAM_ARCHIVED
    | TEAM_INVITE,
  userIds: string[]
};

const NOTIFICATION_TYPES_REQUIRING_ACTION = new Set([
  PAYMENT_REJECTED,
  REQUEST_NEW_USER,
  TEAM_INVITE
]);

// eslint-disable-next-line import/prefer-default-export
export const requiresAction = (n: Notification): bool =>
  NOTIFICATION_TYPES_REQUIRING_ACTION.has(n.type);
