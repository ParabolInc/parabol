import {MeetingTypeEnum} from '../../__generated__/NewMeetingQuery.graphql'
import {CardTheme} from './ActivityCard'

export const MAIN_CATEGORIES = [
  'retrospective',
  'estimation',
  'standup',
  'feedback',
  'strategy',
  'premortem',
  'postmortem'
] as const
export type CategoryID = typeof MAIN_CATEGORIES[number]

export const DEFAULT_CARD_THEME: CardTheme = {primary: 'bg-slate-500', secondary: 'bg-slate-200'}

export const CATEGORY_THEMES: Record<CategoryID, CardTheme> = {
  standup: {primary: 'bg-aqua-400', secondary: 'bg-aqua-100'},
  estimation: {primary: 'bg-tomato-500', secondary: 'bg-tomato-100'},
  retrospective: {primary: 'bg-grape-500', secondary: 'bg-grape-100'},
  feedback: {primary: 'bg-jade-400', secondary: 'bg-jade-100'},
  strategy: {primary: 'bg-rose-500', secondary: 'bg-rose-100'},
  premortem: {primary: 'bg-gold-500', secondary: 'bg-gold-100'},
  postmortem: {primary: 'bg-grass-500', secondary: 'bg-grass-100'}
}

export const QUICK_START_CATEGORY_ID = 'recommended'

export const CATEGORY_ID_TO_NAME: Record<CategoryID | typeof QUICK_START_CATEGORY_ID, string> = {
  [QUICK_START_CATEGORY_ID]: 'Quick Start',
  retrospective: 'Retrospective',
  estimation: 'Estimation',
  standup: 'Standup',
  feedback: 'Feedback',
  strategy: 'Strategy',
  premortem: 'Pre-Mortem',
  postmortem: 'Post-Mortem'
}

export const MEETING_TYPE_TO_CATEGORY: Record<MeetingTypeEnum, CategoryID> = {
  retrospective: 'retrospective',
  action: 'feedback',
  poker: 'estimation',
  teamPrompt: 'standup'
}

export const CATEGORY_TEXT_COLORS: Record<CategoryID, CardTheme> = {
  standup: {primary: 'text-aqua-400', secondary: 'text-aqua-100'},
  estimation: {primary: 'text-tomato-500', secondary: 'text-tomato-100'},
  retrospective: {primary: 'text-grape-500', secondary: 'text-[#F2E1F7]'},
  feedback: {primary: 'text-jade-400', secondary: 'text-jade-100'},
  strategy: {primary: 'text-rose-500', secondary: 'text-rose-100'},
  premortem: {primary: 'text-gold-500', secondary: 'text-gold-100'},
  postmortem: {primary: 'text-grass-500', secondary: 'text-grass-100'}
}
