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
  retrospective: {primary: 'bg-grape-500', secondary: 'bg-[#F2E1F7]'},
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
