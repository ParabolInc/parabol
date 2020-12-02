import CardsSVG from '../../components/CardsSVG'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import {ACTION, RETROSPECTIVE} from '../constants'

/* Used by the server! cannot convert to enums yet */

/* These are the labels show to the viewer */
export const phaseLabelLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: 'Icebreaker',
  [NewMeetingPhaseTypeEnum.reflect]: 'Reflect',
  [NewMeetingPhaseTypeEnum.group]: 'Group',
  [NewMeetingPhaseTypeEnum.vote]: 'Vote',
  [NewMeetingPhaseTypeEnum.discuss]: 'Discuss',
  [NewMeetingPhaseTypeEnum.updates]: 'Solo Updates',
  [NewMeetingPhaseTypeEnum.firstcall]: 'First Call',
  [NewMeetingPhaseTypeEnum.agendaitems]: 'Team Agenda',
  [NewMeetingPhaseTypeEnum.lastcall]: 'Last Call',
  [NewMeetingPhaseTypeEnum.SUMMARY]: 'Summary',
  SCOPE: 'Scope',
  ESTIMATE: 'Estimate'
}

export const phaseIconLookup = {
  [NewMeetingPhaseTypeEnum.checkin]: 'group',
  [NewMeetingPhaseTypeEnum.reflect]: 'edit',
  [NewMeetingPhaseTypeEnum.group]: 'group_work',
  [NewMeetingPhaseTypeEnum.vote]: 'thumbs_up_down',
  [NewMeetingPhaseTypeEnum.discuss]: 'comment',
  [NewMeetingPhaseTypeEnum.updates]: 'update',
  [NewMeetingPhaseTypeEnum.firstcall]: 'comment',
  [NewMeetingPhaseTypeEnum.agendaitems]: 'comment',
  [NewMeetingPhaseTypeEnum.lastcall]: 'comment',
  [NewMeetingPhaseTypeEnum.SUMMARY]: 'receipt',
  SCOPE: 'playlist_add'
}

export const phaseImageLookup = {
  ESTIMATE: CardsSVG
}
export const meetingTypeToIcon = {
  [RETROSPECTIVE]: 'history',
  [ACTION]: 'change_history',
  poker: CardsSVG

} as const

export const phaseTypeToSlug = {
  [NewMeetingPhaseTypeEnum.checkin]: 'checkin',
  [NewMeetingPhaseTypeEnum.reflect]: 'reflect',
  [NewMeetingPhaseTypeEnum.group]: 'group',
  [NewMeetingPhaseTypeEnum.vote]: 'vote',
  [NewMeetingPhaseTypeEnum.discuss]: 'discuss',
  [NewMeetingPhaseTypeEnum.updates]: 'updates',
  [NewMeetingPhaseTypeEnum.firstcall]: 'firstcall',
  [NewMeetingPhaseTypeEnum.agendaitems]: 'agendaitems',
  [NewMeetingPhaseTypeEnum.lastcall]: 'lastcall',
  [NewMeetingPhaseTypeEnum.SUMMARY]: 'summary',
  SCOPE: 'scope',
  ESTIMATE: 'estimate'
}
