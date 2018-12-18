// AUTOMATICALLY GENERATED FILE - DO NOT EDIT

// tslint:disable

export interface IGraphQLResponseRoot {
  data?: IQuery | IMutation | ISubscription
  errors?: Array<IGraphQLResponseError>
}

export interface IGraphQLResponseError {
  /** Required for all errors */
  message: string
  locations?: Array<IGraphQLResponseErrorLocation>
  /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
  [propName: string]: any
}

export interface IGraphQLResponseErrorLocation {
  line: number
  column: number
}

export interface IQuery {
  __typename: 'Query'
  viewer: IUser | null
  verifiedInvitation: IVerifiedInvitationPayload | null
}

export interface IVerifiedInvitationOnQueryArguments {
  /**
   * The invitation token
   */
  token: string
}

/**
 * The user account profile
 */
export interface IUser {
  __typename: 'User'

  /**
   * The userId provided by auth0
   */
  id: string | null

  /**
   * Array of identifier + ip pairs
   */
  blockedFor: Array<IBlockedUserType | null> | null

  /**
   * The timestamp of the user was cached
   */
  cachedAt: any | null

  /**
   * The timestamp when the cached user expires
   */
  cacheExpiresAt: any | null

  /**
   * The socketIds that the user is currently connected with
   */
  connectedSockets: Array<string | null> | null

  /**
   * The timestamp the user was created
   */
  createdAt: any | null

  /**
   * The user email
   */
  email: any

  /**
   * true if email is verified, false otherwise
   */
  emailVerified: boolean | null

  /**
   * Any super power given to the user via a super user
   */
  featureFlags: IUserFeatureFlags | null

  /**
   * An array of objects with information about the user's identities.
   *       More than one will exists in case accounts are linked
   */
  identities: Array<IAuthIdentityType | null> | null

  /**
   * true if the user is currently online
   */
  isConnected: boolean | null

  /**
   * The number of logins for this user
   */
  loginsCount: number | null

  /**
   * Name associated with the user
   */
  name: string | null

  /**
   * Nickname associated with the user
   */
  nickname: string | null

  /**
   * url of user’s profile picture
   */
  picture: any | null

  /**
   * The timestamp the user was last updated
   */
  updatedAt: any | null

  /**
   * flag to determine which broadcasts to show
   */
  broadcastFlags: number | null

  /**
   * The last time the user connected via websocket
   */
  lastSeenAt: any | null

  /**
   * true if the user is not currently being billed for service. removed on every websocket handshake
   */
  inactive: boolean | null

  /**
   * true if the user is a part of the supplied orgId
   */
  isBillingLeader: boolean | null

  /**
   * The application-specific name, defaults to nickname
   */
  preferredName: string

  /**
   * the orgs and roles for this user on each
   */
  userOrgs: Array<IUserOrg | null> | null
  archivedTasks: ITaskConnection | null
  archivedTasksCount: number | null

  /**
   * list of git hub repos available to the viewer
   */
  githubRepos: Array<IGitHubIntegration>

  /**
   * get an integration provider belonging to the user
   */
  integrationProvider: IProvider | null
  invoices: IInvoiceConnection | null
  invoiceDetails: IInvoice | null

  /**
   * A previous meeting that the user was in (present or absent)
   */
  meeting: IMeeting | null

  /**
   * The meeting member associated with this user, if a meeting is currently in progress
   */
  meetingMember: MeetingMember | null

  /**
   * A previous meeting that the user was in (present or absent)
   */
  newMeeting: NewMeeting

  /**
   * all the notifications for a single user
   */
  notifications: INotificationConnection | null

  /**
   * The list of providers as seen on the integrations page
   */
  providerMap: IProviderMap | null

  /**
   * paginated list of slackChannels
   */
  slackChannels: Array<ISlackIntegration>

  /**
   * get a single organization and the count of users by status
   */
  organization: IOrganization

  /**
   * Get the list of all organizations a user belongs to
   */
  organizations: Array<IOrganization>
  tasks: ITaskConnection

  /**
   * A query for a team
   */
  team: ITeam

  /**
   * all the teams the user is on that the viewer can see.
   */
  teams: Array<ITeam>

  /**
   * The team member associated with this user
   */
  teamMember: ITeamMember | null

  /**
   * all the teams the user is a part of that the viewer can see
   */
  tms: Array<string | null> | null
}

export interface IIsBillingLeaderOnUserArguments {
  /**
   * the org for which you want the users
   */
  orgId: string
}

export interface IArchivedTasksOnUserArguments {
  /**
   * the datetime cursor
   */
  after?: any | null
  first?: number | null

  /**
   * The unique team ID
   */
  teamId: string
}

export interface IArchivedTasksCountOnUserArguments {
  /**
   * The unique team ID
   */
  teamId: string
}

export interface IGithubReposOnUserArguments {
  /**
   * The unique team Id
   */
  teamId: string
}

export interface IIntegrationProviderOnUserArguments {
  /**
   * The unique team member Id
   */
  teamId: string

  /**
   * The name of the service
   */
  service: IntegrationService
}

export interface IInvoicesOnUserArguments {
  /**
   * the datetime cursor
   */
  after?: any | null
  first?: number | null

  /**
   * The id of the organization
   */
  orgId: string
}

export interface IInvoiceDetailsOnUserArguments {
  /**
   * The id of the invoice
   */
  invoiceId: string
}

export interface IMeetingOnUserArguments {
  /**
   * The meeting ID
   */
  meetingId: string
}

export interface IMeetingMemberOnUserArguments {
  /**
   * The specific meeting ID
   */
  meetingId?: string | null

  /**
   * The teamId of the meeting currently in progress
   */
  teamId?: string | null
}

export interface INewMeetingOnUserArguments {
  /**
   * The meeting ID
   */
  meetingId: string
}

export interface INotificationsOnUserArguments {
  after?: string | null
  first?: number | null
}

export interface IProviderMapOnUserArguments {
  /**
   * The unique team member Id
   */
  teamId: string
}

export interface ISlackChannelsOnUserArguments {
  /**
   * The unique team Id
   */
  teamId: string
}

export interface IOrganizationOnUserArguments {
  /**
   * the orgId
   */
  orgId: string
}

export interface ITasksOnUserArguments {
  /**
   * the datetime cursor
   */
  after?: any | null
  first?: number | null

  /**
   * The unique team ID
   */
  teamId?: string | null
}

export interface ITeamOnUserArguments {
  /**
   * The team ID for the desired team
   */
  teamId: string
}

export interface ITeamMemberOnUserArguments {
  /**
   * The team the user is on
   */
  teamId: string
}

/**
 * Identifier and IP address blocked
 */
export interface IBlockedUserType {
  __typename: 'BlockedUserType'

  /**
   * The identifier (usually email) of blocked user
   */
  identifier: string | null

  /**
   * The IP address of the blocked user
   */
  id: string | null
}

/**
 * The user account profile
 */
export interface IUserFeatureFlags {
  __typename: 'UserFeatureFlags'

  /**
   * true if the user has access to retro meetings
   */
  retro: boolean | null
}

export interface IAuthIdentityType {
  __typename: 'AuthIdentityType'

  /**
   * The connection name.
   *       This field is not itself updateable
   *       but is needed when updating email, email_verified, username or password.
   */
  connection: string | null

  /**
   * The unique identifier for the user for the identity.
   */
  userId: string | null

  /**
   * The type of identity provider.
   */
  provider: string | null

  /**
   * true if the identity provider is a social provider, false otherwise
   */
  isSocial: boolean | null
}

/**
 * The user/org M:F join, denormalized on the user/org tables
 */
export interface IUserOrg {
  __typename: 'UserOrg'

  /**
   * The orgId
   */
  id: string | null

  /**
   * role of the user in the org
   */
  role: OrgUserRole | null
}

/**
 * The role of the org user
 */
export const enum OrgUserRole {
  billingLeader = 'billingLeader'
}

/**
 * A connection to a list of items.
 */
export interface ITaskConnection {
  __typename: 'TaskConnection'

  /**
   * Page info with cursors coerced to ISO8601 dates
   */
  pageInfo: IPageInfoDateCursor | null

  /**
   * A list of edges.
   */
  edges: Array<ITaskEdge>
}

/**
 * Information about pagination in a connection.
 */
export interface IPageInfoDateCursor {
  __typename: 'PageInfoDateCursor'

  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean

  /**
   * When paginating backwards, are there more items?
   */
  hasPreviousPage: boolean

  /**
   * When paginating backwards, the cursor to continue.
   */
  startCursor: any | null

  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: any | null
}

/**
 * An edge in a connection.
 */
export interface ITaskEdge {
  __typename: 'TaskEdge'

  /**
   * The item at the end of the edge
   */
  node: ITask
  cursor: any | null
}

/**
 * A long-term task shared across the team, assigned to a single user
 */
export interface ITask {
  __typename: 'Task'

  /**
   * shortid
   */
  id: string

  /**
   * the agenda item that created this task, if any
   */
  agendaId: string | null

  /**
   * The body of the task. If null, it is a new task.
   */
  content: string | null

  /**
   * The timestamp the task was created
   */
  createdAt: any | null

  /**
   * The userId that created the task
   */
  createdBy: string | null

  /**
   * a user-defined due date
   */
  dueDate: any | null

  /**
   * a list of users currently editing the task (fed by a subscription, so queries return null)
   */
  editors: Array<ITaskEditorDetails | null> | null
  integration: IGitHubTask | null

  /**
   * true if this is assigned to a soft team member
   */
  isSoftTask: boolean | null

  /**
   * the foreign key for the meeting the task was created in
   */
  meetingId: string | null

  /**
   * the foreign key for the retrospective reflection group this was created in
   */
  reflectionGroupId: string | null

  /**
   * the shared sort order for tasks on the team dash & user dash
   */
  sortOrder: number

  /**
   * The status of the task
   */
  status: TaskStatusEnum | null

  /**
   * The tags associated with the task
   */
  tags: Array<string | null> | null

  /**
   * The id of the team (indexed). Needed for subscribing to archived tasks
   */
  teamId: string | null

  /**
   * The team this task belongs to
   */
  team: ITeam | null

  /**
   * The team member (or soft team member) that owns this task
   */
  assignee: Assignee | null

  /**
   * The id of the team member (or soft team member) assigned to this task
   */
  assigneeId: string

  /**
   * The timestamp the task was updated
   */
  updatedAt: any | null

  /**
   * * The userId, index useful for server-side methods getting all tasks under a user
   */
  userId: string | null
}

export interface ITaskEditorDetails {
  __typename: 'TaskEditorDetails'

  /**
   * The userId of the person editing the task
   */
  userId: string

  /**
   * The name of the userId editing the task
   */
  preferredName: string
}

/**
 * The details associated with a task integrated with GitHub
 */
export interface IGitHubTask {
  __typename: 'GitHubTask'
  integrationId: string
  service: IntegrationService
  nameWithOwner: string | null
  issueNumber: number | null
}

export type TaskIntegration = IGitHubTask

export interface ITaskIntegration {
  __typename: 'TaskIntegration'
  service: IntegrationService | null
}

/**
 * The list of services for integrations
 */
export const enum IntegrationService {
  GitHubIntegration = 'GitHubIntegration',
  SlackIntegration = 'SlackIntegration'
}

/**
 * The status of the task
 */
export const enum TaskStatusEnum {
  active = 'active',
  stuck = 'stuck',
  done = 'done',
  future = 'future'
}

/**
 * A team
 */
export interface ITeam {
  __typename: 'Team'

  /**
   * A shortid for the team
   */
  id: string

  /**
   * The datetime the team was created
   */
  createdAt: any

  /**
   * true if the underlying org has a validUntil date greater than now. if false, subs do not work
   */
  isPaid: boolean | null

  /**
   * The current or most recent meeting number (also the number of meetings the team has had
   */
  meetingNumber: number | null

  /**
   * The name of the team
   */
  name: string

  /**
   * The organization to which the team belongs
   */
  orgId: string

  /**
   * Arbitrary tags that the team uses
   */
  tags: Array<string | null> | null

  /**
   * The datetime the team was last updated
   */
  updatedAt: any | null

  /**
   * The checkIn greeting (fun language)
   */
  checkInGreeting: IMeetingGreeting | null

  /**
   * The checkIn question of the week
   */
  checkInQuestion: string | null
  customPhaseItems: Array<CustomPhaseItem | null> | null

  /**
   * The unique Id of the active meeting
   */
  meetingId: string | null

  /**
   * The current facilitator teamMemberId for this meeting
   */
  activeFacilitator: string | null

  /**
   * The phase of the facilitator
   */
  facilitatorPhase: ActionMeetingPhaseEnum | null

  /**
   * The current item number for the current phase for the facilitator, 1-indexed
   */
  facilitatorPhaseItem: number | null

  /**
   * The outstanding invitations to join the team
   */
  teamInvitations: Array<ITeamInvitation> | null

  /**
   * The outstanding invitations to join the team
   */
  invitations: Array<IInvitation | null> | null

  /**
   * true if the viewer is the team lead, else false
   */
  isLead: boolean | null

  /**
   * The phase of the meeting, usually matches the facilitator phase, be could be further along
   */
  meetingPhase: ActionMeetingPhaseEnum | null

  /**
   * The current item number for the current phase for the meeting, 1-indexed
   */
  meetingPhaseItem: number | null

  /**
   * The team-specific settings for running all available types of meetings
   */
  meetingSettings: TeamMeetingSettings

  /**
   * The new meeting in progress, if any
   */
  newMeeting: NewMeeting | null

  /**
   * The level of access to features on the parabol site
   */
  tier: TierEnum | null

  /**
   * The outstanding invitations to join the team
   */
  orgApprovals: Array<IOrgApproval>
  organization: IOrganization

  /**
   * The agenda items for the upcoming or current meeting
   */
  agendaItems: Array<IAgendaItem>

  /**
   * All of the tasks for this team
   */
  tasks: ITaskConnection | null

  /**
   * All the soft team members actively associated with the team
   */
  softTeamMembers: Array<ISoftTeamMember | null> | null

  /**
   * All the team members actively associated with the team
   */
  teamMembers: Array<ITeamMember>

  /**
   * true if the team has been archived
   */
  isArchived: boolean | null
}

export interface IMeetingSettingsOnTeamArguments {
  /**
   * the type of meeting for the settings
   */
  meetingType: MeetingTypeEnum
}

export interface ITasksOnTeamArguments {
  /**
   * the datetime cursor
   */
  after?: any | null
  first?: number | null
}

export interface ITeamMembersOnTeamArguments {
  /**
   * the field to sort the teamMembers by
   */
  sortBy?: string | null
}

export interface IMeetingGreeting {
  __typename: 'MeetingGreeting'

  /**
   * The foreign-language greeting
   */
  content: string

  /**
   * The source language for the greeting
   */
  language: string
}

export type CustomPhaseItem = IRetroPhaseItem

export interface ICustomPhaseItem {
  __typename: 'CustomPhaseItem'

  /**
   * shortid
   */
  id: string
  createdAt: any

  /**
   * The type of phase item
   */
  phaseItemType: CustomPhaseItemTypeEnum | null

  /**
   * true if the phase item is currently used by the team, else false
   */
  isActive: boolean | null

  /**
   * foreign key. use the team field
   */
  teamId: string

  /**
   * The team that owns this customPhaseItem
   */
  team: ITeam | null
  updatedAt: any
}

/**
 * The type of phase item
 */
export const enum CustomPhaseItemTypeEnum {
  retroPhaseItem = 'retroPhaseItem'
}

/**
 * The phases of an action meeting
 */
export const enum ActionMeetingPhaseEnum {
  lobby = 'lobby',
  checkin = 'checkin',
  updates = 'updates',
  firstcall = 'firstcall',
  agendaitems = 'agendaitems',
  lastcall = 'lastcall',
  summary = 'summary'
}

/**
 * An invitation to become a team member
 */
export interface ITeamInvitation {
  __typename: 'TeamInvitation'

  /**
   * The unique invitation Id
   */
  id: string

  /**
   * null if not accepted, else the datetime the invitation was accepted
   */
  acceptedAt: any | null

  /**
   * null if not accepted, else the userId that accepted the invitation
   */
  acceptedBy: string | null

  /**
   * The datetime the invitation was created
   */
  createdAt: any

  /**
   * The email of the invitee
   */
  email: any

  /**
   * The userId of the person that sent the invitation
   */
  invitedBy: string

  /**
   * The userId of the person that sent the invitation
   */
  inviter: IUser

  /**
   * The team invited to
   */
  teamId: string

  /**
   * 48-byte hex encoded random string
   */
  token: string
}

/**
 * An invitation to become a team member
 */
export interface IInvitation {
  __typename: 'Invitation'

  /**
   * The unique invitation Id
   */
  id: string

  /**
   * The datetime the invitation was accepted
   */
  acceptedAt: any | null

  /**
   * The datetime the invitation was created
   */
  createdAt: any

  /**
   * The email of the invitee
   */
  email: any | null

  /**
   * The name of the invitee, derived from the email address
   */
  fullName: string | null

  /**
   * The teamMemberId of the person that sent the invitation
   */
  invitedBy: string | null

  /**
   * How many invites have been sent to this email address?
   */
  inviteCount: number | null

  /**
   * The team invited to
   */
  teamId: string

  /**
   * The datestamp of when the invitation will expire
   */
  tokenExpiration: any | null

  /**
   * The datetime the invitation was last updated
   */
  updatedAt: any | null
}

export type PossibleTeamMember = IInvitation | IOrgApproval | ITeamMember | ISoftTeamMember

export interface IPossibleTeamMember {
  __typename: 'PossibleTeamMember'

  /**
   * A shortid for the possible team member
   */
  id: string | null

  /**
   * The email invited (if Invitee or OrgApproval) or used
   */
  email: any | null
}

/**
 * The phases of an action meeting
 */
export const enum MeetingTypeEnum {
  action = 'action',
  retrospective = 'retrospective'
}

/**
 * The team settings for a specific type of meeting
 */
export type TeamMeetingSettings = IRetrospectiveMeetingSettings | IActionMeetingSettings

/**
 * The team settings for a specific type of meeting
 */
export interface ITeamMeetingSettings {
  __typename: 'TeamMeetingSettings'
  id: string

  /**
   * The type of meeting these settings apply to
   */
  meetingType: MeetingTypeEnum | null

  /**
   * The broad phase types that will be addressed during the meeting
   */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>

  /**
   * FK
   */
  teamId: string

  /**
   * The team these settings belong to
   */
  team: ITeam | null
}

/**
 * The phase of the meeting
 */
export const enum NewMeetingPhaseTypeEnum {
  checkin = 'checkin',
  updates = 'updates',
  firstcall = 'firstcall',
  agendaitems = 'agendaitems',
  lastcall = 'lastcall',
  reflect = 'reflect',
  group = 'group',
  vote = 'vote',
  discuss = 'discuss'
}

/**
 * A team meeting history for all previous meetings
 */
export type NewMeeting = IRetrospectiveMeeting

/**
 * A team meeting history for all previous meetings
 */
export interface INewMeeting {
  __typename: 'NewMeeting'

  /**
   * The unique meeting id. shortid.
   */
  id: string

  /**
   * The timestamp the meeting was created
   */
  createdAt: any | null

  /**
   * The timestamp the meeting officially ended
   */
  endedAt: any | null

  /**
   * The location of the facilitator in the meeting
   */
  facilitatorStageId: string

  /**
   * The userId (or anonymousId) of the most recent facilitator
   */
  facilitatorUserId: string

  /**
   * The facilitator user
   */
  facilitator: IUser

  /**
   * The team members that were active during the time of the meeting
   */
  meetingMembers: Array<MeetingMember | null> | null

  /**
   * The auto-incrementing meeting number for the team
   */
  meetingNumber: number
  meetingType: MeetingTypeEnum

  /**
   * The phases the meeting will go through, including all phase-specific state
   */
  phases: Array<NewMeetingPhase>

  /**
   * The time the meeting summary was emailed to the team
   */
  summarySentAt: any | null

  /**
   * foreign key for team
   */
  teamId: string

  /**
   * The team that ran the meeting
   */
  team: ITeam

  /**
   * The last time a meeting was updated (stage completed, finished, etc)
   */
  updatedAt: any | null

  /**
   * The meeting member of the viewer
   */
  viewerMeetingMember: MeetingMember
}

/**
 * All the user details for a specific meeting
 */
export type MeetingMember = IRetrospectiveMeetingMember

/**
 * All the user details for a specific meeting
 */
export interface IMeetingMember {
  __typename: 'MeetingMember'

  /**
   * A composite of userId::meetingId
   */
  id: string

  /**
   * true if present, false if absent, else null
   */
  isCheckedIn: boolean | null
  meetingId: string | null
  meetingType: MeetingTypeEnum
  teamId: string | null
  user: IUser | null
  userId: string | null

  /**
   * The last time a meeting was updated (stage completed, finished, etc)
   */
  updatedAt: any | null
}

export type NewMeetingPhase = IReflectPhase | ICheckInPhase | IDiscussPhase | IGenericMeetingPhase

export interface INewMeetingPhase {
  __typename: 'NewMeetingPhase'

  /**
   * shortid
   */
  id: string

  /**
   * The type of phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null
  stages: Array<NewMeetingStage>
}

/**
 * An instance of a meeting phase item. On the client, this usually represents a single view
 */
export type NewMeetingStage = IRetroDiscussStage | IGenericMeetingStage | ICheckInStage

/**
 * An instance of a meeting phase item. On the client, this usually represents a single view
 */
export interface INewMeetingStage {
  __typename: 'NewMeetingStage'

  /**
   * shortid
   */
  id: string

  /**
   * The datetime the stage was completed
   */
  endAt: any | null

  /**
   * foreign key. try using meeting
   */
  meetingId: string

  /**
   * The meeting this stage belongs to
   */
  meeting: NewMeeting | null

  /**
   * true if the facilitator has completed this stage, else false. Should be boolean(endAt)
   */
  isComplete: boolean | null

  /**
   * true if any meeting participant can navigate to this stage
   */
  isNavigable: boolean | null

  /**
   * true if the facilitator can navigate to this stage
   */
  isNavigableByFacilitator: boolean | null

  /**
   * The phase this stage belongs to
   */
  phase: NewMeetingPhase | null

  /**
   * The type of the phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null

  /**
   * The datetime the stage was started
   */
  startAt: any | null

  /**
   * Number of times the facilitator has visited this stage
   */
  viewCount: number | null
}

/**
 * The pay tier of the team
 */
export const enum TierEnum {
  personal = 'personal',
  pro = 'pro',
  enterprise = 'enterprise'
}

/**
 * The state of approving an email address to join a team and org
 */
export interface IOrgApproval {
  __typename: 'OrgApproval'

  /**
   * The unique approval ID
   */
  id: string

  /**
   * The userId of the billing leader that approved the invitee
   */
  approvedBy: string | null

  /**
   * The datetime the organization was created
   */
  createdAt: any

  /**
   * The userId of the billing leader that denied the invitee
   */
  deniedBy: string | null

  /**
   * *The email seeking approval
   */
  email: any | null

  /**
   * true if it applies to a user that was not removed from the org, else false
   */
  isActive: boolean | null

  /**
   * The notification sent to the viewer / billing leader(s) requesting approval
   */
  notification: INotifyRequestNewUser | null

  /**
   * The orgId the email want to join
   */
  orgId: string

  /**
   * *The team seeking approval. Used to populate in the team settings page
   */
  teamId: string
  status: OrgApprovalStatusEnum | null

  /**
   * The datetime the approval was last updated
   */
  updatedAt: any | null
}

/**
 * A notification sent to a user concerning an invitation (request, joined)
 */
export interface INotifyRequestNewUser {
  __typename: 'NotifyRequestNewUser'

  /**
   * The userId of the person that invited the email
   */
  inviterUserId: string

  /**
   * The email of the person being invited
   */
  inviteeEmail: string

  /**
   * The teamId the inviteeEmail is being invited to
   */
  teamId: string

  /**
   * The team name the inviteeEmail is being invited to
   */
  teamName: string

  /**
   * The user that triggered the invitation
   */
  inviter: IUser
  team: ITeam

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export type Notification =
  | INotifyRequestNewUser
  | INotifyTeamInvite
  | INotifyInviteeApproved
  | INotifyTeamArchived
  | INotifyTaskInvolves
  | INotifyAddedToTeam
  | INotificationTeamInvitation
  | INotifyDenial
  | INotifyKickedOut
  | INotifyPaymentRejected
  | INotifyPromoteToOrgLeader

export interface INotification {
  __typename: 'Notification'

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

/**
 * The kind of notification
 */
export const enum NotificationEnum {
  ADD_TO_TEAM = 'ADD_TO_TEAM',
  DENY_NEW_USER = 'DENY_NEW_USER',
  FACILITATOR_DISCONNECTED = 'FACILITATOR_DISCONNECTED',
  undefined = 'undefined',
  INVITEE_APPROVED = 'INVITEE_APPROVED',
  JOIN_TEAM = 'JOIN_TEAM',
  KICKED_OUT = 'KICKED_OUT',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  TASK_INVOLVES = 'TASK_INVOLVES',
  REJOIN_TEAM = 'REJOIN_TEAM',
  REQUEST_NEW_USER = 'REQUEST_NEW_USER',
  TEAM_INVITE = 'TEAM_INVITE',
  TEAM_INVITATION = 'TEAM_INVITATION',
  TEAM_ARCHIVED = 'TEAM_ARCHIVED',
  VERSION_INFO = 'VERSION_INFO',
  PROMOTE_TO_BILLING_LEADER = 'PROMOTE_TO_BILLING_LEADER'
}

export type OrganizationNotification =
  | INotifyRequestNewUser
  | INotifyPaymentRejected
  | INotifyPromoteToOrgLeader

export interface IOrganizationNotification {
  __typename: 'OrganizationNotification'
  id: string | null
  type: NotificationEnum | null
}

export type TeamNotification =
  | INotifyRequestNewUser
  | INotifyTeamInvite
  | INotifyInviteeApproved
  | INotifyTaskInvolves
  | INotifyAddedToTeam
  | INotificationTeamInvitation
  | INotifyDenial

export interface ITeamNotification {
  __typename: 'TeamNotification'
  id: string | null
  type: NotificationEnum | null
}

/**
 * The approval status for a user joining the org
 */
export const enum OrgApprovalStatusEnum {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  DENIED = 'DENIED'
}

/**
 * An organization
 */
export interface IOrganization {
  __typename: 'Organization'

  /**
   * The unique organization ID
   */
  id: string

  /**
   * The datetime the organization was created
   */
  createdAt: any

  /**
   * The safe credit card details
   */
  creditCard: ICreditCard | null

  /**
   * true if the viewer is the billing leader for the org
   */
  isBillingLeader: boolean | null

  /**
   * The billing leader of the organization (or the first, if more than 1)
   */
  mainBillingLeader: IUser | null

  /**
   * The name of the organization
   */
  name: string

  /**
   * The org avatar
   */
  picture: any | null

  /**
   * all the teams the viewer is on in the organization
   */
  teams: Array<ITeam>

  /**
   * The level of access to features on the parabol site
   */
  tier: TierEnum | null

  /**
   * THe datetime the current billing cycle ends
   */
  periodEnd: any | null

  /**
   * The datetime the current billing cycle starts
   */
  periodStart: any | null

  /**
   * The total number of retroMeetings given to the team
   * @deprecated "Unlimited retros for all!"
   */
  retroMeetingsOffered: number

  /**
   * Number of retro meetings that can be run (if not pro)
   * @deprecated "Unlimited retros for all!"
   */
  retroMeetingsRemaining: number

  /**
   * The customerId from stripe
   */
  stripeId: string | null

  /**
   * The subscriptionId from stripe
   */
  stripeSubscriptionId: string | null

  /**
   * The datetime the organization was last updated
   */
  updatedAt: any | null
  orgMembers: IOrganizationMemberConnection | null

  /**
   * The count of active & inactive users
   */
  orgUserCount: IOrgUserCount

  /**
   * The leaders of the org
   */
  billingLeaders: Array<IUser>
}

export interface IOrgMembersOnOrganizationArguments {
  after?: string | null
  first?: number | null
}

/**
 * A credit card
 */
export interface ICreditCard {
  __typename: 'CreditCard'

  /**
   * The brand of the credit card, as provided by skype
   */
  brand: string | null

  /**
   * The MM/YY string of the expiration date
   */
  expiry: string | null

  /**
   * The last 4 digits of a credit card
   */
  last4: number | null
}

/**
 * A connection to a list of items.
 */
export interface IOrganizationMemberConnection {
  __typename: 'OrganizationMemberConnection'

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * A list of edges.
   */
  edges: Array<IOrganizationMemberEdge>
}

/**
 * Information about pagination in a connection.
 */
export interface IPageInfo {
  __typename: 'PageInfo'

  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean

  /**
   * When paginating backwards, are there more items?
   */
  hasPreviousPage: boolean

  /**
   * When paginating backwards, the cursor to continue.
   */
  startCursor: string | null

  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null
}

/**
 * An edge in a connection.
 */
export interface IOrganizationMemberEdge {
  __typename: 'OrganizationMemberEdge'

  /**
   * The item at the end of the edge
   */
  node: IOrganizationMember | null

  /**
   * A cursor for use in pagination
   */
  cursor: string
}

export interface IOrganizationMember {
  __typename: 'OrganizationMember'
  id: string | null
  organization: IOrganization | null
  user: IUser | null
  isBillingLeader: boolean | null
}

export interface IOrgUserCount {
  __typename: 'OrgUserCount'

  /**
   * The number of orgUsers who have an inactive flag
   */
  inactiveUserCount: number

  /**
   * The number of orgUsers who do not have an inactive flag
   */
  activeUserCount: number
}

/**
 * A request placeholder that will likely turn into 1 or more tasks
 */
export interface IAgendaItem {
  __typename: 'AgendaItem'

  /**
   * The unique agenda item id teamId::shortid
   */
  id: string

  /**
   * The body of the agenda item
   */
  content: string

  /**
   * The timestamp the agenda item was created
   */
  createdAt: any | null

  /**
   * true until the agenda item has been marked isComplete and the meeting has ended
   */
  isActive: boolean | null

  /**
   * true if the agenda item has been addressed in a meeting (will have a strikethrough or similar)
   */
  isComplete: boolean | null

  /**
   * The sort order of the agenda item in the list
   */
  sortOrder: number

  /**
   * *The team for this agenda item
   */
  teamId: string

  /**
   * The teamMemberId that created this agenda item
   */
  teamMemberId: string

  /**
   * The timestamp the agenda item was updated
   */
  updatedAt: any | null

  /**
   * The team member that created the agenda item
   */
  teamMember: ITeamMember | null
}

/**
 * A member of a team
 */
export interface ITeamMember {
  __typename: 'TeamMember'

  /**
   * An ID for the teamMember. userId::teamId
   */
  id: string

  /**
   * The name of the assignee
   */
  preferredName: string

  /**
   * foreign key to Team table
   */
  teamId: string

  /**
   * true if the user is a part of the team, false if they no longer are
   */
  isNotRemoved: boolean | null

  /**
   * Is user a team lead?
   */
  isLead: boolean | null

  /**
   * Is user a team facilitator?
   */
  isFacilitator: boolean | null

  /**
   * hide the agenda list on the dashboard
   */
  hideAgenda: boolean | null

  /**
   * The user email
   */
  email: any

  /**
   * url of user’s profile picture
   */
  picture: any | null

  /**
   * The place in line for checkIn, regenerated every meeting
   */
  checkInOrder: number | null

  /**
   * true if the user is connected
   */
  isConnected: boolean | null

  /**
   * true if present, false if absent, null before check-in
   */
  isCheckedIn: boolean | null

  /**
   * true if this team member belongs to the user that queried it
   */
  isSelf: boolean

  /**
   * The meeting specifics for the meeting the team member is currently in
   */
  meetingMember: MeetingMember | null

  /**
   * foreign key to User table
   */
  userId: string | null

  /**
   * The team this team member belongs to
   */
  team: ITeam | null

  /**
   * The user for the team member
   */
  user: IUser | null

  /**
   * Tasks owned by the team member
   */
  tasks: ITaskConnection | null
}

export interface IMeetingMemberOnTeamMemberArguments {
  meetingId?: string | null
}

export interface ITasksOnTeamMemberArguments {
  /**
   * the datetime cursor
   */
  after?: any | null
  first?: number | null
}

export type Assignee = ITeamMember | ISoftTeamMember

export interface IAssignee {
  __typename: 'Assignee'

  /**
   * The teamMemberId or softTeamMemberId
   */
  id: string

  /**
   * The name of the assignee
   */
  preferredName: string

  /**
   * foreign key to Team table
   */
  teamId: string
}

/**
 * A member of a team
 */
export interface ISoftTeamMember {
  __typename: 'SoftTeamMember'

  /**
   * The teamMemberId or softTeamMemberId
   */
  id: string

  /**
   * The name of the assignee
   */
  preferredName: string

  /**
   * foreign key to Team table
   */
  teamId: string

  /**
   * The datetime the team was created
   */
  createdAt: any | null

  /**
   * The user email
   */
  email: any | null

  /**
   * True if this is still a soft team member, false if they were rejected or became a team member
   */
  isActive: boolean | null

  /**
   * Tasks owned by the team member
   */
  tasks: ITaskConnection | null

  /**
   * The team this team member belongs to
   */
  team: ITeam | null
}

export interface ITasksOnSoftTeamMemberArguments {
  /**
   * the datetime cursor
   */
  after?: any | null
  first?: number | null
}

/**
 * An integration that connects github issues & PRs to Parabol tasks
 */
export interface IGitHubIntegration {
  __typename: 'GitHubIntegration'

  /**
   * The ID of an object
   */
  id: string

  /**
   * The parabol userId of the admin for this repo (usually the creator)
   */
  adminUserId: string

  /**
   * The datetime the integration was created
   */
  createdAt: any

  /**
   * The name of the repo. Follows format of OWNER/NAME
   */
  nameWithOwner: string | null

  /**
   * defaults to true. true if this is used
   */
  isActive: boolean | null

  /**
   * *The team that is linked to this integration
   */
  teamId: string

  /**
   * The users that can CRUD this integration
   */
  teamMembers: Array<ITeamMember>

  /**
   * The datetime the integration was updated
   */
  updatedAt: any

  /**
   * *The userIds connected to the repo so they can CRUD things under their own name
   */
  userIds: Array<string | null> | null
}

/**
 * A token for a user to be used on 1 or more teams
 */
export interface IProvider {
  __typename: 'Provider'

  /**
   * The ID of an object
   */
  id: string

  /**
   * The access token to the service
   */
  accessToken: string

  /**
   * The timestamp the provider was created
   */
  createdAt: any | null

  /**
   * True if the Provider is active. else false
   */
  isActive: boolean | null

  /**
   * *The id for the user used by the provider, eg SlackTeamId, GoogleUserId, githubLogin
   */
  providerUserId: string | null

  /**
   * The username (or email) attached to the provider
   */
  providerUserName: string | null

  /**
   * The name of the service
   */
  service: IntegrationService | null

  /**
   * *The team that the token is linked to
   */
  teamId: string | null

  /**
   * The timestamp the task was updated
   */
  updatedAt: any | null

  /**
   * The user that the access token is attached to
   */
  userId: string | null
}

/**
 * A connection to a list of items.
 */
export interface IInvoiceConnection {
  __typename: 'InvoiceConnection'

  /**
   * Page info with cursors coerced to ISO8601 dates
   */
  pageInfo: IPageInfoDateCursor | null

  /**
   * A list of edges.
   */
  edges: Array<IInvoiceEdge>
}

/**
 * An edge in a connection.
 */
export interface IInvoiceEdge {
  __typename: 'InvoiceEdge'

  /**
   * The item at the end of the edge
   */
  node: IInvoice | null
  cursor: any | null
}

/**
 * A monthly billing invoice for an organization
 */
export interface IInvoice {
  __typename: 'Invoice'

  /**
   * A shortid for the invoice
   */
  id: string | null

  /**
   * The amount the card will be charged (total + startingBalance with a min value of 0)
   */
  amountDue: number | null

  /**
   * The datetime the invoice was first generated
   */
  createdAt: any | null

  /**
   * The total amount for the invoice (in USD)
   */
  total: number | null

  /**
   * The emails the invoice was sent to
   */
  billingLeaderEmails: Array<any | null> | null

  /**
   * the card used to pay the invoice
   */
  creditCard: ICreditCard | null

  /**
   * The timestamp for the end of the billing cycle
   */
  endAt: any | null

  /**
   * The date the invoice was created
   */
  invoiceDate: any | null

  /**
   * An invoice line item for previous month adjustments
   */
  lines: Array<IInvoiceLineItem> | null

  /**
   * The details that comprise the charges for next month
   */
  nextMonthCharges: IInvoiceChargeNextMonth | null

  /**
   * *The organization id to charge
   */
  orgId: string | null

  /**
   * The persisted name of the org as it was when invoiced
   */
  orgName: string | null

  /**
   * the datetime the invoice was successfully paid
   */
  paidAt: any | null

  /**
   * The picture of the organization
   */
  picture: any | null

  /**
   * The timestamp for the beginning of the billing cycle
   */
  startAt: any | null

  /**
   * The balance on the customer account (in cents)
   */
  startingBalance: number | null

  /**
   * the status of the invoice. starts as pending, moves to paid or unpaid depending on if the payment succeeded
   */
  status: InvoiceStatusEnum | null
}

/**
 * A single line item charge on the invoice
 */
export interface IInvoiceLineItem {
  __typename: 'InvoiceLineItem'

  /**
   * The unique line item id
   */
  id: string

  /**
   * The amount for the line item (in USD)
   */
  amount: number

  /**
   * A description of the charge. Only present if we have no idea what the charge is
   */
  description: string | null

  /**
   * Array of user activity line items that roll up to total activity (add/leave/pause/unpause)
   */
  details: Array<IInvoiceLineItemDetails> | null

  /**
   * The total number of days that all org users have been inactive during the billing cycle
   */
  quantity: number | null

  /**
   * The line item type for a monthly billing invoice
   */
  type: InvoiceLineItemEnum | null
}

/**
 * The per-user-action line item details,
 */
export interface IInvoiceLineItemDetails {
  __typename: 'InvoiceLineItemDetails'

  /**
   * The unique detailed line item id
   */
  id: string

  /**
   * The amount for the line item (in USD)
   */
  amount: number

  /**
   * The email affected by this line item change
   */
  email: any | null

  /**
   * End of the event. Only present if a pause action gets matched up with an unpause action
   */
  endAt: any | null

  /**
   * The parent line item id
   */
  parentId: string

  /**
   * The timestamp for the beginning of the period of no charge
   */
  startAt: any | null
}

/**
 * A big picture line item
 */
export const enum InvoiceLineItemEnum {
  ADDED_USERS = 'ADDED_USERS',
  INACTIVITY_ADJUSTMENTS = 'INACTIVITY_ADJUSTMENTS',
  OTHER_ADJUSTMENTS = 'OTHER_ADJUSTMENTS',
  REMOVED_USERS = 'REMOVED_USERS'
}

/**
 * A single line item for the charges for next month
 */
export interface IInvoiceChargeNextMonth {
  __typename: 'InvoiceChargeNextMonth'

  /**
   * The amount for the line item (in USD)
   */
  amount: number

  /**
   * The datetime the next period will end
   */
  nextPeriodEnd: any | null

  /**
   * The total number of days that all org users have been inactive during the billing cycle
   */
  quantity: number | null

  /**
   * The per-seat monthly price of the subscription (in dollars)
   */
  unitPrice: number | null
}

/**
 * The payment status of the invoice
 */
export const enum InvoiceStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  UPCOMING = 'UPCOMING'
}

/**
 * A team meeting history for all previous meetings
 */
export interface IMeeting {
  __typename: 'Meeting'

  /**
   * The unique meeting id. shortid.
   */
  id: string

  /**
   * The number of agenda items completed during the meeting
   */
  agendaItemsCompleted: number | null

  /**
   * The timestamp the meeting was created
   */
  createdAt: any | null

  /**
   * The timestamp the meeting officially ended
   */
  endedAt: any | null

  /**
   * The teamMemberId of the person who ended the meeting
   */
  facilitator: string | null
  invitees: Array<IMeetingInvitee | null> | null

  /**
   * The auto-incrementing meeting number for the team
   */
  meetingNumber: number

  /**
   * A list of immutable tasks, as they were created in the meeting
   */
  tasks: Array<IMeetingTask | null> | null

  /**
   * The start time used to create the diff (all taskDiffs occurred between this time and the endTime
   */
  sinceTime: any | null

  /**
   * The happy introductory clause to the summary
   */
  successExpression: string | null

  /**
   * The happy body statement for the summary
   */
  successStatement: string | null

  /**
   * The time the meeting summary was emailed to the team
   */
  summarySentAt: any | null

  /**
   * The team associated with this meeting
   */
  teamId: string

  /**
   * The name as it was when the meeting occurred
   */
  teamName: string | null

  /**
   * All the team members associated who can join this team
   */
  teamMembers: Array<ITeamMember | null> | null
}

/**
 * The user invited to the meeting
 */
export interface IMeetingInvitee {
  __typename: 'MeetingInvitee'

  /**
   * The teamMemberId of the user invited to the meeting
   */
  id: string | null

  /**
   * true if the invitee was present in the meeting
   */
  present: boolean | null

  /**
   * A list of immutable tasks, as they were created in the meeting
   */
  tasks: Array<IMeetingTask | null> | null

  /**
   * url of user’s profile picture
   */
  picture: any | null

  /**
   * The name, as confirmed by the user
   */
  preferredName: string | null

  /**
   * All of the fields from the team member table
   */
  membership: ITeamMember | null
}

/**
 * The task that was created in a meeting
 */
export interface IMeetingTask {
  __typename: 'MeetingTask'

  /**
   * The unique action id, meetingId::taskId
   */
  id: string

  /**
   * The stringified Draft-js raw description of the action created during the meeting
   */
  content: string

  /**
   * The description of the action created during the meeting
   */
  status: TaskStatusEnum | null

  /**
   * The tags associated with the task
   */
  tags: Array<string | null> | null

  /**
   * The id of the team member the action was assigned to during the meeting
   */
  assigneeId: string
}

/**
 * A connection to a list of items.
 */
export interface INotificationConnection {
  __typename: 'NotificationConnection'

  /**
   * Page info with cursors coerced to ISO8601 dates
   */
  pageInfo: IPageInfoDateCursor | null

  /**
   * A list of edges.
   */
  edges: Array<INotificationEdge>
}

/**
 * An edge in a connection.
 */
export interface INotificationEdge {
  __typename: 'NotificationEdge'

  /**
   * The item at the end of the edge
   */
  node: Notification | null
  cursor: any | null
}

/**
 * A token for a user to be used on 1 or more teams
 */
export interface IProviderMap {
  __typename: 'ProviderMap'

  /**
   * The ID of an object
   */
  id: string
  teamId: string | null

  /**
   * All the big details associated with slack
   */
  SlackIntegration: IProviderRow | null

  /**
   * All the big details associated with GitHub
   */
  GitHubIntegration: IProviderRow | null
}

/**
 * All the details about a particular provider
 */
export interface IProviderRow {
  __typename: 'ProviderRow'

  /**
   * composite keyID
   */
  id: string

  /**
   * The access token attached to the userId. null if user does not have a token for the provider
   */
  accessToken: string | null

  /**
   * The count of all the people on the team that have linked their account to the provider
   */
  userCount: number

  /**
   * The number of integrations under this provider for the team
   */
  integrationCount: number

  /**
   * The username according to the provider
   */
  providerUserName: string | null

  /**
   * The name of the service
   */
  service: IntegrationService | null
  teamId: string | null
}

/**
 * An integration that sends start/end meeting messages to a specified slack channel
 */
export interface ISlackIntegration {
  __typename: 'SlackIntegration'

  /**
   * The ID of an object
   */
  id: string

  /**
   * the id of the channel provided by the service, if available. Useful for fetching from their API
   */
  channelId: string

  /**
   * The name of the channel. Shared with all, updated when the integration owner looks at it
   */
  channelName: string | null

  /**
   * defaults to true. true if this is used to send notifications
   */
  isActive: boolean | null

  /**
   * The types of notifications the team wishes to receive
   */
  notifications: Array<string | null> | null

  /**
   * *The team that cares about these annoucements
   */
  teamId: string
}

export interface IVerifiedInvitationPayload {
  __typename: 'VerifiedInvitationPayload'
  errorType: TeamInvitationErrorEnum | null

  /**
   * The name of the person that sent the invitation, present if errorType is expired
   */
  inviterName: string | null

  /**
   * The email of the person that send the invitation, present if errorType is expired
   */
  inviterEmail: string | null

  /**
   * true if the mx record is hosted by google, else falsy
   */
  isGoogle: boolean | null

  /**
   * The valid invitation
   */
  teamInvitation: ITeamInvitation | null

  /**
   * name of the inviting team
   */
  teamName: string

  /**
   * The userId of the invitee, if already a parabol user
   */
  userId: string | null

  /**
   * The invitee, if already a parabol user, present if errorType is null
   */
  user: IUser | null
}

/**
 * The reason the invitation failed
 */
export const enum TeamInvitationErrorEnum {
  accepted = 'accepted',
  expired = 'expired',
  notFound = 'notFound'
}

export interface IMutation {
  __typename: 'Mutation'

  /**
   * Add a user to a Team given an invitationToken or the notification id of the invitation.
   *     If the invitationToken is valid, returns the auth token with the new team added to tms.
   *     Side effect: deletes all other outstanding invitations for user.
   */
  acceptTeamInvite: IAcceptTeamInvitePayload

  /**
   * Redeem an invitation token for a logged in user
   */
  acceptTeamInvitation: IAcceptTeamInvitationPayload

  /**
   * Create a new agenda item
   */
  addAgendaItem: IAddAgendaItemPayload | null

  /**
   * Give someone advanced features in a flag
   */
  addFeatureFlag: IAddFeatureFlagPayload | null
  addGitHubRepo: IAddGitHubRepoPayload

  /**
   * Create a new team and add the first team member
   */
  addOrg: IAddOrgPayload | null
  addProvider: IAddProviderPayload
  addSlackChannel: IAddSlackChannelPayload

  /**
   * Create a new team and add the first team member
   */
  addTeam: IAddTeamPayload | null

  /**
   * Approve an outsider to join the organization
   */
  approveToOrg: IApproveToOrgPayload | null
  archiveTeam: IArchiveTeamPayload | null

  /**
   * Automatically group reflections
   */
  autoGroupReflections: IAutoGroupReflectionsPayload | null

  /**
   * Cancel a pending request for an invitee to join the org
   */
  cancelApproval: ICancelApprovalPayload | null

  /**
   * Cancel an invitation
   */
  cancelTeamInvite: ICancelTeamInvitePayload | null

  /**
   * Change the team a task is associated with
   */
  changeTaskTeam: IChangeTaskTeamPayload | null

  /**
   * Remove a notification by ID
   */
  clearNotification: IClearNotificationPayload | null

  /**
   * a server-side mutation called when a client connects
   */
  connectSocket: IUser | null

  /**
   * for troubleshooting by admins, create a JWT for a given userId
   */
  createImposterToken: ICreateImposterTokenPayload | null

  /**
   * Create a new team and add the first team member. Called from the welcome wizard
   */
  createFirstTeam: ICreateFirstTeamPayload | null
  createGitHubIssue: ICreateGitHubIssuePayload | null

  /**
   * Create a PUT URL on the CDN for an organization’s profile picture
   */
  createOrgPicturePutUrl: ICreatePicturePutUrlPayload | null

  /**
   * Create a new reflection
   */
  createReflection: ICreateReflectionPayload | null

  /**
   * Create a new reflection group
   */
  createReflectionGroup: ICreateReflectionGroupPayload | null

  /**
   * Create a new task, triggering a CreateCard for other viewers
   */
  createTask: ICreateTaskPayload | null

  /**
   * Create a PUT URL on the CDN for the currently authenticated user’s profile picture
   */
  createUserPicturePutUrl: ICreateUserPicturePutUrlPayload | null

  /**
   * Delete (not archive!) a task
   */
  deleteTask: IDeleteTaskPayload | null

  /**
   * a server-side mutation called when a client disconnects
   */
  disconnectSocket: IDisconnectSocketPayload | null

  /**
   * Downgrade a paid account to the personal service
   */
  downgradeToPersonal: IDowngradeToPersonalPayload | null

  /**
   * Changes the priority of the discussion topics
   */
  dragDiscussionTopic: IDragDiscussionTopicPayload | null

  /**
   * Broadcast that the viewer stopped dragging a reflection
   */
  endDraggingReflection: IEndDraggingReflectionPayload | null

  /**
   * Changes the editing state of a user for a phase item
   */
  editReflection: IEditReflectionPayload | null

  /**
   * Announce to everyone that you are editing a task
   */
  editTask: IEditTaskPayload | null

  /**
   * Finish a meeting and go to the summary
   */
  endMeeting: IEndMeetingPayload | null

  /**
   * Receive a webhook from github saying an assignee was added
   */
  githubAddAssignee: boolean | null

  /**
   * Receive a webhook from github saying an org member was added
   */
  githubAddMember: boolean | null

  /**
   * Receive a webhook from github saying an org member was removed
   */
  githubRemoveMember: boolean | null

  /**
   * pauses the subscription for a single user
   */
  inactivateUser: IInactivateUserPayload | null

  /**
   * If in the org,
   *      Send invitation emails to a list of email addresses, add them to the invitation table.
   *      Else, send a request to the org leader to get them approval and put them in the OrgApproval table.
   */
  inviteTeamMembers: IInviteTeamMembersPayload

  /**
   * Send a team invitation to an email address
   */
  inviteToTeam: IInviteToTeamPayload

  /**
   * Add a user to an integration
   */
  joinIntegration: IJoinIntegrationPayload

  /**
   * Finish a meeting abruptly
   */
  killMeeting: IKillMeetingPayload | null

  /**
   * Finish a new meeting abruptly
   */
  endNewMeeting: IEndNewMeetingPayload | null

  /**
   * Remove yourself from an integration
   */
  leaveIntegration: ILeaveIntegrationPayload

  /**
   * Check a member in as present or absent
   */
  meetingCheckIn: IMeetingCheckInPayload | null

  /**
   * Update the facilitator. If this is new territory for the meetingPhaseItem, advance that, too.
   */
  moveMeeting: IMoveMeetingPayload | null

  /**
   * Move a team to a different org. Requires billing leader rights on both orgs!
   */
  moveTeamToOrg: string | null

  /**
   * update a meeting by marking an item complete and setting the facilitator location
   */
  navigateMeeting: INavigateMeetingPayload | null

  /**
   * Check a member in as present or absent
   */
  newMeetingCheckIn: INewMeetingCheckInPayload | null

  /**
   * Change a facilitator while the meeting is in progress
   */
  promoteFacilitator: IPromoteFacilitatorPayload | null

  /**
   * Change a facilitator while the meeting is in progress
   */
  promoteNewMeetingFacilitator: IPromoteNewMeetingFacilitatorPayload | null

  /**
   * Promote another team member to be the leader
   */
  promoteToTeamLead: IPromoteToTeamLeadPayload | null

  /**
   * Reject an invitee from joining any team under your organization
   */
  rejectOrgApproval: IRejectOrgApprovalPayload | null

  /**
   * Remove an agenda item
   */
  removeAgendaItem: IRemoveAgendaItemPayload | null

  /**
   * Disconnect a team from a Provider token
   */
  removeProvider: IRemoveProviderPayload

  /**
   * Remove a slack channel integration from a team
   */
  removeSlackChannel: IRemoveSlackChannelPayload

  /**
   * Remove a github repo integration from a team
   */
  removeGitHubRepo: IRemoveGitHubRepoPayload

  /**
   * Remove a user from an org
   */
  removeOrgUser: IRemoveOrgUserPayload | null

  /**
   * Remove a reflection
   */
  removeReflection: IRemoveReflectionPayload | null

  /**
   * Remove a team member from the team
   */
  removeTeamMember: IRemoveTeamMemberPayload | null

  /**
   * Request to become the facilitator in a meeting
   */
  requestFacilitator: IRequestFacilitatorPayload | null

  /**
   * Resend an invitation
   */
  resendTeamInvite: IResendTeamInvitePayload | null

  /**
   * track an event in segment, like when errors are hit
   */
  segmentEventTrack: boolean | null

  /**
   * Set the selected template for the upcoming retro meeting
   */
  selectRetroTemplate: ISelectRetroTemplatePayload | null

  /**
   * Set the role of a user
   */
  setOrgUserRole: SetOrgUserRolePayload | null

  /**
   * Focus (or unfocus) a phase item
   */
  setPhaseFocus: ISetPhaseFocusPayload | null

  /**
   * Broadcast that the viewer started dragging a reflection
   */
  startDraggingReflection: IStartDraggingReflectionPayload | null

  /**
   * Start a meeting from the lobby
   */
  startMeeting: IStartMeetingPayload | null

  /**
   * Start a new meeting
   */
  startNewMeeting: IStartNewMeetingPayload | null

  /**
   * When stripe tells us an invoice is ready, create a pretty version
   */
  stripeCreateInvoice: boolean | null

  /**
   * When stripe tells us an invoice payment failed, update it in our DB
   */
  stripeFailPayment: IStripeFailPaymentPayload | null

  /**
   * When stripe tells us an invoice payment was successful, update it in our DB
   */
  stripeSucceedPayment: boolean | null

  /**
   * When stripe tells us a credit card was updated, update the details in our own DB
   */
  stripeUpdateCreditCard: boolean | null

  /**
   * When a new invoiceitem is sent from stripe, tag it with metadata
   */
  stripeUpdateInvoiceItem: boolean | null

  /**
   * Show/hide the agenda list
   */
  toggleAgendaList: ITeamMember | null

  /**
   * Update an agenda item
   */
  updateAgendaItem: IUpdateAgendaItemPayload | null

  /**
   * Update an existing credit card on file
   */
  updateCreditCard: IUpdateCreditCardPayload | null

  /**
   * Update an with a change in name, avatar
   */
  updateOrg: IUpdateOrgPayload

  /**
   * Update a Team's Check-in question
   */
  updateCheckInQuestion: IUpdateCheckInQuestionPayload | null

  /**
   * Update a Team's Check-in question in a new meeting
   */
  updateNewCheckInQuestion: IUpdateNewCheckInQuestionPayload | null

  /**
   * all the info required to provide an accurate display-specific location of where an item is
   */
  updateDragLocation: boolean | null

  /**
   * Update the content of a reflection
   */
  updateReflectionContent: IUpdateReflectionContentPayload | null

  /**
   * Update the title of a reflection group
   */
  updateReflectionGroupTitle: IUpdateReflectionGroupTitlePayload | null

  /**
   * Update a task with a change in content, ownership, or status
   */
  updateTask: IUpdateTaskPayload | null

  /**
   * Set or unset the due date of a task
   */
  updateTaskDueDate: IUpdateTaskDueDatePayload | null
  updateTeamName: IUpdateTeamNamePayload | null
  updateUserProfile: IUpdateUserProfilePayload | null

  /**
   * Cast your vote for a reflection group
   */
  voteForReflectionGroup: IVoteForReflectionGroupPayload | null

  /**
   * Log in, or sign up if it is a new user
   */
  login: ILoginPayload | null

  /**
   * Upgrade an account to the paid service
   */
  upgradeToPro: IUpgradeToProPayload | null

  /**
   * Add a new template full of prompts
   */
  addReflectTemplate: IAddReflectTemplatePayload | null

  /**
   * Add a new template full of prompts
   */
  addReflectTemplatePrompt: IAddReflectTemplatePromptPayload | null

  /**
   * Move a reflect template
   */
  moveReflectTemplatePrompt: IMoveReflectTemplatePromptPayload | null

  /**
   * Remove a template full of prompts
   */
  removeReflectTemplate: IRemoveReflectTemplatePayload | null

  /**
   * Remove a prompt from a template
   */
  removeReflectTemplatePrompt: IRemoveReflectTemplatePromptPayload | null

  /**
   * Rename a reflect template prompt
   */
  renameReflectTemplate: IRenameReflectTemplatePayload | null

  /**
   * Rename a reflect template
   */
  renameReflectTemplatePrompt: IRenameReflectTemplatePromptPayload | null
}

export interface IAcceptTeamInviteOnMutationArguments {
  /**
   * The invitation token (first 6 bytes are the id, next 8 are the pre-hash)
   */
  inviteToken?: string | null

  /**
   * The notification id of the team invite
   */
  notificationId?: string | null
}

export interface IAcceptTeamInvitationOnMutationArguments {
  /**
   * The 48-byte hex encoded invitation token
   */
  invitationToken: string

  /**
   * the notification clicked to accept, if any
   */
  notificationId?: string | null
}

export interface IAddAgendaItemOnMutationArguments {
  /**
   * The new task including an id, teamMemberId, and content
   */
  newAgendaItem: ICreateAgendaItemInput
}

export interface IAddFeatureFlagOnMutationArguments {
  /**
   * the complete or partial email of the person to whom you are giving advanced features.
   *       Matches via a regex to support entire domains
   */
  email: string

  /**
   * the flag that you want to give to the user
   */
  flag: UserFlagEnum
}

export interface IAddGitHubRepoOnMutationArguments {
  teamId: string
  nameWithOwner: string
}

export interface IAddOrgOnMutationArguments {
  /**
   * The new team object with exactly 1 team member
   */
  newTeam: INewTeamInput
  invitees?: Array<IInvitee> | null

  /**
   * The name of the new team
   */
  orgName?: string | null
}

export interface IAddProviderOnMutationArguments {
  code: string
  service: IntegrationService
  teamId: string
}

export interface IAddSlackChannelOnMutationArguments {
  input: IAddSlackChannelInput
}

export interface IAddTeamOnMutationArguments {
  /**
   * The new team object
   */
  newTeam: INewTeamInput
  invitees?: Array<IInvitee> | null
}

export interface IApproveToOrgOnMutationArguments {
  email: string
  orgId: string
}

export interface IArchiveTeamOnMutationArguments {
  /**
   * The teamId to archive (or delete, if team is unused)
   */
  teamId: string
}

export interface IAutoGroupReflectionsOnMutationArguments {
  meetingId: string

  /**
   * A number from 0 to 1 to determine how tightly to pack the groups. Higher means fewer groups
   */
  groupingThreshold: number
}

export interface ICancelApprovalOnMutationArguments {
  /**
   * org approval id to cancel
   */
  orgApprovalId: string
}

export interface ICancelTeamInviteOnMutationArguments {
  /**
   * The id of the invitation
   */
  invitationId: string
}

export interface IChangeTaskTeamOnMutationArguments {
  /**
   * The task to change
   */
  taskId: string

  /**
   * The new team to assign the task to
   */
  teamId: string
}

export interface IClearNotificationOnMutationArguments {
  /**
   * The id of the notification to remove
   */
  notificationId: string
}

export interface ICreateImposterTokenOnMutationArguments {
  /**
   * The target userId to impersonate
   */
  userId: string
}

export interface ICreateFirstTeamOnMutationArguments {
  /**
   * The new team object with exactly 1 team member
   */
  newTeam: INewTeamInput
}

export interface ICreateGitHubIssueOnMutationArguments {
  /**
   * The id of the task to convert to a GH issue
   */
  taskId: string

  /**
   * The owner/repo string
   */
  nameWithOwner: string
}

export interface ICreateOrgPicturePutUrlOnMutationArguments {
  /**
   * user-supplied MIME content type
   */
  contentType: string

  /**
   * user-supplied file size
   */
  contentLength: number

  /**
   * The organization id to update
   */
  orgId: string
}

export interface ICreateReflectionOnMutationArguments {
  input: ICreateReflectionInput
}

export interface ICreateReflectionGroupOnMutationArguments {
  meetingId: string

  /**
   * An array of 1 or 2 reflections that make up the group. The first card in the array will be used to determine sort order
   */
  reflectionIds: Array<string>
}

export interface ICreateTaskOnMutationArguments {
  /**
   * The new task including an id, status, and type, and teamMemberId
   */
  newTask: ICreateTaskInput

  /**
   * The part of the site where the creation occurred
   */
  area?: AreaEnum | null
}

export interface ICreateUserPicturePutUrlOnMutationArguments {
  /**
   * user-supplied MIME content type
   */
  contentType?: string | null

  /**
   * user-supplied file size
   */
  contentLength: number
}

export interface IDeleteTaskOnMutationArguments {
  /**
   * The taskId to delete
   */
  taskId: string
}

export interface IDowngradeToPersonalOnMutationArguments {
  /**
   * the org requesting the upgrade
   */
  orgId: string
}

export interface IDragDiscussionTopicOnMutationArguments {
  meetingId: string
  stageId: string
  sortOrder: number
}

export interface IEndDraggingReflectionOnMutationArguments {
  reflectionId: string

  /**
   * if it was a drop (isDragging = false), the type of item it was dropped on. null if there was no valid drop target
   */
  dropTargetType?: DragReflectionDropTargetTypeEnum | null

  /**
   * if dropTargetType could refer to more than 1 component, this ID defines which one
   */
  dropTargetId?: string | null

  /**
   * the ID of the drag to connect to the start drag event
   */
  dragId?: string | null
}

export interface IEditReflectionOnMutationArguments {
  phaseItemId: string

  /**
   * Whether a phaseItem is being edited or not
   */
  isEditing: boolean
}

export interface IEditTaskOnMutationArguments {
  /**
   * The task id that is being edited
   */
  taskId: string

  /**
   * true if the editing is starting, false if it is stopping
   */
  isEditing: boolean
}

export interface IEndMeetingOnMutationArguments {
  /**
   * The team that will be having the meeting
   */
  teamId: string
}

export interface IGithubAddAssigneeOnMutationArguments {
  /**
   * The github issue id
   */
  integrationId: string

  /**
   * The github login for the new assignee
   */
  assigneeLogin: string

  /**
   * The repo name and owner
   */
  nameWithOwner: string
}

export interface IGithubAddMemberOnMutationArguments {
  /**
   * The github login
   */
  userName: string

  /**
   * The github org login
   */
  orgName: string
}

export interface IGithubRemoveMemberOnMutationArguments {
  /**
   * The github login
   */
  userName: string

  /**
   * The github org login
   */
  orgName: string
}

export interface IInactivateUserOnMutationArguments {
  /**
   * the user to pause
   */
  userId: string
}

export interface IInviteTeamMembersOnMutationArguments {
  /**
   * The id of the inviting team
   */
  teamId: string
  invitees: Array<IInvitee>
}

export interface IInviteToTeamOnMutationArguments {
  /**
   * The id of the inviting team
   */
  teamId: string
  invitees: Array<any>
}

export interface IJoinIntegrationOnMutationArguments {
  /**
   * The global id of the integration to join
   */
  globalId: string
}

export interface IKillMeetingOnMutationArguments {
  /**
   * The team that will be having the meeting
   */
  teamId: string
}

export interface IEndNewMeetingOnMutationArguments {
  /**
   * The meeting to end
   */
  meetingId: string
}

export interface ILeaveIntegrationOnMutationArguments {
  /**
   * the id of the integration to remove
   */
  globalId: string
}

export interface IMeetingCheckInOnMutationArguments {
  /**
   * The global teamMemberId of the person who is being checked in
   */
  teamMemberId: string

  /**
   * true if the member is present, false if absent, null if undecided
   */
  isCheckedIn?: boolean | null
}

export interface IMoveMeetingOnMutationArguments {
  /**
   * The teamId to make sure the socket calling has permission
   */
  teamId: string

  /**
   * The desired phase for the meeting
   */
  nextPhase?: ActionMeetingPhaseEnum | null

  /**
   * The item within the phase to set the meeting to
   */
  nextPhaseItem?: number | null

  /**
   * If true, execute the mutation without regard for meeting flow
   */
  force?: boolean | null
}

export interface IMoveTeamToOrgOnMutationArguments {
  /**
   * The teamId that you want to move
   */
  teamId: string

  /**
   * The ID of the organization you want to move the team to
   */
  orgId: string
}

export interface INavigateMeetingOnMutationArguments {
  /**
   * The stage that the facilitator would like to mark as complete
   */
  completedStageId?: string | null

  /**
   * The stage where the facilitator is
   */
  facilitatorStageId?: string | null

  /**
   * The meeting ID
   */
  meetingId: string
}

export interface INewMeetingCheckInOnMutationArguments {
  /**
   * The id of the user being marked present or absent
   */
  userId: string

  /**
   * the meeting currently in progress
   */
  meetingId: string

  /**
   * true if the member is present, false if absent, null if undecided
   */
  isCheckedIn?: boolean | null
}

export interface IPromoteFacilitatorOnMutationArguments {
  /**
   * teamMemberId of the old facilitator, if they disconnected
   */
  disconnectedFacilitatorId?: string | null

  /**
   * teamMemberId of the new facilitator for this meeting
   */
  facilitatorId: string
}

export interface IPromoteNewMeetingFacilitatorOnMutationArguments {
  /**
   * userId of the new facilitator for this meeting
   */
  facilitatorUserId: string
  meetingId: string
}

export interface IPromoteToTeamLeadOnMutationArguments {
  /**
   * the new team member that will be the leader
   */
  teamMemberId: string
}

export interface IRejectOrgApprovalOnMutationArguments {
  /**
   * The notification to which the Billing Leader is responding
   */
  notificationId: string
  reason?: string | null
}

export interface IRemoveAgendaItemOnMutationArguments {
  /**
   * The agenda item unique id
   */
  agendaItemId: string
}

export interface IRemoveProviderOnMutationArguments {
  /**
   * The relay id of the service to remove
   */
  providerId: string

  /**
   * the teamId to disconnect from the token
   */
  teamId: string
}

export interface IRemoveSlackChannelOnMutationArguments {
  slackGlobalId: string
}

export interface IRemoveGitHubRepoOnMutationArguments {
  githubIntegrationId: string
}

export interface IRemoveOrgUserOnMutationArguments {
  /**
   * the user to remove
   */
  userId: string

  /**
   * the org that does not want them anymore
   */
  orgId: string
}

export interface IRemoveReflectionOnMutationArguments {
  reflectionId: string
}

export interface IRemoveTeamMemberOnMutationArguments {
  /**
   * The teamMemberId of the person who is being removed
   */
  teamMemberId: string
}

export interface IRequestFacilitatorOnMutationArguments {
  teamId: string
}

export interface IResendTeamInviteOnMutationArguments {
  /**
   * The id of the invitation
   */
  inviteId: string
}

export interface ISegmentEventTrackOnMutationArguments {
  event: string
  options?: ISegmentEventTrackOptions | null
}

export interface ISelectRetroTemplateOnMutationArguments {
  selectedTemplateId: string
  teamId: string
}

export interface ISetOrgUserRoleOnMutationArguments {
  /**
   * The org to affect
   */
  orgId: string

  /**
   * the user who is receiving a role change
   */
  userId: string

  /**
   * the user’s new role
   */
  role?: string | null
}

export interface ISetPhaseFocusOnMutationArguments {
  meetingId: string

  /**
   * The currently focused phase item
   */
  focusedPhaseItemId?: string | null
}

export interface IStartDraggingReflectionOnMutationArguments {
  reflectionId: string
  initialCoords: ICoords2DInput
}

export interface IStartMeetingOnMutationArguments {
  /**
   * The team starting the meeting
   */
  teamId: string
}

export interface IStartNewMeetingOnMutationArguments {
  /**
   * The team starting the meeting
   */
  teamId: string

  /**
   * The base type of the meeting (action, retro, etc)
   */
  meetingType: MeetingTypeEnum
}

export interface IStripeCreateInvoiceOnMutationArguments {
  /**
   * The stripe invoice ID
   */
  invoiceId: string
}

export interface IStripeFailPaymentOnMutationArguments {
  /**
   * The stripe invoice ID
   */
  invoiceId: string
}

export interface IStripeSucceedPaymentOnMutationArguments {
  /**
   * The stripe invoice ID
   */
  invoiceId: string
}

export interface IStripeUpdateCreditCardOnMutationArguments {
  /**
   * The stripe customer ID, or stripeId
   */
  customerId: string
}

export interface IStripeUpdateInvoiceItemOnMutationArguments {
  /**
   * The stripe invoice ID
   */
  invoiceItemId: string
}

export interface IToggleAgendaListOnMutationArguments {
  /**
   * the team to hide the agenda for
   */
  teamId: string
}

export interface IUpdateAgendaItemOnMutationArguments {
  /**
   * The updated item including an id, content, status, sortOrder
   */
  updatedAgendaItem: IUpdateAgendaItemInput
}

export interface IUpdateCreditCardOnMutationArguments {
  /**
   * the org requesting the changed billing
   */
  orgId: string

  /**
   * The token that came back from stripe
   */
  stripeToken: string
}

export interface IUpdateOrgOnMutationArguments {
  /**
   * the updated org including the id, and at least one other field
   */
  updatedOrg: IUpdateOrgInput
}

export interface IUpdateCheckInQuestionOnMutationArguments {
  /**
   * ID of the Team which will have its Check-in question updated
   */
  teamId: string

  /**
   * The Team's new Check-in question
   */
  checkInQuestion: string
}

export interface IUpdateNewCheckInQuestionOnMutationArguments {
  /**
   * ID of the Team which will have its Check-in question updated
   */
  meetingId: string

  /**
   * The Team's new Check-in question
   */
  checkInQuestion: string
}

export interface IUpdateDragLocationOnMutationArguments {
  input: IUpdateDragLocationInput
}

export interface IUpdateReflectionContentOnMutationArguments {
  reflectionId: string

  /**
   * A stringified draft-js document containing thoughts
   */
  content: string
}

export interface IUpdateReflectionGroupTitleOnMutationArguments {
  reflectionGroupId: string

  /**
   * The new title for the group
   */
  title: string
}

export interface IUpdateTaskOnMutationArguments {
  /**
   * The part of the site where the creation occurred
   */
  area?: AreaEnum | null

  /**
   * the updated task including the id, and at least one other field
   */
  updatedTask: IUpdateTaskInput
}

export interface IUpdateTaskDueDateOnMutationArguments {
  /**
   * The task id
   */
  taskId: string

  /**
   * the new due date. if not a valid date, it will unset the due date
   */
  dueDate?: any | null
}

export interface IUpdateTeamNameOnMutationArguments {
  /**
   * The input object containing the teamId and any modified fields
   */
  updatedTeam: IUpdatedTeamInput
}

export interface IUpdateUserProfileOnMutationArguments {
  /**
   * The input object containing the user profile fields that can be changed
   */
  updatedUser: IUpdateUserProfileInput
}

export interface IVoteForReflectionGroupOnMutationArguments {
  /**
   * true if the user wants to remove one of their votes
   */
  isUnvote?: boolean | null
  reflectionGroupId: string
}

export interface ILoginOnMutationArguments {
  /**
   * The ID Token from auth0, a base64 JWT
   */
  auth0Token: string
}

export interface IUpgradeToProOnMutationArguments {
  /**
   * the org requesting the upgrade
   */
  orgId: string

  /**
   * The token that came back from stripe
   */
  stripeToken: string
}

export interface IAddReflectTemplateOnMutationArguments {
  teamId: string
}

export interface IAddReflectTemplatePromptOnMutationArguments {
  templateId: string
}

export interface IMoveReflectTemplatePromptOnMutationArguments {
  promptId: string
  sortOrder: string
}

export interface IRemoveReflectTemplateOnMutationArguments {
  templateId: string
}

export interface IRemoveReflectTemplatePromptOnMutationArguments {
  promptId: string
}

export interface IRenameReflectTemplateOnMutationArguments {
  templateId: string
  name: string
}

export interface IRenameReflectTemplatePromptOnMutationArguments {
  promptId: string
  question: string
}

export interface IAcceptTeamInvitePayload {
  __typename: 'AcceptTeamInvitePayload'

  /**
   * The new JWT
   */
  authToken: string | null
  error: IStandardMutationError | null

  /**
   * The team that the invitee will be joining
   */
  team: ITeam | null

  /**
   * The new team member on the team
   */
  teamMember: ITeamMember | null

  /**
   * The invite notification removed once accepted
   */
  removedNotification: INotifyTeamInvite | null

  /**
   * The invitation the viewer just accepted
   */
  removedInvitation: IInvitation | null
  user: IUser | null

  /**
   * The soft team member that got promoted to a real team member
   */
  removedSoftTeamMember: ISoftTeamMember | null

  /**
   * The tasks that got reassigned from the soft team member to the real team member
   */
  hardenedTasks: Array<ITask | null> | null
}

export interface IStandardMutationError {
  __typename: 'StandardMutationError'

  /**
   * The title of the error
   */
  title: string

  /**
   * The full error
   */
  message: string
}

/**
 * A notification sent to a user that was invited to a new team
 */
export interface INotifyTeamInvite {
  __typename: 'NotifyTeamInvite'

  /**
   * The user that triggered the invitation
   */
  inviter: IUser
  team: ITeam

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export interface IAcceptTeamInvitationPayload {
  __typename: 'AcceptTeamInvitationPayload'
  error: IStandardMutationError | null

  /**
   * The team that the invitee will be joining
   */
  team: ITeam | null

  /**
   * The new team member on the team
   */
  teamMember: ITeamMember | null

  /**
   * The invite notifications that are no longer necessary
   */
  removedNotificationIds: Array<string> | null
}

export interface ICreateAgendaItemInput {
  /**
   * The content of the agenda item
   */
  content: string
  teamId: string

  /**
   * The team member ID of the person creating the agenda item
   */
  teamMemberId: string

  /**
   * The sort order of the agenda item in the list
   */
  sortOrder?: number | null
}

export interface IAddAgendaItemPayload {
  __typename: 'AddAgendaItemPayload'
  agendaItem: IAgendaItem | null
  error: IStandardMutationError | null
}

/**
 * A flag to give an individual user super powers
 */
export const enum UserFlagEnum {
  retro = 'retro'
}

export interface IAddFeatureFlagPayload {
  __typename: 'AddFeatureFlagPayload'
  error: IStandardMutationError | null

  /**
   * the user that was given the super power. Use users instead in GraphiQL since it may affect multiple users
   */
  user: IUser | null

  /**
   * the users given the super power
   */
  users: Array<IUser | null> | null

  /**
   * A human-readable result
   */
  result: string | null
}

export interface IAddGitHubRepoPayload {
  __typename: 'AddGitHubRepoPayload'
  error: IStandardMutationError | null
  repo: IGitHubIntegration
}

export interface INewTeamInput {
  /**
   * The name of the team
   */
  name?: string | null

  /**
   * The unique orginization ID that pays for the team
   */
  orgId?: string | null
}

/**
 * The email and task of an invited team member
 */
export interface IInvitee {
  /**
   * The email address of the invitee
   */
  email: any

  /**
   * The name derived from an RFC5322 email string
   */
  fullName?: string | null

  /**
   * The current task the invitee is working on
   */
  task?: string | null
}

export interface IAddOrgPayload {
  __typename: 'AddOrgPayload'
  organization: IOrganization | null
  error: IStandardMutationError | null
  team: ITeam | null

  /**
   * The teamMember that just created the new team, if this is a creation
   */
  teamMember: ITeamMember | null
  invitations: Array<IInvitation | null> | null

  /**
   * The invitation sent when an team was being created
   */
  teamInviteNotification: INotifyTeamInvite | null
}

export interface IAddProviderPayload {
  __typename: 'AddProviderPayload'
  error: IStandardMutationError | null
  providerRow: IProviderRow | null
  provider: IProvider | null

  /**
   * All the integrationIds that the provider has successfully joined
   */
  joinedIntegrationIds: Array<string> | null
  teamMember: ITeamMember | null
}

export interface IAddSlackChannelInput {
  /**
   * The id of the teamMember calling it.
   */
  teamMemberId: string

  /**
   * the slack channel that wants our messages
   */
  slackChannelId: string
}

export interface IAddSlackChannelPayload {
  __typename: 'AddSlackChannelPayload'
  error: IStandardMutationError | null
  channel: ISlackIntegration
}

export interface IAddTeamPayload {
  __typename: 'AddTeamPayload'
  error: IStandardMutationError | null
  team: ITeam | null

  /**
   * The teamMember that just created the new team, if this is a creation
   */
  teamMember: ITeamMember | null
  invitations: Array<IInvitation | null> | null

  /**
   * The invitation sent when an team was being created
   */
  teamInviteNotification: INotifyTeamInvite | null
}

export interface IApproveToOrgPayload {
  __typename: 'ApproveToOrgPayload'
  error: IStandardMutationError | null

  /**
   * If the viewer is an org leader, the notifications removed after approving to the organization
   */
  removedRequestNotifications: Array<INotifyRequestNewUser> | null

  /**
   * If the viegnwer is a team member, the org approvals that were removed in place of team members
   */
  removedOrgApprovals: Array<IOrgApproval> | null

  /**
   * If the viewer is a team member, the list of team members added as a result of the approval
   */
  newInvitations: Array<IInvitation> | null

  /**
   * If the viewer invited the invitee, the notifications to say they have been approved
   */
  inviteeApprovedNotifications: Array<INotifyInviteeApproved> | null

  /**
   * If the viewer is the invitee, the notifications to invite them to teams
   */
  teamInviteNotifications: Array<INotifyTeamInvite> | null
}

/**
 * A notification sent to a user when the person they invited got approved by the org leader
 */
export interface INotifyInviteeApproved {
  __typename: 'NotifyInviteeApproved'

  /**
   * The email of the person being invited
   */
  inviteeEmail: string

  /**
   * The user that triggered the invitation
   */
  inviter: IUser | null
  team: ITeam

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export interface IArchiveTeamPayload {
  __typename: 'ArchiveTeamPayload'
  error: IStandardMutationError | null
  team: ITeam | null

  /**
   * A notification explaining that the team was archived and removed from view
   */
  notification: INotifyTeamArchived | null
  removedTeamNotifications: Array<TeamNotification | null> | null
}

/**
 * A notification alerting the user that a team they were on is now archived
 */
export interface INotifyTeamArchived {
  __typename: 'NotifyTeamArchived'
  team: ITeam

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export type TeamRemovedNotification = INotifyTeamArchived | INotifyKickedOut

export interface ITeamRemovedNotification {
  __typename: 'TeamRemovedNotification'

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export interface IAutoGroupReflectionsPayload {
  __typename: 'AutoGroupReflectionsPayload'
  error: IStandardMutationError | null
  meeting: IRetrospectiveMeeting | null
  reflections: Array<IRetroReflection | null> | null
  reflectionGroups: Array<IRetroReflectionGroup | null> | null
  removedReflectionGroups: Array<IRetroReflectionGroup | null> | null
}

/**
 * A retrospective meeting
 */
export interface IRetrospectiveMeeting {
  __typename: 'RetrospectiveMeeting'

  /**
   * The unique meeting id. shortid.
   */
  id: string

  /**
   * The timestamp the meeting was created
   */
  createdAt: any | null

  /**
   * The timestamp the meeting officially ended
   */
  endedAt: any | null

  /**
   * The location of the facilitator in the meeting
   */
  facilitatorStageId: string

  /**
   * The userId (or anonymousId) of the most recent facilitator
   */
  facilitatorUserId: string

  /**
   * The facilitator user
   */
  facilitator: IUser

  /**
   * The team members that were active during the time of the meeting
   */
  meetingMembers: Array<MeetingMember | null> | null

  /**
   * The auto-incrementing meeting number for the team
   */
  meetingNumber: number
  meetingType: MeetingTypeEnum

  /**
   * The phases the meeting will go through, including all phase-specific state
   */
  phases: Array<NewMeetingPhase>

  /**
   * The time the meeting summary was emailed to the team
   */
  summarySentAt: any | null

  /**
   * foreign key for team
   */
  teamId: string

  /**
   * The team that ran the meeting
   */
  team: ITeam

  /**
   * The last time a meeting was updated (stage completed, finished, etc)
   */
  updatedAt: any | null

  /**
   * The retrospective meeting member of the viewer
   */
  viewerMeetingMember: IRetrospectiveMeetingMember

  /**
   * the threshold used to achieve the autogroup. Useful for model tuning. Serves as a flag if autogroup was used.
   */
  autoGroupThreshold: number | null

  /**
   * the next smallest distance threshold to guarantee at least 1 more grouping will be achieved
   */
  nextAutoGroupThreshold: number | null

  /**
   * The grouped reflections
   */
  reflectionGroups: Array<IRetroReflectionGroup>

  /**
   * The settings that govern the retrospective meeting
   */
  settings: IRetrospectiveMeetingSettings

  /**
   * The tasks created within the meeting
   */
  tasks: Array<ITask>

  /**
   * The sum total of the votes remaining for the meeting members that are present in the meeting
   */
  votesRemaining: number
}

export interface IReflectionGroupsOnRetrospectiveMeetingArguments {
  sortBy?: ReflectionGroupSortEnum | null
}

/**
 * All the meeting specifics for a user in a retro meeting
 */
export interface IRetrospectiveMeetingMember {
  __typename: 'RetrospectiveMeetingMember'

  /**
   * A composite of userId::meetingId
   */
  id: string

  /**
   * true if present, false if absent, else null
   */
  isCheckedIn: boolean | null
  meetingId: string | null
  meetingType: MeetingTypeEnum
  teamId: string | null
  user: IUser | null
  userId: string | null

  /**
   * The last time a meeting was updated (stage completed, finished, etc)
   */
  updatedAt: any | null

  /**
   * The tasks assigned to members during the meeting
   */
  tasks: Array<ITask>
  votesRemaining: number
}

/**
 * sorts for the reflection group. default is sortOrder. sorting by voteCount filters out items without votes.
 */
export const enum ReflectionGroupSortEnum {
  voteCount = 'voteCount'
}

/**
 * A reflection created during the reflect phase of a retrospective
 */
export interface IRetroReflectionGroup {
  __typename: 'RetroReflectionGroup'

  /**
   * shortid
   */
  id: string

  /**
   * The timestamp the meeting was created
   */
  createdAt: any | null

  /**
   * True if the group has not been removed, else false
   */
  isActive: boolean | null

  /**
   * The foreign key to link a reflection group to its meeting
   */
  meetingId: string

  /**
   * The retrospective meeting this reflection was created in
   */
  meeting: IRetrospectiveMeeting | null
  phaseItem: IRetroPhaseItem | null
  reflections: Array<IRetroReflection>

  /**
   * The foreign key to link a reflection group to its phaseItem. Immutable.
   */
  retroPhaseItemId: string

  /**
   * Our auto-suggested title, to be compared to the actual title for analytics
   */
  smartTitle: string | null

  /**
   * The sort order of the reflection group in the phase item
   */
  sortOrder: number

  /**
   * The tasks created for this group in the discussion phase
   */
  tasks: Array<ITask>

  /**
   * The team that is running the retro
   */
  team: ITeam | null

  /**
   * The title of the grouping of the retrospective reflections
   */
  title: string | null

  /**
   * true if a user wrote the title, else false
   */
  titleIsUserDefined: boolean | null

  /**
   * The timestamp the meeting was updated at
   */
  updatedAt: any | null

  /**
   * A list of voterIds (userIds). Not available to team to preserve anonymity
   */
  voterIds: Array<string>

  /**
   * The number of votes this group has received
   */
  voteCount: number | null

  /**
   * The number of votes the viewer has given this group
   */
  viewerVoteCount: number | null
}

/**
 * A team-specific retro phase. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.
 */
export interface IRetroPhaseItem {
  __typename: 'RetroPhaseItem'

  /**
   * shortid
   */
  id: string
  createdAt: any

  /**
   * The type of phase item
   */
  phaseItemType: CustomPhaseItemTypeEnum | null

  /**
   * true if the phase item is currently used by the team, else false
   */
  isActive: boolean | null

  /**
   * foreign key. use the team field
   */
  teamId: string

  /**
   * The team that owns this customPhaseItem
   */
  team: ITeam | null
  updatedAt: any

  /**
   * the order of the items in the template
   */
  sortOrder: number

  /**
   * FK for template
   */
  templateId: string

  /**
   * The template that this prompt belongs to
   */
  template: IReflectTemplate

  /**
   * The title of the phase of the retrospective. Often a short version of the question
   */
  title: string

  /**
   * The question to answer during the phase of the retrospective (eg What went well?)
   */
  question: string
}

/**
 * The team-specific templates for the reflection prompts
 */
export interface IReflectTemplate {
  __typename: 'ReflectTemplate'
  id: string
  createdAt: any

  /**
   * True if template can be used, else false
   */
  isActive: boolean

  /**
   * The time of the meeting the template was last used
   */
  lastUsedAt: any | null

  /**
   * The name of the template
   */
  name: string

  /**
   * The prompts that are part of this template
   */
  prompts: Array<IRetroPhaseItem>

  /**
   * *Foreign key. The team this template belongs to
   */
  teamId: string
  updatedAt: any
}

/**
 * A reflection created during the reflect phase of a retrospective
 */
export interface IRetroReflection {
  __typename: 'RetroReflection'

  /**
   * shortid
   */
  id: string

  /**
   * The ID of the group that the autogrouper assigned the reflection. Error rate = Sum(autoId != Id) / autoId.count()
   */
  autoReflectionGroupId: string | null

  /**
   * The timestamp the meeting was created
   */
  createdAt: any | null

  /**
   * The userId that created the reflection (or unique Id if not a team member)
   */
  creatorId: string | null

  /**
   * all the info associated with the drag state, if this reflection is currently being dragged
   */
  dragContext: IDragContext | null

  /**
   * an array of all the socketIds that are currently editing the reflection
   */
  editorIds: Array<string>

  /**
   * True if the reflection was not removed, else false
   */
  isActive: boolean | null

  /**
   * true if the reflection is being edited, else false
   */
  isEditing: boolean | null

  /**
   * true if the viewer (userId) is the creator of the retro reflection, else false
   */
  isViewerCreator: boolean | null

  /**
   * The stringified draft-js content
   */
  content: string

  /**
   * The entities (i.e. nouns) parsed from the content and their respective salience
   */
  entities: Array<IGoogleAnalyzedEntity>

  /**
   * The foreign key to link a reflection to its meeting
   */
  meetingId: string

  /**
   * The retrospective meeting this reflection was created in
   */
  meeting: IRetrospectiveMeeting | null
  phaseItem: IRetroPhaseItem

  /**
   * The foreign key to link a reflection to its phaseItem. Immutable. For sorting, use phase item on the group.
   */
  retroPhaseItemId: string

  /**
   * The foreign key to link a reflection to its group
   */
  reflectionGroupId: string | null

  /**
   * The group the reflection belongs to, if any
   */
  retroReflectionGroup: IRetroReflectionGroup | null

  /**
   * The sort order of the reflection in the group (increments starting from 0)
   */
  sortOrder: number

  /**
   * The team that is running the meeting that contains this reflection
   */
  team: IRetrospectiveMeeting | null

  /**
   * The timestamp the meeting was updated. Used to determine how long it took to write a reflection
   */
  updatedAt: any | null
}

/**
 * Info associated with a current drag
 */
export interface IDragContext {
  __typename: 'DragContext'
  id: string | null

  /**
   * The userId of the person currently dragging the reflection
   */
  dragUserId: string | null

  /**
   * The user that is currently dragging the reflection
   */
  dragUser: IUser | null

  /**
   * The coordinates necessary to simulate a drag for a subscribing user
   */
  dragCoords: ICoords2D | null
}

/**
 * Coordinates used relay a location in a 2-D plane
 */
export interface ICoords2D {
  __typename: 'Coords2D'
  x: number
  y: number
}

export interface IGoogleAnalyzedEntity {
  __typename: 'GoogleAnalyzedEntity'

  /**
   * The lemma (dictionary entry) of the entity name. Fancy way of saying the singular form of the name, if plural.
   */
  lemma: string

  /**
   * The name of the entity. Usually 1 or 2 words. Always a noun, sometimes a proper noun.
   */
  name: string

  /**
   * The salience of the entity in the provided text. The salience of all entities always sums to 1
   */
  salience: number
}

/**
 * The retro-specific meeting settings
 */
export interface IRetrospectiveMeetingSettings {
  __typename: 'RetrospectiveMeetingSettings'
  id: string

  /**
   * The type of meeting these settings apply to
   */
  meetingType: MeetingTypeEnum | null

  /**
   * The broad phase types that will be addressed during the meeting
   */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>

  /**
   * FK
   */
  teamId: string

  /**
   * The team these settings belong to
   */
  team: ITeam | null

  /**
   * the team-specific questions to ask during a retro
   */
  phaseItems: Array<CustomPhaseItem> | null

  /**
   * The total number of votes each team member receives for the voting phase
   */
  totalVotes: number

  /**
   * The maximum number of votes a team member can vote for a single reflection group
   */
  maxVotesPerGroup: number

  /**
   * FK. The template that will be used to start the retrospective
   */
  selectedTemplateId: string

  /**
   * The list of templates used to start a retrospective
   */
  reflectTemplates: Array<IReflectTemplate>
}

export interface ICancelApprovalPayload {
  __typename: 'CancelApprovalPayload'
  error: IStandardMutationError | null

  /**
   * The inactivated org approval
   */
  orgApproval: IOrgApproval | null

  /**
   * The notification requesting org approval to the org leader
   */
  removedRequestNotification: INotifyRequestNewUser | null

  /**
   * The soft team members that are no longer tentatively on the team
   */
  removedSoftTeamMember: ISoftTeamMember | null

  /**
   * The tasks that belonged to the soft team member
   */
  archivedSoftTasks: Array<ITask | null> | null
}

export interface ICancelTeamInvitePayload {
  __typename: 'CancelTeamInvitePayload'
  error: IStandardMutationError | null

  /**
   * The cancelled invitation
   */
  invitation: IInvitation | null
  removedTeamInviteNotification: INotifyTeamInvite | null

  /**
   * The soft team members that are no longer tentatively on the team
   */
  removedSoftTeamMember: ISoftTeamMember | null

  /**
   * The tasks that belonged to the soft team member
   */
  archivedSoftTasks: Array<ITask | null> | null
}

export interface IChangeTaskTeamPayload {
  __typename: 'ChangeTaskTeamPayload'
  error: IStandardMutationError | null
  task: ITask | null
  removedNotification: INotifyTaskInvolves | null

  /**
   * the taskId sent to a user who is not on the new team so they can remove it from their client
   */
  removedTaskId: string | null
}

/**
 * A notification sent to someone who was just added to a team
 */
export interface INotifyTaskInvolves {
  __typename: 'NotifyTaskInvolves'

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null

  /**
   * How the user is affiliated with the task
   */
  involvement: TaskInvolvementType | null

  /**
   * The taskId that now involves the userId
   */
  taskId: string

  /**
   * The task that now involves the userId
   */
  task: ITask | null

  /**
   * The teamMemberId of the person that made the change
   */
  changeAuthorId: string | null

  /**
   * The TeamMember of the person that made the change
   */
  changeAuthor: ITeamMember | null
  teamId: string

  /**
   * The team the task is on
   */
  team: ITeam
}

/**
 * How a user is involved with a task (listed in hierarchical order)
 */
export const enum TaskInvolvementType {
  ASSIGNEE = 'ASSIGNEE',
  MENTIONEE = 'MENTIONEE'
}

export interface IClearNotificationPayload {
  __typename: 'ClearNotificationPayload'
  error: IStandardMutationError | null

  /**
   * The deleted notifcation
   */
  notification: Notification | null
}

export interface ICreateImposterTokenPayload {
  __typename: 'CreateImposterTokenPayload'
  error: IStandardMutationError | null

  /**
   * The new JWT
   */
  authToken: string | null

  /**
   * The user you have assumed
   */
  user: IUser | null
}

export interface ICreateFirstTeamPayload {
  __typename: 'CreateFirstTeamPayload'
  error: IStandardMutationError | null
  team: ITeam | null
  teamLead: ITeamMember | null

  /**
   * The new JWT after adding the team
   */
  jwt: string | null
  user: IUser | null
}

export interface ICreateGitHubIssuePayload {
  __typename: 'CreateGitHubIssuePayload'
  error: IStandardMutationError | null
  task: ITask | null
}

export interface ICreatePicturePutUrlPayload {
  __typename: 'CreatePicturePutUrlPayload'
  error: IStandardMutationError | null
  url: any | null
}

export interface ICreateReflectionInput {
  /**
   * A stringified draft-js document containing thoughts
   */
  content?: string | null

  /**
   * The phase item the reflection belongs to
   */
  retroPhaseItemId: string
  sortOrder: number
}

export interface ICreateReflectionPayload {
  __typename: 'CreateReflectionPayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null
  reflection: IRetroReflection | null

  /**
   * The group automatically created for the reflection
   */
  reflectionGroup: IRetroReflectionGroup | null

  /**
   * The stages that were unlocked by navigating
   */
  unlockedStages: Array<NewMeetingStage> | null
}

export interface ICreateReflectionGroupPayload {
  __typename: 'CreateReflectionGroupPayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null
  reflectionGroup: IRetroReflectionGroup | null
}

export interface ICreateTaskInput {
  /**
   * foreign key for AgendaItem
   */
  agendaId?: string | null
  content?: string | null

  /**
   * foreign key for the meeting this was created in
   */
  meetingId?: string | null

  /**
   * foreign key for the reflection group this was created from
   */
  reflectionGroupId?: string | null
  sortOrder?: number | null
  status?: TaskStatusEnum | null

  /**
   * teamId, the team the task is on
   */
  teamId?: string | null

  /**
   * userId, the owner of the task
   */
  userId?: string | null
}

/**
 * The part of the site that is calling the mutation
 */
export const enum AreaEnum {
  meeting = 'meeting',
  teamDash = 'teamDash',
  userDash = 'userDash'
}

export interface ICreateTaskPayload {
  __typename: 'CreateTaskPayload'
  error: IStandardMutationError | null
  task: ITask | null
  involvementNotification: INotifyTaskInvolves | null
}

export interface ICreateUserPicturePutUrlPayload {
  __typename: 'CreateUserPicturePutUrlPayload'
  error: IStandardMutationError | null
  url: any | null
}

export interface IDeleteTaskPayload {
  __typename: 'DeleteTaskPayload'
  error: IStandardMutationError | null

  /**
   * The task that was deleted
   */
  task: ITask | null

  /**
   * The notification stating that the viewer was mentioned or assigned
   */
  involvementNotification: INotifyTaskInvolves | null
}

export interface IDisconnectSocketPayload {
  __typename: 'DisconnectSocketPayload'

  /**
   * The user that disconnected
   */
  user: IUser | null
}

export interface IDowngradeToPersonalPayload {
  __typename: 'DowngradeToPersonalPayload'
  error: IStandardMutationError | null

  /**
   * The new Personal Org
   */
  organization: IOrganization | null

  /**
   * The updated teams under the org
   */
  teams: Array<ITeam | null> | null
}

export interface IDragDiscussionTopicPayload {
  __typename: 'DragDiscussionTopicPayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null
  stage: IRetroDiscussStage | null
}

/**
 * The stage where the team discusses a single theme
 */
export interface IRetroDiscussStage {
  __typename: 'RetroDiscussStage'

  /**
   * shortid
   */
  id: string

  /**
   * The datetime the stage was completed
   */
  endAt: any | null

  /**
   * foreign key. try using meeting
   */
  meetingId: string

  /**
   * The meeting this stage belongs to
   */
  meeting: NewMeeting | null

  /**
   * true if the facilitator has completed this stage, else false. Should be boolean(endAt)
   */
  isComplete: boolean | null

  /**
   * true if any meeting participant can navigate to this stage
   */
  isNavigable: boolean | null

  /**
   * true if the facilitator can navigate to this stage
   */
  isNavigableByFacilitator: boolean | null

  /**
   * The phase this stage belongs to
   */
  phase: NewMeetingPhase | null

  /**
   * The type of the phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null

  /**
   * The datetime the stage was started
   */
  startAt: any | null

  /**
   * Number of times the facilitator has visited this stage
   */
  viewCount: number | null

  /**
   * foreign key. use reflectionGroup
   */
  reflectionGroupId: string | null

  /**
   * the group that is the focal point of the discussion
   */
  reflectionGroup: IRetroReflectionGroup | null

  /**
   * The sort order for reprioritizing discussion topics
   */
  sortOrder: number
}

/**
 * The possible places a reflection can be dropped
 */
export const enum DragReflectionDropTargetTypeEnum {
  REFLECTION_GROUP = 'REFLECTION_GROUP',
  REFLECTION_GRID = 'REFLECTION_GRID'
}

export interface IEndDraggingReflectionPayload {
  __typename: 'EndDraggingReflectionPayload'
  error: IStandardMutationError | null
  dragId: string | null

  /**
   * the type of item the reflection was dropped on
   */
  dropTargetType: DragReflectionDropTargetTypeEnum | null

  /**
   * The ID that the dragged item was dropped on, if dropTargetType is not specific enough
   */
  dropTargetId: string | null
  meeting: IRetrospectiveMeeting | null
  meetingId: string | null
  reflection: IRetroReflection | null
  reflectionGroupId: string | null
  reflectionId: string | null

  /**
   * foreign key to get user
   */
  userId: string | null

  /**
   * The group encapsulating the new reflection. A new one was created if one was not provided.
   */
  reflectionGroup: IRetroReflectionGroup | null

  /**
   * The old group the reflection was in
   */
  oldReflectionGroup: IRetroReflectionGroup | null
}

export interface IEditReflectionPayload {
  __typename: 'EditReflectionPayload'
  error: IStandardMutationError | null
  phaseItemId: string | null

  /**
   * The socketId of the client editing the card (uses socketId to maintain anonymity)
   */
  editorId: string | null

  /**
   * true if the reflection is being edited, else false
   */
  isEditing: boolean | null
}

export interface IEditTaskPayload {
  __typename: 'EditTaskPayload'
  error: IStandardMutationError | null
  task: ITask | null
  editor: IUser | null

  /**
   * true if the editor is editing, false if they stopped editing
   */
  isEditing: boolean | null
}

export interface IEndMeetingPayload {
  __typename: 'EndMeetingPayload'
  error: IStandardMutationError | null
  team: ITeam | null

  /**
   * The list of tasks that were archived during the meeting
   */
  archivedTasks: Array<ITask | null> | null
  meeting: IMeeting | null
}

export interface IInactivateUserPayload {
  __typename: 'InactivateUserPayload'
  error: IStandardMutationError | null

  /**
   * The user that has been inactivated
   */
  user: IUser | null
}

/**
 * A list of all the possible outcomes when trying to invite a team member
 */
export interface IInviteTeamMembersPayload {
  __typename: 'InviteTeamMembersPayload'
  error: IStandardMutationError | null

  /**
   * The team the inviter is inviting the invitee to
   */
  team: ITeam | null

  /**
   * The notification sent to the invitee if they were previously on the team
   */
  reactivationNotification: INotifyAddedToTeam | null

  /**
   * The notification sent to the invitee
   */
  teamInviteNotification: INotifyTeamInvite | null

  /**
   * A removed request notification if the org leader invited the invitee instead of approving
   */
  removedRequestNotification: INotifyRequestNewUser | null

  /**
   * The notification sent to the org billing leader requesting to be approved
   */
  requestNotification: INotifyRequestNewUser | null

  /**
   * The list of emails that turned out to be reactivated team members
   */
  reactivatedTeamMembers: Array<ITeamMember> | null

  /**
   * The list of invitations successfully sent out
   */
  invitationsSent: Array<IInvitation> | null

  /**
   * The list of orgApprovals sent to the org leader
   */
  orgApprovalsSent: Array<IOrgApproval> | null

  /**
   * The list of orgApprovals removed. Triggered if An org leader invites someone with a pending approval
   */
  orgApprovalsRemoved: Array<IOrgApproval> | null

  /**
   * The new invitees who have yet to accept the invite or get approved to receive an invite
   */
  newSoftTeamMembers: Array<ISoftTeamMember> | null

  /**
   * Any tasks that were recently assigned to a reactivated soft team member
   */
  unarchivedSoftTasks: Array<ITask> | null
}

/**
 * A notification sent to someone who was just added to a team
 */
export interface INotifyAddedToTeam {
  __typename: 'NotifyAddedToTeam'

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null

  /**
   * The new auth token for the user.
   */
  authToken: string | null

  /**
   * The team the invitee is being invited to
   */
  team: ITeam

  /**
   * The name of the team the user is joining
   */
  teamName: string

  /**
   * The teamId the user is joining
   */
  teamId: string
}

export interface IInviteToTeamPayload {
  __typename: 'InviteToTeamPayload'
  error: IStandardMutationError | null

  /**
   * The team the inviter is inviting the invitee to
   */
  team: ITeam | null

  /**
   * A list of email addresses the invitations were sent to
   */
  invitees: Array<any> | null

  /**
   * the notification ID if this payload is sent to a subscriber, else null
   */
  teamInvitationNotificationId: string | null

  /**
   * The notification sent to the invitee if they are a parabol user
   */
  teamInvitationNotification: INotificationTeamInvitation | null
}

/**
 * A notification sent to a user that was invited to a new team
 */
export interface INotificationTeamInvitation {
  __typename: 'NotificationTeamInvitation'

  /**
   * FK
   */
  teamId: string

  /**
   * FK
   */
  invitationId: string

  /**
   * The invitation that triggered this notification
   */
  invitation: ITeamInvitation
  team: ITeam

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export interface IJoinIntegrationPayload {
  __typename: 'JoinIntegrationPayload'
  error: IStandardMutationError | null

  /**
   * The globalId of the integration with a removed member
   */
  globalId: string
  teamMember: ITeamMember
}

export interface IKillMeetingPayload {
  __typename: 'KillMeetingPayload'
  error: IStandardMutationError | null
  team: ITeam | null
}

export interface IEndNewMeetingPayload {
  __typename: 'EndNewMeetingPayload'
  error: IStandardMutationError | null

  /**
   * true if the meeting was killed (ended before reaching last stage)
   */
  isKill: boolean | null
  team: ITeam | null
  meeting: NewMeeting | null
}

export interface ILeaveIntegrationPayload {
  __typename: 'LeaveIntegrationPayload'
  error: IStandardMutationError | null

  /**
   * The globalId of the integration with a removed member
   */
  globalId: string

  /**
   * The global userId of the viewer that left. if null, remove the entire integration
   */
  userId: string | null

  /**
   * The list of tasks removed triggered by a removed repo if this was the last viewer on the repo
   */
  archivedTaskIds: Array<string | null> | null
}

export interface IMeetingCheckInPayload {
  __typename: 'MeetingCheckInPayload'
  error: IStandardMutationError | null
  teamMember: ITeamMember | null
}

export interface IMoveMeetingPayload {
  __typename: 'MoveMeetingPayload'
  error: IStandardMutationError | null
  team: ITeam | null

  /**
   * The agendaItem completed, if any
   */
  completedAgendaItem: IAgendaItem | null
}

export interface INavigateMeetingPayload {
  __typename: 'NavigateMeetingPayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null

  /**
   * The stage that the facilitator is now on
   */
  facilitatorStage: NewMeetingStage | null

  /**
   * The stage that the facilitator left
   */
  oldFacilitatorStage: NewMeetingStage | null

  /**
   * Additional details triggered by completing certain phases
   */
  phaseComplete: IPhaseCompletePayload | null

  /**
   * The stages that were unlocked by navigating
   */
  unlockedStages: Array<NewMeetingStage> | null
}

export interface IPhaseCompletePayload {
  __typename: 'PhaseCompletePayload'

  /**
   * payload provided if the retro reflect phase was completed
   */
  reflect: IReflectPhaseCompletePayload | null

  /**
   * payload provided if the retro grouping phase was completed
   */
  group: IGroupPhaseCompletePayload | null

  /**
   * payload provided if the retro voting phase was completed
   */
  vote: IVotePhaseCompletePayload | null
}

export interface IReflectPhaseCompletePayload {
  __typename: 'ReflectPhaseCompletePayload'

  /**
   * a list of empty reflection groups to remove
   */
  emptyReflectionGroupIds: Array<string | null> | null
}

export interface IGroupPhaseCompletePayload {
  __typename: 'GroupPhaseCompletePayload'

  /**
   * the current meeting
   */
  meeting: IRetrospectiveMeeting

  /**
   * a list of updated reflection groups
   */
  reflectionGroups: Array<IRetroReflectionGroup | null> | null
}

export interface IVotePhaseCompletePayload {
  __typename: 'VotePhaseCompletePayload'

  /**
   * the current meeting
   */
  meeting: IRetrospectiveMeeting | null
}

export interface INewMeetingCheckInPayload {
  __typename: 'NewMeetingCheckInPayload'
  error: IStandardMutationError | null
  meetingMember: MeetingMember | null
  meeting: NewMeeting | null
}

export interface IPromoteFacilitatorPayload {
  __typename: 'PromoteFacilitatorPayload'
  error: IStandardMutationError | null

  /**
   * Thea team currently running a meeting
   */
  team: ITeam | null

  /**
   * The new meeting facilitator
   */
  newFacilitator: ITeamMember | null

  /**
   * The team member that disconnected
   */
  disconnectedFacilitator: ITeamMember | null
}

export interface IPromoteNewMeetingFacilitatorPayload {
  __typename: 'PromoteNewMeetingFacilitatorPayload'
  error: IStandardMutationError | null

  /**
   * The meeting in progress
   */
  meeting: NewMeeting | null

  /**
   * The old meeting facilitator
   */
  oldFacilitator: IUser | null
}

export interface IPromoteToTeamLeadPayload {
  __typename: 'PromoteToTeamLeadPayload'
  error: IStandardMutationError | null
  oldTeamLead: ITeamMember | null
  newTeamLead: ITeamMember | null
}

export interface IRejectOrgApprovalPayload {
  __typename: 'RejectOrgApprovalPayload'
  error: IStandardMutationError | null

  /**
   * The list of org approvals to remove. There may be multiple if many inviters requested the same email
   */
  removedOrgApprovals: Array<IOrgApproval> | null

  /**
   * The notification going to the inviter saying their invitee has been denied
   */
  deniedNotifications: Array<INotifyDenial> | null

  /**
   * The list of notifications to remove. There may be multiple if many inviters requested the same email
   */
  removedRequestNotifications: Array<INotifyRequestNewUser> | null

  /**
   * The soft team members that have not yet been invited
   */
  removedSoftTeamMembers: Array<ISoftTeamMember> | null

  /**
   * The tasks that belonged to the soft team member
   */
  archivedSoftTasks: Array<ITask> | null
}

/**
 * A notification alerting the user that their request was denied by the org billing leader
 */
export interface INotifyDenial {
  __typename: 'NotifyDenial'

  /**
   * The reason, supplied by the org leader, that the request has been denied
   */
  reason: string

  /**
   * The name of the billing leader that denied the request
   */
  deniedByName: string | null

  /**
   * The email of the person being invited
   */
  inviteeEmail: string

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export interface IRemoveAgendaItemPayload {
  __typename: 'RemoveAgendaItemPayload'
  error: IStandardMutationError | null
  agendaItem: IAgendaItem | null
}

export interface IRemoveProviderPayload {
  __typename: 'RemoveProviderPayload'
  error: IStandardMutationError | null
  providerRow: IProviderRow | null

  /**
   * The globalIds of the removed integrations
   */
  deletedIntegrationIds: Array<string> | null

  /**
   * The userId of the person who removed the provider
   */
  userId: string | null
  archivedTaskIds: Array<string | null> | null
}

export interface IRemoveSlackChannelPayload {
  __typename: 'RemoveSlackChannelPayload'
  error: IStandardMutationError | null
  deletedId: string
}

export interface IRemoveGitHubRepoPayload {
  __typename: 'RemoveGitHubRepoPayload'
  deletedId: string | null
  error: IStandardMutationError | null
  archivedTaskIds: Array<string | null> | null
}

export interface IRemoveOrgUserPayload {
  __typename: 'RemoveOrgUserPayload'
  error: IStandardMutationError | null

  /**
   * The organization the user was removed from
   */
  organization: IOrganization | null

  /**
   * The teams the user was removed from
   */
  teams: Array<ITeam | null> | null

  /**
   * The teamMembers removed
   */
  teamMembers: Array<ITeamMember | null> | null

  /**
   * The tasks that were archived or reassigned
   */
  updatedTasks: Array<ITask | null> | null

  /**
   * The user removed from the organization
   */
  user: IUser | null

  /**
   * The notifications relating to a team the user was removed from
   */
  removedTeamNotifications: Array<Notification | null> | null

  /**
   * The notifications that are no longer relevant to the removed org user
   */
  removedOrgNotifications: Array<Notification | null> | null

  /**
   * The notifications for each team the user was kicked out of
   */
  kickOutNotifications: Array<INotifyKickedOut | null> | null

  /**
   * The organization member that got removed
   */
  removedOrgMember: IOrganizationMember | null
}

/**
 * A notification sent to someone who was just kicked off a team
 */
export interface INotifyKickedOut {
  __typename: 'NotifyKickedOut'

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null

  /**
   * true if kicked out, false if leaving by choice
   */
  isKickout: boolean | null

  /**
   * The name of the team the user is joining
   */
  teamName: string

  /**
   * The teamId the user was kicked out of
   */
  teamId: string

  /**
   * The team the task is on
   */
  team: ITeam
}

export interface IRemoveReflectionPayload {
  __typename: 'RemoveReflectionPayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null
  reflection: IRetroReflection | null

  /**
   * The stages that were unlocked by navigating
   */
  unlockedStages: Array<NewMeetingStage> | null
}

export interface IRemoveTeamMemberPayload {
  __typename: 'RemoveTeamMemberPayload'
  error: IStandardMutationError | null

  /**
   * The team member removed
   */
  teamMember: ITeamMember | null

  /**
   * The team the team member was removed from
   */
  team: ITeam | null

  /**
   * The tasks that got reassigned
   */
  updatedTasks: Array<ITask | null> | null

  /**
   * The user removed from the team
   */
  user: IUser | null

  /**
   * Any notifications pertaining to the team that are no longer relevant
   */
  removedNotifications: Array<Notification | null> | null

  /**
   * A notification if you were kicked out by the team leader
   */
  kickOutNotification: INotifyKickedOut | null
}

export interface IRequestFacilitatorPayload {
  __typename: 'RequestFacilitatorPayload'
  error: IStandardMutationError | null

  /**
   * The team member that wants to be the facilitator
   */
  requestor: ITeamMember | null
}

export interface IResendTeamInvitePayload {
  __typename: 'ResendTeamInvitePayload'
  error: IStandardMutationError | null
  invitation: IInvitation | null
}

export interface ISegmentEventTrackOptions {
  teamId?: string | null
  orgId?: string | null

  /**
   * Used during the welcome wizard step 3
   */
  inviteeCount?: number | null
}

export interface ISelectRetroTemplatePayload {
  __typename: 'SelectRetroTemplatePayload'
  error: IStandardMutationError | null
  retroMeetingSettings: IRetrospectiveMeetingSettings
}

export type SetOrgUserRolePayload = ISetOrgUserRoleAddedPayload | ISetOrgUserRoleRemovedPayload

export interface ISetOrgUserRolePayload {
  __typename: 'SetOrgUserRolePayload'
  error: IStandardMutationError | null
  organization: IOrganization | null
  updatedOrgMember: IOrganizationMember | null
}

export interface ISetPhaseFocusPayload {
  __typename: 'SetPhaseFocusPayload'
  error: IStandardMutationError | null
  meeting: IRetrospectiveMeeting
  reflectPhase: IReflectPhase
}

/**
 * The meeting phase where all team members check in one-by-one
 */
export interface IReflectPhase {
  __typename: 'ReflectPhase'

  /**
   * shortid
   */
  id: string

  /**
   * The type of phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null
  stages: Array<IGenericMeetingStage>

  /**
   * foreign key. use focusedPhaseItem
   */
  focusedPhaseItemId: string | null

  /**
   * the phase item that the facilitator wants the group to focus on
   */
  focusedPhaseItem: IRetroPhaseItem | null

  /**
   * FK. The ID of the template used during the reflect phase
   */
  promptTemplateId: string

  /**
   * The prompts used during the reflect phase
   */
  reflectPrompts: Array<IRetroPhaseItem>
  teamId: string
}

/**
 * A stage of a meeting that has no extra state. Only used for single-stage phases
 */
export interface IGenericMeetingStage {
  __typename: 'GenericMeetingStage'

  /**
   * shortid
   */
  id: string

  /**
   * The datetime the stage was completed
   */
  endAt: any | null

  /**
   * foreign key. try using meeting
   */
  meetingId: string

  /**
   * The meeting this stage belongs to
   */
  meeting: NewMeeting | null

  /**
   * true if the facilitator has completed this stage, else false. Should be boolean(endAt)
   */
  isComplete: boolean | null

  /**
   * true if any meeting participant can navigate to this stage
   */
  isNavigable: boolean | null

  /**
   * true if the facilitator can navigate to this stage
   */
  isNavigableByFacilitator: boolean | null

  /**
   * The phase this stage belongs to
   */
  phase: NewMeetingPhase | null

  /**
   * The type of the phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null

  /**
   * The datetime the stage was started
   */
  startAt: any | null

  /**
   * Number of times the facilitator has visited this stage
   */
  viewCount: number | null
}

/**
 * Coordinates used relay a location in a 2-D plane
 */
export interface ICoords2DInput {
  x: number
  y: number
}

export interface IStartDraggingReflectionPayload {
  __typename: 'StartDraggingReflectionPayload'
  error: IStandardMutationError | null

  /**
   * The proposed start/end of a drag. Subject to race conditions, it is up to the client to decide to accept or ignore
   */
  dragContext: IDragContext | null
  meeting: NewMeeting | null
  meetingId: string | null
  reflection: IRetroReflection | null
  reflectionId: string | null
  teamId: string | null
}

export interface IStartMeetingPayload {
  __typename: 'StartMeetingPayload'
  error: IStandardMutationError | null
  team: ITeam | null
}

export interface IStartNewMeetingPayload {
  __typename: 'StartNewMeetingPayload'
  error: IStandardMutationError | null
  team: ITeam | null
  meeting: NewMeeting | null
}

export interface IStripeFailPaymentPayload {
  __typename: 'StripeFailPaymentPayload'
  error: IStandardMutationError | null
  organization: IOrganization | null

  /**
   * The notification to billing leaders stating the payment was rejected
   */
  notification: INotifyPaymentRejected | null
}

/**
 * A notification sent to a user when their payment has been rejected
 */
export interface INotifyPaymentRejected {
  __typename: 'NotifyPaymentRejected'
  organization: IOrganization | null

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

export interface IUpdateAgendaItemInput {
  /**
   * The unique agenda item ID, composed of a teamId::shortid
   */
  id: string

  /**
   * The content of the agenda item
   */
  content?: string | null

  /**
   * true until the agenda item has been marked isComplete and the meeting has ended
   */
  isActive?: boolean | null

  /**
   * true if the agenda item has been addressed in a meeting (will have a strikethrough or similar)
   */
  isComplete?: boolean | null

  /**
   * The sort order of the agenda item in the list
   */
  sortOrder?: number | null
}

export interface IUpdateAgendaItemPayload {
  __typename: 'UpdateAgendaItemPayload'
  agendaItem: IAgendaItem | null
  error: IStandardMutationError | null
}

export interface IUpdateCreditCardPayload {
  __typename: 'UpdateCreditCardPayload'
  error: IStandardMutationError | null

  /**
   * The organization that received the updated credit card
   */
  organization: IOrganization | null

  /**
   * The teams that are now paid up
   */
  teamsUpdated: Array<ITeam | null> | null
}

export interface IUpdateOrgInput {
  /**
   * The unique action ID
   */
  id?: string | null

  /**
   * The name of the org
   */
  name?: string | null

  /**
   * The org avatar
   */
  picture?: any | null
}

export interface IUpdateOrgPayload {
  __typename: 'UpdateOrgPayload'
  error: IStandardMutationError | null

  /**
   * The updated org
   */
  organization: IOrganization | null
}

export interface IUpdateCheckInQuestionPayload {
  __typename: 'UpdateCheckInQuestionPayload'
  error: IStandardMutationError | null
  team: ITeam | null
}

export interface IUpdateNewCheckInQuestionPayload {
  __typename: 'UpdateNewCheckInQuestionPayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null
}

export interface IUpdateDragLocationInput {
  clientHeight: number
  clientWidth: number

  /**
   * The primary key of the item being drug
   */
  sourceId: string

  /**
   * The estimated destination of the item being drug
   */
  targetId?: string | null

  /**
   * The teamId to broadcast the message to
   */
  teamId: string
  coords: ICoords2DInput

  /**
   * The offset from the targetId
   */
  targetOffset?: ICoords2DInput | null
}

export interface IUpdateReflectionContentPayload {
  __typename: 'UpdateReflectionContentPayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null
  reflection: IRetroReflection | null
}

export interface IUpdateReflectionGroupTitlePayload {
  __typename: 'UpdateReflectionGroupTitlePayload'
  error: IStandardMutationError | null
  meeting: NewMeeting | null
  reflectionGroup: IRetroReflectionGroup | null
}

export interface IUpdateTaskInput {
  /**
   * The task id
   */
  id?: string | null
  content?: string | null
  sortOrder?: number | null
  status?: TaskStatusEnum | null

  /**
   * The teamMemberId or softTeamMemberId
   */
  assigneeId?: string | null
}

export interface IUpdateTaskPayload {
  __typename: 'UpdateTaskPayload'
  error: IStandardMutationError | null
  task: ITask | null

  /**
   * If a task was just turned private, this its ID, else null
   */
  privatizedTaskId: string | null
  addedNotification: INotifyTaskInvolves | null
  removedNotification: INotifyTaskInvolves | null
}

export interface IUpdateTaskDueDatePayload {
  __typename: 'UpdateTaskDueDatePayload'
  error: IStandardMutationError | null
  task: ITask | null
}

export interface IUpdatedTeamInput {
  id?: string | null

  /**
   * The name of the team
   */
  name?: string | null

  /**
   * A link to the team’s profile image.
   */
  picture?: any | null
}

export interface IUpdateTeamNamePayload {
  __typename: 'UpdateTeamNamePayload'
  error: IStandardMutationError | null
  team: ITeam | null
}

export interface IUpdateUserProfileInput {
  /**
   * A link to the user’s profile image.
   */
  picture?: any | null

  /**
   * The name, as confirmed by the user
   */
  preferredName?: string | null
}

export interface IUpdateUserProfilePayload {
  __typename: 'UpdateUserProfilePayload'
  error: IStandardMutationError | null
  user: IUser | null

  /**
   * The updated team members
   */
  teamMembers: Array<ITeamMember | null> | null
}

export interface IVoteForReflectionGroupPayload {
  __typename: 'VoteForReflectionGroupPayload'
  error: IStandardMutationError | null
  meeting: IRetrospectiveMeeting | null
  meetingMember: IRetrospectiveMeetingMember | null
  reflectionGroup: IRetroReflectionGroup | null

  /**
   * The stages that were locked or unlocked by having at least 1 vote
   */
  unlockedStages: Array<NewMeetingStage> | null
}

export interface ILoginPayload {
  __typename: 'LoginPayload'
  error: IStandardMutationError | null

  /**
   * The user that just logged in
   */
  user: IUser | null

  /**
   * The new JWT
   */
  authToken: string | null
}

export interface IUpgradeToProPayload {
  __typename: 'UpgradeToProPayload'
  error: IStandardMutationError | null

  /**
   * The new Pro Org
   */
  organization: IOrganization | null

  /**
   * The updated teams under the org
   */
  teams: Array<ITeam | null> | null
}

export interface IAddReflectTemplatePayload {
  __typename: 'AddReflectTemplatePayload'
  error: IStandardMutationError | null
  reflectTemplate: IReflectTemplate | null
}

export interface IAddReflectTemplatePromptPayload {
  __typename: 'AddReflectTemplatePromptPayload'
  error: IStandardMutationError | null
  prompt: IRetroPhaseItem | null
}

export interface IMoveReflectTemplatePromptPayload {
  __typename: 'MoveReflectTemplatePromptPayload'
  error: IStandardMutationError | null
  prompt: IRetroPhaseItem | null
}

export interface IRemoveReflectTemplatePayload {
  __typename: 'RemoveReflectTemplatePayload'
  error: IStandardMutationError | null
  reflectTemplate: IReflectTemplate | null
  retroMeetingSettings: IRetrospectiveMeetingSettings | null
}

export interface IRemoveReflectTemplatePromptPayload {
  __typename: 'RemoveReflectTemplatePromptPayload'
  error: IStandardMutationError | null
  reflectTemplate: IReflectTemplate | null
  prompt: IReflectTemplate | null
}

export interface IRenameReflectTemplatePayload {
  __typename: 'RenameReflectTemplatePayload'
  error: IStandardMutationError | null
  reflectTemplate: IReflectTemplate | null
}

export interface IRenameReflectTemplatePromptPayload {
  __typename: 'RenameReflectTemplatePromptPayload'
  error: IStandardMutationError | null
  prompt: IRetroPhaseItem | null
}

export interface ISubscription {
  __typename: 'Subscription'
  agendaItemSubscription: AgendaItemSubscriptionPayload
  githubMemberRemoved: IGitHubMemberRemovedPayload
  githubRepoAdded: IAddGitHubRepoPayload
  githubRepoRemoved: IRemoveGitHubRepoPayload
  integrationSubscription: IntegrationSubscriptionPayload
  integrationJoined: IJoinIntegrationPayload
  integrationLeft: ILeaveIntegrationPayload
  invitationSubscription: InvitationSubscriptionPayload
  newAuthToken: string | null
  notificationSubscription: NotificationSubscriptionPayload
  orgApprovalSubscription: OrgApprovalSubscriptionPayload
  organizationSubscription: OrganizationSubscriptionPayload
  taskSubscription: TaskSubscriptionPayload
  slackChannelAdded: IAddSlackChannelPayload
  slackChannelRemoved: IRemoveSlackChannelPayload
  teamSubscription: TeamSubscriptionPayload
  teamMemberSubscription: TeanMemberSubscriptionPayload
}

export interface IAgendaItemSubscriptionOnSubscriptionArguments {
  teamId: string
}

export interface IGithubMemberRemovedOnSubscriptionArguments {
  teamId: string
}

export interface IGithubRepoAddedOnSubscriptionArguments {
  teamId: string
}

export interface IGithubRepoRemovedOnSubscriptionArguments {
  teamId: string
}

export interface IIntegrationSubscriptionOnSubscriptionArguments {
  teamId: string
}

export interface IIntegrationJoinedOnSubscriptionArguments {
  service: IntegrationService
  teamId: string
}

export interface IIntegrationLeftOnSubscriptionArguments {
  service: IntegrationService
  teamId: string
}

export interface IInvitationSubscriptionOnSubscriptionArguments {
  teamId: string
}

export interface IOrgApprovalSubscriptionOnSubscriptionArguments {
  teamId: string
}

export interface ISlackChannelAddedOnSubscriptionArguments {
  teamId: string
}

export interface ISlackChannelRemovedOnSubscriptionArguments {
  teamId: string
}

export type AgendaItemSubscriptionPayload =
  | IAddAgendaItemPayload
  | IRemoveAgendaItemPayload
  | IUpdateAgendaItemPayload
  | IMoveMeetingPayload

export interface IGitHubMemberRemovedPayload {
  __typename: 'GitHubMemberRemovedPayload'
  leaveIntegration: Array<ILeaveIntegrationPayload | null> | null
}

export type IntegrationSubscriptionPayload = IAddProviderPayload | IRemoveProviderPayload

export type InvitationSubscriptionPayload =
  | IAcceptTeamInvitePayload
  | IApproveToOrgPayload
  | ICancelTeamInvitePayload
  | IInviteTeamMembersPayload
  | IResendTeamInvitePayload

export type NotificationSubscriptionPayload =
  | IAcceptTeamInvitationPayload
  | IAddFeatureFlagPayload
  | IAddOrgPayload
  | IAddTeamPayload
  | IApproveToOrgPayload
  | ICancelApprovalPayload
  | ICancelTeamInvitePayload
  | IClearNotificationPayload
  | ICreateTaskPayload
  | IDeleteTaskPayload
  | IDisconnectSocketPayload
  | IInviteTeamMembersPayload
  | IInviteToTeamPayload
  | IRejectOrgApprovalPayload
  | IRemoveOrgUserPayload
  | IStripeFailPaymentPayload
  | IUser
  | IUpdateUserProfilePayload

export type OrgApprovalSubscriptionPayload =
  | IApproveToOrgPayload
  | ICancelApprovalPayload
  | IInviteTeamMembersPayload
  | IRejectOrgApprovalPayload

export type OrganizationSubscriptionPayload =
  | IAddOrgPayload
  | IApproveToOrgPayload
  | IDowngradeToPersonalPayload
  | IRemoveOrgUserPayload
  | ISetOrgUserRoleAddedPayload
  | ISetOrgUserRoleRemovedPayload
  | IUpdateCreditCardPayload
  | IUpdateOrgPayload
  | IUpgradeToProPayload

export interface ISetOrgUserRoleAddedPayload {
  __typename: 'SetOrgUserRoleAddedPayload'
  error: IStandardMutationError | null
  organization: IOrganization | null
  updatedOrgMember: IOrganizationMember | null

  /**
   * If promoted, notify them and give them all other admin notifications
   */
  notificationsAdded: Array<OrganizationNotification | null> | null
}

export interface ISetOrgUserRoleRemovedPayload {
  __typename: 'SetOrgUserRoleRemovedPayload'
  error: IStandardMutationError | null
  organization: IOrganization | null
  updatedOrgMember: IOrganizationMember | null

  /**
   * If demoted, notify them and remove all other admin notifications
   */
  notificationsRemoved: Array<OrganizationNotification | null> | null
}

export type TaskSubscriptionPayload =
  | IAcceptTeamInvitePayload
  | ICancelApprovalPayload
  | ICancelTeamInvitePayload
  | IChangeTaskTeamPayload
  | ICreateGitHubIssuePayload
  | ICreateTaskPayload
  | IDeleteTaskPayload
  | IEditTaskPayload
  | IEndMeetingPayload
  | IInviteTeamMembersPayload
  | IRejectOrgApprovalPayload
  | IRemoveOrgUserPayload
  | IRemoveTeamMemberPayload
  | IUpdateTaskPayload
  | IUpdateTaskDueDatePayload

export type TeamSubscriptionPayload =
  | IAcceptTeamInvitationPayload
  | IAcceptTeamInvitePayload
  | IAddTeamPayload
  | IArchiveTeamPayload
  | IAutoGroupReflectionsPayload
  | ICreateReflectionPayload
  | ICreateReflectionGroupPayload
  | IDowngradeToPersonalPayload
  | IDragDiscussionTopicPayload
  | IEndDraggingReflectionPayload
  | IEditReflectionPayload
  | IEndMeetingPayload
  | IKillMeetingPayload
  | IEndNewMeetingPayload
  | IMoveMeetingPayload
  | INavigateMeetingPayload
  | INewMeetingCheckInPayload
  | IPromoteFacilitatorPayload
  | IPromoteNewMeetingFacilitatorPayload
  | IRequestFacilitatorPayload
  | IRemoveOrgUserPayload
  | IRemoveReflectionPayload
  | IRemoveTeamMemberPayload
  | ISelectRetroTemplatePayload
  | ISetPhaseFocusPayload
  | IStartDraggingReflectionPayload
  | IStartMeetingPayload
  | IStartNewMeetingPayload
  | IUpdateCheckInQuestionPayload
  | IUpdateCreditCardPayload
  | IUpdateDragLocationPayload
  | IUpdateNewCheckInQuestionPayload
  | IUpdateReflectionContentPayload
  | IUpdateReflectionGroupTitlePayload
  | IUpdateTeamNamePayload
  | IUpgradeToProPayload
  | IVoteForReflectionGroupPayload
  | IAddReflectTemplatePayload
  | IAddReflectTemplatePromptPayload
  | IMoveReflectTemplatePromptPayload
  | IRemoveReflectTemplatePayload
  | IRemoveReflectTemplatePromptPayload
  | IRenameReflectTemplatePayload
  | IRenameReflectTemplatePromptPayload

export interface IUpdateDragLocationPayload {
  __typename: 'UpdateDragLocationPayload'
  clientHeight: number
  clientWidth: number

  /**
   * The primary key of the item being drug
   */
  sourceId: string

  /**
   * The estimated destination of the item being drug
   */
  targetId: string | null
  coords: ICoords2D

  /**
   * The offset from the targetId
   */
  targetOffset: ICoords2D | null
  userId: string
}

export type TeanMemberSubscriptionPayload =
  | IAcceptTeamInvitePayload
  | ICancelApprovalPayload
  | ICancelTeamInvitePayload
  | IRemoveTeamMemberPayload
  | IInviteTeamMembersPayload
  | IMeetingCheckInPayload
  | IPromoteToTeamLeadPayload
  | IRejectOrgApprovalPayload
  | IRemoveOrgUserPayload
  | IUpdateUserProfilePayload

/**
 * The meeting phase where all team members check in one-by-one
 */
export interface ICheckInPhase {
  __typename: 'CheckInPhase'

  /**
   * shortid
   */
  id: string

  /**
   * The type of phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null
  stages: Array<ICheckInStage>

  /**
   * The checkIn greeting (fun language)
   */
  checkInGreeting: IMeetingGreeting

  /**
   * The checkIn question of the week (draft-js format)
   */
  checkInQuestion: string
}

/**
 * A stage that focuses on a single team member
 */
export interface ICheckInStage {
  __typename: 'CheckInStage'

  /**
   * shortid
   */
  id: string

  /**
   * The datetime the stage was completed
   */
  endAt: any | null

  /**
   * foreign key. try using meeting
   */
  meetingId: string

  /**
   * The meeting this stage belongs to
   */
  meeting: NewMeeting | null

  /**
   * true if the facilitator has completed this stage, else false. Should be boolean(endAt)
   */
  isComplete: boolean | null

  /**
   * true if any meeting participant can navigate to this stage
   */
  isNavigable: boolean | null

  /**
   * true if the facilitator can navigate to this stage
   */
  isNavigableByFacilitator: boolean | null

  /**
   * The phase this stage belongs to
   */
  phase: NewMeetingPhase | null

  /**
   * The type of the phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null

  /**
   * The datetime the stage was started
   */
  startAt: any | null

  /**
   * Number of times the facilitator has visited this stage
   */
  viewCount: number | null

  /**
   * foreign key. use teamMember
   */
  teamMemberId: string

  /**
   * The team member that is the focus for this phase item
   */
  teamMember: ITeamMember | null

  /**
   * true if the team member is present for the meeting
   */
  present: boolean | null
}

/**
 * An instance of a meeting phase item. On the client, this usually represents a single view
 */
export type NewMeetingTeamMemberStage = ICheckInStage

/**
 * An instance of a meeting phase item. On the client, this usually represents a single view
 */
export interface INewMeetingTeamMemberStage {
  __typename: 'NewMeetingTeamMemberStage'

  /**
   * foreign key. use teamMember
   */
  teamMemberId: string

  /**
   * The team member that is the focus for this phase item
   */
  teamMember: ITeamMember | null
}

/**
 * The meeting phase where all team members discuss the topics with the most votes
 */
export interface IDiscussPhase {
  __typename: 'DiscussPhase'

  /**
   * shortid
   */
  id: string

  /**
   * The type of phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null
  stages: Array<IRetroDiscussStage>
}

/**
 * An all-purpose meeting phase with no extra state
 */
export interface IGenericMeetingPhase {
  __typename: 'GenericMeetingPhase'

  /**
   * shortid
   */
  id: string

  /**
   * The type of phase
   */
  phaseType: NewMeetingPhaseTypeEnum | null
  stages: Array<IGenericMeetingStage>
}

/**
 * A notification alerting the user that they have been promoted (to team or org leader)
 */
export interface INotifyPromoteToOrgLeader {
  __typename: 'NotifyPromoteToOrgLeader'
  organization: IOrganization | null

  /**
   * A shortid for the notification
   */
  id: string

  /**
   * true if the notification has been archived, else false (or null)
   */
  isArchived: boolean | null

  /**
   * *The unique organization ID for this notification. Can be blank for targeted notifications
   */
  orgId: string | null

  /**
   * The datetime to activate the notification & send it to the client
   */
  startAt: any | null
  type: NotificationEnum | null

  /**
   * *The userId that should see this notification
   */
  userIds: Array<string> | null
}

/**
 * The action-specific meeting settings
 */
export interface IActionMeetingSettings {
  __typename: 'ActionMeetingSettings'
  id: string

  /**
   * The type of meeting these settings apply to
   */
  meetingType: MeetingTypeEnum | null

  /**
   * The broad phase types that will be addressed during the meeting
   */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>

  /**
   * FK
   */
  teamId: string

  /**
   * The team these settings belong to
   */
  team: ITeam | null
}

/**
 * An auth token provided by Parabol to the client
 */
export interface IAuthToken {
  __typename: 'AuthToken'

  /**
   * A static ID so the location in the relay store is deterministic
   */
  id: string | null

  /**
   * audience. the target API used in auth0. Parabol does not use this.
   */
  aud: string | null

  /**
   * beta. 1 if enrolled in beta features. else absent
   */
  bet: number | null

  /**
   * expiration. Time since unix epoch / 1000
   */
  exp: number

  /**
   * issued at. Time since unix epoch / 1000
   */
  iat: number

  /**
   * issuer. the url that gave them the token. useful for detecting environment
   */
  iss: string | null

  /**
   * subscriber. userId
   */
  sub: string | null

  /**
   * role. Any privileges associated with the account
   */
  rol: AuthTokenRole | null

  /**
   * teams. a list of teamIds where the user is active
   */
  tms: Array<string | null> | null
}

/**
 * A role describing super user privileges
 */
export const enum AuthTokenRole {
  su = 'su'
}

// tslint:enable
