import appTheme from 'universal/styles/theme/appTheme'
import makeShadowColor from 'universal/styles/helpers/makeShadowColor'
import {breakpoints, minWidthMediaQueries} from './breakpoints'

// shared style constants for components in the meeting context

export const meetingChromeBoxShadow = [
  `.0625rem 0 .25rem ${makeShadowColor('.1')}`,
  `.125rem 0 .5rem ${makeShadowColor('.1')}`,
  `.25rem 0 1rem ${makeShadowColor('.1')}`
]
export const meetingChromeBoxShadowInset = `inset .0625rem 0 .0625rem ${makeShadowColor('.1')}`
export const meetingBorderColor = appTheme.palette.mid10a
export const meetingGridGap = '1.25rem'
export const meetingGridMaxWidth = '20rem'
export const meetingGridMinWidth = '13.75rem'
export const meetingHelpWithBottomBar = '4.75rem'
export const meetingSidebarBreakpoint = breakpoints[1]
export const meetingSidebarMediaQuery = minWidthMediaQueries[1]
export const meetingSidebarGutter = '.5rem'
export const meetingSidebarGutterInner = '3.75rem'
export const meetingSidebarWidth = '15rem'
export const meetingSplashGutter = '4.5rem'
export const meetingBottomBarHeight = '3.5rem' // 56px MD bottom bar
export const meetingVoteIcon = 'thumb_up'
export const retroMeetingVotingWidth = 66
export const retroGroupTitleWidth = 196
