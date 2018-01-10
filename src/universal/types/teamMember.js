// @flow

/**
 * Defines the js-land type of a TeamMember (a join between Team and User), and
 * functions to operate on them.
 */

import type {TeamID} from './team';
import type {UserID} from './user';

export type TeamMemberID = string;

// export const getUserId = (tmId: TeamMemberID): UserID =>
//  tmId.split('::')[0];

export const getTeamId = (tmId: TeamMemberID): TeamID =>
  tmId.split('::')[1];

export const getIds = (tmId: TeamMemberID): [UserID, TeamID] => {
  const [userId, teamId] = tmId.split('::');
  return [userId, teamId];
};
