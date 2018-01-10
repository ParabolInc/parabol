// @flow

/**
 * Defines the js-land type of a User, and functions to operate on them.
 */

import type {OrgID, Role} from './organization';
import type {TeamID} from './team';

export type UserID = string;

export type UserOrg = {
  id: OrgID,
  role: ?Role
};

export type Identity = {
  connection:
    | 'Username-Password-Authentication',
  isSocial: boolean,
  provider:
    | 'auth0',
  user_id: string
};

export type User = {
  cachedAt?: Date,
  createdAt?: Date,
  email: string,
  emailVerified?: boolean,
  id: UserID,
  identities?: Identity[],
  inactive: boolean,
  lastLogin?: Date,
  lastSeenAt?: Date,
  name?: string,
  picture: string,
  preferredName: string,
  tms: TeamID[],
  updatedAt?: Date,
  userOrgs: UserOrg[],
  welcomeSentAt?: Date
};
