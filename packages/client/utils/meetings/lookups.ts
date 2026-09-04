import type * as React from 'react'
import type {NewMeetingPhaseTypeEnum} from '~/__generated__/ActionMeetingSidebar_meeting.graphql'
import action from '../../../../static/images/illustrations/action.png'
import retrospective from '../../../../static/images/illustrations/retrospective.png'
import poker from '../../../../static/images/illustrations/sprintPoker.png'
import teamHealth from '../../../../static/images/illustrations/teamHealth.png'
import teamPrompt from '../../../../static/images/illustrations/teamPrompt.png'
import type {MeetingTypeEnum} from '../../__generated__/SummarySheet_meeting.graphql'
import CardsSVG from '../../components/CardsSVG'
import {ACTION, POKER, RETROSPECTIVE, TEAM_PROMPT} from '../constants'

/* Used by the server! cannot convert to enums yet */

/* These are the labels show to the viewer */
export const phaseLabelLookup = {
  checkin: 'Icebreaker',
  TEAM_HEALTH: 'Team Health',
  reflect: 'Reflect',
  group: 'Group',
  vote: 'Vote',
  discuss: 'Discuss',
  updates: 'Solo Updates',
  firstcall: 'First Call',
  agendaitems: 'Team Agenda',
  lastcall: 'Last Call',
  SUMMARY: 'Summary',
  SCOPE: 'Scope',
  ESTIMATE: 'Estimate',
  RESPONSES: 'Active',
  TEAM_HEALTH_INTRO: 'Welcome',
  TEAM_HEALTH_RESPONSE: 'Respond',
  TEAM_HEALTH_SUBMITTED: 'All Set',
  TEAM_HEALTH_RESULT: 'Results'
} as Record<NewMeetingPhaseTypeEnum, string>

export const phaseIconLookup = {
  checkin: 'group',
  TEAM_HEALTH: 'monitor_heart',
  reflect: 'edit',
  group: 'group_work',
  vote: 'thumbs_up_down',
  discuss: 'comment',
  updates: 'update',
  firstcall: 'comment',
  agendaitems: 'comment',
  lastcall: 'comment',
  SUMMARY: 'receipt',
  SCOPE: 'playlist_add',
  TEAM_HEALTH_RESPONSE: 'poll',
  TEAM_HEALTH_RESULT: 'insights'
} as Record<NewMeetingPhaseTypeEnum, string>

export const phaseImageLookup = {
  ESTIMATE: CardsSVG
}
export const MeetingTypeToReadable = {
  action: 'Team Check-in',
  poker: 'Sprint Poker',
  retrospective: 'Retrospective',
  teamPrompt: 'Standup',
  teamHealth: 'Team Health'
} satisfies Record<MeetingTypeEnum, string>

export const meetingTypeToBgClass = {
  retrospective: 'bg-grape-500',
  action: 'bg-aqua-400',
  poker: 'bg-tomato-400',
  teamPrompt: 'bg-jade-400',
  teamHealth: 'bg-rose-500'
} satisfies Record<MeetingTypeEnum, string>

export const meetingTypeToLabelClass = {
  retrospective: 'text-grape-600',
  action: 'text-aqua-600',
  poker: 'text-tomato-600',
  teamPrompt: 'text-jade-600',
  teamHealth: 'text-rose-600'
} satisfies Record<MeetingTypeEnum, string>

export const meetingTypeToIllustration = {
  retrospective,
  action,
  poker,
  teamPrompt,
  teamHealth
} satisfies Record<MeetingTypeEnum, string>

export const meetingTypeToIcon = {
  [RETROSPECTIVE]: 'history',
  [ACTION]: 'change_history',
  [POKER]: CardsSVG,
  [TEAM_PROMPT]: 'group_work',
  teamHealth: 'monitor_heart'
} as Record<MeetingTypeEnum, string | React.ComponentType>

export const phaseTypeToSlug = {
  checkin: 'checkin',
  TEAM_HEALTH: 'teamhealth',
  reflect: 'reflect',
  group: 'group',
  vote: 'vote',
  discuss: 'discuss',
  updates: 'updates',
  firstcall: 'firstcall',
  agendaitems: 'agendaitems',
  lastcall: 'lastcall',
  SUMMARY: 'summary',
  SCOPE: 'scope',
  ESTIMATE: 'estimate',
  RESPONSES: 'responses',
  TEAM_HEALTH_INTRO: 'intro',
  TEAM_HEALTH_RESPONSE: 'respond',
  TEAM_HEALTH_SUBMITTED: 'submitted',
  TEAM_HEALTH_RESULT: 'result'
} as Record<NewMeetingPhaseTypeEnum, string>
