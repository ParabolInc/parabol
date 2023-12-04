import {MeetingTypeEnum} from '../../__generated__/NewMeetingQuery.graphql'
import retroBackgroundSrc from '../../../../static/images/illustrations/retro-background.png'
import standupBackgroundSrc from '../../../../static/images/illustrations/standup-background.png'
import feedbackBackgroundSrc from '../../../../static/images/illustrations/feedback-background.png'
import estimationBackgroundSrc from '../../../../static/images/illustrations/estimation-background.png'
import strategyBackgroundSrc from '../../../../static/images/illustrations/strategy-background.png'
import premortemBackgroundSrc from '../../../../static/images/illustrations/premortem-background.png'
import postmortemBackgroundSrc from '../../../../static/images/illustrations/postmortem-background.png'
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
  standup: {primary: 'aqua-400', secondary: 'aqua-100'},
  estimation: {primary: 'tomato-500', secondary: 'tomato-100'},
  retrospective: {primary: 'grape-500', secondary: '[#F2E1F7]'},
  feedback: {primary: 'jade-400', secondary: 'jade-100'},
  strategy: {primary: 'rose-500', secondary: 'rose-100'},
  premortem: {primary: 'gold-500', secondary: 'gold-100'},
  postmortem: {primary: 'grass-500', secondary: 'grass-100'}
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

export const backgroundImgMap = {
  retrospective: retroBackgroundSrc,
  standup: standupBackgroundSrc,
  feedback: feedbackBackgroundSrc,
  estimation: estimationBackgroundSrc,
  strategy: strategyBackgroundSrc,
  premortem: premortemBackgroundSrc,
  postmortem: postmortemBackgroundSrc
} as const
