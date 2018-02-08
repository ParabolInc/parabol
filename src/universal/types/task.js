// @flow

/**
 * Defines the js-land type of a Task, and functions to operate on them.
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
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

export type TaskID = string;

type Tag = 'archived' | 'private';

export type Status = ACTIVE | DONE | FUTURE | STUCK;

export type Task = {
  content: EntityMap,
  createdAt: Date,
  createdBy: UserID,
  id: TaskID,
  sortOrder: number,
  status: Status,
  tags: Tag[],
  teamId: TeamID,
  teamMemberId: TeamMemberID,
  updatedAt: Date,
  userId: UserID
};

export const getMentions = (p: Task): UserID[] =>
  getTypeFromEntityMap('MENTION', p.content);

export const getAssignee = (p: Task): UserID => {
  return fromTeamMemberId(p.teamMemberId).userId;
};
