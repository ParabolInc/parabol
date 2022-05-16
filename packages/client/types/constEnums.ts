/*
  This file was created years ago.
  Since then, const enums have largely been considered a mistake by Typescript because
  they don't bundle well & changes to const enums require re-transpiling every single file.
  Today, we get around this by compiling const enums to enums, which doesn't save as much space
  But makes life easier in development.

  Before adding a new enum, please consider the following:
  - Are the values easy to read? If so, a string union might be a better choice
  - Does the value live on the server? Then get it there (usually via a generated GraphQL type) instead of creating a second source of truth
*/
export const enum AppBar {
  HEIGHT = 56
}

export const enum AuthIdentityTypeEnum {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE'
}

// https://github.com/material-components/material-components-web/blob/4844330e7836d9dc97798b47594ff0dbaac51227/packages/mdc-animation/_variables.scss
export const enum BezierCurve {
  DECELERATE = 'cubic-bezier(0, 0, .2, 1)',

  // Timing function to quickly accelerate and slowly decelerate
  STANDARD_CURVE = 'cubic-bezier(.4, 0, .2, 1)',

  // Timing function to accelerate
  ACCELERATE = 'cubic-bezier(.4, 0, 1, 1)',

  // Timing function to quickly accelerate and decelerate
  SHARP_CURVE = 'cubic-bezier(.4, 0, .6, 1)'
}

export const enum Breakpoint {
  INVOICE = 512,
  SIDEBAR_LEFT = 1024,
  NEW_MEETING_GRID = 1112,
  NEW_MEETING_SELECTOR = 500,
  SINGLE_REFLECTION_COLUMN = 704, // (ReflectionWith + 16) * 2,
  DASH_BREAKPOINT_WIDEST = 1816, // (4*296) + (5*24) + (256*2) = 4 card cols, 4 col gutters, 2 sidebars
  VOTE_PHASE = 800,
  FUZZY_TABLET = 700,
  BIG_DISPLAY = 1900
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
  FEED_MIN_WIDTH = 296,
  MIN_PADDING = 16,
  TIMELINE_DRAWER_WIDTH = 336
}

export const enum DiscussionThreadEnum {
  WIDTH = 360
}

export const enum DragAttribute {
  CONTROL_BAR_COVERABLE = 'data-control-bar-coverable',
  DROPPABLE = 'data-droppable',
  DROPZONE = 'data-dropzone'
}

export const enum DroppableType {
  TASK = 'task',
  REFLECTION = 'reflection'
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
  CONTROL_BAR_BUTTON = 90,
  CONTROL_BAR_PADDING = 8,
  DASHBOARD_AVATAR = 28,
  DASHBOARD_AVATAR_OVERLAPPED = 20,
  REFLECTION_CARD = 296,
  REFLECTION_CARD_PADDED = 296,
  REFLECTION_CARD_PADDING = 6,
  REFLECTION_COLUMN = 320,
  NEW_MEETING_FAB = 128,
  MEETING_CARD = 320,
  MEETING_CARD_MARGIN = 16,
  MEETING_CARD_LARGE_MARGIN = 40,
  MEETING_CARD_WITH_MARGIN = 336
}

export const enum ElementHeight {
  DASHBOARD_AVATAR = 28,
  MEETING_CARD_AVATARS = 32,
  REFLECTION_CARD = 44,
  REFLECTION_CARD_MAX = 104, // 4 lines (20px each) + (2 * 12px) vertical gutter
  MEETING_CARD_IMG = 180,
  MEETING_CARD_MARGIN = 16
}

export const enum ExternalLinks {
  EMAIL_CDN = 'https://action-files.parabol.co/static/email/',
  PRICING_LINK = 'https://www.parabol.co/pricing/',
  GETTING_STARTED_RETROS = 'https://www.parabol.co/resources/retrospective-meetings',
  GETTING_STARTED_CHECK_INS = 'https://www.parabol.co/resources/check-in-meetings',
  GETTING_STARTED_SPRINT_POKER = 'https://www.parabol.co/resources/sprint-poker-meetings',
  GETTING_STARTED_ASYNC_STANDUP = 'https://www.parabol.co/resources/async-standup-meetings',
  INTEGRATIONS_JIRA = 'https://www.parabol.co/integrations/jira',
  INTEGRATIONS_GITHUB = 'https://www.parabol.co/integrations/github',
  INTEGRATIONS_MATTERMOST = 'https://www.parabol.co/integrations/mattermost',
  INTEGRATIONS_GITLAB = 'https://www.parabol.co/integrations/gitlab',
  INTEGRATIONS_JIRASERVER = 'https://www.parabol.co/integrations/jiraserver',
  RESOURCES = 'https://www.parabol.co/resources',
  SUPPORT = 'https://www.parabol.co/support',
  TEAM = 'https://www.parabol.co/team/',
  LANDING_PAGE = 'https://www.parabol.co/'
}

export const enum Filter {
  BENEATH_DIALOG = 'blur(1.5px)'
}

export const enum Gutters {
  COLUMN_INNER_GUTTER = '12px',
  DASH_GUTTER = '20px',
  REFLECTION_INNER_GUTTER_HORIZONTAL = '16px',
  REFLECTION_INNER_GUTTER_VERTICAL = '12px',
  ROW_INNER_GUTTER = '12px'
}

export const enum InvitationTokenError {
  NOT_FOUND = 'notFound',
  EXPIRED = 'expired',
  ALREADY_ACCEPTED = 'accepted'
}
export const enum InvoiceItemType {
  ADD_USER = 'addUser',
  PAUSE_USER = 'pauseUser',
  AUTO_PAUSE_USER = 'autoPauseUser',
  REMOVE_USER = 'removeUser',
  UNPAUSE_USER = 'unpauseUser'
}

// https://material.io/design/layout/spacing-methods.html
// NOTE: iterate on this pattern as we go (TA)
export const enum Layout {
  TYPE_GRID = 4, // .5x
  LAYOUT_GRID = 8, // 1x
  ROW_GUTTER = 16, // 2x
  SETTINGS_MAX_WIDTH = 768,
  TASK_COLUMNS_MAX_WIDTH = 1360
}

export const enum LoaderSize {
  MENU = 24,
  MAIN = 40,
  WHOLE_PAGE = 400,
  PANEL = 200
}

export const enum LocalStorageKey {
  APP_TOKEN_KEY = 'Action:token',
  INVITATION_TOKEN = 'invitationToken',
  GRAPHIQL_SCHEMA = 'gqlSchema',
  EMAIL = 'email',
  ERROR_PRONE_AT = 'errorProneAt'
}

export const enum AuthenticationError {
  FAILED_TO_SEND = 'failedToSend',
  MISSING_HASH = 'missingHash',
  INVALID_PASSWORD = 'invalidPassword',
  IDENTITY_NOT_FOUND = 'identityNotFound',
  EXCEEDED_RESET_THRESHOLD = 'exceededResetThreshold',
  USER_NOT_FOUND = 'userNotFound',
  USER_EXISTS_GOOGLE = 'userExistsGoogle',
  USER_EXISTS_SAML = 'userExistsSaml'
}

export const enum MathEnum {
  MAX_INT = 2147483647
}

export const enum MeetingControlBarEnum {
  HEIGHT = 56
}

export const enum MeetingLabels {
  TIME_LIMIT = 'Time Limit',
  TIMER = 'Timer'
}

export const enum PokerCards {
  HEIGHT = 175,
  WIDTH = 125,
  OVERLAP = 96,
  MAX_VALUE = 2147483647,
  // the angle in degrees from the middle of the deck to a deck edge (0-90)
  TILT = 8,
  // number of pixels from the middle of the circle below the fold to the middle of the card (0-2x innerHeight)
  RADIUS = 1200,
  // the % of the first & last card that sits below the fold (0-1)
  MAX_HIDDEN = 0.35,
  PASS_CARD = 'Pass',
  QUESTION_CARD = '?',
  AVATAR_WIDTH = 46,
  AVATAR_BORDER = 3
}
export const enum UserTaskViewFilterLabels {
  ALL_TEAMS = 'All Teams',
  ALL_TEAM_MEMBERS = 'All Team Members'
}

export const enum MeetingSettingsThreshold {
  RETROSPECTIVE_TOTAL_VOTES_DEFAULT = 5,
  RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT = 3,
  RETROSPECTIVE_TOTAL_VOTES_MAX = 12
}

// equal to utils/constants
export const enum MeetingTypes {
  ACTION = 'action',
  RETROSPECTIVE = 'retrospective'
}

export const enum NavSidebar {
  FONT_SIZE = 14,
  LEFT_BORDER_WIDTH = '3px',
  LINE_HEIGHT = '24px',
  SUB_FONT_SIZE = 14,
  SUB_LINE_HEIGHT = '24px',
  WIDTH = 256
}

export const enum NewMeeting {
  ILLUSTRATION_WIDTH = 450,
  CONTROLS_WIDTH = 300
}
export const enum Pricing {
  PRO_SEAT_COST = 600
}

export const enum Providers {
  ATLASSIAN_NAME = 'Atlassian',
  ATLASSIAN_DESC = 'Use Jira Cloud Issues from within Parabol',
  JIRA_SERVER_NAME = 'Jira Server',
  JIRA_SERVER_DESC = 'Use Jira Server Issues from within Parabol',
  GITHUB_NAME = 'GitHub',
  GITHUB_DESC = 'Use GitHub Issues from within Parabol',
  GITHUB_SCOPE = 'admin:org_hook,read:org,repo,user,write:repo_hook',
  GITLAB_SCOPE = 'api',
  MATTERMOST_NAME = 'Mattermost',
  MATTERMOST_DESC = 'Push notifications to Mattermost',
  SLACK_NAME = 'Slack',
  SLACK_DESC = 'Push notifications to Slack',
  AZUREDEVOPS_NAME = 'Azure DevOps',
  AZUREDEVOPS_DESC = 'Use Azure DevOps Issues from within Parabol'
}

// Use power of 2 for cheap sense of scale (e.g. 2, 4, 8)
export const enum Radius {
  BUTTON_PILL = '10em',
  FIELD = 4,
  DIALOG = 8,
  MENU = 4,
  SNACKBAR = 4,
  TOOLTIP = 2
}

export const enum ReflectionStackPerspective {
  X = 8,
  Y = 6
}

export const enum RetroDemo {
  MEETING_ID = 'demoMeetingId',
  TEAM_ID = 'demoTeamId',
  REFLECT_STAGE_ID = 'reflectStage',
  GROUP_STAGE_ID = 'groupStage',
  VOTE_STAGE_ID = 'voteStage'
}

export const enum RightSidebar {
  WIDTH = 256
}

export const enum Security {
  SALT_ROUNDS = 12,
  MASS_INVITATION_TOKEN_LENGTH = 12
}

export const enum ServerChannel {
  GQL_EXECUTOR_STREAM = 'gqlStream',
  GQL_EXECUTOR_CONSUMER_GROUP = 'gqlConsumerGroup'
}

export const enum SubscriptionChannel {
  TASK = 'task',
  TEAM = 'team',
  MEETING = 'meeting',
  NOTIFICATION = 'notification',
  ORGANIZATION = 'organization'
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
  MAX_NUMBER_OF_TASKS_TO_LOAD = 1000,
  AUTO_PAUSE = 2592000000, // 30 days
  EMAIL_VERIFICATION_LIFESPAN = 86400000, // 1 day
  JWT_LIFESPAN = 2592000000, // 30 days
  MASS_INVITATION_TOKEN_LIFESPAN = 2592000000, // 30 days
  TEAM_INVITATION_LIFESPAN = 2592000000, // 30 days
  MAX_FREE_TEAMS = 10,
  MAX_MONTHLY_PAUSES = 4,
  MAX_ACCOUNT_PASSWORD_ATTEMPTS = 10,
  MAX_ACCOUNT_DAILY_PASSWORD_RESETS = 3,
  MAX_AVATAR_FILE_SIZE = 1024 * 1024,
  MAX_DAILY_PASSWORD_RESETS = 5,
  MAX_DAILY_PASSWORD_ATTEMPTS = 100,
  MAX_REFLECTION_PROMPTS = 12,
  MAX_POKER_TEMPLATE_DIMENSIONS = 12,
  MAX_POKER_TEMPLATE_SCALES = 12,
  MAX_POKER_SCALE_VALUES = 30,
  MAX_RETRO_TEAM_TEMPLATES = 20,
  MAX_POKER_TEAM_TEMPLATES = 20,
  MAX_POKER_DIMENSION_NAME = 50,
  MAX_REACTJIS = 12,
  MAX_POKER_STORIES = 50,
  MAX_INTEGRATION_FETCH_TIME = 10000,
  REFRESH_JWT_AFTER = 1296000000, // 15 days
  RESET_PASSWORD_LIFESPAN = 86400000, // 1 day
  VERIFY_TOKEN_LIFESPAN = 2592000000, // 30 days
  UPCOMING_INVOICE_EMAIL_WARNING = 345600000, // 4 days
  UPCOMING_INVOICE_TIME_VALID = 120000 // 2 minutes
}

export const enum Times {
  HUMAN_ADDICTION_THRESH = 300,
  MAX_WAIT_TIME = 5000,
  MEETING_CONFIRM_TOOLTIP_DELAY = 0,
  MEETING_CONFIRM_DURATION = 8000,
  REFLECTION_DEAL_CARD_INIT_DELAY = 100,
  REFLECTION_DEAL_CARD_MIN_DELAY = 30,
  REFLECTION_DEAL_CARD_DURATION = 300,
  REFLECTION_DEAL_TOTAL_DURATION = 500,
  REFLECTION_COLLAPSE_DURATION = 300,
  REFLECTION_DROP_DURATION = 1000,
  REFLECTION_REMOTE_DROP_DURATION = 2000,
  REFLECTION_DRAG_STALE_TIMEOUT = 10000,
  REFLECTION_SPOTLIGHT_DRAG_STALE_TIMEOUT = 120000,
  REFLECTION_COLUMN_SWIPE_THRESH = 600,
  SPOTLIGHT_SOURCE_DURATION = 300,
  SPOTLIGHT_MODAL_DURATION = 300,
  TOUCH_LONGPRESS = 120,
  WEBSOCKET_KEEP_ALIVE = 10000
}

export const enum TrebuchetCloseReason {
  SESSION_INVALIDATED = 'sessionInvalidated',
  EXPIRED_SESSION = 'expiredSession'
}
/* https://material.io/design/environment/elevation.html#default-elevations */
export const enum ZIndex {
  BOTTOM_BAR = 8,
  DIALOG = 24,
  FAB = 6,
  MENU = 24 /* portal needs to float above other components, especially sidebars */,
  SIDEBAR = 16,
  SIDE_SHEET = 8,
  SNACKBAR = 24 /* snackbar is kind of dialog */,
  REFLECTION_IN_FLIGHT = 8,
  REFLECTION_IN_FLIGHT_LOCAL = 28, // keep it above the dialog
  REFLECTION_IN_FLIGHT_SPOTLIGHT = 26,
  TOOLTIP = 24 /* portal needs to float above other components, especially sidebars */
}

export const enum AuthTokenRole {
  SUPER_USER = 'su'
}

export const enum SprintPokerDefaults {
  DEFAULT_TEMPLATE_ID = 'estimatedEffortTemplate',
  DEFAULT_SCALE_ID = 'fibonacciScale',
  JIRA_FIELD_DEFAULT = 'Story point estimate',
  JIRA_FIELD_LEGACY_DEFAULT = 'Story Points',
  AZURE_DEVOPS_USERSTORY_FIELD = '__storyPoints',
  AZURE_DEVOPS_USERSTORY_FIELD_LABEL = 'Story point estimate',
  AZURE_DEVOPS_TASK_FIELD = '__origEst',
  AZURE_DEVOPS_TASK_FIELD_LABEL = 'Original Estimate',
  AZURE_DEVOPS_EFFORT_FIELD = '__effort',
  AZURE_DEVOPS_EFFORT_LABEL = 'Effort',
  SERVICE_FIELD_COMMENT = '__comment',
  SERVICE_FIELD_COMMENT_LABEL = 'As Comment',
  SERVICE_FIELD_NULL = '',
  SERVICE_FIELD_NULL_LABEL = 'Do Not Update',
  GITHUB_DEFAULT_QUERY = 'is:issue is:open sort:updated involves:@me',
  JIRA_FIELD_UPDATE_ERROR = 'Couldn’t fix the missing field! In Jira, use "Find my field" to determine the error'
}

export const enum AriaLabels {
  COMMENT_EDITOR = 'Comment Editor',
  TASK_EDITOR = 'Task Editor'
}

export const enum Polls {
  MAX_OPTIONS = 4,
  MIN_OPTIONS = 2,
  MAX_TITLE_LENGTH = 100,
  MIN_TITLE_LENGTH = 2,
  MIN_OPTION_TITLE_LENGTH = 1,
  MAX_OPTION_TITLE_LENGTH = 30
}

export const enum PollsAriaLabels {
  POLL_TITLE_EDITOR = 'Poll Editor',
  POLL_OPTION_EDITOR = 'Poll Option Editor',
  POLL_SUBMIT_VOTE = 'Submit poll vote',
  POLL_START = 'Start a poll',
  POLL_ADD_OPTION = 'Add a poll option'
}
