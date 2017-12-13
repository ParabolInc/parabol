// @flow

/**
 * Defines the js-land type of a Team, and functions to operate on them.
 */

import type {EntityMap} from './entityMap';
import type {OrgID} from './organization';
import type {UserID} from './user';

import {
  LOBBY,
  CHECKIN,
  ENTERPRISE,
  UPDATES,
  FIRST_CALL,
  AGENDA_ITEMS,
  LAST_CALL,
  PERSONAL,
  PRO,
  SUMMARY
} from '../utils/constants';

export type TeamID = string;

type MeetingID = string;

type MeetingPhase =
  | LOBBY
  | CHECKIN
  | UPDATES
  | FIRST_CALL
  | AGENDA_ITEMS
  | LAST_CALL
  | SUMMARY;

export type Team = {
  activeFacilitator: ?UserID,
  checkInGreeting?: {
    content: string,
    language: string
  },
  checkInQuestion?: EntityMap,
  facilitatorPhase: MeetingPhase,
  facilitatorPhaseItem: ?number,
  id: TeamID,
  isArchived: boolean,
  isPaid: boolean,
  meetingID: ?MeetingID,
  meetingPhase: MeetingPhase,
  meetingPhaseItem: ?number,
  name: string,
  orgId: OrgID,
  tier:
    | PERSONAL
    | PRO
    | ENTERPRISE,
  updatedAt?: Date
};
