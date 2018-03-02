/* @flow */

export type GraphQLResponseRoot = {
  data?: Query | Mutation;
  errors?: Array<GraphQLResponseError>;
}

export type GraphQLResponseError = {
  message: string;            // Required for all errors
  locations?: Array<GraphQLResponseErrorLocation>;
  [propName: string]: any;    // 7.2.2 says 'GraphQL servers may provide additional entries to error'
}

export type GraphQLResponseErrorLocation = {
  line: number;
  column: number;
}

export type Query = {
  activeProOrgCount: ?number;
  activeProUserCount: ?number;
  viewer: ?User;
}

/**
  The user account profile
*/
export type User = {
  /** The userId provided by auth0 */
  id: ?string;
  /** Array of identifier + ip pairs */
  blockedFor: ?Array<BlockedUserType>;
  /** The timestamp of the user was cached */
  cachedAt: ?any;
  /** The timestamp when the cached user expires */
  cacheExpiresAt: ?any;
  /** The socketIds that the user is currently connected with */
  connectedSockets: ?Array<string>;
  /** The timestamp the user was created */
  createdAt: ?any;
  /** The user email */
  email: any;
  /** true if email is verified, false otherwise */
  emailVerified: ?boolean;
  /** An array of objects with information about the user's identities.
      More than one will exists in case accounts are linked */
  identities: ?Array<AuthIdentityType>;
  /** true if the user is currently online */
  isConnected: ?boolean;
  /** The number of logins for this user */
  loginsCount: ?number;
  /** Name associated with the user */
  name: ?string;
  /** Nickname associated with the user */
  nickname: ?string;
  /** url of user’s profile picture */
  picture: ?any;
  /** The timestamp the user was last updated */
  updatedAt: ?any;
  /** flag to determine which broadcasts to show */
  broadcastFlags: ?number;
  /** The last time the user connected via websocket */
  lastSeenAt: ?any;
  /** true if the user is not currently being billed for service. removed on every websocket handshake */
  inactive: ?boolean;
  /** true if the user is a part of the supplied orgId */
  isBillingLeader: ?boolean;
  /** The application-specific name, defaults to nickname */
  preferredName: ?string;
  /** the orgs and roles for this user on each */
  userOrgs: ?Array<UserOrg>;
  /** The datetime that we sent them a welcome email */
  welcomeSentAt: ?any;
  archivedTasks: ?TaskConnection;
  archivedTasksCount: ?number;
  /** list of git hub repos available to the viewer */
  githubRepos: ?Array<GitHubIntegration>;
  /** get an integration provider belonging to the user */
  integrationProvider: ?Provider;
  invoices: ?InvoiceConnection;
  invoiceDetails: ?Invoice;
  /** A previous meeting that the user was in (present or absent) */
  meeting: ?Meeting;
  /** all the notifications for a single user */
  notifications: ?NotificationConnection;
  /** The list of providers as seen on the integrations page */
  providerMap: ?ProviderMap;
  /** paginated list of slackChannels */
  slackChannels: ?Array<SlackIntegration>;
  /** get a single organization and the count of users by status */
  organization: ?Organization;
  /** Get the list of all organizations a user belongs to */
  organizations: ?Array<Organization>;
  tasks: ?TaskConnection;
  /** A query for a team */
  team: Team;
  /** all the teams the user is on that the viewer can see. */
  teams: ?Array<Team>;
  /** The team member associated with this user */
  teamMember: ?TeamMember;
  /** all the teams the user is a part of that the viewer can see */
  tms: ?Array<string>;
}

/**
  Identifier and IP address blocked
*/
export type BlockedUserType = {
  /** The identifier (usually email) of blocked user */
  identifier: ?string;
  /** The IP address of the blocked user */
  id: ?string;
}

export type AuthIdentityType = {
  /** The connection name.
      This field is not itself updateable
      but is needed when updating email, email_verified, username or password. */
  connection: ?string;
  /** The unique identifier for the user for the identity. */
  userId: ?string;
  /** The type of identity provider. */
  provider: ?string;
  /** true if the identity provider is a social provider, false otherwise */
  isSocial: ?boolean;
}

/**
  The user/org M:F join, denormalized on the user/org tables
*/
export type UserOrg = {
  /** The orgId */
  id: ?string;
  /** role of the user in the org */
  role: ?OrgUserRole;
}

/**
  The role of the org user
*/
export type OrgUserRole = "billingLeader";

/**
  A connection to a list of items.
*/
export type TaskConnection = {
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo: ?PageInfoDateCursor;
  /** A list of edges. */
  edges: ?Array<TaskEdge>;
}

/**
  Information about pagination in a connection.
*/
export type PageInfoDateCursor = {
  /** When paginating forwards, are there more items? */
  hasNextPage: boolean;
  /** When paginating backwards, are there more items? */
  hasPreviousPage: boolean;
  /** When paginating backwards, the cursor to continue. */
  startCursor: ?any;
  /** When paginating forwards, the cursor to continue. */
  endCursor: ?any;
}

/**
  An edge in a connection.
*/
export type TaskEdge = {
  /** The item at the end of the edge */
  node: ?Task;
  cursor: ?any;
}

/**
  A long-term task shared across the team, assigned to a single user 
*/
export type Task = {
  /** shortid */
  id: ?string;
  /** the agenda item that created this task, if any */
  agendaId: ?string;
  /** The body of the task. If null, it is a new task. */
  content: ?string;
  /** The timestamp the task was created */
  createdAt: ?any;
  /** The userId that created the task */
  createdBy: ?string;
  /** a list of users currently editing the task (fed by a subscription, so queries return null) */
  editors: ?Array<TaskEditorDetails>;
  integration: ?GitHubTask;
  /** true if this is assigned to a soft team member */
  isSoftTask: ?boolean;
  /** the shared sort order for tasks on the team dash & user dash */
  sortOrder: ?number;
  /** The status of the task */
  status: ?TaskStatusEnum;
  /** The tags associated with the task */
  tags: ?Array<string>;
  /** The id of the team (indexed). Needed for subscribing to archived tasks */
  teamId: ?string;
  /** The team this task belongs to */
  team: ?Team;
  /** The team member (or soft team member) that owns this task */
  assignee: ?Assignee;
  /** The id of the team member (or soft team member) assigned to this task */
  assigneeId: string;
  /** The timestamp the task was updated */
  updatedAt: ?any;
  /** * The userId, index useful for server-side methods getting all tasks under a user */
  userId: ?string;
}

export type TaskEditorDetails = {
  /** The userId of the person editing the task */
  userId: string;
  /** The name of the userId editing the task */
  preferredName: string;
}

/**
  The details associated with a task integrated with GitHub
*/
export type GitHubTask = {
  integrationId: string;
  service: IntegrationService;
  nameWithOwner: ?string;
  issueNumber: ?number;
}

export type TaskIntegration = GitHubTask;

/**
  The list of services for integrations
*/
export type IntegrationService = "GitHubIntegration" | "SlackIntegration";

/**
  The status of the task
*/
export type TaskStatusEnum = "active" | "stuck" | "done" | "future";

/**
  A team
*/
export type Team = {
  /** A shortid for the team */
  id: string;
  /** The datetime the team was created */
  createdAt: any;
  /** true if the underlying org has a validUntil date greater than now. if false, subs do not work */
  isPaid: ?boolean;
  /** The current or most recent meeting number (also the number of meetings the team has had */
  meetingNumber: ?number;
  /** The name of the team */
  name: string;
  /** The organization to which the team belongs */
  orgId: string;
  /** Arbitrary tags that the team uses */
  tags: ?Array<string>;
  /** The datetime the team was last updated */
  updatedAt: ?any;
  /** The checkIn greeting (fun language) */
  checkInGreeting: ?MeetingGreeting;
  /** The checkIn question of the week */
  checkInQuestion: ?string;
  customPhaseItems: ?Array<CustomPhaseItem>;
  /** The unique Id of the active meeting */
  meetingId: ?string;
  /** The current facilitator teamMemberId for this meeting */
  activeFacilitator: ?string;
  /** The phase of the facilitator */
  facilitatorPhase: ?ActionMeetingPhaseEnum;
  /** The current item number for the current phase for the facilitator, 1-indexed */
  facilitatorPhaseItem: ?number;
  /** The outstanding invitations to join the team */
  invitations: ?Array<Invitation>;
  /** The phase of the meeting, usually matches the facilitator phase, be could be further along */
  meetingPhase: ?ActionMeetingPhaseEnum;
  /** The current item number for the current phase for the meeting, 1-indexed */
  meetingPhaseItem: ?number;
  /** The team-specific settings for running all available types of meetings */
  meetingSettings: TeamMeetingSettings;
  /** The unique Id of the active meeting */
  newMeetingId: ?string;
  /** The new meeting in progress, if any */
  newMeeting: ?NewMeeting;
  /** The level of access to features on the parabol site */
  tier: ?TierEnum;
  /** The outstanding invitations to join the team */
  orgApprovals: ?Array<OrgApproval>;
  organization: ?Organization;
  /** The agenda items for the upcoming or current meeting */
  agendaItems: ?Array<AgendaItem>;
  /** All of the tasks for this team */
  tasks: ?TaskConnection;
  /** All the soft team members actively associated with the team */
  softTeamMembers: ?Array<SoftTeamMember>;
  /** All the team members actively associated with the team */
  teamMembers: ?Array<TeamMember>;
  /** true if the team has been archived */
  isArchived: ?boolean;
}

export type MeetingGreeting = {
  /** The foreign-language greeting */
  content: ?string;
  /** The source language for the greeting */
  language: ?string;
}

export type CustomPhaseItem = RetroPhaseItem;

/**
  The type of phase item
*/
export type CustomPhaseItemTypeEnum = "retroPhaseItem";

/**
  The phases of an action meeting
*/
export type ActionMeetingPhaseEnum = "lobby" | "checkin" | "updates" | "firstcall" | "agendaitems" | "lastcall" | "summary";

/**
  An invitation to become a team member
*/
export type Invitation = {
  /** The unique invitation Id */
  id: string;
  /** The datetime the invitation was accepted */
  acceptedAt: ?any;
  /** The datetime the invitation was created */
  createdAt: any;
  /** The email of the invitee */
  email: ?any;
  /** The name of the invitee, derived from the email address */
  fullName: ?string;
  /** The teamMemberId of the person that sent the invitation */
  invitedBy: ?string;
  /** How many invites have been sent to this email address? */
  inviteCount: ?number;
  /** The task that the invitee is currently working on */
  task: ?string;
  /** The team invited to */
  teamId: string;
  /** The datestamp of when the invitation will expire */
  tokenExpiration: ?any;
  /** The datetime the invitation was last updated */
  updatedAt: ?any;
}

export type PossibleTeamMember = Invitation | TeamMember | OrgApproval | SoftTeamMember;

/**
  The phases of an action meeting
*/
export type MeetingTypeEnum = "action" | "retrospective";

/**
  The team settings for a specific type of meeting
*/
export type TeamMeetingSettings = {
  /** The total number of meetings given to the team */
  meetingsOffered: ?number;
  /** Number of meetings that can be run (if not pro) */
  meetingsRemaining: ?number;
  /** The type of meeting these settings apply to */
  meetingType: ?MeetingTypeEnum;
  /** The broad phase types that will be addressed during the meeting */
  phases: Array<NewMeetingPhaseTypeEnum>;
  /** The team these settings belong to */
  team: ?Team;
}

/**
  The phase of the meeting
*/
export type NewMeetingPhaseTypeEnum = "lobby" | "checkin" | "summary" | "updates" | "firstcall" | "agendaitems" | "lastcall" | "think" | "group" | "vote" | "discuss";

/**
  A team meeting history for all previous meetings
*/
export type NewMeeting = RetrospectiveMeeting;

/**
  The user invited to the meeting
*/
export type MeetingInvitee = {
  /** The teamMemberId of the user invited to the meeting */
  id: ?string;
  /** true if the invitee was present in the meeting */
  present: ?boolean;
  /** A list of immutable tasks, as they were created in the meeting */
  tasks: ?Array<MeetingTask>;
  /** url of user’s profile picture */
  picture: ?any;
  /** The name, as confirmed by the user */
  preferredName: ?string;
  /** All of the fields from the team member table */
  membership: ?TeamMember;
}

/**
  The task that was created in a meeting
*/
export type MeetingTask = {
  /** The unique action id, meetingId::taskId */
  id: string;
  /** The stringified Draft-js raw description of the action created during the meeting */
  content: string;
  /** The description of the action created during the meeting */
  status: ?TaskStatusEnum;
  /** The tags associated with the task */
  tags: ?Array<string>;
  /** The id of the team member the action was assigned to during the meeting */
  assigneeId: string;
}

/**
  A member of a team
*/
export type TeamMember = {
  /** An ID for the teamMember. userId::teamId */
  id: ?string;
  /** true if the user is a part of the team, false if they no longer are */
  isNotRemoved: ?boolean;
  /** Is user a team lead? */
  isLead: ?boolean;
  /** Is user a team facilitator? */
  isFacilitator: ?boolean;
  /** hide the agenda list on the dashboard */
  hideAgenda: ?boolean;
  /** The user email */
  email: ?any;
  /** url of user’s profile picture */
  picture: ?any;
  /** The name, as confirmed by the user */
  preferredName: ?string;
  /** The place in line for checkIn, regenerated every meeting */
  checkInOrder: ?number;
  /** true if the user is connected */
  isConnected: ?boolean;
  /** true if present, false if absent, null before check-in */
  isCheckedIn: ?boolean;
  /** true if this team member belongs to the user that queried it */
  isSelf: ?boolean;
  /** foreign key to Team table */
  teamId: ?string;
  /** foreign key to User table */
  userId: ?string;
  /** The team this team member belongs to */
  team: ?Team;
  /** The user for the team member */
  user: ?User;
  /** Tasks owned by the team member */
  tasks: ?TaskConnection;
}

export type Assignee = TeamMember | SoftTeamMember;

/**
  An instance of a meeting phase item. On the client, this usually represents a single view
*/
export type NewMeetingStage = {
  /** shortid */
  id: string;
  /** The meeting this stage belongs to */
  meeting: ?NewMeeting;
  /** true if the facilitator is currently looking at the stage, else false */
  isFacilitatorStage: ?boolean;
  /** true if the facilitator has completed this stage, else false */
  isComplete: ?boolean;
  /** The type of the phase */
  type: ?NewMeetingPhaseTypeEnum;
  /** true if the meeting phase can only be viewed once (eg first call) */
  isSingleView: ?boolean;
  /** true if the meeting phase automatically advances to the next (eg Phase1.part2 completes when part1 completes) */
  isAutoAdvanced: ?boolean;
  /** The phase item that this phase represents */
  customPhaseItem: ?CustomPhaseItem;
}

/**
  The pay tier of the team
*/
export type TierEnum = "personal" | "pro" | "enterprise";

/**
  The state of approving an email address to join a team and org
*/
export type OrgApproval = {
  /** The unique approval ID */
  id: string;
  /** The userId of the billing leader that approved the invitee */
  approvedBy: ?string;
  /** The datetime the organization was created */
  createdAt: any;
  /** The userId of the billing leader that denied the invitee */
  deniedBy: ?string;
  /** *The email seeking approval */
  email: ?any;
  /** true if it applies to a user that was not removed from the org, else false */
  isActive: ?boolean;
  /** The orgId the email want to join */
  orgId: string;
  /** *The team seeking approval. Used to populate in the team settings page */
  teamId: string;
  status: ?OrgApprovalStatusEnum;
  /** The datetime the approval was last updated */
  updatedAt: ?any;
}

/**
  The approval status for a user joining the org
*/
export type OrgApprovalStatusEnum = "APPROVED" | "PENDING" | "DENIED";

/**
  An organization
*/
export type Organization = {
  /** The unique organization ID */
  id: string;
  /** The datetime the organization was created */
  createdAt: any;
  /** The safe credit card details */
  creditCard: ?CreditCard;
  /** true if the viewer is the billing leader for the org */
  isBillingLeader: ?boolean;
  /** The billing leader of the organization (or the first, if more than 1) */
  mainBillingLeader: ?User;
  /** The name of the organization */
  name: ?string;
  /** The org avatar */
  picture: ?any;
  /** The level of access to features on the parabol site */
  tier: ?TierEnum;
  /** THe datetime the current billing cycle ends */
  periodEnd: ?any;
  /** The datetime the current billing cycle starts */
  periodStart: ?any;
  /** The customerId from stripe */
  stripeId: ?string;
  /** The subscriptionId from stripe */
  stripeSubscriptionId: ?string;
  /** The datetime the organization was last updated */
  updatedAt: ?any;
  orgMembers: ?OrganizationMemberConnection;
  /** The count of active & inactive users */
  orgUserCount: ?OrgUserCount;
  /** The leaders of the org */
  billingLeaders: ?Array<User>;
}

/**
  A credit card
*/
export type CreditCard = {
  /** The brand of the credit card, as provided by skype */
  brand: ?string;
  /** The MM/YY string of the expiration date */
  expiry: ?string;
  /** The last 4 digits of a credit card */
  last4: ?number;
}

/**
  A connection to a list of items.
*/
export type OrganizationMemberConnection = {
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of edges. */
  edges: ?Array<OrganizationMemberEdge>;
}

/**
  Information about pagination in a connection.
*/
export type PageInfo = {
  /** When paginating forwards, are there more items? */
  hasNextPage: boolean;
  /** When paginating backwards, are there more items? */
  hasPreviousPage: boolean;
  /** When paginating backwards, the cursor to continue. */
  startCursor: ?string;
  /** When paginating forwards, the cursor to continue. */
  endCursor: ?string;
}

/**
  An edge in a connection.
*/
export type OrganizationMemberEdge = {
  /** The item at the end of the edge */
  node: ?OrganizationMember;
  /** A cursor for use in pagination */
  cursor: string;
}

export type OrganizationMember = {
  id: ?string;
  organization: ?Organization;
  user: ?User;
  isBillingLeader: ?boolean;
}

export type OrgUserCount = {
  /** The number of orgUsers who have an inactive flag */
  inactiveUserCount: ?number;
  /** The number of orgUsers who do not have an inactive flag */
  activeUserCount: ?number;
}

/**
  A request placeholder that will likely turn into 1 or more tasks
*/
export type AgendaItem = {
  /** The unique agenda item id teamId::shortid */
  id: string;
  /** The body of the agenda item */
  content: string;
  /** The timestamp the agenda item was created */
  createdAt: ?any;
  /** true until the agenda item has been marked isComplete and the meeting has ended */
  isActive: ?boolean;
  /** true if the agenda item has been addressed in a meeting (will have a strikethrough or similar) */
  isComplete: ?boolean;
  /** The sort order of the agenda item in the list */
  sortOrder: ?number;
  /** *The team for this agenda item */
  teamId: string;
  /** The teamMemberId that created this agenda item */
  teamMemberId: string;
  /** The timestamp the agenda item was updated */
  updatedAt: ?any;
  /** The team member that created the agenda item */
  teamMember: ?TeamMember;
}

/**
  A member of a team
*/
export type SoftTeamMember = {
  /** An ID for the teamMember. userId::teamId */
  id: ?string;
  /** The datetime the team was created */
  createdAt: ?any;
  /** The user email */
  email: ?any;
  /** True if this is still a soft team member, false if they were rejected or became a team member */
  isActive: ?boolean;
  /** The name, as confirmed by the user */
  preferredName: ?string;
  /** Tasks owned by the team member */
  tasks: ?TaskConnection;
  /** foreign key to Team table */
  teamId: ?string;
  /** The team this team member belongs to */
  team: ?Team;
}

/**
  An integration that connects github issues & PRs to Parabol tasks
*/
export type GitHubIntegration = {
  /** The ID of an object */
  id: string;
  /** The parabol userId of the admin for this repo (usually the creator) */
  adminUserId: string;
  /** The datetime the integration was created */
  createdAt: any;
  /** The name of the repo. Follows format of OWNER/NAME */
  nameWithOwner: ?string;
  /** defaults to true. true if this is used */
  isActive: ?boolean;
  /** *The team that is linked to this integration */
  teamId: string;
  /** The users that can CRUD this integration */
  teamMembers: ?Array<TeamMember>;
  /** The datetime the integration was updated */
  updatedAt: any;
  /** *The userIds connected to the repo so they can CRUD things under their own name */
  userIds: ?Array<string>;
}

/**
  A token for a user to be used on 1 or more teams
*/
export type Provider = {
  /** The ID of an object */
  id: string;
  /** The access token to the service */
  accessToken: string;
  /** The timestamp the provider was created */
  createdAt: ?any;
  /** True if the Provider is active. else false */
  isActive: ?boolean;
  /** *The id for the user used by the provider, eg SlackTeamId, GoogleUserId, githubLogin */
  providerUserId: ?string;
  /** The username (or email) attached to the provider */
  providerUserName: ?string;
  /** The name of the service */
  service: ?IntegrationService;
  /** *The team that the token is linked to */
  teamId: ?string;
  /** The timestamp the task was updated */
  updatedAt: ?any;
  /** The user that the access token is attached to */
  userId: ?string;
}

/**
  A connection to a list of items.
*/
export type InvoiceConnection = {
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo: ?PageInfoDateCursor;
  /** A list of edges. */
  edges: ?Array<InvoiceEdge>;
}

/**
  An edge in a connection.
*/
export type InvoiceEdge = {
  /** The item at the end of the edge */
  node: ?Invoice;
  cursor: ?any;
}

/**
  A monthly billing invoice for an organization
*/
export type Invoice = {
  /** A shortid for the invoice */
  id: ?string;
  /** The amount the card will be charged (total + startingBalance with a min value of 0) */
  amountDue: ?number;
  /** The datetime the invoice was first generated */
  createdAt: ?any;
  /** The total amount for the invoice (in USD) */
  total: ?number;
  /** The emails the invoice was sent to */
  billingLeaderEmails: ?Array<any>;
  /** the card used to pay the invoice */
  creditCard: ?CreditCard;
  /** The timestamp for the end of the billing cycle */
  endAt: ?any;
  /** The date the invoice was created */
  invoiceDate: ?any;
  /** An invoice line item for previous month adjustments */
  lines: ?Array<InvoiceLineItem>;
  /** The details that comprise the charges for next month */
  nextMonthCharges: ?InvoiceChargeNextMonth;
  /** *The organization id to charge */
  orgId: ?string;
  /** The persisted name of the org as it was when invoiced */
  orgName: ?string;
  /** the datetime the invoice was successfully paid */
  paidAt: ?any;
  /** The picture of the organization */
  picture: ?any;
  /** The timestamp for the beginning of the billing cycle */
  startAt: ?any;
  /** The balance on the customer account (in cents) */
  startingBalance: ?number;
  /** the status of the invoice. starts as pending, moves to paid or unpaid depending on if the payment succeeded */
  status: ?InvoiceStatusEnum;
}

/**
  A single line item charge on the invoice
*/
export type InvoiceLineItem = {
  /** The unique line item id */
  id: string;
  /** The amount for the line item (in USD) */
  amount: number;
  /** A description of the charge. Only present if we have no idea what the charge is */
  description: ?string;
  /** Array of user activity line items that roll up to total activity (add/leave/pause/unpause) */
  details: ?Array<InvoiceLineItemDetails>;
  /** The total number of days that all org users have been inactive during the billing cycle */
  quantity: ?number;
  /** The line item type for a monthly billing invoice */
  type: ?InvoiceLineItemEnum;
}

/**
  The per-user-action line item details,
*/
export type InvoiceLineItemDetails = {
  /** The unique detailed line item id */
  id: string;
  /** The amount for the line item (in USD) */
  amount: number;
  /** The email affected by this line item change */
  email: ?any;
  /** End of the event. Only present if a pause action gets matched up with an unpause action */
  endAt: ?any;
  /** The parent line item id */
  parentId: string;
  /** The timestamp for the beginning of the period of no charge */
  startAt: ?any;
}

/**
  A big picture line item
*/
export type InvoiceLineItemEnum = "ADDED_USERS" | "INACTIVITY_ADJUSTMENTS" | "OTHER_ADJUSTMENTS" | "REMOVED_USERS";

/**
  A single line item for the charges for next month
*/
export type InvoiceChargeNextMonth = {
  /** The amount for the line item (in USD) */
  amount: number;
  /** The datetime the next period will end */
  nextPeriodEnd: ?any;
  /** The total number of days that all org users have been inactive during the billing cycle */
  quantity: ?number;
  /** The per-seat monthly price of the subscription (in dollars) */
  unitPrice: ?number;
}

/**
  The payment status of the invoice
*/
export type InvoiceStatusEnum = "PENDING" | "PAID" | "FAILED" | "UPCOMING";

/**
  A team meeting history for all previous meetings
*/
export type Meeting = {
  /** The unique meeting id. shortid. */
  id: string;
  /** The number of agenda items completed during the meeting */
  agendaItemsCompleted: ?number;
  /** The timestamp the meeting was created */
  createdAt: ?any;
  /** The timestamp the meeting officially ended */
  endedAt: ?any;
  /** The teamMemberId of the person who ended the meeting */
  facilitator: ?string;
  invitees: ?Array<MeetingInvitee>;
  /** The auto-incrementing meeting number for the team */
  meetingNumber: number;
  /** A list of immutable tasks, as they were created in the meeting */
  tasks: ?Array<MeetingTask>;
  /** The start time used to create the diff (all taskDiffs occurred between this time and the endTime */
  sinceTime: ?any;
  /** The happy introductory clause to the summary */
  successExpression: ?string;
  /** The happy body statement for the summary */
  successStatement: ?string;
  /** The time the meeting summary was emailed to the team */
  summarySentAt: ?any;
  /** The team associated with this meeting */
  teamId: string;
  /** The name as it was when the meeting occurred */
  teamName: ?string;
  /** All the team members associated who can join this team */
  teamMembers: ?Array<TeamMember>;
}

/**
  A connection to a list of items.
*/
export type NotificationConnection = {
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo: ?PageInfoDateCursor;
  /** A list of edges. */
  edges: ?Array<NotificationEdge>;
}

/**
  An edge in a connection.
*/
export type NotificationEdge = {
  /** The item at the end of the edge */
  node: ?Notification;
  cursor: ?any;
}

export type Notification = NotifyTeamInvite | NotifyRequestNewUser | NotifyInviteeApproved | NotifyTeamArchived | NotifyTaskInvolves | NotifyAddedToTeam | NotifyDenial | NotifyKickedOut | NotifyPaymentRejected | NotifyPromoteToOrgLeader;

/**
  The kind of notification
*/
export type NotificationEnum = "ADD_TO_TEAM" | "DENY_NEW_USER" | "FACILITATOR_DISCONNECTED" | "undefined" | "INVITEE_APPROVED" | "JOIN_TEAM" | "KICKED_OUT" | "PAYMENT_REJECTED" | "TASK_INVOLVES" | "REJOIN_TEAM" | "REQUEST_NEW_USER" | "TEAM_INVITE" | "TEAM_ARCHIVED" | "VERSION_INFO" | "PROMOTE_TO_BILLING_LEADER";

/**
  A token for a user to be used on 1 or more teams
*/
export type ProviderMap = {
  /** The ID of an object */
  id: string;
  teamId: ?string;
  /** All the big details associated with slack */
  SlackIntegration: ?ProviderRow;
  /** All the big details associated with GitHub */
  GitHubIntegration: ?ProviderRow;
}

/**
  All the details about a particular provider
*/
export type ProviderRow = {
  /** The ID of an object */
  id: string;
  /** The access token attached to the userId. null if user does not have a token for the provider */
  accessToken: ?string;
  /** The count of all the people on the team that have linked their account to the provider */
  userCount: ?number;
  /** The number of integrations under this provider for the team */
  integrationCount: ?number;
  /** The username according to the provider */
  providerUserName: ?string;
  /** The name of the service */
  service: ?IntegrationService;
  teamId: ?string;
}

/**
  An integration that sends start/end meeting messages to a specified slack channel
*/
export type SlackIntegration = {
  /** The ID of an object */
  id: string;
  /** the id of the channel provided by the service, if available. Useful for fetching from their API */
  channelId: string;
  /** The name of the channel. Shared with all, updated when the integration owner looks at it */
  channelName: ?string;
  /** defaults to true. true if this is used to send notifications */
  isActive: ?boolean;
  /** The types of notifications the team wishes to receive */
  notifications: ?Array<string>;
  /** *The team that cares about these annoucements */
  teamId: string;
}

export type Mutation = {
  /** Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the auth token with the new team added to tms.
    Side effect: deletes all other outstanding invitations for user. */
  acceptTeamInviteEmail: AcceptTeamInviteEmailPayload;
  /** Approve an outsider to join the organization */
  acceptTeamInviteNotification: ?AcceptTeamInviteNotificationPayload;
  /** Create a new agenda item */
  addAgendaItem: ?AddAgendaItemPayload;
  /** Give someone advanced features in a flag */
  addFeatureFlag: ?string;
  addGitHubRepo: AddGitHubRepoPayload;
  /** Create a new team and add the first team member */
  addOrg: ?AddOrgPayload;
  addProvider: ?boolean;
  addSlackChannel: AddSlackChannelPayload;
  /** Create a new team and add the first team member */
  addTeam: ?AddTeamPayload;
  /** Approve an outsider to join the organization */
  approveToOrg: ?ApproveToOrgPayload;
  archiveTeam: ?ArchiveTeamPayload;
  /** Cancel a pending request for an invitee to join the org */
  cancelApproval: ?CancelApprovalPayload;
  /** Cancel an invitation */
  cancelTeamInvite: ?CancelTeamInvitePayload;
  /** Change the team a task is associated with */
  changeTaskTeam: ?ChangeTaskTeamPayload;
  /** Remove a notification by ID */
  clearNotification: ?ClearNotificationPayload;
  /** a server-side mutation called when a client connects */
  connectSocket: ?User;
  /** for troubleshooting by admins, create a JWT for a given userId */
  createImposterToken: ?CreateImposterTokenPayload;
  /** Create a new team and add the first team member. Called from the welcome wizard */
  createFirstTeam: ?CreateFirstTeamPayload;
  createGitHubIssue: ?CreateGitHubIssuePayload;
  /** Create a PUT URL on the CDN for an organization’s profile picture */
  createOrgPicturePutUrl: ?CreatePicturePutUrlPayload;
  /** Create a new task, triggering a CreateCard for other viewers */
  createTask: ?CreateTaskPayload;
  /** Create a PUT URL on the CDN for the currently authenticated user’s profile picture */
  createUserPicturePutUrl: ?CreateUserPicturePutUrlPayload;
  /** Delete (not archive!) a task */
  deleteTask: ?DeleteTaskPayload;
  /** a server-side mutation called when a client disconnects */
  disconnectSocket: ?User;
  /** Announce to everyone that you are editing a task */
  editTask: ?EditTaskPayload;
  /** Finish a meeting and go to the summary */
  endMeeting: ?EndMeetingPayload;
  /** Receive a webhook from github saying an assignee was added */
  githubAddAssignee: ?boolean;
  /** Receive a webhook from github saying an org member was added */
  githubAddMember: ?boolean;
  /** Receive a webhook from github saying an org member was removed */
  githubRemoveMember: ?boolean;
  /** pauses the subscription for a single user */
  inactivateUser: ?boolean;
  /** If in the org,
     Send invitation emails to a list of email addresses, add them to the invitation table.
     Else, send a request to the org leader to get them approval and put them in the OrgApproval table. */
  inviteTeamMembers: InviteTeamMembersPayload;
  /** Add a user to an integration */
  joinIntegration: JoinIntegrationPayload;
  /** Finish a meeting abruptly */
  killMeeting: ?KillMeetingPayload;
  /** Remove yourself from an integration */
  leaveIntegration: LeaveIntegrationPayload;
  /** Check a member in as present or absent */
  meetingCheckIn: ?MeetingCheckInPayload;
  /** Update the facilitator. If this is new territory for the meetingPhaseItem, advance that, too. */
  moveMeeting: ?MoveMeetingPayload;
  /** Move a team to a different org. Requires billing leader rights on both orgs! */
  moveTeamToOrg: ?string;
  /** Change a facilitator while the meeting is in progress */
  promoteFacilitator: ?PromoteFacilitatorPayload;
  /** Promote another team member to be the leader */
  promoteToTeamLead: ?PromoteToTeamLeadPayload;
  /** Reject an invitee from joining any team under your organization */
  rejectOrgApproval: ?RejectOrgApprovalPayload;
  /** Remove an agenda item */
  removeAgendaItem: ?RemoveAgendaItemPayload;
  /** Disconnect a team from a Provider token */
  removeProvider: RemoveProviderPayload;
  /** Remove a slack channel integration from a team */
  removeSlackChannel: RemoveSlackChannelPayload;
  /** Remove a github repo integration from a team */
  removeGitHubRepo: RemoveGitHubRepoPayload;
  /** Remove a user from an org */
  removeOrgUser: ?RemoveOrgUserPayload;
  /** Remove a team member from the team */
  removeTeamMember: ?RemoveTeamMemberPayload;
  /** Request to become the facilitator in a meeting */
  requestFacilitator: ?RequestFacilitatorPayload;
  /** Resend an invitation */
  resendTeamInvite: ?ResendTeamInvitePayload;
  /** track an event in segment, like when errors are hit */
  segmentEventTrack: ?boolean;
  /** Set the role of a user */
  setOrgUserRole: ?SetOrgUserRolePayload;
  /** Start a meeting from the lobby */
  startMeeting: ?StartMeetingPayload;
  /** When stripe tells us an invoice is ready, create a pretty version */
  stripeCreateInvoice: ?boolean;
  /** When stripe tells us an invoice payment failed, update it in our DB */
  stripeFailPayment: ?StripeFailPaymentPayload;
  /** When stripe tells us an invoice payment was successful, update it in our DB */
  stripeSucceedPayment: ?boolean;
  /** When stripe tells us a credit card was updated, update the details in our own DB */
  stripeUpdateCreditCard: ?boolean;
  /** When a new invoiceitem is sent from stripe, tag it with metadata */
  stripeUpdateInvoiceItem: ?boolean;
  /** Show/hide the agenda list */
  toggleAgendaList: ?TeamMember;
  /** Update an agenda item */
  updateAgendaItem: ?UpdateAgendaItemPayload;
  /** Update an existing credit card on file */
  updateCreditCard: ?UpdateCreditCardPayload;
  /** Update an with a change in name, avatar */
  updateOrg: UpdateOrgPayload;
  /** Update a Team's Check-in question */
  updateCheckInQuestion: ?UpdateCheckInQuestionPayload;
  /** Update a task with a change in content, ownership, or status */
  updateTask: ?UpdateTaskPayload;
  updateTeamName: ?UpdateTeamNamePayload;
  updateUserProfile: ?UpdateUserProfilePayload;
  /** Log in, or sign up if it is a new user */
  login: ?LoginPayload;
  /** Upgrade an account to the paid service */
  upgradeToPro: ?UpgradeToProPayload;
}

export type AcceptTeamInviteEmailPayload = {
  /** The team that the invitee will be joining */
  team: ?Team;
  /** The new team member on the team */
  teamMember: ?TeamMember;
  /** The invite notification removed once accepted */
  removedNotification: ?NotifyTeamInvite;
  /** The invitation the viewer just accepted */
  removedInvitation: ?Invitation;
  user: ?User;
  /** The soft team member that got promoted to a real team member */
  removedSoftTeamMember: ?SoftTeamMember;
  /** The tasks that got reassigned from the soft team member to the real team member */
  hardenedTasks: ?Array<Task>;
  /** The new JWT */
  authToken: ?string;
  /** The error encountered while accepting a team invite */
  error: ?AcceptTeamInviteError;
}

export type AcceptTeamInvitePayload = AcceptTeamInviteEmailPayload | AcceptTeamInviteNotificationPayload;

/**
  A notification sent to a user that was invited to a new team
*/
export type NotifyTeamInvite = {
  /** The user that triggered the invitation */
  inviter: ?User;
  team: ?Team;
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
}

export type TeamNotification = NotifyTeamInvite | NotifyRequestNewUser | NotifyInviteeApproved | NotifyTaskInvolves | NotifyAddedToTeam | NotifyDenial;

export type AcceptTeamInviteError = {
  /** The title of the error */
  title: ?string;
  /** The full error */
  message: ?string;
}

export type AcceptTeamInviteNotificationPayload = {
  /** The team that the invitee will be joining */
  team: ?Team;
  /** The new team member on the team */
  teamMember: ?TeamMember;
  /** The invite notification removed once accepted */
  removedNotification: ?NotifyTeamInvite;
  /** The invitation the viewer just accepted */
  removedInvitation: ?Invitation;
  user: ?User;
  /** The soft team member that got promoted to a real team member */
  removedSoftTeamMember: ?SoftTeamMember;
  /** The tasks that got reassigned from the soft team member to the real team member */
  hardenedTasks: ?Array<Task>;
}

export type CreateAgendaItemInput = {
  /** The content of the agenda item */
  content: string;
  teamId: string;
  /** The team member ID of the person creating the agenda item */
  teamMemberId: string;
  /** The sort order of the agenda item in the list */
  sortOrder: ?number;
}

export type AddAgendaItemPayload = {
  agendaItem: ?AgendaItem;
}

export type AddGitHubRepoPayload = {
  repo: GitHubIntegration;
}

export type NewTeamInput = {
  /** The name of the team */
  name: ?string;
  /** The unique orginization ID that pays for the team */
  orgId: ?string;
}

/**
  The email and task of an invited team member
*/
export type Invitee = {
  /** The email address of the invitee */
  email: any;
  /** The name derived from an RFC5322 email string */
  fullName: ?string;
  /** The current task the invitee is working on */
  task: ?string;
}

export type AddOrgPayload = {
  organization: ?Organization;
  team: ?Team;
  /** The teamMember that just created the new team, if this is a creation */
  teamMember: ?TeamMember;
  invitations: ?Array<Invitation>;
  /** The invitation sent when an team was being created */
  teamInviteNotification: ?NotifyTeamInvite;
}

export type AddSlackChannelInput = {
  /** The id of the teamMember calling it. */
  teamMemberId: string;
  /** the slack channel that wants our messages */
  slackChannelId: string;
}

export type AddSlackChannelPayload = {
  channel: SlackIntegration;
}

export type AddTeamPayload = {
  team: ?Team;
  /** The teamMember that just created the new team, if this is a creation */
  teamMember: ?TeamMember;
  invitations: ?Array<Invitation>;
  /** The invitation sent when an team was being created */
  teamInviteNotification: ?NotifyTeamInvite;
}

export type ApproveToOrgPayload = {
  /** If the viewer is an org leader, the notifications removed after approving to the organization */
  removedRequestNotifications: ?Array<NotifyRequestNewUser>;
  /** If the viegnwer is a team member, the org approvals that were removed in place of team members */
  removedOrgApprovals: ?Array<OrgApproval>;
  /** If the viewer is a team member, the list of team members added as a result of the approval */
  newInvitations: ?Array<Invitation>;
  /** If the viewer invited the invitee, the notifications to say they have been approved */
  inviteeApprovedNotifications: ?Array<NotifyInviteeApproved>;
  /** If the viewer is the invitee, the notifications to invite them to teams */
  teamInviteNotifications: ?Array<NotifyTeamInvite>;
}

/**
  A notification sent to a user concerning an invitation (request, joined)
*/
export type NotifyRequestNewUser = {
  /** The userId of the person that invited the email */
  inviterUserId: string;
  /** The email of the person being invited */
  inviteeEmail: string;
  /** The teamId the inviteeEmail is being invited to */
  teamId: string;
  /** The team name the inviteeEmail is being invited to */
  teamName: string;
  /** The user that triggered the invitation */
  inviter: ?User;
  team: ?Team;
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
}

export type OrganizationNotification = NotifyRequestNewUser | NotifyPaymentRejected | NotifyPromoteToOrgLeader;

/**
  A notification sent to a user when the person they invited got approved by the org leader
*/
export type NotifyInviteeApproved = {
  /** The email of the person being invited */
  inviteeEmail: string;
  /** The user that triggered the invitation */
  inviter: ?User;
  team: ?Team;
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
}

export type ArchiveTeamPayload = {
  team: ?Team;
  /** A notification explaining that the team was archived and removed from view */
  notification: ?NotifyTeamArchived;
  removedTeamNotifications: ?Array<TeamNotification>;
}

/**
  A notification alerting the user that a team they were on is now archived
*/
export type NotifyTeamArchived = {
  team: ?Team;
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
}

export type TeamRemovedNotification = NotifyTeamArchived | NotifyKickedOut;

export type CancelApprovalPayload = {
  /** The inactivated org approval */
  orgApproval: ?OrgApproval;
  /** The notification requesting org approval to the org leader */
  removedRequestNotification: ?NotifyRequestNewUser;
  /** The soft team members that are no longer tentatively on the team */
  removedSoftTeamMember: ?SoftTeamMember;
  /** The tasks that belonged to the soft team member */
  archivedSoftTasks: ?Array<Task>;
}

export type CancelTeamInvitePayload = {
  /** The cancelled invitation */
  invitation: ?Invitation;
  removedTeamInviteNotification: ?NotifyTeamInvite;
  /** The soft team members that are no longer tentatively on the team */
  removedSoftTeamMember: ?SoftTeamMember;
  /** The tasks that belonged to the soft team member */
  archivedSoftTasks: ?Array<Task>;
}

export type ChangeTaskTeamPayload = {
  task: ?Task;
  removedNotification: ?NotifyTaskInvolves;
  /** the taskId sent to a user who is not on the new team so they can remove it from their client */
  removedTaskId: ?string;
}

/**
  A notification sent to someone who was just added to a team
*/
export type NotifyTaskInvolves = {
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
  /** How the user is affiliated with the task */
  involvement: ?TaskInvolvementType;
  /** The taskId that now involves the userId */
  taskId: string;
  /** The task that now involves the userId */
  task: ?Task;
  /** The teamMemberId of the person that made the change */
  changeAuthorId: ?string;
  /** The TeamMember of the person that made the change */
  changeAuthor: ?TeamMember;
  teamId: string;
  /** The team the task is on */
  team: ?Team;
}

/**
  How a user is involved with a task (listed in hierarchical order)
*/
export type TaskInvolvementType = "ASSIGNEE" | "MENTIONEE";

export type ClearNotificationPayload = {
  /** The deleted notifcation */
  notification: ?Notification;
}

export type CreateImposterTokenPayload = {
  /** The new JWT */
  authToken: ?string;
  /** The user you have assumed */
  user: ?User;
}

export type CreateFirstTeamPayload = {
  team: ?Team;
  teamLead: ?TeamMember;
  /** The new JWT after adding the team */
  jwt: ?string;
  user: ?User;
}

export type CreateGitHubIssuePayload = {
  task: ?Task;
}

export type CreatePicturePutUrlPayload = {
  url: ?any;
}

export type CreateTaskInput = {
  /** foreign key for AgendaItem */
  agendaId: ?string;
  content: ?string;
  /** teamId, the team the task is on */
  teamId: ?string;
  /** userId, the owner of the task */
  userId: ?string;
  sortOrder: ?number;
  status: ?TaskStatusEnum;
}

/**
  The part of the site that is calling the mutation
*/
export type AreaEnum = "meeting" | "teamDash" | "userDash";

export type CreateTaskPayload = {
  task: ?Task;
  involvementNotification: ?NotifyTaskInvolves;
}

export type CreateUserPicturePutUrlPayload = {
  url: ?any;
}

export type DeleteTaskPayload = {
  /** The task that was deleted */
  task: ?Task;
  /** The notification stating that the viewer was mentioned or assigned */
  involvementNotification: ?NotifyTaskInvolves;
}

export type EditTaskPayload = {
  task: ?Task;
  editor: ?User;
  /** true if the editor is editing, false if they stopped editing */
  isEditing: ?boolean;
}

export type EndMeetingPayload = {
  team: ?Team;
  /** The list of tasks that were archived during the meeting */
  archivedTasks: ?Array<Task>;
  meeting: ?Meeting;
}

/**
  A list of all the possible outcomes when trying to invite a team member
*/
export type InviteTeamMembersPayload = {
  /** The team the inviter is inviting the invitee to */
  team: ?Team;
  /** The notification sent to the invitee if they were previously on the team */
  reactivationNotification: ?NotifyAddedToTeam;
  /** The notification sent to the invitee */
  teamInviteNotification: ?NotifyTeamInvite;
  /** A removed request notification if the org leader invited the invitee instead of approving */
  removedRequestNotification: ?NotifyRequestNewUser;
  /** The notification sent to the org billing leader requesting to be approved */
  requestNotification: ?NotifyRequestNewUser;
  /** The list of emails that turned out to be reactivated team members */
  reactivatedTeamMembers: ?Array<TeamMember>;
  /** The list of invitations successfully sent out */
  invitationsSent: ?Array<Invitation>;
  /** The list of orgApprovals sent to the org leader */
  orgApprovalsSent: ?Array<OrgApproval>;
  /** The list of orgApprovals removed. Triggered if An org leader invites someone with a pending approval */
  orgApprovalsRemoved: ?Array<OrgApproval>;
  /** The new invitees who have yet to accept the invite or get approved to receive an invite */
  newSoftTeamMembers: ?Array<SoftTeamMember>;
  /** Any tasks that were recently assigned to a reactivated soft team member */
  unarchivedSoftTasks: ?Array<Task>;
}

/**
  A notification sent to someone who was just added to a team
*/
export type NotifyAddedToTeam = {
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
  /** The new auth token for the user. */
  authToken: ?string;
  /** The team the invitee is being invited to */
  team: ?Team;
  /** The name of the team the user is joining */
  teamName: string;
  /** The teamId the user is joining */
  teamId: string;
}

export type JoinIntegrationPayload = {
  /** The globalId of the integration with a removed member */
  globalId: string;
  teamMember: TeamMember;
}

export type KillMeetingPayload = {
  team: ?Team;
}

export type LeaveIntegrationPayload = {
  /** The globalId of the integration with a removed member */
  globalId: string;
  /** The global userId of the viewer that left. if null, remove the entire integration */
  userId: ?string;
  /** The list of tasks removed triggered by a removed repo if this was the last viewer on the repo */
  archivedTaskIds: ?Array<string>;
}

export type MeetingCheckInPayload = {
  teamMember: ?TeamMember;
}

export type MoveMeetingPayload = {
  team: ?Team;
  /** The agendaItem completed, if any */
  completedAgendaItem: ?AgendaItem;
}

export type PromoteFacilitatorPayload = {
  /** Thea team currently running a meeting */
  team: ?Team;
  /** The new meeting facilitator */
  newFacilitator: ?TeamMember;
  /** The team member that disconnected */
  disconnectedFacilitator: ?TeamMember;
}

export type PromoteToTeamLeadPayload = {
  oldTeamLead: ?TeamMember;
  newTeamLead: ?TeamMember;
}

export type RejectOrgApprovalPayload = {
  /** The list of org approvals to remove. There may be multiple if many inviters requested the same email */
  removedOrgApprovals: ?Array<OrgApproval>;
  /** The notification going to the inviter saying their invitee has been denied */
  deniedNotifications: ?Array<NotifyDenial>;
  /** The list of notifications to remove. There may be multiple if many inviters requested the same email */
  removedRequestNotifications: ?Array<NotifyRequestNewUser>;
  /** The soft team members that have not yet been invited */
  removedSoftTeamMembers: ?Array<SoftTeamMember>;
  /** The tasks that belonged to the soft team member */
  archivedSoftTasks: ?Array<Task>;
}

/**
  A notification alerting the user that their request was denied by the org billing leader
*/
export type NotifyDenial = {
  /** The reason, supplied by the org leader, that the request has been denied */
  reason: string;
  /** The name of the billing leader that denied the request */
  deniedByName: ?string;
  /** The email of the person being invited */
  inviteeEmail: string;
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
}

export type RemoveAgendaItemPayload = {
  agendaItem: ?AgendaItem;
}

export type RemoveProviderPayload = {
  providerRow: ProviderRow;
  /** The globalIds of the removed integrations */
  deletedIntegrationIds: Array<string>;
  /** The userId of the person who removed the provider */
  userId: string;
  archivedTaskIds: ?Array<string>;
}

export type RemoveSlackChannelPayload = {
  deletedId: string;
}

export type RemoveGitHubRepoPayload = {
  deletedId: string;
  archivedTaskIds: ?Array<string>;
}

export type RemoveOrgUserPayload = {
  /** The organization the user was removed from */
  organization: ?Organization;
  /** The teams the user was removed from */
  teams: ?Array<Team>;
  /** The teamMembers removed */
  teamMembers: ?Array<TeamMember>;
  /** The tasks that were archived or reassigned */
  updatedTasks: ?Array<Task>;
  /** The user removed from the organization */
  user: ?User;
  /** The notifications relating to a team the user was removed from */
  removedTeamNotifications: ?Array<Notification>;
  /** The notifications that are no longer relevant to the removed org user */
  removedOrgNotifications: ?Array<Notification>;
  /** The notifications for each team the user was kicked out of */
  kickOutNotifications: ?Array<NotifyKickedOut>;
  /** The organization member that got removed */
  removedOrgMember: ?OrganizationMember;
}

/**
  A notification sent to someone who was just kicked off a team
*/
export type NotifyKickedOut = {
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
  /** true if kicked out, false if leaving by choice */
  isKickout: ?boolean;
  /** The name of the team the user is joining */
  teamName: string;
  /** The teamId the user was kicked out of */
  teamId: string;
  /** The team the task is on */
  team: ?Team;
}

export type RemoveTeamMemberPayload = {
  /** The team member removed */
  teamMember: ?TeamMember;
  /** The team the team member was removed from */
  team: ?Team;
  /** The tasks that got reassigned */
  updatedTasks: ?Array<Task>;
  /** The user removed from the team */
  user: ?User;
  /** Any notifications pertaining to the team that are no longer relevant */
  removedNotifications: ?Array<Notification>;
  /** A notification if you were kicked out by the team leader */
  kickOutNotification: ?NotifyKickedOut;
}

export type RequestFacilitatorPayload = {
  /** The team member that wants to be the facilitator */
  requestor: ?TeamMember;
}

export type ResendTeamInvitePayload = {
  invitation: ?Invitation;
}

export type SegmentEventTrackOptions = {
  teamId: ?string;
  orgId: ?string;
  /** Used during the welcome wizard step 3 */
  inviteeCount: ?number;
}

export type SetOrgUserRolePayload = SetOrgUserRoleAddedPayload | SetOrgUserRoleRemovedPayload;

export type StartMeetingPayload = {
  team: ?Team;
}

export type StripeFailPaymentPayload = {
  organization: ?Organization;
  /** The notification to billing leaders stating the payment was rejected */
  notification: ?NotifyPaymentRejected;
}

/**
  A notification sent to a user when their payment has been rejected
*/
export type NotifyPaymentRejected = {
  organization: ?Organization;
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
}

export type UpdateAgendaItemInput = {
  /** The unique agenda item ID, composed of a teamId::shortid */
  id: string;
  /** The content of the agenda item */
  content: ?string;
  /** true until the agenda item has been marked isComplete and the meeting has ended */
  isActive: ?boolean;
  /** true if the agenda item has been addressed in a meeting (will have a strikethrough or similar) */
  isComplete: ?boolean;
  /** The sort order of the agenda item in the list */
  sortOrder: ?number;
}

export type UpdateAgendaItemPayload = {
  agendaItem: ?AgendaItem;
}

export type UpdateCreditCardPayload = {
  /** The organization that received the updated credit card */
  organization: ?Organization;
  /** The teams that are now paid up */
  teamsUpdated: ?Array<Team>;
}

export type UpdateOrgInput = {
  /** The unique action ID */
  id: ?string;
  /** The name of the org */
  name: ?string;
  /** The org avatar */
  picture: ?any;
}

export type UpdateOrgPayload = {
  /** The updated org */
  organization: ?Organization;
}

export type UpdateCheckInQuestionPayload = {
  team: ?Team;
}

export type UpdateTaskInput = {
  /** The task id */
  id: ?string;
  content: ?string;
  sortOrder: ?number;
  status: ?TaskStatusEnum;
  /** The teamMemberId or softTeamMemberId */
  assigneeId: ?string;
}

export type UpdateTaskPayload = {
  task: ?Task;
  /** If a task was just turned private, this its ID, else null */
  privatizedTaskId: ?string;
  addedNotification: ?NotifyTaskInvolves;
  removedNotification: ?NotifyTaskInvolves;
}

export type UpdatedTeamInput = {
  id: ?string;
  /** The name of the team */
  name: ?string;
  /** A link to the team’s profile image. */
  picture: ?any;
}

export type UpdateTeamNamePayload = {
  team: ?Team;
}

export type UpdateUserProfileInput = {
  /** A link to the user’s profile image. */
  picture: ?any;
  /** The name, as confirmed by the user */
  preferredName: ?string;
}

export type UpdateUserProfilePayload = {
  user: ?User;
  /** The updated team members */
  teamMembers: ?Array<TeamMember>;
}

export type LoginPayload = {
  /** The user that just logged in */
  user: ?User;
}

export type UpgradeToProPayload = {
  /** The new Pro Org */
  organization: ?Organization;
  /** The updated teams under the org */
  teams: ?Array<Team>;
}

export type Subscription = {
  agendaItemSubscription: AgendaItemSubscriptionPayload;
  githubMemberRemoved: GitHubMemberRemovedPayload;
  githubRepoAdded: AddGitHubRepoPayload;
  githubRepoRemoved: RemoveGitHubRepoPayload;
  integrationJoined: JoinIntegrationPayload;
  integrationLeft: LeaveIntegrationPayload;
  invitationSubscription: InvitationSubscriptionPayload;
  newAuthToken: ?string;
  notificationSubscription: NotificationSubscriptionPayload;
  orgApprovalSubscription: OrgApprovalSubscriptionPayload;
  organizationSubscription: OrganizationSubscriptionPayload;
  taskSubscription: TaskSubscriptionPayload;
  slackChannelAdded: AddSlackChannelPayload;
  slackChannelRemoved: RemoveSlackChannelPayload;
  providerAdded: AddProviderPayload;
  providerRemoved: RemoveProviderPayload;
  teamSubscription: TeamSubscriptionPayload;
  teamMemberSubscription: TeanMemberSubscriptionPayload;
}

export type AgendaItemSubscriptionPayload = AddAgendaItemPayload | RemoveAgendaItemPayload | UpdateAgendaItemPayload | MoveMeetingPayload;

export type GitHubMemberRemovedPayload = {
  leaveIntegration: ?Array<LeaveIntegrationPayload>;
}

export type InvitationSubscriptionPayload = AcceptTeamInviteEmailPayload | AcceptTeamInviteNotificationPayload | ApproveToOrgPayload | CancelTeamInvitePayload | InviteTeamMembersPayload | ResendTeamInvitePayload;

export type NotificationSubscriptionPayload = AddOrgPayload | AddTeamPayload | ApproveToOrgPayload | CancelApprovalPayload | CancelTeamInvitePayload | ClearNotificationPayload | CreateTaskPayload | DeleteTaskPayload | InviteTeamMembersPayload | RejectOrgApprovalPayload | RemoveOrgUserPayload | StripeFailPaymentPayload | User | UpdateUserProfilePayload;

export type OrgApprovalSubscriptionPayload = ApproveToOrgPayload | CancelApprovalPayload | InviteTeamMembersPayload | RejectOrgApprovalPayload;

export type OrganizationSubscriptionPayload = AddOrgPayload | ApproveToOrgPayload | RemoveOrgUserPayload | SetOrgUserRoleAddedPayload | SetOrgUserRoleRemovedPayload | UpdateCreditCardPayload | UpdateOrgPayload | UpgradeToProPayload;

export type SetOrgUserRoleAddedPayload = {
  organization: ?Organization;
  updatedOrgMember: ?OrganizationMember;
  /** If promoted, notify them and give them all other admin notifications */
  notificationsAdded: ?Array<OrganizationNotification>;
}

export type SetOrgUserRoleRemovedPayload = {
  organization: ?Organization;
  updatedOrgMember: ?OrganizationMember;
  /** If demoted, notify them and remove all other admin notifications */
  notificationsRemoved: ?Array<OrganizationNotification>;
}

export type TaskSubscriptionPayload = AcceptTeamInviteEmailPayload | AcceptTeamInviteNotificationPayload | CancelApprovalPayload | CancelTeamInvitePayload | ChangeTaskTeamPayload | CreateGitHubIssuePayload | CreateTaskPayload | DeleteTaskPayload | EditTaskPayload | EndMeetingPayload | InviteTeamMembersPayload | RejectOrgApprovalPayload | RemoveOrgUserPayload | RemoveTeamMemberPayload | UpdateTaskPayload;

export type AddProviderPayload = {
  providerRow: ProviderRow;
  provider: ?Provider;
  /** All the integrationIds that the provider has successfully joined */
  joinedIntegrationIds: ?Array<string>;
  teamMember: ?TeamMember;
}

export type TeamSubscriptionPayload = AcceptTeamInviteEmailPayload | AcceptTeamInviteNotificationPayload | AddTeamPayload | ArchiveTeamPayload | EndMeetingPayload | KillMeetingPayload | MoveMeetingPayload | PromoteFacilitatorPayload | RequestFacilitatorPayload | StartMeetingPayload | RemoveOrgUserPayload | RemoveTeamMemberPayload | UpdateCheckInQuestionPayload | UpdateCreditCardPayload | UpdateTeamNamePayload | UpgradeToProPayload;

export type TeanMemberSubscriptionPayload = AcceptTeamInviteNotificationPayload | AcceptTeamInviteEmailPayload | CancelApprovalPayload | CancelTeamInvitePayload | RemoveTeamMemberPayload | InviteTeamMembersPayload | MeetingCheckInPayload | PromoteToTeamLeadPayload | RejectOrgApprovalPayload | RemoveOrgUserPayload | UpdateUserProfilePayload;

/**
  A notification alerting the user that they have been promoted (to team or org leader)
*/
export type NotifyPromoteToOrgLeader = {
  organization: ?Organization;
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
}

/**
  A team-specific retro phase. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.
*/
export type RetroPhaseItem = {
  /** shortid */
  id: string;
  /** The type of phase item */
  type: ?CustomPhaseItemTypeEnum;
  /** true if the phase item is currently used by the team, else false */
  isActive: ?boolean;
  /** The team that owns this customPhaseItem */
  team: ?Team;
  /** The title of the phase of the retrospective. Often a short version of the question */
  title: ?string;
  /** The question to answer during the phase of the retrospective (eg What went well?) */
  question: ?string;
}

/**
  A retrospective meeting
*/
export type RetrospectiveMeeting = {
  /** The unique meeting id. shortid. */
  id: string;
  /** The timestamp the meeting was created */
  createdAt: ?any;
  /** The timestamp the meeting officially ended */
  endedAt: ?any;
  /** The userId (or anonymousId) of the most recent facilitator */
  facilitatorUserId: ?string;
  invitees: ?Array<MeetingInvitee>;
  /** The auto-incrementing meeting number for the team */
  meetingNumber: number;
  /** The stages that make up the meeting */
  stages: Array<NewMeetingStage>;
  /** The time the meeting summary was emailed to the team */
  summarySentAt: ?any;
  /** The team that ran the meeting */
  team: ?Team;
  thoughtGroups: ?Array<RetroThoughtGroup>;
  /** The thoughts generated during the think phase of the retro */
  thoughts: ?Array<RetroThought>;
}

/**
  A thought created during the think phase of a retrospective
*/
export type RetroThoughtGroup = {
  /** shortid */
  id: string;
  /** The timestamp the meeting was created */
  createdAt: ?any;
  /** The title of the grouping of the retrospective thoughts */
  title: ?string;
  /** The thoughts that belong in the group */
  retroThoughts: ?Array<RetroThought>;
  /** The retrospective meeting this thought was created in */
  meeting: ?RetrospectiveMeeting;
  /** The team that is running the retro */
  team: ?Team;
  /** A list of voterIds (teamMemberId or anonymousTeamMemberId). Not available to team to preserve anonymity */
  votes: ?Array<string>;
  /** The number of votes this group has received */
  voteCount: ?number;
}

/**
  A thought created during the think phase of a retrospective
*/
export type RetroThought = {
  /** shortid */
  id: string;
  /** The timestamp the meeting was created */
  createdAt: ?any;
  /** The teamMemberId that created the thought (or unique Id if not a team member) */
  creatorId: ?string;
  /** The stringified draft-js content */
  content: ?string;
  /** The foreign key to link a thought to its meeting */
  meetingId: ?string;
  /** The foreign key to link a thought to its phaseItem */
  retroPhaseItemId: ?string;
  /** The foreign key to link a thought to its group */
  thoughtGroupId: ?string;
  /** The group the thought belongs to, if any */
  retroThoughtGroup: ?RetroThoughtGroup;
  phase: ?RetroPhaseItem;
  /** The retrospective meeting this thought was cretaed in */
  meeting: ?RetrospectiveMeeting;
  /** The team that is running the meeting that contains this thought */
  team: ?RetrospectiveMeeting;
}