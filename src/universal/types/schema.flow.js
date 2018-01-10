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
  viewer: ?User;
  orgDetails: ?Organization;
  teamMemberCount: ?number;
  /** A query for admin to find a user by their id */
  getUserByUserId: ?User;
  /** Given an auth token, return the user and auth token */
  getCurrentUser: ?User;
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
  /** all the teams the user is a part of that the viewer can see */
  tms: ?Array<string>;
  /** all the teams the user is on. Returns empty if the user is not the viewer. */
  teams: ?Array<Team>;
  /** The team member associated with this user */
  teamMember: ?TeamMember;
  /** the orgs and roles for this user on each */
  userOrgs: ?Array<UserOrg>;
  /** The datetime that we sent them a welcome email */
  welcomeSentAt: ?any;
  archivedProjects: ?ProjectConnection;
  archivedProjectsCount: ?number;
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
  projects: ?ProjectConnection;
  /** A query for a team */
  team: ?Team;
  /** a refreshed JWT */
  jwt: ?string;
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
  A team
*/
export type Team = {
  /** A shortid for the team */
  id: ?string;
  /** The datetime the team was created */
  createdAt: any;
  /** true if the underlying org has a validUntil date greater than now. if false, subs do not work */
  isPaid: ?boolean;
  /** The current or most recent meeting number (also the number of meetings the team has had */
  meetingNumber: ?number;
  /** The name of the team */
  name: ?string;
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
  /** The level of access to features on the parabol site */
  tier: ?TierEnum;
  /** The outstanding invitations to join the team */
  orgApprovals: ?Array<OrgApproval>;
  organization: ?Organization;
  /** The agenda items for the upcoming or current meeting */
  agendaItems: ?Array<AgendaItem>;
  /** All of the projects for this team */
  projects: ?ProjectConnection;
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

export type PossibleTeamMember = Invitation | OrgApproval | TeamMember;

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
  /** Projects owned by the team member */
  projects: ?ProjectConnection;
}

/**
  A connection to a list of items.
*/
export type ProjectConnection = {
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo: ?PageInfoDateCursor;
  /** A list of edges. */
  edges: ?Array<ProjectEdge>;
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
export type ProjectEdge = {
  /** The item at the end of the edge */
  node: ?Project;
  cursor: ?any;
}

/**
  A long-term project shared across the team, assigned to a single user 
*/
export type Project = {
  /** A shortid for the project teamId::shortid */
  id: ?string;
  /** the agenda item that created this project, if any */
  agendaId: ?string;
  /** The body of the project. If null, it is a new project. */
  content: ?string;
  /** The timestamp the project was created */
  createdAt: ?any;
  /** The userId that created the project */
  createdBy: ?string;
  /** a list of users currently editing the project (fed by a subscription, so queries return null) */
  editors: ?Array<ProjectEditorDetails>;
  integration: ?GitHubProject;
  /** the shared sort order for projects on the team dash & user dash */
  sortOrder: ?number;
  /** The status of the project */
  status: ?ProjectStatusEnum;
  /** The tags associated with the project */
  tags: ?Array<string>;
  /** The id of the team (indexed). Needed for subscribing to archived projects */
  teamId: ?string;
  /** The team this project belongs to */
  team: ?Team;
  /** The team member that owns this project */
  teamMember: ?TeamMember;
  /** The id of the team member assigned to this project, or the creator if content is null */
  teamMemberId: string;
  /** The timestamp the project was updated */
  updatedAt: ?any;
  /** * The userId, index useful for server-side methods getting all projects under a user */
  userId: ?string;
}

export type ProjectEditorDetails = {
  /** The userId of the person editing the project */
  userId: string;
  /** The name of the userId editing the project */
  preferredName: string;
}

/**
  The details associated with a project integrated with GitHub
*/
export type GitHubProject = {
  integrationId: string;
  service: IntegrationService;
  nameWithOwner: ?string;
  issueNumber: ?number;
}

export type ProjectIntegration = GitHubProject;

/**
  The list of services for integrations
*/
export type IntegrationService = "GitHubIntegration" | "SlackIntegration";

/**
  The status of the project
*/
export type ProjectStatusEnum = "active" | "stuck" | "done" | "future";

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
  An integration that connects github issues & PRs to Parabol projects
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
  /** The timestamp the project was updated */
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
  /** A list of immutable projects, as they were created in the meeting */
  projects: ?Array<MeetingProject>;
  /** The start time used to create the diff (all projectDiffs occurred between this time and the endTime */
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
  The user invited to the meeting
*/
export type MeetingInvitee = {
  /** The teamMemberId of the user invited to the meeting */
  id: ?string;
  /** true if the invitee was present in the meeting */
  present: ?boolean;
  /** A list of immutable projects, as they were created in the meeting */
  projects: ?Array<MeetingProject>;
  /** url of user’s profile picture */
  picture: ?any;
  /** The name, as confirmed by the user */
  preferredName: ?string;
  /** All of the fields from the team member table */
  membership: ?TeamMember;
}

/**
  The project that was created in a meeting
*/
export type MeetingProject = {
  /** The unique action id, meetingId::projectId */
  id: string;
  /** The stringified Draft-js raw description of the action created during the meeting */
  content: string;
  /** The description of the action created during the meeting */
  status: ?ProjectStatusEnum;
  /** The tags associated with the project */
  tags: ?Array<string>;
  /** The id of the team member the action was assigned to during the meeting */
  teamMemberId: string;
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

export type Notification = NotifyTeamInvite | NotifyRequestNewUser | NotifyInviteeApproved | NotifyTeamArchived | NotifyProjectInvolves | NotifyAddedToTeam | NotifyDenial | NotifyKickedOut | NotifyPaymentRejected | NotifyVersionInfo | NotifyPromoteToOrgLeader;

/**
  The kind of notification
*/
export type NotificationEnum = "ADD_TO_TEAM" | "DENY_NEW_USER" | "FACILITATOR_DISCONNECTED" | "undefined" | "INVITEE_APPROVED" | "JOIN_TEAM" | "KICKED_OUT" | "PAYMENT_REJECTED" | "PROJECT_INVOLVES" | "REJOIN_TEAM" | "REQUEST_NEW_USER" | "TEAM_INVITE" | "TEAM_ARCHIVED" | "VERSION_INFO" | "PROMOTE_TO_BILLING_LEADER";

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
  /** Remove a user from an org */
  removeOrgUser: ?boolean;
  /** Create a PUT URL on the CDN for an organization’s profile picture */
  createOrgPicturePutUrl: ?any;
  /** Give someone advanced features in a flag */
  addFeatureFlag: ?string;
  /** for troubleshooting by admins, create a JWT for a given userId */
  createImposterToken: ?User;
  /** Create a PUT URL on the CDN for the currently authenticated user’s profile picture */
  createUserPicturePutUrl: ?any;
  /** Given an auth0 auth token, return basic user profile info */
  updateUserWithAuthToken: ?User;
  updateUserProfile: ?User;
  /** Add a user to a Team given an invitationToken.
    If the invitationToken is valid, returns the auth token with the new team added to tms.
    Side effect: deletes all other outstanding invitations for user. */
  acceptTeamInviteEmail: AcceptTeamInviteEmailPayload;
  /** Approve an outsider to join the organization */
  acceptTeamInviteNotification: ?AcceptTeamInviteNotificationPayload;
  /** Create a new agenda item */
  addAgendaItem: ?AddAgendaItemPayload;
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
  /** Remove a notification by ID */
  clearNotification: ?ClearNotificationPayload;
  /** a server-side mutation called when a client connects */
  connectSocket: ?User;
  /** Create a new team and add the first team member. Called from the welcome wizard */
  createFirstTeam: ?CreateFirstTeamPayload;
  createGitHubIssue: ?CreateGitHubIssuePayload;
  /** Create a new project, triggering a CreateCard for other viewers */
  createProject: ?CreateProjectPayload;
  /** Delete (not archive!) a project */
  deleteProject: ?DeleteProjectPayload;
  /** a server-side mutation called when a client disconnects */
  disconnectSocket: ?User;
  /** Announce to everyone that you are editing a project */
  editProject: ?EditProjectPayload;
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
  /** Update a project with a change in content, ownership, or status */
  updateProject: ?UpdateProjectPayload;
  updateTeamName: ?UpdateTeamNamePayload;
  /** Upgrade an account to the paid service */
  upgradeToPro: ?UpgradeToProPayload;
}

export type UpdateUserProfileInput = {
  /** The unique userId */
  id: ?string;
  /** A link to the user’s profile image. */
  picture: ?any;
  /** The name, as confirmed by the user */
  preferredName: ?string;
}

export type AcceptTeamInviteEmailPayload = {
  /** Thea team that the invitee will be joining */
  team: ?Team;
  /** The new team member on the team */
  teamMember: ?TeamMember;
  /** The invite notification removed once accepted */
  removedNotification: ?NotifyTeamInvite;
  /** The invitation the viewer just accepted */
  removedInvitation: ?Invitation;
  user: ?User;
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

export type TeamNotification = NotifyTeamInvite | NotifyRequestNewUser | NotifyInviteeApproved | NotifyProjectInvolves | NotifyAddedToTeam | NotifyDenial;

export type AcceptTeamInviteError = {
  /** The title of the error */
  title: ?string;
  /** The full error */
  message: ?string;
}

export type AcceptTeamInviteNotificationPayload = {
  /** Thea team that the invitee will be joining */
  team: ?Team;
  /** The new team member on the team */
  teamMember: ?TeamMember;
  /** The invite notification removed once accepted */
  removedNotification: ?NotifyTeamInvite;
  /** The invitation the viewer just accepted */
  removedInvitation: ?Invitation;
  user: ?User;
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
}

export type CancelTeamInvitePayload = {
  /** The cancelled invitation */
  invitation: ?Invitation;
  removedTeamInviteNotification: ?NotifyTeamInvite;
}

export type ClearNotificationPayload = {
  /** The deleted notifcation */
  notification: ?Notification;
}

export type CreateFirstTeamPayload = {
  team: ?Team;
  teamLead: ?TeamMember;
  /** The new JWT after adding the team */
  jwt: ?string;
}

export type CreateGitHubIssuePayload = {
  project: ?Project;
}

export type CreateProjectInput = {
  /** foreign key for AgendaItem */
  agendaId: ?string;
  content: ?string;
  /** teamId, the team the project is on */
  teamId: ?string;
  /** userId, the owner of the project */
  userId: ?string;
  sortOrder: ?number;
  status: ?ProjectStatusEnum;
}

/**
  The part of the site that is calling the mutation
*/
export type AreaEnum = "meeting" | "teamDash" | "userDash";

export type CreateProjectPayload = {
  project: ?Project;
  involvementNotification: ?NotifyProjectInvolves;
}

/**
  A notification sent to someone who was just added to a team
*/
export type NotifyProjectInvolves = {
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
  /** How the user is affiliated with the project */
  involvement: ?ProjectInvolvementType;
  /** The projectId that now involves the userId */
  projectId: string;
  /** The project that now involves the userId */
  project: ?Project;
  /** The teamMemberId of the person that made the change */
  changeAuthorId: ?string;
  /** The TeamMember of the person that made the change */
  changeAuthor: ?TeamMember;
  teamId: string;
  /** The team the project is on */
  team: ?Team;
}

/**
  How a user is involved with a project (listed in hierarchical order)
*/
export type ProjectInvolvementType = "ASSIGNEE" | "MENTIONEE";

export type DeleteProjectPayload = {
  /** The project that was deleted */
  project: ?Project;
  /** The notification stating that the viewer was mentioned or assigned */
  involvementNotification: ?NotifyProjectInvolves;
}

export type EditProjectPayload = {
  project: ?Project;
  editor: ?User;
  /** true if the editor is editing, false if they stopped editing */
  isEditing: ?boolean;
}

export type EndMeetingPayload = {
  team: ?Team;
  /** The list of projects that were archived during the meeting */
  archivedProjects: ?Array<Project>;
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
  /** The list of projects removed triggered by a removed repo if this was the last viewer on the repo */
  archivedProjectIds: ?Array<string>;
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
  archivedProjectIds: ?Array<string>;
}

export type RemoveSlackChannelPayload = {
  deletedId: string;
}

export type RemoveGitHubRepoPayload = {
  deletedId: string;
  archivedProjectIds: ?Array<string>;
}

export type RemoveTeamMemberPayload = {
  /** The team member removed */
  teamMember: ?TeamMember;
  /** The team the team member was removed from */
  team: ?Team;
  /** The projects that got reassigned */
  updatedProjects: ?Array<Project>;
  /** The user removed from the team */
  user: ?User;
  /** Any notifications pertaining to the team that are no longer relevant */
  removedNotifications: ?Array<Notification>;
  /** A notification if you were kicked out by the team leader */
  kickOutNotification: ?NotifyKickedOut;
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
  /** The team the project is on */
  team: ?Team;
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
  /** the credit card details that got updated */
  creditCard: ?CreditCard;
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

export type UpdateProjectInput = {
  /** The project id */
  id: ?string;
  content: ?string;
  sortOrder: ?number;
  status: ?ProjectStatusEnum;
  /** the owner of the project */
  userId: ?string;
}

export type UpdateProjectPayload = {
  project: ?Project;
  /** If a project was just turned private, this its ID, else null */
  privatizedProjectId: ?string;
  addedNotification: ?NotifyProjectInvolves;
  removedNotification: ?NotifyProjectInvolves;
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
  projectSubscription: ProjectSubscriptionPayload;
  slackChannelAdded: AddSlackChannelPayload;
  slackChannelRemoved: RemoveSlackChannelPayload;
  providerAdded: AddProviderPayload;
  providerRemoved: RemoveProviderPayload;
  teamSubscription: TeamSubscriptionPayload;
  teamMemberSubscription: TeanMemberSubscriptionPayload;
  upcomingInvoice: ?Invoice;
}

export type AgendaItemSubscriptionPayload = AddAgendaItemPayload | RemoveAgendaItemPayload | UpdateAgendaItemPayload | MoveMeetingPayload;

export type GitHubMemberRemovedPayload = {
  leaveIntegration: ?Array<LeaveIntegrationPayload>;
}

export type InvitationSubscriptionPayload = ApproveToOrgPayload | CancelTeamInvitePayload | InviteTeamMembersPayload | ResendTeamInvitePayload;

export type NotificationSubscriptionPayload = AddOrgPayload | AddTeamPayload | ApproveToOrgPayload | CancelApprovalPayload | CancelTeamInvitePayload | ClearNotificationPayload | CreateProjectPayload | DeleteProjectPayload | InviteTeamMembersPayload | RejectOrgApprovalPayload | StripeFailPaymentPayload | User | NotifyVersionInfo;

/**
  A notification with the app version sent upon connection
*/
export type NotifyVersionInfo = {
  /** A shortid for the notification */
  id: ?string;
  /** *The unique organization ID for this notification. Can be blank for targeted notifications */
  orgId: ?string;
  /** The datetime to activate the notification & send it to the client */
  startAt: ?any;
  type: ?NotificationEnum;
  /** *The userId that should see this notification */
  userIds: ?Array<string>;
  /** The version of the app the server is using */
  version: ?string;
}

export type OrgApprovalSubscriptionPayload = ApproveToOrgPayload | CancelApprovalPayload | InviteTeamMembersPayload | RejectOrgApprovalPayload;

export type OrganizationSubscriptionPayload = AddOrgPayload | ApproveToOrgPayload | SetOrgUserRoleAddedPayload | SetOrgUserRoleRemovedPayload | UpdateOrgPayload | UpgradeToProPayload;

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

export type ProjectSubscriptionPayload = CreateGitHubIssuePayload | CreateProjectPayload | DeleteProjectPayload | EditProjectPayload | EndMeetingPayload | RemoveTeamMemberPayload | UpdateProjectPayload;

export type AddProviderPayload = {
  providerRow: ProviderRow;
  provider: ?Provider;
  /** All the integrationIds that the provider has successfully joined */
  joinedIntegrationIds: ?Array<string>;
  teamMember: ?TeamMember;
}

export type TeamSubscriptionPayload = AcceptTeamInviteEmailPayload | AcceptTeamInviteNotificationPayload | AddTeamPayload | ArchiveTeamPayload | EndMeetingPayload | KillMeetingPayload | MoveMeetingPayload | PromoteFacilitatorPayload | RequestFacilitatorPayload | StartMeetingPayload | RemoveTeamMemberPayload | UpdateCheckInQuestionPayload | UpdateTeamNamePayload | UpgradeToProPayload;

export type TeanMemberSubscriptionPayload = AcceptTeamInviteNotificationPayload | AcceptTeamInviteEmailPayload | RemoveTeamMemberPayload | InviteTeamMembersPayload | MeetingCheckInPayload | PromoteToTeamLeadPayload;

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