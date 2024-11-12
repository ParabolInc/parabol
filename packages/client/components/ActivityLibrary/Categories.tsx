import FavoriteIcon from '@mui/icons-material/Favorite'
import {MeetingTypeEnum} from '../../__generated__/MeetingSelectorQuery.graphql'
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

export const QUICK_START_CATEGORY_ID = 'recommended'
export const CUSTOM_CATEGORY_ID = 'custom'
export const FAVORITE_CATEGORY_ID = 'favorite'

export const ALL_CATEGORIES = [
  QUICK_START_CATEGORY_ID,
  ...MAIN_CATEGORIES,
  FAVORITE_CATEGORY_ID,
  CUSTOM_CATEGORY_ID
] as const

export type CategoryID = (typeof MAIN_CATEGORIES)[number]
export type AllCategoryID = (typeof ALL_CATEGORIES)[number]

export const DEFAULT_CARD_THEME: CardTheme = {
  primary: 'bg-slate-500',
  secondary: 'bg-slate-200',
  text: 'text-slate-500'
}

export const CATEGORY_THEMES: Record<AllCategoryID, CardTheme> = {
  [QUICK_START_CATEGORY_ID]: {
    primary: 'bg-grape-700',
    secondary: 'bg-slate-200',
    text: 'text-slate-500'
  },
  standup: {primary: 'bg-aqua-400', secondary: 'bg-aqua-100', text: 'text-aqua-400'},
  estimation: {primary: 'bg-tomato-500', secondary: 'bg-tomato-100', text: 'text-tomato-500'},
  retrospective: {primary: 'bg-grape-500', secondary: 'bg-[#F2E1F7]', text: 'text-grape-500'},
  feedback: {primary: 'bg-jade-400', secondary: 'bg-jade-100', text: 'text-jade-400'},
  strategy: {primary: 'bg-rose-500', secondary: 'bg-rose-100', text: 'text-rose-500'},
  premortem: {primary: 'bg-gold-500', secondary: 'bg-gold-100', text: 'text-gold-500'},
  postmortem: {primary: 'bg-grass-500', secondary: 'bg-grass-100', text: 'text-grass-500'},
  [CUSTOM_CATEGORY_ID]: {
    primary: 'bg-fuscia-400',
    secondary: 'bg-slate-200',
    text: 'text-slate-500'
  },
  [FAVORITE_CATEGORY_ID]: {
    primary: 'bg-grape-700',
    secondary: 'bg-slate-200',
    text: 'text-slate-500'
  }
}

export const CATEGORY_ID_TO_NAME: Record<AllCategoryID, string | JSX.Element> = {
  [QUICK_START_CATEGORY_ID]: 'Quick Start',
  [FAVORITE_CATEGORY_ID]: (
    <FavoriteIcon
      style={{
        color: 'inherit',
        display: 'flex',
        fontSize: '22px'
      }}
    />
  ),
  [CUSTOM_CATEGORY_ID]: 'Custom',
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
