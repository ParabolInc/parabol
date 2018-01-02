// @flow

/**
 * Defines the js-land type of a Project, and functions to operate on them.
 */

import type {EntityMap} from './entityMap';
import type {TeamID} from './team';
import type {TeamMemberID} from './teamMember';
import type {UserID} from './user';

import {
  ACTIVE,
  DONE,
  FUTURE,
  STUCK
} from '../utils/constants';
import getTypeFromEntityMap from '../utils/draftjs/getTypeFromEntityMap';
import {getUserId} from './teamMember';

export type ProjectID = string;

type Tag = 'archived' | 'private';

export type Status = ACTIVE | DONE | FUTURE | STUCK;

export type Project = {
  content: EntityMap,
  createdAt: Date,
  createdBy: UserID,
  id: ProjectID,
  sortOrder: number,
  status: Status,
  tags: Tag[],
  teamId: TeamID,
  teamMemberId: TeamMemberID,
  updatedAt: Date,
  userId: UserID
};

export const getMentions = (p: Project): UserID[] =>
  getTypeFromEntityMap('MENTION', p.content);

export const getAssignee = (p: Project): UserID =>
  getUserId(p.teamMemberId);
