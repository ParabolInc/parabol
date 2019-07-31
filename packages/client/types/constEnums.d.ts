export const enum Times {
  HUMAN_ADDICTION_THRESH = 300,
  MAX_WAIT_TIME = 5000
}

export const enum Breakpoint {
  SIDEBAR_LEFT = 800,
  MEETING_FACILITATOR_BAR = 480
}

export const enum LoaderSize {
  MAIN = 40,
  WHOLE_PAGE = 400,
  PANEL = 200
}

export const enum ZIndex {
  MODAL = 400 /*should be 24, https://github.com/ParabolInc/action/issues/2772 */,
  SIDEBAR = 200,
  SNACKBAR = 200
}
// equal to utils/constants
export const enum MeetingTypes {
  ACTION = 'action',
  RETROSPECTIVE = 'retrospective'
}

export const enum Duration {
  MENU_OPEN = 150,
  MENU_OPEN_MAX = 188,
  MODAL_OPEN = 200,
  PORTAL_CLOSE = 120,
  SELECTION_CONTROL = 100,
  TOOLTIP_DELAY = 400,
  TOOLTIP_OPEN = 150,
  TOOLTIP_CLOSE = 75
}

export const enum Providers {
  ATLASSIAN_NAME = 'Atlassian',
  ATLASSIAN_DESC = 'Create Jira issues from Parabol',
  GITHUB_NAME = 'GitHub',
  GITHUB_DESC = 'Create issues from Parabol',
  SLACK_NAME = 'Slack',
  SLACK_DESC = 'Push notifications to Slack'
}

// https://material.io/design/layout/spacing-methods.html
// NOTE: iterate on this pattern as we go (TA)
export const enum Layout {
  TYPE_GRID = 4, // .5x
  LAYOUT_GRID = 8, // 1x
  ROW_GUTTER = 16 // 2x
}

// Use power of 2 for cheap sense of scale (e.g. 2, 4, 8)
export const enum Radius {
  FIELD = 2,
  DIALOG = 8,
  MENU = 4,
  SNACKBAR = 4,
  TOOLTIP = 2
}

export const enum DASH_TIMELINE {
  FEED_MAX_WIDTH = 600,
  FEED_MIN_WIDTH = 288,
  MIN_PADDING = 16,
  TIMELINE_DRAWER_WIDTH = 336
}
