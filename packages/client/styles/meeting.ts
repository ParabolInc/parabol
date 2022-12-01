import {minWidthMediaQueries} from './breakpoints'

// DEPRECATED, refactor and use constEnums moving forward

export const meetingGridMinWidth = 256
export const meetingTopBarMediaQuery = minWidthMediaQueries[2]
export const meetingAvatarMediaQueries = [minWidthMediaQueries[2], minWidthMediaQueries[4]] as [
  string,
  string
]
