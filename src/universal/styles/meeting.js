import appTheme from 'universal/styles/theme/appTheme'
import {makeShadowColor} from './ui'

// shared style constants for components in the meeting context

export const meetingChromeBoxShadow = [
  `.0625rem 0 .25rem ${makeShadowColor('.1')}`,
  `.125rem 0 .5rem ${makeShadowColor('.1')}`,
  `.25rem 0 1rem ${makeShadowColor('.1')}`
]
export const meetingChromeBoxShadowInset = `inset .0625rem 0 .0625rem ${makeShadowColor('.1')}`
export const meetingBorderColor = appTheme.palette.mid10a
export const meetingSidebarBreakpoint = 801
export const meetingSidebarGutter = '.5rem'
export const meetingSidebarGutterInner = '3.75rem'
export const meetingSidebarWidth = '15rem'
export const meetingSplashGutter = '4.5rem'
export const meetingBottomBarHeight = '4rem'
export const meetingTopicPhaseMaxWidth = '80rem'
