/*
 This file was created before we used TypeScript
 Now that everything is strongly typed, we no longer need it & should work to deprecate it
 Instead of adding variables to this file, please consider this list of alternatives:
 - Does the variable come from the GraphQL schema? If so, import it from a file in the __generated__ folder
 - Is the variable a string? Create a string union & pass in a plain string to get type safety
*/
import {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {ReasonToDowngradeEnum} from '../__generated__/DowngradeToStarterMutation.graphql'
import {ReadableReasonToDowngradeEnum} from '../../server/graphql/types/ReasonToDowngrade'

/**
 * Big stuff:
 */
export const APP_CDN_USER_ASSET_SUBDIR = '/store'

/* Meeting Misc. */
export const MEETING_NAME = 'Check-in Meeting'
export const MEETING_SUMMARY_LABEL = 'Summary'
export const AGENDA_ITEM_LABEL = 'Agenda Topic'
export const RETRO_TOPIC_LABEL = 'Topic'

/* Phases */
export const LOBBY = 'lobby'

// lowercase here to match url
export const CHECKIN = 'checkin'
export const UPDATES = 'updates'
export const FIRST_CALL = 'firstcall'
export const AGENDA_ITEMS = 'agendaitems'
export const LAST_CALL = 'lastcall'
export const SUMMARY = 'summary'

/* Retrospective Phases */
export const REFLECT = 'reflect'
export const GROUP = 'group'
export const VOTE = 'vote'
export const DISCUSS = 'discuss'

/* Columns */
export const ACTIVE = 'active' as const
export const STUCK = 'stuck' as const
export const DONE = 'done' as const
export const FUTURE = 'future' as const
export const columnArray = [FUTURE, STUCK, ACTIVE, DONE] as TaskStatusEnum[]
export const meetingColumnArray = [DONE, ACTIVE, STUCK, FUTURE] as TaskStatusEnum[]

/* Scoping Task Search Filter */
export const taskScopingStatusFilters = [ACTIVE, STUCK, FUTURE] as TaskStatusEnum[]

/* Drag-n-Drop Items DroppableId */
export const AGENDA_ITEM = 'AGENDA_ITEM'
export const DISCUSSION_TOPIC = 'DISCUSSION_TOPIC'
export const ESTIMATING_TASK = 'ESTIMATING_TASK'
export const TEMPLATE_DIMENSION = 'TEMPLATE_DIMENSION'
export const TEMPLATE_PROMPT = 'TEMPLATE_PROMPT'
export const TEMPLATE_SCALE_VALUE = 'TEMPLATE_SCALE_VALUE'
export const ACTIVE_TASK = 'ACTIVE_TASK'

/* Sorting */
export const SORT_STEP = 1
export const ESTIMATE_TASK_SORT_ORDER = 2 ** 43
export const DND_THROTTLE = 25
export const AUTO_GROUPING_THRESHOLD = 0.25

/* Areas */
export const MEETING = 'meeting'
export const TEAM_DASH = 'teamDash'
export const USER_DASH = 'userDash'

/* Accounts */
export const STARTER_LABEL = 'Starter'
export const TEAM_LABEL = 'Team'

/* DEPRECATED. Use NotificationEnum */
// sent to someone just kicked out of a team
export const KICKED_OUT = 'KICKED_OUT'
// Sent to Billing Leaders when a reoccuring payment gets rejected
export const PAYMENT_REJECTED = 'PAYMENT_REJECTED'
// sent to the orgMember that just got promoted, goes away if they get demoted before acknowledging it
export const PROMOTE_TO_BILLING_LEADER = 'PROMOTE_TO_BILLING_LEADER'
// new version of TEAM_INVITE
export const TEAM_INVITATION = 'TEAM_INVITATION'
// sent to members of team that was archived
export const TEAM_ARCHIVED = 'TEAM_ARCHIVED'
// sent to members when a task is assigned to them or mentions them
export const TASK_INVOLVES = 'TASK_INVOLVES'

export const billingLeaderTypes = [PAYMENT_REJECTED]

/* User Settings */
export const PROFILE = 'profile'
export const ORGANIZATIONS = 'organizations'
export const NOTIFICATIONS = 'notifications'

/* Org Settings */
export const BILLING_PAGE = 'billing'
export const MEMBERS_PAGE = 'members'
export const AUTHENTICATION_PAGE = 'authentication'

/* Stripe */
// changing this does NOT change it in stripe, it just changes the UI
export const MONTHLY_PRICE = 6

export const FAILED = 'FAILED'

/* character limits */
export const TASK_MAX_CHARS = 51200

/* Task tags */
export const tags = [
  {
    name: 'private',
    description: 'Only you will be able to see this task'
  },
  {
    name: 'archived',
    description: 'Hidden from your main board'
  }
]

export const textTags = ['#private', '#archived']

export const NEWLINE_REGEX = /\r\n?|\n/g

/* Integrations */
export const GITHUB = 'GitHubIntegration'
export const SLACK = 'SlackIntegration'
export const GITHUB_ENDPOINT = 'https://api.github.com/graphql'

/* JavaScript specifics */
export const MAX_INT = 2147483647

/* Relay Subscription Event Types */
export const UPDATED = 'updated'

/* Task Involvement Types */
export const ASSIGNEE = 'ASSIGNEE'
export const MENTIONEE = 'MENTIONEE'

/* Auth Labels, Slugs */
export const SIGNIN_LABEL = 'Sign In'
export const SIGNIN_SLUG = 'signin'
export const SIGNOUT_LABEL = 'Sign Out'
export const SIGNOUT_SLUG = 'signout'
export const CREATE_ACCOUNT_LABEL = 'Create Free Account'
export const CREATE_ACCOUNT_BUTTON_LABEL = 'Create Free Account'
export const CREATE_ACCOUNT_SLUG = 'create-account'

/* Meeting Types */
export const ACTION = 'action'
export const RETROSPECTIVE = 'retrospective'
export const POKER = 'poker'
export const TEAM_PROMPT = 'teamPrompt'

/* Spotlight */
export const MAX_REDUCTION_PERCENTAGE = 1
export const MAX_RESULT_GROUP_SIZE = 10
export const MAX_SPOTLIGHT_COLUMNS = 3
export const SPOTLIGHT_TOP_SECTION_HEIGHT = 236

export const PARABOL_AI_USER_ID = 'parabolAIUser'

export const TeamBenefits = [
  'Unlimited teams',
  'Premium templates',
  'Custom templates',
  'Unlimited meeting history',
  'Priority customer support'
]

export const readableReasonsToDowngrade: ReadableReasonToDowngradeEnum[] = [
  'Parabol is too expensive',
  'Budget changes',
  'Missing key features',
  `Not using Parabol's paid features`,
  'Moving to another tool (please specify)'
]

export const reasonsToDowngradeLookup = {
  'Parabol is too expensive': 'tooExpensive',
  'Budget changes': 'budgetChanges',
  'Missing key features': 'missingKeyFeatures',
  "Not using Parabol's paid features": 'notUsingPaidFeatures',
  'Moving to another tool (please specify)': 'anotherTool'
} as Record<ReadableReasonToDowngradeEnum, ReasonToDowngradeEnum>
