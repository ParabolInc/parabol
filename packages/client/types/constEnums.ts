export const enum AppBar {
  HEIGHT = 56
}

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
  DASHBOARD_WIDE = 1600,
  INVOICE = 512,
  INVOICE_LABEL = 384,
  SIDEBAR_LEFT = 800,
  MEETING_FACILITATOR_BAR = 480,
  SINGLE_REFLECTION_COLUMN = 704, // (ReflectionWith + 16) * 2
}

export const enum Card {
  BACKGROUND_COLOR = '#FFFFFF',
  BORDER_RADIUS = 4,
  BUTTON_HEIGHT = 24,
  FONT_SIZE = 14,
  LINE_HEIGHT = '20px',
  PADDING = '16px'
}

export const enum ContactInfo {
  TELEPHONE = '612-227-5673',
  EMAIL_BILLING = 'billing@parabol.co',
  EMAIL_LOVE = 'love@parabol.co'
}

// TODO refactor into ElementWidth
export const enum DashTimeline {
  FEED_MAX_WIDTH = 600,
  FEED_MIN_WIDTH = 288,
  MIN_PADDING = 16,
  TIMELINE_DRAWER_WIDTH = 336
}

export const enum DragAttribute {
  DROPPABLE = 'data-droppable',
  DROPZONE = 'data-dropzone'
}

export const enum DroppableType {
  TASK = 'task',
  REFLECTION = 'reflection',
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
  REFLECTION_CARD_PADDED = 296,
  REFLECTION_CARD_PADDING = 6
}

export const enum ElementHeight {
  REFLECTION_CARD_MAX = 104  // 4 lines (20px each) + (2 * 12px) vertical gutter
}

export const enum ExternalLinks {
  PRICING_LINK = 'https://www.parabol.co/pricing/'
}

export const enum Filter {
  BENEATH_DIALOG = 'blur(1.5px)'
}

export const enum Gutters {
  DASH_GUTTER_SMALL = '20px',
  DASH_GUTTER_LARGE = '32px',
  REFLECTION_INNER_GUTTER_HORIZONTAL = '16px',
  REFLECTION_INNER_GUTTER_VERTICAL = '12px',
  COLUMN_GUTTER = '12px'
}

export const enum InvoiceItemType {
  ADD_USER = 'addUser',
  PAUSE_USER = 'pauseUser',
  AUTO_PAUSE_USER = 'autoPauseUser',
  REMOVE_USER = 'removeUser',
  UNPAUSE_USER = 'unpauseUser',
}

// https://material.io/design/layout/spacing-methods.html
// NOTE: iterate on this pattern as we go (TA)
export const enum Layout {
  TYPE_GRID = 4, // .5x
  LAYOUT_GRID = 8, // 1x
  ROW_GUTTER = 16, // 2x
  TASK_COLUMNS_MAX_WIDTH = '1334px', // (4 x 296 card max-width) + (5 x 30 - gutters around cols)
}

export const enum LoaderSize {
  MAIN = 40,
  WHOLE_PAGE = 400,
  PANEL = 200
}

export const enum LocalStorageKey {
  INVITATION_TOKEN = 'invitationToken'
}

export const enum MathEnum {
  MAX_INT = 2147483647
}
// equal to utils/constants
export const enum MeetingTypes {
  ACTION = 'action',
  RETROSPECTIVE = 'retrospective'
}

export const enum NavSidebar {
  FONT_SIZE = 15,
  LEFT_BORDER_WIDTH = '3px',
  LINE_HEIGHT = '20px',
  SUB_FONT_SIZE = 14,
  SUB_LINE_HEIGHT = '24px',
  WIDTH = 240
}

export const enum Pricing {
  PRO_SEAT_COST = 600
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
  BUTTON_PILL = '10em',
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

export const enum RightSidebar {
  WIDTH = 240
}

export const enum SubscriptionChannel {
  TASK = 'task',
  TEAM = 'team',
  NOTIFICATION = 'notification',
  ORGANIZATION = 'organization',
}

export const enum TaskStatus {
  DONE = 'done',
  ACTIVE = 'active',
  STUCK = 'stuck',
  FUTURE = 'future',
  ARCHIVED = 'archived',
  PRIVATE = 'private'
}

export const enum TaskStatusLabel {
  DONE = 'Done',
  ACTIVE = 'Active',
  STUCK = 'Stuck',
  FUTURE = 'Future',
  ARCHIVED = 'Archived',
  PRIVATE = 'Private'
}

export const enum TierLabel {
  PERSONAL = 'Personal',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise'
}

export const enum Threshold {
  AUTO_PAUSE = 2592000000, // 30 days
  JWT_LIFESPAN = 2592000000, // 30 days
  REFRESH_JWT_AFTER = 1296000000, // 15 days
  MAX_FREE_TEAMS = 10,
  MAX_MONTHLY_PAUSES = 4
}
export const enum Times {
  HUMAN_ADDICTION_THRESH = 300,
  MAX_WAIT_TIME = 5000,
  REFLECTION_DEAL_CARD_INIT_DELAY = 100,
  REFLECTION_DEAL_CARD_MIN_DELAY = 30,
  REFLECTION_DEAL_CARD_DURATION = 300,
  REFLECTION_DEAL_TOTAL_DURATION = 500,
  REFLECTION_COLLAPSE_DURATION = 300,
  REFLECTION_DROP_DURATION = 1000,
  REFLECTION_REMOTE_DROP_DURATION = 2000,
  REFLECTION_STALE_LIMIT = 5000,
  REFLECTION_COLUMN_SWIPE_THRESH = 600
}

export const enum ZIndex {
  MODAL = 400 /*should be 24, https://github.com/ParabolInc/action/issues/2772 */,
  SIDEBAR = 200,
  SNACKBAR = 200,
  REFLECTION_IN_FLIGHT = 500
}

export const enum AuthTokenRole {
  SUPER_USER = 'su'
}
