// https://github.com/material-components/material-components-web/blob/4844330e7836d9dc97798b47594ff0dbaac51227/packages/mdc-animation/_variables.scss
export const enum BezierCurve {
  DECELERATE = 'cubic-bezier(0, 0, .2, 1)',

// Timing function to quickly accelerate and slowly decelerate
  STANDARD_CURVE = 'cubic-bezier(.4, 0, .2, 1)',

// Timing function to accelerate
  ACCELERATE = 'cubic-bezier(.4, 0, 1, 1)',

// Timing function to quickly accelerate and decelerate
  SHARP_CURVE = 'cubic-bezier(.4, 0, .6, 1)',
}

export const enum Breakpoint {
  SIDEBAR_LEFT = 800,
  MEETING_FACILITATOR_BAR = 480,
  SINGLE_REFLECTION_COLUMN = 704, // (ReflectionWith + 16) * 2
}

// TODO refactor into ElementWidth
export const enum DashTimeline {
  FEED_MAX_WIDTH = 600,
  FEED_MIN_WIDTH = 288,
  MIN_PADDING = 16,
  TIMELINE_DRAWER_WIDTH = 336
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

export const enum ElementWidth {
  END_MEETING_BUTTON = 90,
  REFLECTION_CARD = 296,
  REFLECTION_CARD_PADDED = 312,
  REFLECTION_CARD_PADDING = 8
}

export const enum ElementHeight {
  REFLECTION_CARD_MAX = 104  // 4 lines (20px each) + (2 * 12px) vertical gutter
}

// https://material.io/design/layout/spacing-methods.html
// NOTE: iterate on this pattern as we go (TA)
export const enum Layout {
  TYPE_GRID = 4, // .5x
  LAYOUT_GRID = 8, // 1x
  ROW_GUTTER = 16 // 2x
}

export const enum LoaderSize {
  MAIN = 40,
  WHOLE_PAGE = 400,
  PANEL = 200
}

// equal to utils/constants
export const enum MeetingTypes {
  ACTION = 'action',
  RETROSPECTIVE = 'retrospective'
}

export const enum Providers {
  ATLASSIAN_NAME = 'Atlassian',
  ATLASSIAN_DESC = 'Create Jira issues from Parabol',
  GITHUB_NAME = 'GitHub',
  GITHUB_DESC = 'Create issues from Parabol',
  SLACK_NAME = 'Slack',
  SLACK_DESC = 'Push notifications to Slack'
}

// Use power of 2 for cheap sense of scale (e.g. 2, 4, 8)
export const enum Radius {
  FIELD = 2,
  DIALOG = 8,
  MENU = 4,
  SNACKBAR = 4,
  TOOLTIP = 2
}

export const enum ReflectionStackPerspective {
  X = 8,
  Y = 6
}
export const enum SubscriptionChannel {
  TEAM = 'team',
  NEW_AUTH_TOKEN = 'newAuthToken',
  NOTIFICATION = 'notification',
  ORGANIZATION = 'organization',
}

export const enum Times {
  HUMAN_ADDICTION_THRESH = 300,
  MAX_WAIT_TIME = 5000,
  REFLECTION_DEAL_CARD_INIT_DELAY= 100,
  REFLECTION_DEAL_CARD_MIN_DELAY = 30,
  REFLECTION_DEAL_CARD_DURATION = 300,
  REFLECTION_DEAL_TOTAL_DURATION = 500,
}

export const enum ZIndex {
  MODAL = 400 /*should be 24, https://github.com/ParabolInc/action/issues/2772 */,
  SIDEBAR = 200,
  SNACKBAR = 200
}
