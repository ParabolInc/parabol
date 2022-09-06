import React from 'react'
import {MeetingTypeEnum} from '~/../server/postgres/types/Meeting'
import {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeetingSidebar_meeting.graphql'
import CardsSVG from '../../components/CardsSVG'
import {ACTION, POKER, RETROSPECTIVE, TEAM_PROMPT} from '../constants'

/* Used by the server! cannot convert to enums yet */

/* These are the labels show to the viewer */
export const phaseLabelLookup = {
  checkin: 'Icebreaker',
  reflect: 'Reflect',
  group: 'Group',
  vote: 'Vote',
  discuss: 'Discuss',
  updates: 'Solo Updates',
  firstcall: 'First Call',
  agendaitems: 'Team Agenda',
  lastcall: 'Last Call',
  additems: 'Add Agenda Items',
  SUMMARY: 'Summary',
  SCOPE: 'Scope',
  ESTIMATE: 'Estimate',
  RESPONSES: 'Active'
} as Record<NewMeetingPhaseTypeEnum, string>

export const phaseIconLookup = {
  checkin: 'group',
  reflect: 'edit',
  group: 'group_work',
  vote: 'thumbs_up_down',
  discuss: 'comment',
  updates: 'update',
  firstcall: 'comment',
  agendaitems: 'comment',
  lastcall: 'comment',
  additems: 'update',
  SUMMARY: 'receipt',
  SCOPE: 'playlist_add'
} as Record<NewMeetingPhaseTypeEnum, string>

export const phaseImageLookup = {
  ESTIMATE: CardsSVG
}
export const meetingTypeToIcon = {
  [RETROSPECTIVE]: 'history',
  [ACTION]: 'change_history',
  [POKER]: CardsSVG,
  [TEAM_PROMPT]: 'group_work'
} as Record<MeetingTypeEnum, string | React.ComponentType>

export const phaseTypeToSlug = {
  checkin: 'checkin',
  reflect: 'reflect',
  group: 'group',
  vote: 'vote',
  discuss: 'discuss',
  updates: 'updates',
  firstcall: 'firstcall',
  agendaitems: 'agendaitems',
  lastcall: 'lastcall',
  additems: 'additems',
  SUMMARY: 'summary',
  SCOPE: 'scope',
  ESTIMATE: 'estimate',
  RESPONSES: 'responses'
} as Record<NewMeetingPhaseTypeEnum, string>
