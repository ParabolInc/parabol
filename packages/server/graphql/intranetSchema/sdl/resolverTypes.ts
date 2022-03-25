// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { PingableServicesSource } from './types/PingableServices';
import { LoginsPayloadSource } from './types/LoginsPayload';
import { InternalContext } from '../../graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Email: any;
  URL: any;
};

/** An action meeting */
export type ActionMeeting = NewMeeting & {
  __typename?: 'ActionMeeting';
  /** A single agenda item */
  agendaItem?: Maybe<AgendaItem>;
  /** The number of agenda items generated in the meeting */
  agendaItemCount: Scalars['Int'];
  /** All of the agenda items for the meeting */
  agendaItems: Array<AgendaItem>;
  /** The number of comments generated in the meeting */
  commentCount: Scalars['Int'];
  /** The timestamp the meeting was created */
  createdAt: Scalars['DateTime'];
  /** The id of the user that created the meeting */
  createdBy: Scalars['ID'];
  /** The user that created the meeting */
  createdByUser: User;
  /** The timestamp the meeting officially ended */
  endedAt?: Maybe<Scalars['DateTime']>;
  /** The facilitator team member */
  facilitator: TeamMember;
  /** The location of the facilitator in the meeting */
  facilitatorStageId: Scalars['ID'];
  /** The userId (or anonymousId) of the most recent facilitator */
  facilitatorUserId: Scalars['ID'];
  /** The unique meeting id. shortid. */
  id: Scalars['ID'];
  /** The team members that were active during the time of the meeting */
  meetingMembers: Array<ActionMeetingMember>;
  /** The auto-incrementing meeting number for the team */
  meetingNumber: Scalars['Int'];
  meetingType: MeetingTypeEnum;
  /** The name of the meeting */
  name: Scalars['String'];
  /** The organization this meeting belongs to */
  organization: Organization;
  /** The phases the meeting will go through, including all phase-specific state */
  phases: Array<NewMeetingPhase>;
  /** The settings that govern the action meeting */
  settings: ActionMeetingSettings;
  /** true if should show the org the conversion modal, else false */
  showConversionModal: Scalars['Boolean'];
  /** The time the meeting summary was emailed to the team */
  summarySentAt?: Maybe<Scalars['DateTime']>;
  /** The number of tasks generated in the meeting */
  taskCount: Scalars['Int'];
  /** The tasks created within the meeting */
  tasks: Array<Task>;
  /** The team that ran the meeting */
  team: Team;
  /** foreign key for team */
  teamId: Scalars['ID'];
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** The action meeting member of the viewer */
  viewerMeetingMember?: Maybe<ActionMeetingMember>;
};


/** An action meeting */
export type ActionMeetingAgendaItemArgs = {
  agendaItemId: Scalars['ID'];
};

/** All the meeting specifics for a user in a action meeting */
export type ActionMeetingMember = MeetingMember & {
  __typename?: 'ActionMeetingMember';
  /** The tasks marked as done in the meeting */
  doneTasks: Array<Task>;
  /** A composite of userId::meetingId */
  id: Scalars['ID'];
  /**
   * true if present, false if absent, else null
   * @deprecated Members are checked in when they enter the meeting now & not created beforehand
   */
  isCheckedIn?: Maybe<Scalars['Boolean']>;
  meetingId: Scalars['ID'];
  meetingType: MeetingTypeEnum;
  /** The tasks assigned to members during the meeting */
  tasks: Array<Task>;
  teamId: Scalars['ID'];
  teamMember: TeamMember;
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['ID'];
};

/** The action-specific meeting settings */
export type ActionMeetingSettings = TeamMeetingSettings & {
  __typename?: 'ActionMeetingSettings';
  id: Scalars['ID'];
  /** The type of meeting these settings apply to */
  meetingType: MeetingTypeEnum;
  /** The broad phase types that will be addressed during the meeting */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>;
  /** The team these settings belong to */
  team: Team;
  /** FK */
  teamId: Scalars['ID'];
};

export type AddNewFeaturePayload = {
  __typename?: 'AddNewFeaturePayload';
  /** the new feature broadcast */
  newFeature?: Maybe<NewFeatureBroadcast>;
};

/** A request placeholder that will likely turn into 1 or more tasks */
export type AgendaItem = {
  __typename?: 'AgendaItem';
  /**
   * A list of users currently commenting
   * @deprecated Moved to ThreadConnection. Can remove Jun-01-2021
   */
  commentors?: Maybe<Array<CommentorDetails>>;
  /** The body of the agenda item */
  content: Scalars['String'];
  /** The timestamp the agenda item was created */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** The unique agenda item id teamId::shortid */
  id: Scalars['ID'];
  /** true if the agenda item has not been processed or deleted */
  isActive: Scalars['Boolean'];
  /** The meetingId of the agenda item */
  meetingId?: Maybe<Scalars['ID']>;
  /** True if the agenda item has been pinned */
  pinned?: Maybe<Scalars['Boolean']>;
  /** If pinned, this is the unique id of the original agenda item */
  pinnedParentId?: Maybe<Scalars['ID']>;
  /** The sort order of the agenda item in the list */
  sortOrder: Scalars['Float'];
  /** *The team for this agenda item */
  teamId: Scalars['ID'];
  /** The team member that created the agenda item */
  teamMember: TeamMember;
  /** The teamMemberId that created this agenda item */
  teamMemberId: Scalars['ID'];
  /** The timestamp the agenda item was updated */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** The meeting phase where all team members discuss the topics with the most votes */
export type AgendaItemsPhase = NewMeetingPhase & {
  __typename?: 'AgendaItemsPhase';
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  stages: Array<AgendaItemsStage>;
  teamId: Scalars['ID'];
};

/** The stage where the team discusses a single agenda item */
export type AgendaItemsStage = DiscussionThreadStage & NewMeetingStage & {
  __typename?: 'AgendaItemsStage';
  agendaItem: AgendaItem;
  /** The id of the agenda item this relates to */
  agendaItemId: Scalars['ID'];
  /** The discussion about the stage */
  discussion: Discussion;
  /** The ID to find the discussion that goes in the stage */
  discussionId: Scalars['ID'];
  /** The datetime the stage was completed */
  endAt?: Maybe<Scalars['DateTime']>;
  /** stageId, shortid */
  id: Scalars['ID'];
  /** true if a time limit is set, false if end time is set, null if neither is set */
  isAsync?: Maybe<Scalars['Boolean']>;
  /** true if the facilitator has completed this stage, else false. Should be boolean(endAt) */
  isComplete: Scalars['Boolean'];
  /** true if any meeting participant can navigate to this stage */
  isNavigable: Scalars['Boolean'];
  /** true if the facilitator can navigate to this stage */
  isNavigableByFacilitator: Scalars['Boolean'];
  /** true if the viewer is ready to advance, else false */
  isViewerReady: Scalars['Boolean'];
  /** The meeting this stage belongs to */
  meeting?: Maybe<NewMeeting>;
  /** foreign key. try using meeting */
  meetingId: Scalars['ID'];
  /** The phase this stage belongs to */
  phase?: Maybe<NewMeetingPhase>;
  /** The type of the phase */
  phaseType?: Maybe<NewMeetingPhaseTypeEnum>;
  /** the number of meeting members ready to advance, excluding the facilitator */
  readyCount: Scalars['Int'];
  /** The datetime the phase is scheduled to be finished, null if no time limit or end time is set */
  scheduledEndTime?: Maybe<Scalars['DateTime']>;
  /** The datetime the stage was started */
  startAt?: Maybe<Scalars['DateTime']>;
  /** The suggested ending datetime for a phase to be completed async, null if not enough data to make a suggestion */
  suggestedEndTime?: Maybe<Scalars['DateTime']>;
  /** The suggested time limit for a phase to be completed together, null if not enough data to make a suggestion */
  suggestedTimeLimit?: Maybe<Scalars['Float']>;
  teamId: Scalars['ID'];
  /** The number of milliseconds left before the scheduled end time. Useful for unsynced client clocks. null if scheduledEndTime is null */
  timeRemaining?: Maybe<Scalars['Float']>;
  /** Number of times the facilitator has visited this stage */
  viewCount?: Maybe<Scalars['Int']>;
};

/** The atlassian auth + integration helpers for a specific team member */
export type AtlassianIntegration = {
  __typename?: 'AtlassianIntegration';
  /** The access token to atlassian, useful for 1 hour. null if no access token available or the viewer is not the user */
  accessToken?: Maybe<Scalars['ID']>;
  /** *The atlassian account ID */
  accountId: Scalars['ID'];
  /** The atlassian cloud IDs that the user has granted */
  cloudIds: Array<Scalars['ID']>;
  /** The timestamp the provider was created */
  createdAt: Scalars['DateTime'];
  /** Composite key in atlassiani:teamId:userId format */
  id: Scalars['ID'];
  /** true if the auth is valid, else false */
  isActive: Scalars['Boolean'];
  /** A list of issues coming straight from the jira integration for a specific team member */
  issues: JiraIssueConnection;
  /** The list of field names that can be used as a  */
  jiraFields: Array<Scalars['String']>;
  /** the list of suggested search queries, sorted by most recent. Guaranteed to be < 60 days old */
  jiraSearchQueries: Array<JiraSearchQuery>;
  /** A list of projects accessible by this team member. empty if viewer is not the user */
  projects: Array<JiraRemoteProject>;
  /** *The team that the token is linked to */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
  /** The user that the access token is attached to */
  userId: Scalars['ID'];
};


/** The atlassian auth + integration helpers for a specific team member */
export type AtlassianIntegrationIssuesArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  first?: InputMaybe<Scalars['Int']>;
  isJQL: Scalars['Boolean'];
  projectKeyFilters?: InputMaybe<Array<Scalars['ID']>>;
  queryString?: InputMaybe<Scalars['String']>;
};


/** The atlassian auth + integration helpers for a specific team member */
export type AtlassianIntegrationJiraFieldsArgs = {
  cloudId: Scalars['ID'];
};

/** The atlassian integration details shared across an entire team */
export type AtlassianTeamIntegration = {
  __typename?: 'AtlassianTeamIntegration';
  /** shortid */
  id: Scalars['ID'];
  /** The dimensions and their corresponding Jira fields */
  jiraDimensionFields: Array<JiraDimensionField>;
};

/** An authentication strategy to log in to Parabol */
export type AuthIdentity = {
  /** true if the email address using this strategy is verified, else false */
  isEmailVerified: Scalars['Boolean'];
  type: AuthIdentityTypeEnum;
};

/** An authentication strategy using Google */
export type AuthIdentityGoogle = AuthIdentity & {
  __typename?: 'AuthIdentityGoogle';
  /** The googleID for this strategy */
  id: Scalars['ID'];
  /** true if the email address using this strategy is verified, else false */
  isEmailVerified: Scalars['Boolean'];
  type: AuthIdentityTypeEnum;
};

/** An authentication strategy using an email & password */
export type AuthIdentityLocal = AuthIdentity & {
  __typename?: 'AuthIdentityLocal';
  /** true if the email address using this strategy is verified, else false */
  isEmailVerified: Scalars['Boolean'];
  type: AuthIdentityTypeEnum;
};

/** The types of authentication strategies */
export enum AuthIdentityTypeEnum {
  Google = 'GOOGLE',
  Local = 'LOCAL'
}

/** The source that a change to a record came in through */
export enum ChangeSourceEnum {
  External = 'external',
  Meeting = 'meeting',
  Task = 'task'
}

/** The meeting phase where all team members check in one-by-one */
export type CheckInPhase = NewMeetingPhase & {
  __typename?: 'CheckInPhase';
  /** The checkIn greeting (fun language) */
  checkInGreeting: MeetingGreeting;
  /** The checkIn question of the week (draft-js format) */
  checkInQuestion: Scalars['String'];
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  stages: Array<CheckInStage>;
  teamId: Scalars['ID'];
};

/** A stage that focuses on a single team member */
export type CheckInStage = NewMeetingStage & NewMeetingTeamMemberStage & {
  __typename?: 'CheckInStage';
  /** The datetime the stage was completed */
  endAt?: Maybe<Scalars['DateTime']>;
  /** stageId, shortid */
  id: Scalars['ID'];
  /** true if a time limit is set, false if end time is set, null if neither is set */
  isAsync?: Maybe<Scalars['Boolean']>;
  /** true if the facilitator has completed this stage, else false. Should be boolean(endAt) */
  isComplete: Scalars['Boolean'];
  /** true if any meeting participant can navigate to this stage */
  isNavigable: Scalars['Boolean'];
  /** true if the facilitator can navigate to this stage */
  isNavigableByFacilitator: Scalars['Boolean'];
  /** true if the viewer is ready to advance, else false */
  isViewerReady: Scalars['Boolean'];
  /** The meeting this stage belongs to */
  meeting?: Maybe<NewMeeting>;
  /** foreign key. try using meeting */
  meetingId: Scalars['ID'];
  /** The meeting member that is the focus for this phase item */
  meetingMember: MeetingMember;
  /** The phase this stage belongs to */
  phase?: Maybe<NewMeetingPhase>;
  /** The type of the phase */
  phaseType?: Maybe<NewMeetingPhaseTypeEnum>;
  /** the number of meeting members ready to advance, excluding the facilitator */
  readyCount: Scalars['Int'];
  /** The datetime the phase is scheduled to be finished, null if no time limit or end time is set */
  scheduledEndTime?: Maybe<Scalars['DateTime']>;
  /** The datetime the stage was started */
  startAt?: Maybe<Scalars['DateTime']>;
  /** The suggested ending datetime for a phase to be completed async, null if not enough data to make a suggestion */
  suggestedEndTime?: Maybe<Scalars['DateTime']>;
  /** The suggested time limit for a phase to be completed together, null if not enough data to make a suggestion */
  suggestedTimeLimit?: Maybe<Scalars['Float']>;
  teamId: Scalars['ID'];
  /** The team member that is the focus for this phase item */
  teamMember: TeamMember;
  /** foreign key. use teamMember */
  teamMemberId: Scalars['ID'];
  /** The number of milliseconds left before the scheduled end time. Useful for unsynced client clocks. null if scheduledEndTime is null */
  timeRemaining?: Maybe<Scalars['Float']>;
  /** Number of times the facilitator has visited this stage */
  viewCount?: Maybe<Scalars['Int']>;
};

/** A comment on a thread */
export type Comment = Reactable & Threadable & {
  __typename?: 'Comment';
  /** The rich text body of the item, if inactive, a tombstone text */
  content: Scalars['String'];
  /** The timestamp the item was created */
  createdAt: Scalars['DateTime'];
  /** The userId that created the item, null if anonymous */
  createdBy?: Maybe<Scalars['ID']>;
  /** The user that created the item, null if anonymous */
  createdByUser?: Maybe<User>;
  /** The FK of the discussion this task was created in. Null if task was not created in a discussion */
  discussionId?: Maybe<Scalars['ID']>;
  /** shortid */
  id: Scalars['ID'];
  /** true if the agenda item has not been processed or deleted */
  isActive: Scalars['Boolean'];
  /** true if the comment is anonymous, else false */
  isAnonymous: Scalars['Boolean'];
  /** true if the viewer wrote this comment, else false */
  isViewerComment: Scalars['Boolean'];
  /** All the reactjis for the given reflection */
  reactjis: Array<Reactji>;
  /** the replies to this threadable item */
  replies: Array<Threadable>;
  /** the parent, if this threadable is a reply, else null */
  threadParentId?: Maybe<Scalars['ID']>;
  /** the order of this threadable, relative to threadParentId */
  threadSortOrder?: Maybe<Scalars['Float']>;
  /** The timestamp the item was updated */
  updatedAt: Scalars['DateTime'];
};

/** The user that is commenting */
export type CommentorDetails = {
  __typename?: 'CommentorDetails';
  /** The userId of the person commenting */
  id: Scalars['ID'];
  /** The preferred name of the user commenting */
  preferredName: Scalars['String'];
};

/** A grouping of organizations. Automatically grouped by top level domain of each */
export type Company = {
  __typename?: 'Company';
  /** the number of active teams across all organizations */
  activeTeamCount: Scalars['Int'];
  /** the number of active users across all organizations */
  activeUserCount: Scalars['Int'];
  /** the top level domain */
  id: Scalars['ID'];
  /** the last time any team in the organization started a meeting, null if no meetings were ever run */
  lastMetAt?: Maybe<Scalars['DateTime']>;
  /** the total number of meetings started across all teams on all organizations */
  meetingCount: Scalars['Int'];
  /** the longest monthly streak for meeting at least once per month for any team in the company */
  monthlyTeamStreakMax: Scalars['Int'];
  /** Get the list of all organizations that belong to the company */
  organizations: Array<Organization>;
  /** The highest tier for any organization within the company */
  tier: TierEnum;
  /** the total number of users across all organizations */
  userCount: Scalars['Int'];
};

/** The discount coupon from Stripe, if any */
export type Coupon = {
  __typename?: 'Coupon';
  /** The amount off the invoice, if any */
  amountOff?: Maybe<Scalars['Int']>;
  /** The ID of the discount coupon from Stripe */
  id: Scalars['String'];
  /** The name of the discount coupon from Stripe */
  name: Scalars['String'];
  /** The percent off the invoice, if any */
  percentOff?: Maybe<Scalars['Int']>;
};

/** A credit card */
export type CreditCard = {
  __typename?: 'CreditCard';
  /** The brand of the credit card, as provided by stripe */
  brand: Scalars['String'];
  /** The MM/YY string of the expiration date */
  expiry: Scalars['String'];
  /** The last 4 digits of a credit card */
  last4: Scalars['String'];
};

export type DeleteUserPayload = {
  __typename?: 'DeleteUserPayload';
  error?: Maybe<StandardMutationError>;
};

export type DisconnectSocketPayload = {
  __typename?: 'DisconnectSocketPayload';
  /** The user that disconnected */
  user?: Maybe<User>;
};

/** The meeting phase where all team members discuss the topics with the most votes */
export type DiscussPhase = NewMeetingPhase & {
  __typename?: 'DiscussPhase';
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  stages: Array<RetroDiscussStage>;
  teamId: Scalars['ID'];
};

/** A discussion thread */
export type Discussion = {
  __typename?: 'Discussion';
  /** The number of comments contained in the thread */
  commentCount: Scalars['Int'];
  /** The users writing a comment right now */
  commentors: Array<User>;
  /** time the thread was created */
  createdAt: Scalars['DateTime'];
  /** The partial foreign key that references the object that is the topic of the discussion. E.g. AgendaItemId, TaskId, ReflectionGroupId */
  discussionTopicId: Scalars['ID'];
  /** The partial foregin key that describes the type of object that is the topic of the discussion. E.g. AgendaItem, TaskId, ReflectionGroup, GitHubIssue */
  discussionTopicType: DiscussionTopicTypeEnum;
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  teamId: Scalars['ID'];
  /** The comments & tasks thread in the discussion */
  thread: ThreadableConnection;
};


/** A discussion thread */
export type DiscussionThreadArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** A meeting stage that includes a discussion thread */
export type DiscussionThreadStage = {
  /** The discussion about the stage */
  discussion: Discussion;
  /** The ID to find the discussion that goes in the stage */
  discussionId: Scalars['ID'];
};

/** The topic being discussed */
export enum DiscussionTopicTypeEnum {
  AgendaItem = 'agendaItem',
  GithubIssue = 'githubIssue',
  JiraIssue = 'jiraIssue',
  ReflectionGroup = 'reflectionGroup',
  Task = 'task'
}

export type DomainCountPayload = {
  __typename?: 'DomainCountPayload';
  /** the email domain */
  domain: Scalars['ID'];
  /** the sum total */
  total: Scalars['Int'];
};

export type DraftEnterpriseInvoicePayload = {
  __typename?: 'DraftEnterpriseInvoicePayload';
  error?: Maybe<StandardMutationError>;
  /** The updated organization */
  organization?: Maybe<Organization>;
};

/** Return object for EnableSAMLForDomainPayload */
export type EnableSamlForDomainPayload = EnableSamlForDomainSuccess | ErrorPayload;

export type EnableSamlForDomainSuccess = {
  __typename?: 'EnableSAMLForDomainSuccess';
  success: Scalars['Boolean'];
};

export type ErrorPayload = {
  __typename?: 'ErrorPayload';
  error: StandardMutationError;
};

/** The meeting phase where all team members estimate a the point value of a task */
export type EstimatePhase = NewMeetingPhase & {
  __typename?: 'EstimatePhase';
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  stages: Array<EstimateStage>;
  teamId: Scalars['ID'];
};

/** The stage where the team estimates & discusses a single task */
export type EstimateStage = DiscussionThreadStage & NewMeetingStage & {
  __typename?: 'EstimateStage';
  /** The id of the user that added this stage. */
  creatorUserId: Scalars['ID'];
  /** The immutable dimension linked to this stage */
  dimensionRef: TemplateDimensionRef;
  /** The immutable index of the dimensionRef tied to this stage */
  dimensionRefIdx: Scalars['Int'];
  /** The discussion about the stage */
  discussion: Discussion;
  /** The ID to find the discussion that goes in the stage */
  discussionId: Scalars['ID'];
  /** The datetime the stage was completed */
  endAt?: Maybe<Scalars['DateTime']>;
  /** the final score, as defined by the facilitator */
  finalScore?: Maybe<Scalars['String']>;
  /** the userIds of the team members hovering the deck */
  hoveringUserIds: Array<Scalars['ID']>;
  /** the users of the team members hovering the deck */
  hoveringUsers: Array<User>;
  /** stageId, shortid */
  id: Scalars['ID'];
  /** true if a time limit is set, false if end time is set, null if neither is set */
  isAsync?: Maybe<Scalars['Boolean']>;
  /** true if the facilitator has completed this stage, else false. Should be boolean(endAt) */
  isComplete: Scalars['Boolean'];
  /** true if any meeting participant can navigate to this stage */
  isNavigable: Scalars['Boolean'];
  /** true if the facilitator can navigate to this stage */
  isNavigableByFacilitator: Scalars['Boolean'];
  /** true if the viewer is ready to advance, else false */
  isViewerReady: Scalars['Boolean'];
  /** true when the participants are still voting and results are hidden. false when votes are revealed */
  isVoting: Scalars['Boolean'];
  /** The meeting this stage belongs to */
  meeting?: Maybe<NewMeeting>;
  /** foreign key. try using meeting */
  meetingId: Scalars['ID'];
  /** The phase this stage belongs to */
  phase?: Maybe<NewMeetingPhase>;
  /** The type of the phase */
  phaseType?: Maybe<NewMeetingPhaseTypeEnum>;
  /** the number of meeting members ready to advance, excluding the facilitator */
  readyCount: Scalars['Int'];
  /** The datetime the phase is scheduled to be finished, null if no time limit or end time is set */
  scheduledEndTime?: Maybe<Scalars['DateTime']>;
  /** all the estimates, 1 per user */
  scores: Array<EstimateUserScore>;
  /** The field name used by the service for this dimension */
  serviceField: ServiceField;
  /** The datetime the stage was started */
  startAt?: Maybe<Scalars['DateTime']>;
  /** The suggested ending datetime for a phase to be completed async, null if not enough data to make a suggestion */
  suggestedEndTime?: Maybe<Scalars['DateTime']>;
  /** The suggested time limit for a phase to be completed together, null if not enough data to make a suggestion */
  suggestedTimeLimit?: Maybe<Scalars['Float']>;
  /** The task referenced in the stage, as it exists in Parabol. null if the task was deleted */
  task?: Maybe<Task>;
  /** The ID that points to the issue that exists in parabol */
  taskId: Scalars['ID'];
  teamId: Scalars['ID'];
  /** The number of milliseconds left before the scheduled end time. Useful for unsynced client clocks. null if scheduledEndTime is null */
  timeRemaining?: Maybe<Scalars['Float']>;
  /** Number of times the facilitator has visited this stage */
  viewCount?: Maybe<Scalars['Int']>;
};

/** The user and number of points they estimated for dimension (where 1 stage has 1 dimension) */
export type EstimateUserScore = {
  __typename?: 'EstimateUserScore';
  /** shortid */
  id: Scalars['ID'];
  /** The label that was associated with the score at the time of the vote. Note: It may no longer exist on the dimension */
  label: Scalars['String'];
  /** The stageId */
  stageId: Scalars['ID'];
  /** The user that for this score */
  user: User;
  /** The userId that for this score */
  userId: Scalars['ID'];
};

export type FlagConversionModalPayload = {
  __typename?: 'FlagConversionModalPayload';
  error?: Maybe<StandardMutationError>;
  /** the org with the limit added or removed */
  org?: Maybe<Organization>;
};

export type FlagOverLimitPayload = {
  __typename?: 'FlagOverLimitPayload';
  error?: Maybe<StandardMutationError>;
  /** the users with the limit added or removed */
  users?: Maybe<Array<Maybe<User>>>;
};

/** An all-purpose meeting phase with no extra state */
export type GenericMeetingPhase = NewMeetingPhase & {
  __typename?: 'GenericMeetingPhase';
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  stages: Array<GenericMeetingStage>;
  teamId: Scalars['ID'];
};

/** A stage of a meeting that has no extra state. Only used for single-stage phases */
export type GenericMeetingStage = NewMeetingStage & {
  __typename?: 'GenericMeetingStage';
  /** The datetime the stage was completed */
  endAt?: Maybe<Scalars['DateTime']>;
  /** stageId, shortid */
  id: Scalars['ID'];
  /** true if a time limit is set, false if end time is set, null if neither is set */
  isAsync?: Maybe<Scalars['Boolean']>;
  /** true if the facilitator has completed this stage, else false. Should be boolean(endAt) */
  isComplete: Scalars['Boolean'];
  /** true if any meeting participant can navigate to this stage */
  isNavigable: Scalars['Boolean'];
  /** true if the facilitator can navigate to this stage */
  isNavigableByFacilitator: Scalars['Boolean'];
  /** true if the viewer is ready to advance, else false */
  isViewerReady: Scalars['Boolean'];
  /** The meeting this stage belongs to */
  meeting?: Maybe<NewMeeting>;
  /** foreign key. try using meeting */
  meetingId: Scalars['ID'];
  /** The phase this stage belongs to */
  phase?: Maybe<NewMeetingPhase>;
  /** The type of the phase */
  phaseType?: Maybe<NewMeetingPhaseTypeEnum>;
  /** the number of meeting members ready to advance, excluding the facilitator */
  readyCount: Scalars['Int'];
  /** The datetime the phase is scheduled to be finished, null if no time limit or end time is set */
  scheduledEndTime?: Maybe<Scalars['DateTime']>;
  /** The datetime the stage was started */
  startAt?: Maybe<Scalars['DateTime']>;
  /** The suggested ending datetime for a phase to be completed async, null if not enough data to make a suggestion */
  suggestedEndTime?: Maybe<Scalars['DateTime']>;
  /** The suggested time limit for a phase to be completed together, null if not enough data to make a suggestion */
  suggestedTimeLimit?: Maybe<Scalars['Float']>;
  teamId: Scalars['ID'];
  /** The number of milliseconds left before the scheduled end time. Useful for unsynced client clocks. null if scheduledEndTime is null */
  timeRemaining?: Maybe<Scalars['Float']>;
  /** Number of times the facilitator has visited this stage */
  viewCount?: Maybe<Scalars['Int']>;
};

/** OAuth token for a team member */
export type GitHubIntegration = {
  __typename?: 'GitHubIntegration';
  /** The access token to github. good forever */
  accessToken?: Maybe<Scalars['ID']>;
  /** The timestamp the provider was created */
  createdAt: Scalars['DateTime'];
  /** the list of suggested search queries, sorted by most recent. Guaranteed to be < 60 days old */
  githubSearchQueries: Array<GitHubSearchQuery>;
  /** composite key */
  id: Scalars['ID'];
  /** true if an access token exists, else false */
  isActive: Scalars['Boolean'];
  /** *The GitHub login used for queries */
  login: Scalars['ID'];
  /** The comma-separated list of scopes requested from GitHub */
  scope: Scalars['String'];
  /** *The team that the token is linked to */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
  /** The user that the access token is attached to */
  userId: Scalars['ID'];
};

/** A GitHub search query including all filters selected when the query was executed */
export type GitHubSearchQuery = {
  __typename?: 'GitHubSearchQuery';
  /** shortid */
  id: Scalars['ID'];
  /** the time the search query was last used. Used for sorting */
  lastUsedAt: Scalars['DateTime'];
  /** The query string in GitHub format, including repository filters. e.g. is:issue is:open */
  queryString: Scalars['String'];
};

/** Gitlab integration data for a given team member */
export type GitLabIntegration = {
  __typename?: 'GitLabIntegration';
  /** The OAuth2 Authorization for this team member */
  auth?: Maybe<TeamMemberIntegrationAuthOAuth2>;
  /** The cloud provider the team member may choose to integrate with. Nullable based on env vars */
  cloudProvider?: Maybe<IntegrationProviderOAuth2>;
  /** The non-global providers shared with the team or organization */
  sharedProviders: Array<IntegrationProviderOAuth2>;
};

export type GoogleAnalyzedEntity = {
  __typename?: 'GoogleAnalyzedEntity';
  /** The lemma (dictionary entry) of the entity name. Fancy way of saying the singular form of the name, if plural. */
  lemma: Scalars['String'];
  /** The name of the entity. Usually 1 or 2 words. Always a noun, sometimes a proper noun. */
  name: Scalars['String'];
  /** The salience of the entity in the provided text. The salience of all entities always sums to 1 */
  salience: Scalars['Float'];
};

/** An authentication provider configuration */
export type IntegrationProvider = {
  /** The kind of token used by this provider (OAuth2, PAT, Webhook) */
  authStrategy: IntegrationProviderAuthStrategyEnum;
  /** The timestamp the provider was created */
  createdAt: Scalars['DateTime'];
  /** The provider's unique identifier */
  id: Scalars['ID'];
  /** true if the provider configuration should be used */
  isActive: Scalars['Boolean'];
  /** The scope this provider configuration was created at (globally, org-wide, or by the team) */
  scope: IntegrationProviderScopeEnum;
  /** The name of the integration service (GitLab, Mattermost, etc) */
  service: IntegrationProviderServiceEnum;
  /** The team that created the provider. "aGhostTeam" if global */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
};

/** The kind of token provided by the service */
export enum IntegrationProviderAuthStrategyEnum {
  Oauth1 = 'oauth1',
  Oauth2 = 'oauth2',
  Pat = 'pat',
  Webhook = 'webhook'
}

/** An integration provider that connects via OAuth1.0 */
export type IntegrationProviderOAuth1 = IntegrationProvider & {
  __typename?: 'IntegrationProviderOAuth1';
  /** The kind of token used by this provider (OAuth2, PAT, Webhook) */
  authStrategy: IntegrationProviderAuthStrategyEnum;
  /** The timestamp the provider was created */
  createdAt: Scalars['DateTime'];
  /** The provider's unique identifier */
  id: Scalars['ID'];
  /** true if the provider configuration should be used */
  isActive: Scalars['Boolean'];
  /** The scope this provider configuration was created at (globally, org-wide, or by the team) */
  scope: IntegrationProviderScopeEnum;
  /** The base URL of the OAuth1 server */
  serverBaseUrl: Scalars['URL'];
  /** The name of the integration service (GitLab, Mattermost, etc) */
  service: IntegrationProviderServiceEnum;
  /** The team that created the provider. "aGhostTeam" if global */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
};

/** An integration provider that connects via OAuth2 */
export type IntegrationProviderOAuth2 = IntegrationProvider & {
  __typename?: 'IntegrationProviderOAuth2';
  /** The kind of token used by this provider (OAuth2, PAT, Webhook) */
  authStrategy: IntegrationProviderAuthStrategyEnum;
  /** The OAuth2 client id */
  clientId: Scalars['ID'];
  /** The timestamp the provider was created */
  createdAt: Scalars['DateTime'];
  /** The provider's unique identifier */
  id: Scalars['ID'];
  /** true if the provider configuration should be used */
  isActive: Scalars['Boolean'];
  /** The scope this provider configuration was created at (globally, org-wide, or by the team) */
  scope: IntegrationProviderScopeEnum;
  /** The base URL of the OAuth2 server */
  serverBaseUrl: Scalars['URL'];
  /** The name of the integration service (GitLab, Mattermost, etc) */
  service: IntegrationProviderServiceEnum;
  /** The team that created the provider. "aGhostTeam" if global */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
};

/** The scope this provider was created on (globally, org-wide, or on the team) */
export enum IntegrationProviderScopeEnum {
  Global = 'global',
  Org = 'org',
  Team = 'team'
}

/** The name of the service of the Integration Provider */
export enum IntegrationProviderServiceEnum {
  Github = 'github',
  Gitlab = 'gitlab',
  Jira = 'jira',
  JiraServer = 'jiraServer',
  Mattermost = 'mattermost'
}

/** An integration provider that connects via webhook */
export type IntegrationProviderWebhook = IntegrationProvider & {
  __typename?: 'IntegrationProviderWebhook';
  /** The kind of token used by this provider (OAuth2, PAT, Webhook) */
  authStrategy: IntegrationProviderAuthStrategyEnum;
  /** The timestamp the provider was created */
  createdAt: Scalars['DateTime'];
  /** The provider's unique identifier */
  id: Scalars['ID'];
  /** true if the provider configuration should be used */
  isActive: Scalars['Boolean'];
  /** The scope this provider configuration was created at (globally, org-wide, or by the team) */
  scope: IntegrationProviderScopeEnum;
  /** The name of the integration service (GitLab, Mattermost, etc) */
  service: IntegrationProviderServiceEnum;
  /** The team that created the provider. "aGhostTeam" if global */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
  /** The webhook URL */
  webhookUrl: Scalars['URL'];
};

/** A monthly billing invoice for an organization */
export type Invoice = {
  __typename?: 'Invoice';
  /** The amount the card will be charged (total + startingBalance with a min value of 0) */
  amountDue: Scalars['Float'];
  /** The emails the invoice was sent to */
  billingLeaderEmails: Array<Scalars['Email']>;
  /** The discount coupon information from Stripe, if any discount applied */
  coupon?: Maybe<Coupon>;
  /** The datetime the invoice was first generated */
  createdAt: Scalars['DateTime'];
  /** the card used to pay the invoice */
  creditCard?: Maybe<CreditCard>;
  /** The timestamp for the end of the billing cycle */
  endAt: Scalars['DateTime'];
  /** A shortid for the invoice */
  id: Scalars['ID'];
  /** The date the invoice was created */
  invoiceDate: Scalars['DateTime'];
  /** An invoice line item for previous month adjustments */
  lines: Array<InvoiceLineItem>;
  /** The details that comprise the charges for next month */
  nextPeriodCharges: NextPeriodCharges;
  /** *The organization id to charge */
  orgId: Scalars['ID'];
  /** The persisted name of the org as it was when invoiced */
  orgName: Scalars['String'];
  /** the datetime the invoice was successfully paid */
  paidAt?: Maybe<Scalars['DateTime']>;
  /** The URL to pay via stripe if payment was not collected in app */
  payUrl?: Maybe<Scalars['String']>;
  /** The picture of the organization */
  picture?: Maybe<Scalars['URL']>;
  /** The timestamp for the beginning of the billing cycle */
  startAt: Scalars['DateTime'];
  /** The balance on the customer account (in cents) */
  startingBalance: Scalars['Float'];
  /** the status of the invoice. starts as pending, moves to paid or unpaid depending on if the payment succeeded */
  status: InvoiceStatusEnum;
  /** The tier this invoice pays for */
  tier: TierEnum;
  /** The total amount for the invoice (in USD) */
  total: Scalars['Float'];
};

/** A connection to a list of items. */
export type InvoiceConnection = {
  __typename?: 'InvoiceConnection';
  /** A list of edges. */
  edges: Array<InvoiceEdge>;
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo?: Maybe<PageInfoDateCursor>;
};

/** An edge in a connection. */
export type InvoiceEdge = {
  __typename?: 'InvoiceEdge';
  cursor?: Maybe<Scalars['DateTime']>;
  /** The item at the end of the edge */
  node: Invoice;
};

/** A single line item charge on the invoice */
export type InvoiceLineItem = {
  __typename?: 'InvoiceLineItem';
  /** The amount for the line item (in USD) */
  amount: Scalars['Float'];
  /** A description of the charge. Only present if we have no idea what the charge is */
  description?: Maybe<Scalars['String']>;
  /** Array of user activity line items that roll up to total activity (add/leave/pause/unpause) */
  details: Array<InvoiceLineItemDetails>;
  /** The unique line item id */
  id: Scalars['ID'];
  /** The total number of days that all org users have been inactive during the billing cycle */
  quantity?: Maybe<Scalars['Int']>;
  /** The line item type for a monthly billing invoice */
  type: InvoiceLineItemEnum;
};

/** The per-user-action line item details, */
export type InvoiceLineItemDetails = {
  __typename?: 'InvoiceLineItemDetails';
  /** The amount for the line item (in USD) */
  amount: Scalars['Float'];
  /** The email affected by this line item change */
  email: Scalars['Email'];
  /** End of the event. Only present if a pause action gets matched up with an unpause action */
  endAt?: Maybe<Scalars['DateTime']>;
  /** The unique detailed line item id */
  id: Scalars['ID'];
  /** The parent line item id */
  parentId: Scalars['ID'];
  /** The timestamp for the beginning of the period of no charge */
  startAt?: Maybe<Scalars['DateTime']>;
};

/** A big picture line item */
export enum InvoiceLineItemEnum {
  AddedUsers = 'ADDED_USERS',
  InactivityAdjustments = 'INACTIVITY_ADJUSTMENTS',
  OtherAdjustments = 'OTHER_ADJUSTMENTS',
  RemovedUsers = 'REMOVED_USERS'
}

/** The payment status of the invoice */
export enum InvoiceStatusEnum {
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Upcoming = 'UPCOMING'
}

/** Poker dimensions mapped to their corresponding fields in jira */
export type JiraDimensionField = {
  __typename?: 'JiraDimensionField';
  /** The atlassian cloud that the field lives in */
  cloudId: Scalars['ID'];
  /** The name of the associated dimension */
  dimensionName: Scalars['String'];
  /** The ID referring to the field name */
  fieldId: Scalars['ID'];
  /** The field name in jira that the estimate is pushed to */
  fieldName: Scalars['String'];
  /** the type of field, e.g. number, string, any */
  fieldType: Scalars['String'];
  id: Scalars['ID'];
  /** The project under the atlassian cloud the field lives in */
  projectKey: Scalars['ID'];
};

/** The Jira Issue that comes direct from Jira */
export type JiraIssue = TaskIntegration & {
  __typename?: 'JiraIssue';
  /** The ID of the jira cloud where the issue lives */
  cloudId: Scalars['ID'];
  /** The name of the jira cloud where the issue lives */
  cloudName: Scalars['ID'];
  /** The stringified ADF of the jira issue description */
  description: Scalars['String'];
  /** The description converted into raw HTML */
  descriptionHTML: Scalars['String'];
  /** GUID cloudId:issueKey */
  id: Scalars['ID'];
  /** The key of the issue as found in Jira */
  issueKey: Scalars['ID'];
  /** Field names that exists on the issue and can be used as estimation fields */
  possibleEstimationFieldNames: Array<Scalars['String']>;
  /** The project fetched from jira */
  project?: Maybe<JiraRemoteProject>;
  /** The key of the project, which is the prefix to the issueKey */
  projectKey: Scalars['ID'];
  /** The plaintext summary of the jira issue */
  summary: Scalars['String'];
  /** The parabol teamId this issue was fetched for */
  teamId: Scalars['ID'];
  /** The url to access the issue */
  url: Scalars['URL'];
  /** The parabol userId this issue was fetched for */
  userId: Scalars['ID'];
};

/** A connection to a list of items. */
export type JiraIssueConnection = {
  __typename?: 'JiraIssueConnection';
  /** A list of edges. */
  edges: Array<JiraIssueEdge>;
  /** An error with the connection, if any */
  error?: Maybe<StandardMutationError>;
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo?: Maybe<PageInfoDateCursor>;
};

/** An edge in a connection. */
export type JiraIssueEdge = {
  __typename?: 'JiraIssueEdge';
  cursor?: Maybe<Scalars['DateTime']>;
  /** The item at the end of the edge */
  node: JiraIssue;
};

/** The URLs for avatars. NOTE: If they are custom, an Authorization header is required! */
export type JiraRemoteAvatarUrls = {
  __typename?: 'JiraRemoteAvatarUrls';
  x16: Scalars['ID'];
  x24: Scalars['ID'];
  x32: Scalars['ID'];
  x48: Scalars['ID'];
};

/** A project fetched from Jira in real time */
export type JiraRemoteProject = RepoIntegration & {
  __typename?: 'JiraRemoteProject';
  avatar: Scalars['String'];
  avatarUrls: JiraRemoteAvatarUrls;
  /** The cloud ID that the project lives on. Does not exist on the Jira object! */
  cloudId: Scalars['ID'];
  id: Scalars['ID'];
  key: Scalars['String'];
  name: Scalars['String'];
  projectCategory: JiraRemoteProjectCategory;
  self: Scalars['ID'];
  service: IntegrationProviderServiceEnum;
  simplified: Scalars['Boolean'];
  style: Scalars['String'];
  /** The parabol teamId this issue was fetched for */
  teamId: Scalars['ID'];
  /** The parabol userId this issue was fetched for */
  userId: Scalars['ID'];
};

/** A project category fetched from a JiraRemoteProject */
export type JiraRemoteProjectCategory = {
  __typename?: 'JiraRemoteProjectCategory';
  description: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  self: Scalars['String'];
};

/** A jira search query including all filters selected when the query was executed */
export type JiraSearchQuery = {
  __typename?: 'JiraSearchQuery';
  /** shortid */
  id: Scalars['ID'];
  /** true if the queryString is JQL, else false */
  isJQL: Scalars['Boolean'];
  /** the time the search query was last used. Used for sorting */
  lastUsedAt: Scalars['DateTime'];
  /** The list of project keys selected as a filter. null if not set */
  projectKeyFilters: Array<Scalars['ID']>;
  /** The query string, either simple or JQL depending on the isJQL flag */
  queryString: Scalars['String'];
};

/** Jira Server integration data for a given team member */
export type JiraServerIntegration = {
  __typename?: 'JiraServerIntegration';
  /** The OAuth1 Authorization for this team member */
  auth?: Maybe<TeamMemberIntegrationAuthOAuth1>;
  /** A list of projects accessible by this team member. empty if viewer is not the user */
  projects: Array<JiraServerRemoteProject>;
  /** The non-global providers shared with the team or organization */
  sharedProviders: Array<IntegrationProviderOAuth1>;
};

/** A project fetched from Jira in real time */
export type JiraServerRemoteProject = RepoIntegration & {
  __typename?: 'JiraServerRemoteProject';
  avatar: Scalars['String'];
  avatarUrls: JiraRemoteAvatarUrls;
  id: Scalars['ID'];
  name: Scalars['String'];
  projectCategory: JiraRemoteProjectCategory;
  service: IntegrationProviderServiceEnum;
  /** The parabol teamId this issue was fetched for */
  teamId: Scalars['ID'];
  /** The parabol userId this issue was fetched for */
  userId: Scalars['ID'];
};

export type LoginSamlPayload = {
  __typename?: 'LoginSAMLPayload';
  /** The new JWT */
  authToken?: Maybe<Scalars['ID']>;
  error?: Maybe<StandardMutationError>;
};

export type LoginsPayload = {
  __typename?: 'LoginsPayload';
  /** The total broken down by email domain */
  byDomain: Array<DomainCountPayload>;
  /** the total number of records */
  total: Scalars['Int'];
};

/** An invitation and expiration */
export type MassInvitation = {
  __typename?: 'MassInvitation';
  /** the expiration for the token */
  expiration: Scalars['DateTime'];
  /** the invitation token */
  id: Scalars['ID'];
  meetingId?: Maybe<Scalars['ID']>;
};

/** Integration Auth and shared providers available to the team member */
export type MattermostIntegration = {
  __typename?: 'MattermostIntegration';
  /** The OAuth2 Authorization for this team member */
  auth?: Maybe<TeamMemberIntegrationAuthWebhook>;
  /** The non-global providers shared with the team or organization */
  sharedProviders: Array<IntegrationProviderWebhook>;
};

export type MeetingGreeting = {
  __typename?: 'MeetingGreeting';
  /** The foreign-language greeting */
  content: Scalars['String'];
  /** The source language for the greeting */
  language: Scalars['String'];
};

/** All the user details for a specific meeting */
export type MeetingMember = {
  /** A composite of userId::meetingId */
  id: Scalars['ID'];
  /**
   * true if present, false if absent, else null
   * @deprecated Members are checked in when they enter the meeting now & not created beforehand
   */
  isCheckedIn?: Maybe<Scalars['Boolean']>;
  meetingId: Scalars['ID'];
  meetingType: MeetingTypeEnum;
  teamId: Scalars['ID'];
  teamMember: TeamMember;
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['ID'];
};

/** A meeting template that can be shared across team, orgnization and public */
export type MeetingTemplate = {
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** True if template can be used, else false */
  isActive: Scalars['Boolean'];
  /** The time of the meeting the template was last used */
  lastUsedAt?: Maybe<Scalars['DateTime']>;
  /** The name of the template */
  name: Scalars['String'];
  /** *Foreign key. The organization that owns the team that created the template */
  orgId: Scalars['ID'];
  /** Who can see this template */
  scope: SharingScopeEnum;
  /** The team this template belongs to */
  team: Team;
  /** *Foreign key. The team this template belongs to */
  teamId: Scalars['ID'];
  /** The type of the template */
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

/** The type of meeting */
export enum MeetingTypeEnum {
  Action = 'action',
  Poker = 'poker',
  Retrospective = 'retrospective',
  TeamPrompt = 'teamPrompt'
}

/** Return object for MessageAllSlackUsersPayload */
export type MessageAllSlackUsersPayload = ErrorPayload | MessageAllSlackUsersSuccess;

export type MessageAllSlackUsersSuccess = {
  __typename?: 'MessageAllSlackUsersSuccess';
  /** Slack messages that failed to send */
  errors?: Maybe<Array<MessageSlackUserError>>;
  /** A list of the Parabol user ids that have been sent a direct message in Slack */
  messagedUserIds: Array<Scalars['ID']>;
};

/** An error from sending a message to a Slack user */
export type MessageSlackUserError = {
  __typename?: 'MessageSlackUserError';
  /** The error message received from Slack */
  error: Scalars['String'];
  userId: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** broadcast a new feature to the entire userbase */
  addNewFeature?: Maybe<AddNewFeaturePayload>;
  /** automatically pause users that have been inactive for 30 days. returns the number of users paused */
  autopauseUsers?: Maybe<Scalars['Int']>;
  /** copies all the records from RethinkDB for a list of organizations */
  backupOrganization: Scalars['String'];
  /** check equality of a table between rethinkdb and postgres */
  checkRethinkPgEquality: Scalars['String'];
  /** a server-side mutation called when a client connects */
  connectSocket: User;
  /** a server-side mutation called when a client disconnects */
  disconnectSocket?: Maybe<DisconnectSocketPayload>;
  /** Create a stripe customer & subscription in stripe, send them an invoice for an enterprise license */
  draftEnterpriseInvoice?: Maybe<DraftEnterpriseInvoicePayload>;
  /** dump the memory heap to a file */
  dumpHeap?: Maybe<Scalars['String']>;
  /** Enable SAML for domain */
  enableSAMLForDomain: EnableSamlForDomainPayload;
  /** close all meetings that started before the given threshold */
  endOldMeetings?: Maybe<Scalars['Int']>;
  /** add/remove a flag on an org asking them to pay */
  flagConversionModal?: Maybe<FlagConversionModalPayload>;
  /** add/remove a flag on a user saying they are over the free tier */
  flagOverLimit?: Maybe<FlagOverLimitPayload>;
  /** hard deletes a user and all its associated objects */
  hardDeleteUser: DeleteUserPayload;
  /** Lock/Unlock teams, flagging them as unpaid/paid. Return true if successful */
  lockTeams: Scalars['Boolean'];
  /** Log in using SAML single sign on (SSO) */
  loginSAML: LoginSamlPayload;
  /** Send a message to all authorised Slack users */
  messageAllSlackUsers: MessageAllSlackUsersPayload;
  /** profile the CPU */
  profileCPU?: Maybe<Scalars['String']>;
  /** Remove Slack integrations for all users */
  removeAllSlackAuths: RemoveAllSlackAuthsPayload;
  /** schedule upcoming jobs to be run */
  runScheduledJobs?: Maybe<Scalars['Int']>;
  /** Send summary emails of unread notifications to all users who have not been seen within the last 24 hours */
  sendBatchNotificationEmails?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** send an email to organizations including all the users that were added in the current billing cycle */
  sendUpcomingInvoiceEmails?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** manually set the domain that the organization belongs to */
  setOrganizationDomain: Scalars['Boolean'];
  /** When stripe tells us an invoice is ready, create a pretty version */
  stripeCreateInvoice?: Maybe<Scalars['Boolean']>;
  /** When stripe tells us an invoice payment failed, update it in our DB */
  stripeFailPayment?: Maybe<StripeFailPaymentPayload>;
  /** An invice has been sent from stripe, meaning it is finalized */
  stripeInvoiceFinalized?: Maybe<Scalars['Boolean']>;
  /** When stripe tells us an invoice payment was successful, update it in our DB */
  stripeSucceedPayment?: Maybe<Scalars['Boolean']>;
  /** When stripe tells us a credit card was updated, update the details in our own DB */
  stripeUpdateCreditCard?: Maybe<Scalars['Boolean']>;
  /** When a new invoiceitem is sent from stripe, tag it with metadata */
  stripeUpdateInvoiceItem?: Maybe<Scalars['Boolean']>;
  /** Updates the user email */
  updateEmail: Scalars['Boolean'];
  /** Updates Atlassian OAuth tokens that haven't been updated since the date specified in input */
  updateOAuthRefreshTokens?: Maybe<Scalars['Int']>;
  /** add/remove user(s) to/from the LogRocket watchlist so that we start/stop recording their sessions */
  updateWatchlist: UpdateWatchlistPayload;
};


export type MutationAddNewFeatureArgs = {
  actionButtonCopy: Scalars['String'];
  snackbarMessage: Scalars['String'];
  url: Scalars['String'];
};


export type MutationBackupOrganizationArgs = {
  orgIds: Array<Scalars['ID']>;
};


export type MutationCheckRethinkPgEqualityArgs = {
  maxErrors?: InputMaybe<Scalars['Int']>;
  tableName: Scalars['String'];
  writeToFile?: InputMaybe<Scalars['Boolean']>;
};


export type MutationDraftEnterpriseInvoiceArgs = {
  apEmail?: InputMaybe<Scalars['ID']>;
  email?: InputMaybe<Scalars['ID']>;
  orgId: Scalars['ID'];
  plan?: InputMaybe<Scalars['ID']>;
  quantity: Scalars['Int'];
};


export type MutationDumpHeapArgs = {
  isDangerous: Scalars['Boolean'];
};


export type MutationEnableSamlForDomainArgs = {
  domains: Array<Scalars['ID']>;
  metadata: Scalars['String'];
  name: Scalars['ID'];
};


export type MutationFlagConversionModalArgs = {
  active: Scalars['Boolean'];
  orgId: Scalars['ID'];
};


export type MutationFlagOverLimitArgs = {
  copy?: InputMaybe<Scalars['String']>;
  orgId: Scalars['ID'];
};


export type MutationHardDeleteUserArgs = {
  email?: InputMaybe<Scalars['ID']>;
  reasonText?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['ID']>;
};


export type MutationLockTeamsArgs = {
  isPaid: Scalars['Boolean'];
  message?: InputMaybe<Scalars['String']>;
  teamIds: Array<InputMaybe<Scalars['ID']>>;
};


export type MutationLoginSamlArgs = {
  queryString: Scalars['String'];
  samlName: Scalars['ID'];
};


export type MutationMessageAllSlackUsersArgs = {
  message: Scalars['String'];
};


export type MutationRunScheduledJobsArgs = {
  seconds: Scalars['Int'];
};


export type MutationSetOrganizationDomainArgs = {
  domain: Scalars['ID'];
  orgId: Scalars['ID'];
};


export type MutationStripeCreateInvoiceArgs = {
  invoiceId: Scalars['ID'];
};


export type MutationStripeFailPaymentArgs = {
  invoiceId: Scalars['ID'];
};


export type MutationStripeInvoiceFinalizedArgs = {
  invoiceId: Scalars['ID'];
};


export type MutationStripeSucceedPaymentArgs = {
  invoiceId: Scalars['ID'];
};


export type MutationStripeUpdateCreditCardArgs = {
  customerId: Scalars['ID'];
};


export type MutationStripeUpdateInvoiceItemArgs = {
  invoiceItemId: Scalars['ID'];
};


export type MutationUpdateEmailArgs = {
  newEmail: Scalars['Email'];
  oldEmail: Scalars['Email'];
};


export type MutationUpdateOAuthRefreshTokensArgs = {
  updatedBefore: Scalars['DateTime'];
};


export type MutationUpdateWatchlistArgs = {
  domain?: InputMaybe<Scalars['String']>;
  emails?: InputMaybe<Array<Scalars['String']>>;
  includeInWatchlist: Scalars['Boolean'];
};

/** The latest feature released by Parabol */
export type NewFeatureBroadcast = {
  __typename?: 'NewFeatureBroadcast';
  /** The text of the action button in the snackbar */
  actionButtonCopy: Scalars['String'];
  id: Scalars['ID'];
  /** The description of the new feature */
  snackbarMessage: Scalars['String'];
  /** The permalink to the blog post describing the new feature */
  url: Scalars['String'];
};

/** A team meeting history for all previous meetings */
export type NewMeeting = {
  /** The timestamp the meeting was created */
  createdAt: Scalars['DateTime'];
  /** The id of the user that created the meeting */
  createdBy: Scalars['ID'];
  /** The user that created the meeting */
  createdByUser: User;
  /** The timestamp the meeting officially ended */
  endedAt?: Maybe<Scalars['DateTime']>;
  /** The facilitator team member */
  facilitator: TeamMember;
  /** The location of the facilitator in the meeting */
  facilitatorStageId: Scalars['ID'];
  /** The userId (or anonymousId) of the most recent facilitator */
  facilitatorUserId: Scalars['ID'];
  /** The unique meeting id. shortid. */
  id: Scalars['ID'];
  /** The team members that were active during the time of the meeting */
  meetingMembers: Array<MeetingMember>;
  /** The auto-incrementing meeting number for the team */
  meetingNumber: Scalars['Int'];
  meetingType: MeetingTypeEnum;
  /** The name of the meeting */
  name: Scalars['String'];
  /** The organization this meeting belongs to */
  organization: Organization;
  /** The phases the meeting will go through, including all phase-specific state */
  phases: Array<NewMeetingPhase>;
  /** true if should show the org the conversion modal, else false */
  showConversionModal: Scalars['Boolean'];
  /** The time the meeting summary was emailed to the team */
  summarySentAt?: Maybe<Scalars['DateTime']>;
  /** The team that ran the meeting */
  team: Team;
  /** foreign key for team */
  teamId: Scalars['ID'];
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** The meeting member of the viewer */
  viewerMeetingMember?: Maybe<MeetingMember>;
};

export type NewMeetingPhase = {
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  stages: Array<NewMeetingStage>;
  teamId: Scalars['ID'];
};

/** The phase of the meeting */
export enum NewMeetingPhaseTypeEnum {
  Estimate = 'ESTIMATE',
  Responses = 'RESPONSES',
  Scope = 'SCOPE',
  Summary = 'SUMMARY',
  Agendaitems = 'agendaitems',
  Checkin = 'checkin',
  Discuss = 'discuss',
  Firstcall = 'firstcall',
  Group = 'group',
  Lastcall = 'lastcall',
  Lobby = 'lobby',
  Reflect = 'reflect',
  Updates = 'updates',
  Vote = 'vote'
}

/** An instance of a meeting phase item. On the client, this usually represents a single view */
export type NewMeetingStage = {
  /** The datetime the stage was completed */
  endAt?: Maybe<Scalars['DateTime']>;
  /** stageId, shortid */
  id: Scalars['ID'];
  /** true if a time limit is set, false if end time is set, null if neither is set */
  isAsync?: Maybe<Scalars['Boolean']>;
  /** true if the facilitator has completed this stage, else false. Should be boolean(endAt) */
  isComplete: Scalars['Boolean'];
  /** true if any meeting participant can navigate to this stage */
  isNavigable: Scalars['Boolean'];
  /** true if the facilitator can navigate to this stage */
  isNavigableByFacilitator: Scalars['Boolean'];
  /** true if the viewer is ready to advance, else false */
  isViewerReady: Scalars['Boolean'];
  /** The meeting this stage belongs to */
  meeting?: Maybe<NewMeeting>;
  /** foreign key. try using meeting */
  meetingId: Scalars['ID'];
  /** The phase this stage belongs to */
  phase?: Maybe<NewMeetingPhase>;
  /** The type of the phase */
  phaseType?: Maybe<NewMeetingPhaseTypeEnum>;
  /** the number of meeting members ready to advance, excluding the facilitator */
  readyCount: Scalars['Int'];
  /** The datetime the phase is scheduled to be finished, null if no time limit or end time is set */
  scheduledEndTime?: Maybe<Scalars['DateTime']>;
  /** The datetime the stage was started */
  startAt?: Maybe<Scalars['DateTime']>;
  /** The suggested ending datetime for a phase to be completed async, null if not enough data to make a suggestion */
  suggestedEndTime?: Maybe<Scalars['DateTime']>;
  /** The suggested time limit for a phase to be completed together, null if not enough data to make a suggestion */
  suggestedTimeLimit?: Maybe<Scalars['Float']>;
  teamId: Scalars['ID'];
  /** The number of milliseconds left before the scheduled end time. Useful for unsynced client clocks. null if scheduledEndTime is null */
  timeRemaining?: Maybe<Scalars['Float']>;
  /** Number of times the facilitator has visited this stage */
  viewCount?: Maybe<Scalars['Int']>;
};

/** An instance of a meeting phase item. On the client, this usually represents a single view */
export type NewMeetingTeamMemberStage = {
  /** The meeting member that is the focus for this phase item */
  meetingMember: MeetingMember;
  /** The team member that is the focus for this phase item */
  teamMember: TeamMember;
  /** foreign key. use teamMember */
  teamMemberId: Scalars['ID'];
};

/** A single line item for the charges for next month */
export type NextPeriodCharges = {
  __typename?: 'NextPeriodCharges';
  /** The amount for the line item (in USD) */
  amount: Scalars['Float'];
  /** "year" if enterprise, else "month" for pro */
  interval?: Maybe<Scalars['String']>;
  /** The datetime the next period will end */
  nextPeriodEnd: Scalars['DateTime'];
  /** The total number of days that all org users have been inactive during the billing cycle */
  quantity: Scalars['Int'];
  /** The per-seat monthly price of the subscription (in dollars), null if invoice is not per-seat */
  unitPrice?: Maybe<Scalars['Float']>;
};

export type Notification = {
  /** The datetime to activate the notification & send it to the client */
  createdAt: Scalars['DateTime'];
  /** A shortid for the notification */
  id: Scalars['ID'];
  /** UNREAD if new, READ if viewer has seen it, CLICKED if viewed clicked it */
  status: NotificationStatusEnum;
  type: NotificationEnum;
  /** *The userId that should see this notification */
  userId: Scalars['ID'];
};

/** A connection to a list of items. */
export type NotificationConnection = {
  __typename?: 'NotificationConnection';
  /** A list of edges. */
  edges: Array<NotificationEdge>;
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo?: Maybe<PageInfoDateCursor>;
};

/** An edge in a connection. */
export type NotificationEdge = {
  __typename?: 'NotificationEdge';
  cursor?: Maybe<Scalars['DateTime']>;
  /** The item at the end of the edge */
  node: Notification;
};

/** The kind of notification */
export enum NotificationEnum {
  KickedOut = 'KICKED_OUT',
  MeetingStageTimeLimitEnd = 'MEETING_STAGE_TIME_LIMIT_END',
  PaymentRejected = 'PAYMENT_REJECTED',
  PromoteToBillingLeader = 'PROMOTE_TO_BILLING_LEADER',
  TaskInvolves = 'TASK_INVOLVES',
  TeamArchived = 'TEAM_ARCHIVED',
  TeamInvitation = 'TEAM_INVITATION'
}

/** The status of the notification interaction */
export enum NotificationStatusEnum {
  Clicked = 'CLICKED',
  Read = 'READ',
  Unread = 'UNREAD'
}

/** A notification sent to a user that was invited to a new team */
export type NotificationTeamInvitation = Notification & TeamNotification & {
  __typename?: 'NotificationTeamInvitation';
  /** The datetime to activate the notification & send it to the client */
  createdAt: Scalars['DateTime'];
  /** A shortid for the notification */
  id: Scalars['ID'];
  /** The invitation that triggered this notification */
  invitation: TeamInvitation;
  /** FK */
  invitationId: Scalars['ID'];
  /** UNREAD if new, READ if viewer has seen it, CLICKED if viewed clicked it */
  status: NotificationStatusEnum;
  team: Team;
  /** FK */
  teamId: Scalars['ID'];
  type: NotificationEnum;
  /** *The userId that should see this notification */
  userId: Scalars['ID'];
};

/** A notification sent to a user when their payment has been rejected */
export type NotifyPaymentRejected = Notification & {
  __typename?: 'NotifyPaymentRejected';
  /** The datetime to activate the notification & send it to the client */
  createdAt: Scalars['DateTime'];
  /** A shortid for the notification */
  id: Scalars['ID'];
  organization: Organization;
  /** UNREAD if new, READ if viewer has seen it, CLICKED if viewed clicked it */
  status: NotificationStatusEnum;
  type: NotificationEnum;
  /** *The userId that should see this notification */
  userId: Scalars['ID'];
};

/** A notification alerting the user that they have been promoted (to team or org leader) */
export type NotifyPromoteToOrgLeader = Notification & {
  __typename?: 'NotifyPromoteToOrgLeader';
  /** The datetime to activate the notification & send it to the client */
  createdAt: Scalars['DateTime'];
  /** A shortid for the notification */
  id: Scalars['ID'];
  organization: Organization;
  /** UNREAD if new, READ if viewer has seen it, CLICKED if viewed clicked it */
  status: NotificationStatusEnum;
  type: NotificationEnum;
  /** *The userId that should see this notification */
  userId: Scalars['ID'];
};

export type OrgUserCount = {
  __typename?: 'OrgUserCount';
  /** The number of orgUsers who do not have an inactive flag */
  activeUserCount: Scalars['Int'];
  /** The number of orgUsers who have an inactive flag */
  inactiveUserCount: Scalars['Int'];
};

/** The role of the org user */
export enum OrgUserRole {
  BillingLeader = 'BILLING_LEADER'
}

/** An organization */
export type Organization = {
  __typename?: 'Organization';
  /** The top level domain this organization is linked to, null if only generic emails used */
  activeDomain?: Maybe<Scalars['String']>;
  /** The leaders of the org */
  billingLeaders: Array<User>;
  /** The assumed company this organizaiton belongs to */
  company?: Maybe<Company>;
  /** The datetime the organization was created */
  createdAt: Scalars['DateTime'];
  /** The safe credit card details */
  creditCard?: Maybe<CreditCard>;
  /** The unique organization ID */
  id: Scalars['ID'];
  /** false if the activeDomain is null or was set automatically via a heuristic, true if set manually */
  isActiveDomainTouched: Scalars['Boolean'];
  /** true if the viewer is the billing leader for the org */
  isBillingLeader: Scalars['Boolean'];
  /** The name of the organization */
  name: Scalars['String'];
  /** The count of active & inactive users */
  orgUserCount: OrgUserCount;
  organizationUsers: OrganizationUserConnection;
  /** THe datetime the current billing cycle ends */
  periodEnd?: Maybe<Scalars['DateTime']>;
  /** The datetime the current billing cycle starts */
  periodStart?: Maybe<Scalars['DateTime']>;
  /** The org avatar */
  picture?: Maybe<Scalars['URL']>;
  /**
   * The total number of retroMeetings given to the team
   * @deprecated Unlimited retros for all!
   */
  retroMeetingsOffered: Scalars['Int'];
  /**
   * Number of retro meetings that can be run (if not pro)
   * @deprecated Unlimited retros for all!
   */
  retroMeetingsRemaining: Scalars['Int'];
  /** true if should show the org the conversion modal, else false */
  showConversionModal: Scalars['Boolean'];
  /** The customerId from stripe */
  stripeId?: Maybe<Scalars['ID']>;
  /** The subscriptionId from stripe */
  stripeSubscriptionId?: Maybe<Scalars['ID']>;
  /** all the teams the viewer is on in the organization */
  teams: Array<Team>;
  /** The level of access to features on the parabol site */
  tier: TierEnum;
  /** The last upcoming invoice email that was sent, null if never sent */
  upcomingInvoiceEmailSentAt?: Maybe<Scalars['DateTime']>;
  /** The datetime the organization was last updated */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** An organization */
export type OrganizationOrganizationUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** organization-specific details about a user */
export type OrganizationUser = {
  __typename?: 'OrganizationUser';
  /** orgId::userId */
  id: Scalars['ID'];
  /** true if the user is paused and the orgs are not being billed, else false */
  inactive: Scalars['Boolean'];
  /** the datetime the user first joined the org */
  joinedAt: Scalars['DateTime'];
  /** The last moment a billing leader can remove the user from the org & receive a refund. Set to the subscription periodEnd */
  newUserUntil: Scalars['DateTime'];
  /** FK */
  orgId: Scalars['ID'];
  /** The user attached to the organization */
  organization: Organization;
  /** if not a member, the datetime the user was removed from the org */
  removedAt?: Maybe<Scalars['DateTime']>;
  /** role of the user in the org */
  role?: Maybe<OrgUserRole>;
  /** Their level of access to features on the parabol site */
  tier?: Maybe<TierEnum>;
  /** The user attached to the organization */
  user: User;
  /** FK */
  userId: Scalars['ID'];
};

/** A connection to a list of items. */
export type OrganizationUserConnection = {
  __typename?: 'OrganizationUserConnection';
  /** A list of edges. */
  edges: Array<OrganizationUserEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type OrganizationUserEdge = {
  __typename?: 'OrganizationUserEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node: OrganizationUser;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

/** Information about pagination in a connection. */
export type PageInfoDateCursor = {
  __typename?: 'PageInfoDateCursor';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['DateTime']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['DateTime']>;
};

export type PingableServices = {
  __typename?: 'PingableServices';
  /** Response time for Postgres (in milliseconds) -1 if unreachable after 5 seconds */
  postgres: Scalars['Int'];
  /** Response time for Redis (in milliseconds) -1 if unreachable after 5 seconds */
  redis: Scalars['Int'];
  /** Response time for RethinkDB (in milliseconds) -1 if unreachable after 5 seconds */
  rethinkdb: Scalars['Int'];
};

/** A Poker meeting */
export type PokerMeeting = NewMeeting & {
  __typename?: 'PokerMeeting';
  /** The number of comments generated in the meeting */
  commentCount: Scalars['Int'];
  /** The timestamp the meeting was created */
  createdAt: Scalars['DateTime'];
  /** The id of the user that created the meeting */
  createdBy: Scalars['ID'];
  /** The user that created the meeting */
  createdByUser: User;
  /** The timestamp the meeting officially ended */
  endedAt?: Maybe<Scalars['DateTime']>;
  /** The facilitator team member */
  facilitator: TeamMember;
  /** The location of the facilitator in the meeting */
  facilitatorStageId: Scalars['ID'];
  /** The userId (or anonymousId) of the most recent facilitator */
  facilitatorUserId: Scalars['ID'];
  /** The unique meeting id. shortid. */
  id: Scalars['ID'];
  /** The team members that were active during the time of the meeting */
  meetingMembers: Array<PokerMeetingMember>;
  /** The auto-incrementing meeting number for the team */
  meetingNumber: Scalars['Int'];
  meetingType: MeetingTypeEnum;
  /** The name of the meeting */
  name: Scalars['String'];
  /** The organization this meeting belongs to */
  organization: Organization;
  /** The phases the meeting will go through, including all phase-specific state */
  phases: Array<NewMeetingPhase>;
  /** The settings that govern the Poker meeting */
  settings: PokerMeetingSettings;
  /** true if should show the org the conversion modal, else false */
  showConversionModal: Scalars['Boolean'];
  /** A single story created in a Sprint Poker meeting */
  story?: Maybe<Task>;
  /** The number of stories scored during a meeting */
  storyCount: Scalars['Int'];
  /** The time the meeting summary was emailed to the team */
  summarySentAt?: Maybe<Scalars['DateTime']>;
  /** The team that ran the meeting */
  team: Team;
  teamId: Scalars['ID'];
  /**
   * The ID of the template used for the meeting. Note the underlying template could have changed!
   * @deprecated The underlying template could be mutated. Use templateRefId
   */
  templateId: Scalars['ID'];
  /** The ID of the immutable templateRef used for the meeting */
  templateRefId: Scalars['ID'];
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** The Poker meeting member of the viewer */
  viewerMeetingMember?: Maybe<PokerMeetingMember>;
};


/** A Poker meeting */
export type PokerMeetingStoryArgs = {
  storyId: Scalars['ID'];
};

/** All the meeting specifics for a user in a poker meeting */
export type PokerMeetingMember = MeetingMember & {
  __typename?: 'PokerMeetingMember';
  /** A composite of userId::meetingId */
  id: Scalars['ID'];
  /**
   * true if present, false if absent, else null
   * @deprecated Members are checked in when they enter the meeting now & not created beforehand
   */
  isCheckedIn?: Maybe<Scalars['Boolean']>;
  /** true if the user is not voting and does not want their vote to count towards aggregates */
  isSpectating: Scalars['Boolean'];
  meetingId: Scalars['ID'];
  meetingType: MeetingTypeEnum;
  teamId: Scalars['ID'];
  teamMember: TeamMember;
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['ID'];
};

/** The retro-specific meeting settings */
export type PokerMeetingSettings = TeamMeetingSettings & {
  __typename?: 'PokerMeetingSettings';
  id: Scalars['ID'];
  /** The type of meeting these settings apply to */
  meetingType: MeetingTypeEnum;
  /** The list of templates shared across the organization to start a Poker meeting */
  organizationTemplates: PokerTemplateConnection;
  /** The broad phase types that will be addressed during the meeting */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>;
  /** The list of templates shared across the organization to start a Poker meeting */
  publicTemplates: PokerTemplateConnection;
  /** The template that will be used to start the Poker meeting */
  selectedTemplate: PokerTemplate;
  /** FK. The template that will be used to start the poker meeting */
  selectedTemplateId: Scalars['ID'];
  /** The team these settings belong to */
  team: Team;
  /** FK */
  teamId: Scalars['ID'];
  /** The list of templates used to start a Poker meeting */
  teamTemplates: Array<PokerTemplate>;
};


/** The retro-specific meeting settings */
export type PokerMeetingSettingsOrganizationTemplatesArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first: Scalars['Int'];
};


/** The retro-specific meeting settings */
export type PokerMeetingSettingsPublicTemplatesArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first: Scalars['Int'];
};

/** The team-specific templates for sprint poker meeting */
export type PokerTemplate = MeetingTemplate & {
  __typename?: 'PokerTemplate';
  createdAt: Scalars['DateTime'];
  /** A query for the dimension */
  dimension: TemplateDimension;
  /** The dimensions that are part of this template */
  dimensions: Array<TemplateDimension>;
  /** shortid */
  id: Scalars['ID'];
  /** True if template can be used, else false */
  isActive: Scalars['Boolean'];
  /** The time of the meeting the template was last used */
  lastUsedAt?: Maybe<Scalars['DateTime']>;
  /** The name of the template */
  name: Scalars['String'];
  /** *Foreign key. The organization that owns the team that created the template */
  orgId: Scalars['ID'];
  /** Who can see this template */
  scope: SharingScopeEnum;
  /** The team this template belongs to */
  team: Team;
  /** *Foreign key. The team this template belongs to */
  teamId: Scalars['ID'];
  /** The type of the template */
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};


/** The team-specific templates for sprint poker meeting */
export type PokerTemplateDimensionArgs = {
  dimensionId: Scalars['ID'];
};

/** A connection to a list of items. */
export type PokerTemplateConnection = {
  __typename?: 'PokerTemplateConnection';
  /** A list of edges. */
  edges: Array<PokerTemplateEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PokerTemplateEdge = {
  __typename?: 'PokerTemplateEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node: PokerTemplate;
};

export type Query = {
  __typename?: 'Query';
  /** All the info about a specific company */
  company?: Maybe<Company>;
  /** Post signup and login metrics to slack */
  dailyPulse?: Maybe<Scalars['Boolean']>;
  /** Get the number of logins, optionally broken down by domain */
  logins: LoginsPayload;
  /** Ping various services to determine response time & availability */
  ping: PingableServices;
  /** Check if this server is alive (an example query). */
  pingActionTick?: Maybe<Scalars['String']>;
  /** Get the number of signups, optionally broken down by domain */
  signups: SignupsPayload;
  suCountTiersForUser?: Maybe<UserTiersCount>;
  suOrgCount?: Maybe<Scalars['Int']>;
  suProOrgInfo?: Maybe<Array<Organization>>;
  suUserCount?: Maybe<Scalars['Int']>;
  /** Dig into a user by providing the email or userId */
  user?: Maybe<User>;
  /** Dig into many users by providing the userId */
  users: Array<Maybe<User>>;
};


export type QueryCompanyArgs = {
  domain?: InputMaybe<Scalars['ID']>;
  userId?: InputMaybe<Scalars['ID']>;
};


export type QueryDailyPulseArgs = {
  after: Scalars['DateTime'];
  channelId: Scalars['ID'];
  email: Scalars['String'];
};


export type QueryLoginsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
};


export type QuerySignupsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
};


export type QuerySuCountTiersForUserArgs = {
  userId: Scalars['ID'];
};


export type QuerySuOrgCountArgs = {
  minOrgSize?: InputMaybe<Scalars['Int']>;
  tier?: InputMaybe<TierEnum>;
};


export type QuerySuProOrgInfoArgs = {
  includeInactive?: Scalars['Boolean'];
};


export type QuerySuUserCountArgs = {
  tier?: InputMaybe<TierEnum>;
};


export type QueryUserArgs = {
  email?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['ID']>;
};


export type QueryUsersArgs = {
  userIds: Array<Scalars['ID']>;
};

/** An item that can have reactjis */
export type Reactable = {
  /** shortid */
  id: Scalars['ID'];
  /** All the reactjis for the given reflection */
  reactjis: Array<Reactji>;
};

/** An aggregate of reactji metadata */
export type Reactji = {
  __typename?: 'Reactji';
  /** The number of users who have added this reactji */
  count: Scalars['Int'];
  /** composite of entity:reactjiId */
  id: Scalars['ID'];
  /** true if the viewer is included in the count, else false */
  isViewerReactji: Scalars['Boolean'];
};

/** The meeting phase where all team members check in one-by-one */
export type ReflectPhase = NewMeetingPhase & {
  __typename?: 'ReflectPhase';
  /** the Prompt that the facilitator wants the group to focus on */
  focusedPrompt?: Maybe<ReflectPrompt>;
  /** foreign key. use focusedPrompt */
  focusedPromptId?: Maybe<Scalars['ID']>;
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  /** The prompts used during the reflect phase */
  reflectPrompts: Array<ReflectPrompt>;
  stages: Array<GenericMeetingStage>;
  teamId: Scalars['ID'];
};

/** A team-specific reflection prompt. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc. */
export type ReflectPrompt = {
  __typename?: 'ReflectPrompt';
  createdAt: Scalars['DateTime'];
  /** The description to the question for further context. A long version of the question. */
  description: Scalars['String'];
  /** The color used to visually group a phase item. */
  groupColor: Scalars['String'];
  /** shortid */
  id: Scalars['ID'];
  /** The question to answer during the phase of the retrospective (eg What went well?) */
  question: Scalars['String'];
  /** The datetime that the prompt was removed. Null if it has not been removed. */
  removedAt?: Maybe<Scalars['DateTime']>;
  /** the order of the items in the template */
  sortOrder: Scalars['Float'];
  /** The team that owns this reflectPrompt */
  team?: Maybe<Team>;
  /** foreign key. use the team field */
  teamId: Scalars['ID'];
  /** The template that this prompt belongs to */
  template: ReflectTemplate;
  /** FK for template */
  templateId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

/** The team-specific templates for the reflection prompts */
export type ReflectTemplate = MeetingTemplate & {
  __typename?: 'ReflectTemplate';
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** True if template can be used, else false */
  isActive: Scalars['Boolean'];
  /** The time of the meeting the template was last used */
  lastUsedAt?: Maybe<Scalars['DateTime']>;
  /** The name of the template */
  name: Scalars['String'];
  /** *Foreign key. The organization that owns the team that created the template */
  orgId: Scalars['ID'];
  /** The prompts that are part of this template */
  prompts: Array<ReflectPrompt>;
  /** Who can see this template */
  scope: SharingScopeEnum;
  /** The team this template belongs to */
  team: Team;
  /** *Foreign key. The team this template belongs to */
  teamId: Scalars['ID'];
  /** The type of the template */
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

/** A connection to a list of items. */
export type ReflectTemplateConnection = {
  __typename?: 'ReflectTemplateConnection';
  /** A list of edges. */
  edges: Array<ReflectTemplateEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ReflectTemplateEdge = {
  __typename?: 'ReflectTemplateEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
  /** The item at the end of the edge */
  node: ReflectTemplate;
};

/** sorts for the reflection group. default is sortOrder. sorting by voteCount filters out items without votes. */
export enum ReflectionGroupSortEnum {
  StageOrder = 'stageOrder',
  VoteCount = 'voteCount'
}

/** Return object for RemoveAllSlackAuthsPayload */
export type RemoveAllSlackAuthsPayload = ErrorPayload | RemoveAllSlackAuthsSuccess;

export type RemoveAllSlackAuthsSuccess = {
  __typename?: 'RemoveAllSlackAuthsSuccess';
  /** Response from removing all Slack auths */
  slackAuthRes: Scalars['String'];
  /** Response from removing all Slack notifications */
  slackNotificationRes: Scalars['String'];
};

/** The suggested repos and projects a user can integrate with */
export type RepoIntegration = {
  id: Scalars['ID'];
  service: IntegrationProviderServiceEnum;
};

/** The details associated with the possible repo and project integrations */
export type RepoIntegrationQueryPayload = {
  __typename?: 'RepoIntegrationQueryPayload';
  error?: Maybe<StandardMutationError>;
  /** true if the items returned are a subset of all the possible integration, else false (all possible integrations) */
  hasMore: Scalars['Boolean'];
  /** All the integrations that are likely to be integrated */
  items?: Maybe<Array<RepoIntegration>>;
};

/** The stage where the team discusses a single theme */
export type RetroDiscussStage = DiscussionThreadStage & NewMeetingStage & {
  __typename?: 'RetroDiscussStage';
  /** The discussion about the stage or a dummy data when there is no disscussion */
  discussion: Discussion;
  /** The ID to find the discussion that goes in the stage */
  discussionId: Scalars['ID'];
  /** The datetime the stage was completed */
  endAt?: Maybe<Scalars['DateTime']>;
  /** stageId, shortid */
  id: Scalars['ID'];
  /** true if a time limit is set, false if end time is set, null if neither is set */
  isAsync?: Maybe<Scalars['Boolean']>;
  /** true if the facilitator has completed this stage, else false. Should be boolean(endAt) */
  isComplete: Scalars['Boolean'];
  /** true if any meeting participant can navigate to this stage */
  isNavigable: Scalars['Boolean'];
  /** true if the facilitator can navigate to this stage */
  isNavigableByFacilitator: Scalars['Boolean'];
  /** true if the viewer is ready to advance, else false */
  isViewerReady: Scalars['Boolean'];
  /** The meeting this stage belongs to */
  meeting?: Maybe<NewMeeting>;
  /** foreign key. try using meeting */
  meetingId: Scalars['ID'];
  /** The phase this stage belongs to */
  phase?: Maybe<NewMeetingPhase>;
  /** The type of the phase */
  phaseType?: Maybe<NewMeetingPhaseTypeEnum>;
  /** the number of meeting members ready to advance, excluding the facilitator */
  readyCount: Scalars['Int'];
  /** the group that is the focal point of the discussion */
  reflectionGroup: RetroReflectionGroup;
  /** foreign key. use reflectionGroup */
  reflectionGroupId: Scalars['ID'];
  /** The datetime the phase is scheduled to be finished, null if no time limit or end time is set */
  scheduledEndTime?: Maybe<Scalars['DateTime']>;
  /** The sort order for reprioritizing discussion topics */
  sortOrder: Scalars['Float'];
  /** The datetime the stage was started */
  startAt?: Maybe<Scalars['DateTime']>;
  /** The suggested ending datetime for a phase to be completed async, null if not enough data to make a suggestion */
  suggestedEndTime?: Maybe<Scalars['DateTime']>;
  /** The suggested time limit for a phase to be completed together, null if not enough data to make a suggestion */
  suggestedTimeLimit?: Maybe<Scalars['Float']>;
  teamId: Scalars['ID'];
  /** The number of milliseconds left before the scheduled end time. Useful for unsynced client clocks. null if scheduledEndTime is null */
  timeRemaining?: Maybe<Scalars['Float']>;
  /** Number of times the facilitator has visited this stage */
  viewCount?: Maybe<Scalars['Int']>;
};

/** A reflection created during the reflect phase of a retrospective */
export type RetroReflection = Reactable & {
  __typename?: 'RetroReflection';
  /** The ID of the group that the autogrouper assigned the reflection. Error rate = Sum(autoId != Id) / autoId.count() */
  autoReflectionGroupId?: Maybe<Scalars['ID']>;
  /** The stringified draft-js content */
  content: Scalars['String'];
  /** The timestamp the meeting was created */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** The userId that created the reflection (or unique Id if not a team member) */
  creatorId?: Maybe<Scalars['ID']>;
  /** an array of all the socketIds that are currently editing the reflection */
  editorIds: Array<Scalars['ID']>;
  /** The entities (i.e. nouns) parsed from the content and their respective salience */
  entities: Array<GoogleAnalyzedEntity>;
  /** shortid */
  id: Scalars['ID'];
  /** True if the reflection was not removed, else false */
  isActive: Scalars['Boolean'];
  /** true if the viewer (userId) is the creator of the retro reflection, else false */
  isViewerCreator: Scalars['Boolean'];
  /** The retrospective meeting this reflection was created in */
  meeting: RetrospectiveMeeting;
  /** The foreign key to link a reflection to its meeting */
  meetingId: Scalars['ID'];
  /** The plaintext version of content */
  plaintextContent: Scalars['String'];
  prompt: ReflectPrompt;
  /** The foreign key to link a reflection to its prompt. Immutable. For sorting, use prompt on the group. */
  promptId: Scalars['ID'];
  /** All the reactjis for the given reflection */
  reactjis: Array<Reactji>;
  /** The foreign key to link a reflection to its group */
  reflectionGroupId: Scalars['ID'];
  /** The group the reflection belongs to, if any */
  retroReflectionGroup?: Maybe<RetroReflectionGroup>;
  /** The sort order of the reflection in the group (increments starting from 0) */
  sortOrder: Scalars['Float'];
  /** The team that is running the meeting that contains this reflection */
  team: Team;
  /** The timestamp the meeting was updated. Used to determine how long it took to write a reflection */
  updatedAt?: Maybe<Scalars['DateTime']>;
};

/** A reflection group created during the group phase of a retrospective */
export type RetroReflectionGroup = {
  __typename?: 'RetroReflectionGroup';
  /**
   * A list of users currently commenting
   * @deprecated Moved to ThreadConnection. Can remove Jun-01-2021
   */
  commentors?: Maybe<Array<CommentorDetails>>;
  /** The timestamp the meeting was created */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** True if the group has not been removed, else false */
  isActive: Scalars['Boolean'];
  /** The retrospective meeting this reflection was created in */
  meeting: RetrospectiveMeeting;
  /** The foreign key to link a reflection group to its meeting */
  meetingId: Scalars['ID'];
  prompt: ReflectPrompt;
  /** The foreign key to link a reflection group to its prompt. Immutable. */
  promptId: Scalars['ID'];
  reflections: Array<RetroReflection>;
  /** Our auto-suggested title, to be compared to the actual title for analytics */
  smartTitle?: Maybe<Scalars['String']>;
  /** The sort order of the reflection group */
  sortOrder: Scalars['Float'];
  /** The team that is running the retro */
  team?: Maybe<Team>;
  /** The title of the grouping of the retrospective reflections */
  title?: Maybe<Scalars['String']>;
  /** true if a user wrote the title, else false */
  titleIsUserDefined: Scalars['Boolean'];
  /** The timestamp the meeting was updated at */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** The number of votes the viewer has given this group */
  viewerVoteCount?: Maybe<Scalars['Int']>;
  /** The number of votes this group has received */
  voteCount: Scalars['Int'];
  /** A list of voterIds (userIds). Not available to team to preserve anonymity */
  voterIds: Array<Scalars['ID']>;
};

/** A retrospective meeting */
export type RetrospectiveMeeting = NewMeeting & {
  __typename?: 'RetrospectiveMeeting';
  /** the threshold used to achieve the autogroup. Useful for model tuning. Serves as a flag if autogroup was used. */
  autoGroupThreshold?: Maybe<Scalars['Float']>;
  /** The number of comments generated in the meeting */
  commentCount: Scalars['Int'];
  /** The timestamp the meeting was created */
  createdAt: Scalars['DateTime'];
  /** The id of the user that created the meeting */
  createdBy: Scalars['ID'];
  /** The user that created the meeting */
  createdByUser: User;
  /** The timestamp the meeting officially ended */
  endedAt?: Maybe<Scalars['DateTime']>;
  /** The facilitator team member */
  facilitator: TeamMember;
  /** The location of the facilitator in the meeting */
  facilitatorStageId: Scalars['ID'];
  /** The userId (or anonymousId) of the most recent facilitator */
  facilitatorUserId: Scalars['ID'];
  /** The unique meeting id. shortid. */
  id: Scalars['ID'];
  /** the number of votes allowed for each participant to cast on a single group */
  maxVotesPerGroup: Scalars['Int'];
  /** The team members that were active during the time of the meeting */
  meetingMembers: Array<RetrospectiveMeetingMember>;
  /** The auto-incrementing meeting number for the team */
  meetingNumber: Scalars['Int'];
  meetingType: MeetingTypeEnum;
  /** The name of the meeting */
  name: Scalars['String'];
  /** the next smallest distance threshold to guarantee at least 1 more grouping will be achieved */
  nextAutoGroupThreshold?: Maybe<Scalars['Float']>;
  /** The organization this meeting belongs to */
  organization: Organization;
  /** The phases the meeting will go through, including all phase-specific state */
  phases: Array<NewMeetingPhase>;
  /** The number of reflections generated in the meeting */
  reflectionCount: Scalars['Int'];
  /** a single reflection group */
  reflectionGroup?: Maybe<RetroReflectionGroup>;
  /** The grouped reflections */
  reflectionGroups: Array<RetroReflectionGroup>;
  /** The settings that govern the retrospective meeting */
  settings: RetrospectiveMeetingSettings;
  /** true if should show the org the conversion modal, else false */
  showConversionModal: Scalars['Boolean'];
  /** The time the meeting summary was emailed to the team */
  summarySentAt?: Maybe<Scalars['DateTime']>;
  /** The number of tasks generated in the meeting */
  taskCount: Scalars['Int'];
  /** The tasks created within the meeting */
  tasks: Array<Task>;
  /** The team that ran the meeting */
  team: Team;
  teamId: Scalars['ID'];
  /** The ID of the template used for the meeting */
  templateId: Scalars['ID'];
  /** The number of topics generated in the meeting */
  topicCount: Scalars['Int'];
  /** the total number of votes allowed for each participant */
  totalVotes: Scalars['Int'];
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** The retrospective meeting member of the viewer */
  viewerMeetingMember?: Maybe<RetrospectiveMeetingMember>;
  /** The sum total of the votes remaining for the meeting members that are present in the meeting */
  votesRemaining: Scalars['Int'];
};


/** A retrospective meeting */
export type RetrospectiveMeetingReflectionGroupArgs = {
  reflectionGroupId: Scalars['ID'];
};


/** A retrospective meeting */
export type RetrospectiveMeetingReflectionGroupsArgs = {
  sortBy?: InputMaybe<ReflectionGroupSortEnum>;
};

/** All the meeting specifics for a user in a retro meeting */
export type RetrospectiveMeetingMember = MeetingMember & {
  __typename?: 'RetrospectiveMeetingMember';
  /** A composite of userId::meetingId */
  id: Scalars['ID'];
  /**
   * true if present, false if absent, else null
   * @deprecated Members are checked in when they enter the meeting now & not created beforehand
   */
  isCheckedIn?: Maybe<Scalars['Boolean']>;
  meetingId: Scalars['ID'];
  meetingType: MeetingTypeEnum;
  /** The tasks assigned to members during the meeting */
  tasks: Array<Task>;
  teamId: Scalars['ID'];
  teamMember: TeamMember;
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['ID'];
  votesRemaining: Scalars['Int'];
};

/** The retro-specific meeting settings */
export type RetrospectiveMeetingSettings = TeamMeetingSettings & {
  __typename?: 'RetrospectiveMeetingSettings';
  id: Scalars['ID'];
  /** The maximum number of votes a team member can vote for a single reflection group */
  maxVotesPerGroup: Scalars['Int'];
  /** The type of meeting these settings apply to */
  meetingType: MeetingTypeEnum;
  /** The list of templates shared across the organization to start a retrospective */
  organizationTemplates: ReflectTemplateConnection;
  /** The broad phase types that will be addressed during the meeting */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>;
  /** The list of templates shared across the organization to start a retrospective */
  publicTemplates: ReflectTemplateConnection;
  /** The list of templates used to start a retrospective */
  reflectTemplates: Array<ReflectTemplate>;
  /** The template that will be used to start the retrospective */
  selectedTemplate: ReflectTemplate;
  /** FK. The template that will be used to start the retrospective */
  selectedTemplateId: Scalars['ID'];
  /** The team these settings belong to */
  team: Team;
  /** FK */
  teamId: Scalars['ID'];
  /** The list of templates used to start a retrospective */
  teamTemplates: Array<ReflectTemplate>;
  /** The total number of votes each team member receives for the voting phase */
  totalVotes: Scalars['Int'];
};


/** The retro-specific meeting settings */
export type RetrospectiveMeetingSettingsOrganizationTemplatesArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first: Scalars['Int'];
};


/** The retro-specific meeting settings */
export type RetrospectiveMeetingSettingsPublicTemplatesArgs = {
  after?: InputMaybe<Scalars['ID']>;
  first: Scalars['Int'];
};

/** A field that exists on a 3rd party service */
export type ServiceField = {
  __typename?: 'ServiceField';
  /** The name of the field as provided by the service */
  name: Scalars['String'];
  /** The field type, to be used for validation and analytics */
  type: Scalars['String'];
};

/** The scope of a shareable item */
export enum SharingScopeEnum {
  Organization = 'ORGANIZATION',
  Public = 'PUBLIC',
  Team = 'TEAM'
}

export type SignupsPayload = {
  __typename?: 'SignupsPayload';
  /** The total broken down by email domain */
  byDomain: Array<DomainCountPayload>;
  /** the total number of signups for the given time range */
  total: Scalars['Int'];
};

/** OAuth token for a team member */
export type SlackIntegration = {
  __typename?: 'SlackIntegration';
  /** the parabol bot access token, used as primary communication */
  botAccessToken?: Maybe<Scalars['ID']>;
  /** the parabol bot user id */
  botUserId?: Maybe<Scalars['ID']>;
  /** The timestamp the provider was created */
  createdAt: Scalars['DateTime'];
  /** The default channel to assign to new team notifications */
  defaultTeamChannelId: Scalars['String'];
  /** shortid */
  id: Scalars['ID'];
  /** true if the auth is updated & ready to use for all features, else false */
  isActive: Scalars['Boolean'];
  /** A list of events and the slack channels they get posted to */
  notifications: Array<SlackNotification>;
  /** The id of the team in slack */
  slackTeamId?: Maybe<Scalars['ID']>;
  /** The name of the team in slack */
  slackTeamName?: Maybe<Scalars['String']>;
  /** The userId in slack */
  slackUserId: Scalars['ID'];
  /** The name of the user in slack */
  slackUserName: Scalars['String'];
  /** *The team that the token is linked to */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
  /** The id of the user that integrated Slack */
  userId: Scalars['ID'];
};

/** an event trigger and slack channel to receive it */
export type SlackNotification = {
  __typename?: 'SlackNotification';
  /** null if no notification is to be sent */
  channelId?: Maybe<Scalars['ID']>;
  event: SlackNotificationEventEnum;
  eventType: SlackNotificationEventTypeEnum;
  id: Scalars['ID'];
  teamId: Scalars['ID'];
  userId: Scalars['ID'];
};

/** The event that triggers a slack notification */
export enum SlackNotificationEventEnum {
  MeetingStageTimeLimitEnd = 'MEETING_STAGE_TIME_LIMIT_END',
  MeetingStageTimeLimitStart = 'MEETING_STAGE_TIME_LIMIT_START',
  MeetingEnd = 'meetingEnd',
  MeetingStart = 'meetingStart'
}

/** The type of event for a slack notification */
export enum SlackNotificationEventTypeEnum {
  /** notification that concerns a single member on the team */
  Member = 'member',
  /** notification that concerns the whole team */
  Team = 'team'
}

export type StandardMutationError = {
  __typename?: 'StandardMutationError';
  /** The full error */
  message: Scalars['String'];
  /** The title of the error */
  title?: Maybe<Scalars['String']>;
};

export type StripeFailPaymentPayload = {
  __typename?: 'StripeFailPaymentPayload';
  error?: Maybe<StandardMutationError>;
  /** The notification to a billing leader stating the payment was rejected */
  notification: NotifyPaymentRejected;
  organization?: Maybe<Organization>;
};

/** A past event that is important to the viewer */
export type SuggestedAction = {
  /** * The timestamp the action was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** The priority of the suggested action compared to other suggested actions (smaller number is higher priority) */
  priority?: Maybe<Scalars['Float']>;
  /** * The timestamp the action was removed at */
  removedAt: Scalars['DateTime'];
  /** The specific type of suggested action */
  type: SuggestedActionTypeEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId this action is for */
  userId: Scalars['ID'];
};

/** a suggestion to try a retro with your team */
export type SuggestedActionCreateNewTeam = SuggestedAction & {
  __typename?: 'SuggestedActionCreateNewTeam';
  /** * The timestamp the action was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** The priority of the suggested action compared to other suggested actions (smaller number is higher priority) */
  priority?: Maybe<Scalars['Float']>;
  /** * The timestamp the action was removed at */
  removedAt: Scalars['DateTime'];
  /** The specific type of suggested action */
  type: SuggestedActionTypeEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId this action is for */
  userId: Scalars['ID'];
};

/** a suggestion to invite others to your team */
export type SuggestedActionInviteYourTeam = SuggestedAction & {
  __typename?: 'SuggestedActionInviteYourTeam';
  /** * The timestamp the action was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** The priority of the suggested action compared to other suggested actions (smaller number is higher priority) */
  priority?: Maybe<Scalars['Float']>;
  /** * The timestamp the action was removed at */
  removedAt: Scalars['DateTime'];
  /** The team you should invite people to */
  team: Team;
  /** The teamId that we suggest you should invite people to */
  teamId: Scalars['ID'];
  /** The specific type of suggested action */
  type: SuggestedActionTypeEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId this action is for */
  userId: Scalars['ID'];
};

/** a suggestion to try a retro with your team */
export type SuggestedActionTryActionMeeting = SuggestedAction & {
  __typename?: 'SuggestedActionTryActionMeeting';
  /** * The timestamp the action was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** The priority of the suggested action compared to other suggested actions (smaller number is higher priority) */
  priority?: Maybe<Scalars['Float']>;
  /** * The timestamp the action was removed at */
  removedAt: Scalars['DateTime'];
  /** The team you should run an action meeting with */
  team: Team;
  /** fk */
  teamId: Scalars['ID'];
  /** The specific type of suggested action */
  type: SuggestedActionTypeEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId this action is for */
  userId: Scalars['ID'];
};

/** a suggestion to try a retro with your team */
export type SuggestedActionTryRetroMeeting = SuggestedAction & {
  __typename?: 'SuggestedActionTryRetroMeeting';
  /** * The timestamp the action was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** The priority of the suggested action compared to other suggested actions (smaller number is higher priority) */
  priority?: Maybe<Scalars['Float']>;
  /** * The timestamp the action was removed at */
  removedAt: Scalars['DateTime'];
  /** The team you should run a retro with */
  team: Team;
  /** fk */
  teamId: Scalars['ID'];
  /** The specific type of suggested action */
  type: SuggestedActionTypeEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId this action is for */
  userId: Scalars['ID'];
};

/** a suggestion to invite others to your team */
export type SuggestedActionTryTheDemo = SuggestedAction & {
  __typename?: 'SuggestedActionTryTheDemo';
  /** * The timestamp the action was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** The priority of the suggested action compared to other suggested actions (smaller number is higher priority) */
  priority?: Maybe<Scalars['Float']>;
  /** * The timestamp the action was removed at */
  removedAt: Scalars['DateTime'];
  /** The specific type of suggested action */
  type: SuggestedActionTypeEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId this action is for */
  userId: Scalars['ID'];
};

/** The specific type of the suggested action */
export enum SuggestedActionTypeEnum {
  CreateNewTeam = 'createNewTeam',
  InviteYourTeam = 'inviteYourTeam',
  TryActionMeeting = 'tryActionMeeting',
  TryRetroMeeting = 'tryRetroMeeting',
  TryTheDemo = 'tryTheDemo'
}

/** A long-term task shared across the team, assigned to a single user  */
export type Task = Threadable & {
  __typename?: 'Task';
  /** The agenda item that the task was created in, if any */
  agendaItem?: Maybe<AgendaItem>;
  /** The rich text body of the item */
  content: Scalars['String'];
  /** The timestamp the item was created */
  createdAt: Scalars['DateTime'];
  /** The userId that created the item */
  createdBy: Scalars['ID'];
  /** The user that created the item */
  createdByUser: User;
  /** The FK of the discussion this task was created in. Null if task was not created in a discussion */
  discussionId?: Maybe<Scalars['ID']>;
  /** the foreign key for the meeting the task was marked as complete */
  doneMeetingId?: Maybe<Scalars['ID']>;
  /** a user-defined due date */
  dueDate?: Maybe<Scalars['DateTime']>;
  /** a list of users currently editing the task (fed by a subscription, so queries return null) */
  editors: Array<TaskEditorDetails>;
  /** A list of the most recent estimates for the task */
  estimates: Array<TaskEstimate>;
  /** shortid */
  id: Scalars['ID'];
  /** The reference to the single source of truth for this task */
  integration?: Maybe<TaskIntegration>;
  /** A hash of the integrated task */
  integrationHash?: Maybe<Scalars['ID']>;
  /** The owner hovers over the task in their solo update of a checkin */
  isHighlighted: Scalars['Boolean'];
  /** the foreign key for the meeting the task was created in */
  meetingId?: Maybe<Scalars['ID']>;
  /** the plain text content of the task */
  plaintextContent: Scalars['String'];
  /** the replies to this threadable item */
  replies: Array<Threadable>;
  /** the shared sort order for tasks on the team dash & user dash */
  sortOrder: Scalars['Float'];
  /** The status of the task */
  status: TaskStatusEnum;
  /** The tags associated with the task */
  tags: Array<Scalars['String']>;
  /** The team this task belongs to */
  team: Team;
  /** The id of the team (indexed). Needed for subscribing to archived tasks */
  teamId: Scalars['ID'];
  /** the parent, if this threadable is a reply, else null */
  threadParentId?: Maybe<Scalars['ID']>;
  /** the order of this threadable, relative to threadParentId */
  threadSortOrder?: Maybe<Scalars['Float']>;
  /** The first block of the content */
  title: Scalars['String'];
  /** The timestamp the item was updated */
  updatedAt: Scalars['DateTime'];
  /** The user the task is assigned to. Null if it is not assigned to anyone. */
  user?: Maybe<User>;
  /** * The userId, index useful for server-side methods getting all tasks under a user. This can be null if the task is not assigned to anyone. */
  userId?: Maybe<Scalars['ID']>;
};


/** A long-term task shared across the team, assigned to a single user  */
export type TaskIsHighlightedArgs = {
  meetingId?: InputMaybe<Scalars['ID']>;
};

/** A connection to a list of items. */
export type TaskConnection = {
  __typename?: 'TaskConnection';
  /** A list of edges. */
  edges: Array<TaskEdge>;
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo?: Maybe<PageInfoDateCursor>;
};

/** An edge in a connection. */
export type TaskEdge = {
  __typename?: 'TaskEdge';
  cursor?: Maybe<Scalars['DateTime']>;
  /** The item at the end of the edge */
  node: Task;
};

export type TaskEditorDetails = {
  __typename?: 'TaskEditorDetails';
  /** The name of the userId editing the task */
  preferredName: Scalars['String'];
  /** The userId of the person editing the task */
  userId: Scalars['ID'];
};

/** An estimate for a Task that was voted on and scored in a poker meeting */
export type TaskEstimate = {
  __typename?: 'TaskEstimate';
  /** The source that a change came in through */
  changeSource: ChangeSourceEnum;
  /** The timestamp the estimate was created */
  createdAt: Scalars['DateTime'];
  /** The discussionId where the estimated was discussed */
  discussionId?: Maybe<Scalars['ID']>;
  /** The ID of the estimate */
  id: Scalars['ID'];
  /** If the task comes from jira, this is the jira field that the estimate refers to */
  jiraFieldId?: Maybe<Scalars['ID']>;
  /** The human-readable label for the estimate */
  label: Scalars['String'];
  /** *The meetingId that the estimate occured in, if any */
  meetingId?: Maybe<Scalars['ID']>;
  /** The name of the estimate dimension */
  name: Scalars['String'];
  /** The meeting stageId the estimate occurred in, if any */
  stageId?: Maybe<Scalars['ID']>;
  /** *The taskId that the estimate refers to */
  taskId: Scalars['ID'];
  /** The userId that added the estimate */
  userId: Scalars['ID'];
};

export type TaskIntegration = {
  id: Scalars['ID'];
};

/** The status of the task */
export enum TaskStatusEnum {
  Active = 'active',
  Done = 'done',
  Future = 'future',
  Stuck = 'stuck'
}

/** A team */
export type Team = {
  __typename?: 'Team';
  /** a list of meetings that are currently in progress */
  activeMeetings: Array<NewMeeting>;
  /** The agenda items for the upcoming or current meeting */
  agendaItems: Array<AgendaItem>;
  /** The datetime the team was created */
  createdAt: Scalars['DateTime'];
  /** The userId that created the team. Non-null at v2.22.0+ */
  createdBy?: Maybe<Scalars['ID']>;
  /** @deprecated Field no longer needs to exist for now */
  customPhaseItems?: Maybe<Array<Maybe<ReflectPrompt>>>;
  /** A shortid for the team */
  id: Scalars['ID'];
  /** Integration details that are shared by all team members. Nothing user specific */
  integrations: TeamIntegrations;
  /** true if the team has been archived */
  isArchived?: Maybe<Scalars['Boolean']>;
  /** true if the viewer is the team lead, else false */
  isLead: Scalars['Boolean'];
  /** true if the team was created when the account was created, else false */
  isOnboardTeam: Scalars['Boolean'];
  /** true if the underlying org has a validUntil date greater than now. if false, subs do not work */
  isPaid?: Maybe<Scalars['Boolean']>;
  /** The type of the last meeting run */
  lastMeetingType: MeetingTypeEnum;
  /** The HTML message to show if isPaid is false */
  lockMessageHTML?: Maybe<Scalars['String']>;
  /** The hash and expiration for a token that allows anyone with it to join the team */
  massInvitation: MassInvitation;
  /** The new meeting in progress, if any */
  meeting?: Maybe<NewMeeting>;
  /** The team-specific settings for running all available types of meetings */
  meetingSettings: TeamMeetingSettings;
  /** The name of the team */
  name: Scalars['String'];
  /** The organization to which the team belongs */
  orgId: Scalars['ID'];
  organization: Organization;
  /** A query for the scale */
  scale?: Maybe<TemplateScale>;
  /** The list of scales this team can use */
  scales: Array<TemplateScale>;
  /** Arbitrary tags that the team uses */
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** All of the tasks for this team */
  tasks: TaskConnection;
  /** The outstanding invitations to join the team */
  teamInvitations: Array<TeamInvitation>;
  /** All the team members actively associated with the team */
  teamMembers: Array<TeamMember>;
  /** The level of access to features on the parabol site */
  tier: TierEnum;
  /** The datetime the team was last updated */
  updatedAt?: Maybe<Scalars['DateTime']>;
};


/** A team */
export type TeamMassInvitationArgs = {
  meetingId?: InputMaybe<Scalars['ID']>;
};


/** A team */
export type TeamMeetingArgs = {
  meetingId: Scalars['ID'];
};


/** A team */
export type TeamMeetingSettingsArgs = {
  meetingType: MeetingTypeEnum;
};


/** A team */
export type TeamScaleArgs = {
  scaleId: Scalars['ID'];
};


/** A team */
export type TeamTasksArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  first?: InputMaybe<Scalars['Int']>;
};


/** A team */
export type TeamTeamMembersArgs = {
  sortBy?: InputMaybe<Scalars['String']>;
};

/** The right drawer types available on the team dashboard */
export enum TeamDrawer {
  Agenda = 'agenda',
  ManageTeam = 'manageTeam'
}

/** All the available integrations available for this team member */
export type TeamIntegrations = {
  __typename?: 'TeamIntegrations';
  /** All things associated with an atlassian integration for a team member */
  atlassian: AtlassianTeamIntegration;
  /** composite */
  id: Scalars['ID'];
};

/** An invitation to become a team member */
export type TeamInvitation = {
  __typename?: 'TeamInvitation';
  /** null if not accepted, else the datetime the invitation was accepted */
  acceptedAt?: Maybe<Scalars['DateTime']>;
  /** null if not accepted, else the userId that accepted the invitation */
  acceptedBy?: Maybe<Scalars['ID']>;
  /** The datetime the invitation was created */
  createdAt: Scalars['DateTime'];
  /** The email of the invitee */
  email: Scalars['Email'];
  /** The datetime the invitation expires. Changes when team is archived. */
  expiresAt: Scalars['DateTime'];
  /** The unique invitation Id */
  id: Scalars['ID'];
  /** The userId of the person that sent the invitation */
  invitedBy: Scalars['ID'];
  /** The userId of the person that sent the invitation */
  inviter: User;
  /** the meetingId that the invite was generated for */
  meetingId?: Maybe<Scalars['ID']>;
  /** The team invited to */
  teamId: Scalars['ID'];
  /** 48-byte hex encoded random string */
  token: Scalars['ID'];
};

/** The response to a teamInvitation query */
export type TeamInvitationPayload = {
  __typename?: 'TeamInvitationPayload';
  /** one of the active meetings trying to join */
  meetingId?: Maybe<Scalars['ID']>;
  /** the teamId of the team trying to join */
  teamId?: Maybe<Scalars['ID']>;
  /** The team invitation, if any */
  teamInvitation?: Maybe<TeamInvitation>;
};

/** The team settings for a specific type of meeting */
export type TeamMeetingSettings = {
  id: Scalars['ID'];
  /** The type of meeting these settings apply to */
  meetingType: MeetingTypeEnum;
  /** The broad phase types that will be addressed during the meeting */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>;
  /** The team these settings belong to */
  team: Team;
  /** FK */
  teamId: Scalars['ID'];
};

/** A member of a team */
export type TeamMember = {
  __typename?: 'TeamMember';
  /** All the integrations that the user could possibly use */
  allAvailableRepoIntegrations: Array<RepoIntegration>;
  /** The datetime the team member was created */
  createdAt: Scalars['DateTime'];
  /** The user email */
  email: Scalars['Email'];
  /** An ID for the teamMember. userId::teamId */
  id: Scalars['ID'];
  /** The integrations that the team member has authorized. accessible by all */
  integrations: TeamMemberIntegrations;
  /** Is user a team lead? */
  isLead: Scalars['Boolean'];
  /** true if the user is a part of the team, false if they no longer are */
  isNotRemoved?: Maybe<Scalars['Boolean']>;
  /** true if this team member belongs to the user that queried it */
  isSelf: Scalars['Boolean'];
  /** true if the user prefers to not vote during a poker meeting */
  isSpectatingPoker: Scalars['Boolean'];
  /** The meeting specifics for the meeting the team member is currently in */
  meetingMember?: Maybe<MeetingMember>;
  /** the type of drawer that is open in the team dash. Null if the drawer is closed */
  openDrawer?: Maybe<TeamDrawer>;
  /** url of user’s profile picture */
  picture: Scalars['URL'];
  /** The name of the assignee */
  preferredName: Scalars['String'];
  /** The integrations that the user would probably like to use */
  repoIntegrations: RepoIntegrationQueryPayload;
  /** Tasks owned by the team member */
  tasks?: Maybe<TaskConnection>;
  /** The team this team member belongs to */
  team?: Maybe<Team>;
  /** foreign key to Team table */
  teamId: Scalars['ID'];
  /** The user for the team member */
  user: User;
  /** foreign key to User table */
  userId: Scalars['ID'];
};


/** A member of a team */
export type TeamMemberMeetingMemberArgs = {
  meetingId: Scalars['ID'];
};


/** A member of a team */
export type TeamMemberTasksArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  first?: InputMaybe<Scalars['Int']>;
};

/** The auth credentials for a token, specific to a team member */
export type TeamMemberIntegrationAuth = {
  /** The timestamp the token was created */
  createdAt: Scalars['DateTime'];
  /** The token's unique identifier */
  id: Scalars['ID'];
  /** true if the token configuration should be used */
  isActive: Scalars['Boolean'];
  /** The provider to connect to */
  provider: IntegrationProvider;
  /** The GQL GUID of the DB providerId foreign key */
  providerId: Scalars['ID'];
  /** The service this token is associated with, denormalized from the provider */
  service: IntegrationProviderServiceEnum;
  /** The team that the token is linked to */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
};

/** An integration token that connects via OAuth1 */
export type TeamMemberIntegrationAuthOAuth1 = TeamMemberIntegrationAuth & {
  __typename?: 'TeamMemberIntegrationAuthOAuth1';
  /** The timestamp the token was created */
  createdAt: Scalars['DateTime'];
  /** The token's unique identifier */
  id: Scalars['ID'];
  /** true if the token configuration should be used */
  isActive: Scalars['Boolean'];
  /** The provider strategy this token connects to */
  provider: IntegrationProviderOAuth1;
  /** The GQL GUID of the DB providerId foreign key */
  providerId: Scalars['ID'];
  /** The service this token is associated with, denormalized from the provider */
  service: IntegrationProviderServiceEnum;
  /** The team that the token is linked to */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
};

/** An integration token that connects via OAuth2 */
export type TeamMemberIntegrationAuthOAuth2 = TeamMemberIntegrationAuth & {
  __typename?: 'TeamMemberIntegrationAuthOAuth2';
  /** The token used to connect to the provider */
  accessToken: Scalars['ID'];
  /** The timestamp the token was created */
  createdAt: Scalars['DateTime'];
  /** The token's unique identifier */
  id: Scalars['ID'];
  /** true if the token configuration should be used */
  isActive: Scalars['Boolean'];
  /** The provider strategy this token connects to */
  provider: IntegrationProviderOAuth2;
  /** The GQL GUID of the DB providerId foreign key */
  providerId: Scalars['ID'];
  /** The scopes allowed on the provider */
  scopes: Scalars['String'];
  /** The service this token is associated with, denormalized from the provider */
  service: IntegrationProviderServiceEnum;
  /** The team that the token is linked to */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
};

/** An integration authorization that connects via Webhook auth strategy */
export type TeamMemberIntegrationAuthWebhook = TeamMemberIntegrationAuth & {
  __typename?: 'TeamMemberIntegrationAuthWebhook';
  /** The timestamp the token was created */
  createdAt: Scalars['DateTime'];
  /** The token's unique identifier */
  id: Scalars['ID'];
  /** true if the token configuration should be used */
  isActive: Scalars['Boolean'];
  /** The provider strategy this token connects to */
  provider: IntegrationProviderWebhook;
  /** The GQL GUID of the DB providerId foreign key */
  providerId: Scalars['ID'];
  /** The service this token is associated with, denormalized from the provider */
  service: IntegrationProviderServiceEnum;
  /** The team that the token is linked to */
  teamId: Scalars['ID'];
  /** The timestamp the token was updated at */
  updatedAt: Scalars['DateTime'];
};

/** All the available integrations available for this team member */
export type TeamMemberIntegrations = {
  __typename?: 'TeamMemberIntegrations';
  /** All things associated with an Atlassian integration for a team member */
  atlassian?: Maybe<AtlassianIntegration>;
  /** All things associated with a GitHub integration for a team member */
  github?: Maybe<GitHubIntegration>;
  /** All things associated with a GitLab integration for a team member */
  gitlab: GitLabIntegration;
  /** composite */
  id: Scalars['ID'];
  /** All things associated with a Jira Server integration for a team member */
  jiraServer: JiraServerIntegration;
  /** All things associated with a Mattermost integration for a team member */
  mattermost: MattermostIntegration;
  /** All things associated with a slack integration for a team member */
  slack?: Maybe<SlackIntegration>;
};

export type TeamNotification = {
  id?: Maybe<Scalars['ID']>;
  type?: Maybe<NotificationEnum>;
};

/** A team prompt meeting */
export type TeamPromptMeeting = NewMeeting & {
  __typename?: 'TeamPromptMeeting';
  /** The timestamp the meeting was created */
  createdAt: Scalars['DateTime'];
  /** The id of the user that created the meeting */
  createdBy: Scalars['ID'];
  /** The user that created the meeting */
  createdByUser: User;
  /** The timestamp the meeting officially ended */
  endedAt?: Maybe<Scalars['DateTime']>;
  /** The facilitator team member */
  facilitator: TeamMember;
  /** The location of the facilitator in the meeting */
  facilitatorStageId: Scalars['ID'];
  /** The userId (or anonymousId) of the most recent facilitator */
  facilitatorUserId: Scalars['ID'];
  /** The unique meeting id. shortid. */
  id: Scalars['ID'];
  /** The team members that were active during the time of the meeting */
  meetingMembers: Array<MeetingMember>;
  /** The auto-incrementing meeting number for the team */
  meetingNumber: Scalars['Int'];
  meetingType: MeetingTypeEnum;
  /** The name of the meeting */
  name: Scalars['String'];
  /** The organization this meeting belongs to */
  organization: Organization;
  /** The phases the meeting will go through, including all phase-specific state */
  phases: Array<NewMeetingPhase>;
  /** The tasks created within the meeting */
  responses: Array<Task>;
  /** The settings that govern the team prompt meeting */
  settings: TeamPromptMeetingSettings;
  /** true if should show the org the conversion modal, else false */
  showConversionModal: Scalars['Boolean'];
  /** The time the meeting summary was emailed to the team */
  summarySentAt?: Maybe<Scalars['DateTime']>;
  /** The team that ran the meeting */
  team: Team;
  /** foreign key for team */
  teamId: Scalars['ID'];
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt?: Maybe<Scalars['DateTime']>;
  /** The team prompt meeting member of the viewer */
  viewerMeetingMember?: Maybe<TeamPromptMeetingMember>;
};

/** All the meeting specifics for a user in a team prompt meeting */
export type TeamPromptMeetingMember = MeetingMember & {
  __typename?: 'TeamPromptMeetingMember';
  /** A composite of userId::meetingId */
  id: Scalars['ID'];
  /**
   * true if present, false if absent, else null
   * @deprecated Members are checked in when they enter the meeting now & not created beforehand
   */
  isCheckedIn?: Maybe<Scalars['Boolean']>;
  meetingId: Scalars['ID'];
  meetingType: MeetingTypeEnum;
  teamId: Scalars['ID'];
  teamMember: TeamMember;
  /** The last time a meeting was updated (stage completed, finished, etc) */
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['ID'];
};

/** The team prompt specific meeting settings */
export type TeamPromptMeetingSettings = TeamMeetingSettings & {
  __typename?: 'TeamPromptMeetingSettings';
  id: Scalars['ID'];
  /** The type of meeting these settings apply to */
  meetingType: MeetingTypeEnum;
  /** The broad phase types that will be addressed during the meeting */
  phaseTypes: Array<NewMeetingPhaseTypeEnum>;
  /** The team these settings belong to */
  team: Team;
  /** FK */
  teamId: Scalars['ID'];
};

/** A team-specific template dimension: e.g., effort, importance etc. */
export type TemplateDimension = {
  __typename?: 'TemplateDimension';
  createdAt: Scalars['DateTime'];
  /** The description to the dimension name for further context. A long version of the dimension name. */
  description: Scalars['String'];
  /** shortid */
  id: Scalars['ID'];
  /** true if the dimension is currently used by the team, else false */
  isActive: Scalars['Boolean'];
  /** The name of the dimension */
  name: Scalars['String'];
  /** The datetime that the dimension was removed. Null if it has not been removed. */
  removedAt?: Maybe<Scalars['DateTime']>;
  /** The scaleId to resolve the selected scale */
  scaleId: Scalars['ID'];
  /** scale used in this dimension */
  selectedScale: TemplateScale;
  /** the order of the dimensions in the template */
  sortOrder: Scalars['Float'];
  /** The team that owns this dimension */
  team: Team;
  /** foreign key. use the team field */
  teamId: Scalars['ID'];
  /** The template that this dimension belongs to */
  template: PokerTemplate;
  /** FK for template */
  templateId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
};

/** An immutable TemplateDimension */
export type TemplateDimensionRef = {
  __typename?: 'TemplateDimensionRef';
  id: Scalars['ID'];
  /** The name of the dimension */
  name: Scalars['String'];
  /** scale used in this dimension */
  scale: TemplateScaleRef;
  /** The md5 hash to resolve the immutable selected scale ref */
  scaleRefId: Scalars['ID'];
  /** the order of the dimensions in the template */
  sortOrder: Scalars['Float'];
};

/** A team-specific template scale. */
export type TemplateScale = {
  __typename?: 'TemplateScale';
  createdAt: Scalars['DateTime'];
  /** The dimensions currently using this scale */
  dimensions: Array<TemplateDimension>;
  /** shortid */
  id: Scalars['ID'];
  /** true if the scale is currently used by the team, else false */
  isActive: Scalars['Boolean'];
  /** True if this is a starter/default scale; false otherwise */
  isStarter: Scalars['Boolean'];
  /** The title of the scale used in the template */
  name: Scalars['String'];
  /** The datetime that the scale was removed. Null if it has not been removed. */
  removedAt?: Maybe<Scalars['DateTime']>;
  /** The team that owns this template scale */
  team: Team;
  /** foreign key. use the team field */
  teamId: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  /** The values used in this scale */
  values: Array<TemplateScaleValue>;
};

/** An immutable version of TemplateScale to be shared across all users */
export type TemplateScaleRef = {
  __typename?: 'TemplateScaleRef';
  createdAt: Scalars['DateTime'];
  /** md5 hash */
  id: Scalars['ID'];
  /** The title of the scale used in the template */
  name: Scalars['String'];
  /** The values used in this scale */
  values: Array<TemplateScaleValue>;
};

/** A value for a scale. */
export type TemplateScaleValue = {
  __typename?: 'TemplateScaleValue';
  /** The color used to visually group a scale value */
  color: Scalars['String'];
  id: Scalars['ID'];
  /** The label for this value, e.g., XS, M, L */
  label: Scalars['String'];
  /** The id of the scale this value belongs to */
  scaleId: Scalars['ID'];
  /** the order of the scale value in this scale */
  sortOrder: Scalars['Int'];
};

/** An item that can be put in a thread */
export type Threadable = {
  /** The rich text body of the item */
  content: Scalars['String'];
  /** The timestamp the item was created */
  createdAt: Scalars['DateTime'];
  /** The userId that created the item */
  createdBy?: Maybe<Scalars['ID']>;
  /** The user that created the item */
  createdByUser?: Maybe<User>;
  /** The FK of the discussion this task was created in. Null if task was not created in a discussion */
  discussionId?: Maybe<Scalars['ID']>;
  /** shortid */
  id: Scalars['ID'];
  /** the replies to this threadable item */
  replies: Array<Threadable>;
  /** the parent, if this threadable is a reply, else null */
  threadParentId?: Maybe<Scalars['ID']>;
  /** the order of this threadable, relative to threadParentId */
  threadSortOrder?: Maybe<Scalars['Float']>;
  /** The timestamp the item was updated */
  updatedAt: Scalars['DateTime'];
};

/** A connection to a list of items. */
export type ThreadableConnection = {
  __typename?: 'ThreadableConnection';
  /** A list of edges. */
  edges: Array<ThreadableEdge>;
  /** Any errors that prevented the query from returning the full results */
  error?: Maybe<Scalars['String']>;
  /** Page info with strings (sortOrder) as cursors */
  pageInfo?: Maybe<PageInfo>;
};

/** An edge in a connection. */
export type ThreadableEdge = {
  __typename?: 'ThreadableEdge';
  cursor?: Maybe<Scalars['String']>;
  /** The item at the end of the edge */
  node: Threadable;
};

/** The pay tier of the team */
export enum TierEnum {
  Enterprise = 'enterprise',
  Personal = 'personal',
  Pro = 'pro'
}

/** A past event that is important to the viewer */
export type TimelineEvent = {
  /** * The timestamp the event was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** the number of times the user has interacted with (ie clicked) this event */
  interactionCount: Scalars['Int'];
  /** true if the timeline event is active, false if archived */
  isActive: Scalars['Boolean'];
  /** The orgId this event is associated with. Null if not traceable to one org */
  orgId?: Maybe<Scalars['ID']>;
  /** The organization this event is associated with */
  organization?: Maybe<Organization>;
  /** the number of times the user has seen this event */
  seenCount: Scalars['Int'];
  /** The team that can see this event */
  team?: Maybe<Team>;
  /** The teamId this event is associated with. Null if not traceable to one team */
  teamId?: Maybe<Scalars['ID']>;
  /** The specific type of event */
  type: TimelineEventEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId that can see this event */
  userId: Scalars['ID'];
};

/** An event for a completed action meeting */
export type TimelineEventCompletedActionMeeting = TimelineEvent & {
  __typename?: 'TimelineEventCompletedActionMeeting';
  /** * The timestamp the event was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** the number of times the user has interacted with (ie clicked) this event */
  interactionCount: Scalars['Int'];
  /** true if the timeline event is active, false if archived */
  isActive: Scalars['Boolean'];
  /** The meeting that was completed */
  meeting: ActionMeeting;
  /** The meetingId that was completed, null if legacyMeetingId is present */
  meetingId: Scalars['ID'];
  /** The orgId this event is associated with */
  orgId: Scalars['ID'];
  /** The organization this event is associated with */
  organization?: Maybe<Organization>;
  /** the number of times the user has seen this event */
  seenCount: Scalars['Int'];
  /** The team that can see this event */
  team: Team;
  /** The teamId this event is associated with */
  teamId: Scalars['ID'];
  /** The specific type of event */
  type: TimelineEventEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId that can see this event */
  userId: Scalars['ID'];
};

/** An event for a completed retro meeting */
export type TimelineEventCompletedRetroMeeting = TimelineEvent & {
  __typename?: 'TimelineEventCompletedRetroMeeting';
  /** * The timestamp the event was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** the number of times the user has interacted with (ie clicked) this event */
  interactionCount: Scalars['Int'];
  /** true if the timeline event is active, false if archived */
  isActive: Scalars['Boolean'];
  /** The meeting that was completed */
  meeting: RetrospectiveMeeting;
  /** The meetingId that was completed */
  meetingId: Scalars['ID'];
  /** The orgId this event is associated with */
  orgId: Scalars['ID'];
  /** The organization this event is associated with */
  organization?: Maybe<Organization>;
  /** the number of times the user has seen this event */
  seenCount: Scalars['Int'];
  /** The team that can see this event */
  team: Team;
  /** The teamId this event is associated with */
  teamId: Scalars['ID'];
  /** The specific type of event */
  type: TimelineEventEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId that can see this event */
  userId: Scalars['ID'];
};

/** A connection to a list of items. */
export type TimelineEventConnection = {
  __typename?: 'TimelineEventConnection';
  /** A list of edges. */
  edges: Array<TimelineEventEdge>;
  /** Page info with cursors coerced to ISO8601 dates */
  pageInfo?: Maybe<PageInfoDateCursor>;
};

/** An edge in a connection. */
export type TimelineEventEdge = {
  __typename?: 'TimelineEventEdge';
  cursor?: Maybe<Scalars['DateTime']>;
  /** The item at the end of the edge */
  node: TimelineEvent;
};

/** The specific type of event */
export enum TimelineEventEnum {
  PokerComplete = 'POKER_COMPLETE',
  ActionComplete = 'actionComplete',
  CreatedTeam = 'createdTeam',
  JoinedParabol = 'joinedParabol',
  RetroComplete = 'retroComplete'
}

/** An event for joining the app */
export type TimelineEventJoinedParabol = TimelineEvent & {
  __typename?: 'TimelineEventJoinedParabol';
  /** * The timestamp the event was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** the number of times the user has interacted with (ie clicked) this event */
  interactionCount: Scalars['Int'];
  /** true if the timeline event is active, false if archived */
  isActive: Scalars['Boolean'];
  /** The orgId this event is associated with. Null if not traceable to one org */
  orgId?: Maybe<Scalars['ID']>;
  /** The organization this event is associated with */
  organization?: Maybe<Organization>;
  /** the number of times the user has seen this event */
  seenCount: Scalars['Int'];
  /** The team that can see this event */
  team?: Maybe<Team>;
  /** The teamId this event is associated with. Null if not traceable to one team */
  teamId?: Maybe<Scalars['ID']>;
  /** The specific type of event */
  type: TimelineEventEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId that can see this event */
  userId: Scalars['ID'];
};

/** An event for a completed poker meeting */
export type TimelineEventPokerComplete = TimelineEvent & {
  __typename?: 'TimelineEventPokerComplete';
  /** * The timestamp the event was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** the number of times the user has interacted with (ie clicked) this event */
  interactionCount: Scalars['Int'];
  /** true if the timeline event is active, false if archived */
  isActive: Scalars['Boolean'];
  /** The meeting that was completed */
  meeting: PokerMeeting;
  /** The meetingId that was completed */
  meetingId: Scalars['ID'];
  /** The orgId this event is associated with */
  orgId: Scalars['ID'];
  /** The organization this event is associated with */
  organization?: Maybe<Organization>;
  /** the number of times the user has seen this event */
  seenCount: Scalars['Int'];
  /** The team that can see this event */
  team: Team;
  /** The teamId this event is associated with */
  teamId: Scalars['ID'];
  /** The specific type of event */
  type: TimelineEventEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId that can see this event */
  userId: Scalars['ID'];
};

/** An event triggered whenever a team is created */
export type TimelineEventTeamCreated = TimelineEvent & {
  __typename?: 'TimelineEventTeamCreated';
  /** * The timestamp the event was created at */
  createdAt: Scalars['DateTime'];
  /** shortid */
  id: Scalars['ID'];
  /** the number of times the user has interacted with (ie clicked) this event */
  interactionCount: Scalars['Int'];
  /** true if the timeline event is active, false if archived */
  isActive: Scalars['Boolean'];
  /** The orgId this event is associated with */
  orgId: Scalars['ID'];
  /** The organization this event is associated with */
  organization?: Maybe<Organization>;
  /** the number of times the user has seen this event */
  seenCount: Scalars['Int'];
  /** The team that can see this event */
  team: Team;
  /** The teamId this event is associated with. Null if not traceable to one team */
  teamId: Scalars['ID'];
  /** The specific type of event */
  type: TimelineEventEnum;
  /** The user than can see this event */
  user: User;
  /** * The userId that can see this event */
  userId: Scalars['ID'];
};

/** Return object for UpdateWatchlistPayload */
export type UpdateWatchlistPayload = ErrorPayload | UpdateWatchlistSuccess;

export type UpdateWatchlistSuccess = {
  __typename?: 'UpdateWatchlistSuccess';
  /** true if the mutation was successfully executed */
  success?: Maybe<Scalars['Boolean']>;
};

/** The meeting phase where all team members give updates one-by-one */
export type UpdatesPhase = NewMeetingPhase & {
  __typename?: 'UpdatesPhase';
  /** shortid */
  id: Scalars['ID'];
  meetingId: Scalars['ID'];
  /** The type of phase */
  phaseType: NewMeetingPhaseTypeEnum;
  stages: Array<UpdatesStage>;
  teamId: Scalars['ID'];
};

/** A stage that focuses on a single team member */
export type UpdatesStage = NewMeetingStage & NewMeetingTeamMemberStage & {
  __typename?: 'UpdatesStage';
  /** The datetime the stage was completed */
  endAt?: Maybe<Scalars['DateTime']>;
  /** stageId, shortid */
  id: Scalars['ID'];
  /** true if a time limit is set, false if end time is set, null if neither is set */
  isAsync?: Maybe<Scalars['Boolean']>;
  /** true if the facilitator has completed this stage, else false. Should be boolean(endAt) */
  isComplete: Scalars['Boolean'];
  /** true if any meeting participant can navigate to this stage */
  isNavigable: Scalars['Boolean'];
  /** true if the facilitator can navigate to this stage */
  isNavigableByFacilitator: Scalars['Boolean'];
  /** true if the viewer is ready to advance, else false */
  isViewerReady: Scalars['Boolean'];
  /** The meeting this stage belongs to */
  meeting?: Maybe<NewMeeting>;
  /** foreign key. try using meeting */
  meetingId: Scalars['ID'];
  /** The meeting member that is the focus for this phase item */
  meetingMember: MeetingMember;
  /** The phase this stage belongs to */
  phase?: Maybe<NewMeetingPhase>;
  /** The type of the phase */
  phaseType?: Maybe<NewMeetingPhaseTypeEnum>;
  /** the number of meeting members ready to advance, excluding the facilitator */
  readyCount: Scalars['Int'];
  /** The datetime the phase is scheduled to be finished, null if no time limit or end time is set */
  scheduledEndTime?: Maybe<Scalars['DateTime']>;
  /** The datetime the stage was started */
  startAt?: Maybe<Scalars['DateTime']>;
  /** The suggested ending datetime for a phase to be completed async, null if not enough data to make a suggestion */
  suggestedEndTime?: Maybe<Scalars['DateTime']>;
  /** The suggested time limit for a phase to be completed together, null if not enough data to make a suggestion */
  suggestedTimeLimit?: Maybe<Scalars['Float']>;
  teamId: Scalars['ID'];
  /** The team member that is the focus for this phase item */
  teamMember: TeamMember;
  /** foreign key. use teamMember */
  teamMemberId: Scalars['ID'];
  /** The number of milliseconds left before the scheduled end time. Useful for unsynced client clocks. null if scheduledEndTime is null */
  timeRemaining?: Maybe<Scalars['Float']>;
  /** Number of times the facilitator has visited this stage */
  viewCount?: Maybe<Scalars['Int']>;
};

/** The user account profile */
export type User = {
  __typename?: 'User';
  archivedTasks?: Maybe<TaskConnection>;
  archivedTasksCount?: Maybe<Scalars['Int']>;
  /** The assumed company this organizaiton belongs to */
  company?: Maybe<Company>;
  /** The timestamp the user was created */
  createdAt?: Maybe<Scalars['DateTime']>;
  /** the comments and tasks created from the discussion */
  discussion?: Maybe<Discussion>;
  /** The user email */
  email: Scalars['Email'];
  /** Any super power given to the user via a super user */
  featureFlags: UserFeatureFlags;
  /** The userId provided by us */
  id: Scalars['ID'];
  /**
   * An array of objects with information about the user's identities.
   *       More than one will exists in case accounts are linked
   */
  identities?: Maybe<Array<Maybe<AuthIdentity>>>;
  /** true if the user is not currently being billed for service. removed on every websocket handshake */
  inactive?: Maybe<Scalars['Boolean']>;
  invoiceDetails?: Maybe<Invoice>;
  invoices?: Maybe<InvoiceConnection>;
  /** true if the user is a billing leader on any organization, else false */
  isAnyBillingLeader: Scalars['Boolean'];
  /** true if the user is currently online */
  isConnected?: Maybe<Scalars['Boolean']>;
  /** true if the user is the first to sign up from their domain, else false */
  isPatientZero: Scalars['Boolean'];
  /** true if the user was removed from parabol, else false */
  isRemoved: Scalars['Boolean'];
  /** true if all user sessions are being recorded in LogRocket, else false */
  isWatched: Scalars['Boolean'];
  /** the endedAt timestamp of the most recent meeting they were a member of */
  lastMetAt?: Maybe<Scalars['DateTime']>;
  /** The last day the user connected via websocket or navigated to a common area */
  lastSeenAt: Scalars['DateTime'];
  /** The paths that the user is currently visiting. This is null if the user is not currently online. A URL can also be null if the socket is not in a meeting, e.g. on the timeline. */
  lastSeenAtURLs?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** A previous meeting that the user was in (present or absent) */
  meeting?: Maybe<NewMeeting>;
  /** The number of meetings the user has attended */
  meetingCount: Scalars['Int'];
  /** The meeting member associated with this user, if a meeting is currently in progress */
  meetingMember?: Maybe<MeetingMember>;
  /** The number of consecutive 30-day intervals that the user has checked into a meeting as of this moment */
  monthlyStreakCurrent: Scalars['Int'];
  /** The largest number of consecutive months the user has checked into a meeting */
  monthlyStreakMax: Scalars['Int'];
  /** The new feature released by Parabol. null if the user already hid it */
  newFeature?: Maybe<NewFeatureBroadcast>;
  /** the ID of the newest feature, null if the user has dismissed it */
  newFeatureId?: Maybe<Scalars['ID']>;
  /** A previous meeting that the user was in (present or absent) */
  newMeeting?: Maybe<NewMeeting>;
  /** all the notifications for a single user */
  notifications: NotificationConnection;
  /** get a single organization */
  organization?: Maybe<Organization>;
  /** The connection between a user and an organization */
  organizationUser?: Maybe<OrganizationUser>;
  /** A single user that is connected to a single organization */
  organizationUsers: Array<OrganizationUser>;
  /** Get the list of all organizations a user belongs to */
  organizations: Array<Organization>;
  /** a string with message stating that the user is over the free tier limit, else null */
  overLimitCopy?: Maybe<Scalars['String']>;
  /** the number of times the user clicked pay later */
  payLaterClickCount: Scalars['Int'];
  /** url of user’s profile picture */
  picture: Scalars['URL'];
  /** The application-specific name, defaults to email before the tld */
  preferredName: Scalars['String'];
  /** url of user’s raster profile picture (if user profile pic is an SVG, raster will be a PNG) */
  rasterPicture: Scalars['URL'];
  /** the reason the user account was removed */
  reasonRemoved?: Maybe<Scalars['String']>;
  /** The reflection groups that are similar to the selected reflection in the Spotlight */
  similarReflectionGroups: Array<RetroReflectionGroup>;
  /** the most important actions for the user to perform */
  suggestedActions: Array<SuggestedAction>;
  tasks: TaskConnection;
  /** A query for a team */
  team?: Maybe<Team>;
  /** The invitation sent to the user, even if it was sent before they were a user */
  teamInvitation: TeamInvitationPayload;
  /** The team member associated with this user */
  teamMember?: Maybe<TeamMember>;
  /** all the teams the user is on that the viewer can see. */
  teams: Array<Team>;
  /** The highest tier of any org the user belongs to */
  tier: TierEnum;
  /** The timeline of important events for the viewer */
  timeline: TimelineEventConnection;
  /** all the teams the user is a part of that the viewer can see */
  tms: Array<Scalars['ID']>;
  /** The timestamp the user was last updated */
  updatedAt?: Maybe<Scalars['DateTime']>;
  userOnTeam?: Maybe<User>;
};


/** The user account profile */
export type UserArchivedTasksArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  first: Scalars['Int'];
  teamId: Scalars['ID'];
};


/** The user account profile */
export type UserArchivedTasksCountArgs = {
  teamId: Scalars['ID'];
};


/** The user account profile */
export type UserDiscussionArgs = {
  id: Scalars['ID'];
};


/** The user account profile */
export type UserInvoiceDetailsArgs = {
  invoiceId: Scalars['ID'];
};


/** The user account profile */
export type UserInvoicesArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  first: Scalars['Int'];
  orgId: Scalars['ID'];
};


/** The user account profile */
export type UserMeetingArgs = {
  meetingId: Scalars['ID'];
};


/** The user account profile */
export type UserMeetingMemberArgs = {
  meetingId: Scalars['ID'];
};


/** The user account profile */
export type UserNewMeetingArgs = {
  meetingId: Scalars['ID'];
};


/** The user account profile */
export type UserNotificationsArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  first: Scalars['Int'];
};


/** The user account profile */
export type UserOrganizationArgs = {
  orgId: Scalars['ID'];
};


/** The user account profile */
export type UserOrganizationUserArgs = {
  orgId: Scalars['ID'];
};


/** The user account profile */
export type UserSimilarReflectionGroupsArgs = {
  reflectionGroupId: Scalars['ID'];
  searchQuery: Scalars['String'];
};


/** The user account profile */
export type UserTasksArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  archived?: InputMaybe<Scalars['Boolean']>;
  filterQuery?: InputMaybe<Scalars['String']>;
  first: Scalars['Int'];
  includeUnassigned?: InputMaybe<Scalars['Boolean']>;
  statusFilters?: InputMaybe<Array<TaskStatusEnum>>;
  teamIds?: InputMaybe<Array<Scalars['ID']>>;
  userIds?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


/** The user account profile */
export type UserTeamArgs = {
  teamId: Scalars['ID'];
};


/** The user account profile */
export type UserTeamInvitationArgs = {
  meetingId?: InputMaybe<Scalars['ID']>;
  teamId?: InputMaybe<Scalars['ID']>;
};


/** The user account profile */
export type UserTeamMemberArgs = {
  teamId: Scalars['ID'];
  userId?: InputMaybe<Scalars['ID']>;
};


/** The user account profile */
export type UserTimelineArgs = {
  after?: InputMaybe<Scalars['DateTime']>;
  first: Scalars['Int'];
};


/** The user account profile */
export type UserUserOnTeamArgs = {
  userId: Scalars['ID'];
};

/** The types of flags that give an individual user super powers */
export type UserFeatureFlags = {
  __typename?: 'UserFeatureFlags';
  /** true if gitlab is allowed */
  gitlab: Scalars['Boolean'];
  /** true if spotlight is allowed */
  spotlight: Scalars['Boolean'];
  /** true if standups is allowed */
  standups: Scalars['Boolean'];
};

/** A count of the number of account tiers a user belongs to. */
export type UserTiersCount = {
  __typename?: 'UserTiersCount';
  /** The number of personal orgs the user is active upon */
  tierPersonalCount?: Maybe<Scalars['Int']>;
  /** The number of pro orgs the user holds the role of Billing Leader */
  tierProBillingLeaderCount?: Maybe<Scalars['Int']>;
  /** The number of pro orgs the user is active upon */
  tierProCount?: Maybe<Scalars['Int']>;
  user?: Maybe<User>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ActionMeeting: ResolverTypeWrapper<ActionMeeting>;
  ActionMeetingMember: ResolverTypeWrapper<ActionMeetingMember>;
  ActionMeetingSettings: ResolverTypeWrapper<ActionMeetingSettings>;
  AddNewFeaturePayload: ResolverTypeWrapper<AddNewFeaturePayload>;
  AgendaItem: ResolverTypeWrapper<AgendaItem>;
  AgendaItemsPhase: ResolverTypeWrapper<AgendaItemsPhase>;
  AgendaItemsStage: ResolverTypeWrapper<AgendaItemsStage>;
  AtlassianIntegration: ResolverTypeWrapper<AtlassianIntegration>;
  AtlassianTeamIntegration: ResolverTypeWrapper<AtlassianTeamIntegration>;
  AuthIdentity: ResolversTypes['AuthIdentityGoogle'] | ResolversTypes['AuthIdentityLocal'];
  AuthIdentityGoogle: ResolverTypeWrapper<AuthIdentityGoogle>;
  AuthIdentityLocal: ResolverTypeWrapper<AuthIdentityLocal>;
  AuthIdentityTypeEnum: AuthIdentityTypeEnum;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ChangeSourceEnum: ChangeSourceEnum;
  CheckInPhase: ResolverTypeWrapper<CheckInPhase>;
  CheckInStage: ResolverTypeWrapper<CheckInStage>;
  Comment: ResolverTypeWrapper<Comment>;
  CommentorDetails: ResolverTypeWrapper<CommentorDetails>;
  Company: ResolverTypeWrapper<Company>;
  Coupon: ResolverTypeWrapper<Coupon>;
  CreditCard: ResolverTypeWrapper<CreditCard>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DeleteUserPayload: ResolverTypeWrapper<DeleteUserPayload>;
  DisconnectSocketPayload: ResolverTypeWrapper<DisconnectSocketPayload>;
  DiscussPhase: ResolverTypeWrapper<DiscussPhase>;
  Discussion: ResolverTypeWrapper<Discussion>;
  DiscussionThreadStage: ResolversTypes['AgendaItemsStage'] | ResolversTypes['EstimateStage'] | ResolversTypes['RetroDiscussStage'];
  DiscussionTopicTypeEnum: DiscussionTopicTypeEnum;
  DomainCountPayload: ResolverTypeWrapper<DomainCountPayload>;
  DraftEnterpriseInvoicePayload: ResolverTypeWrapper<DraftEnterpriseInvoicePayload>;
  Email: ResolverTypeWrapper<Scalars['Email']>;
  EnableSAMLForDomainPayload: ResolversTypes['EnableSAMLForDomainSuccess'] | ResolversTypes['ErrorPayload'];
  EnableSAMLForDomainSuccess: ResolverTypeWrapper<EnableSamlForDomainSuccess>;
  ErrorPayload: ResolverTypeWrapper<ErrorPayload>;
  EstimatePhase: ResolverTypeWrapper<EstimatePhase>;
  EstimateStage: ResolverTypeWrapper<EstimateStage>;
  EstimateUserScore: ResolverTypeWrapper<EstimateUserScore>;
  FlagConversionModalPayload: ResolverTypeWrapper<FlagConversionModalPayload>;
  FlagOverLimitPayload: ResolverTypeWrapper<FlagOverLimitPayload>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  GenericMeetingPhase: ResolverTypeWrapper<GenericMeetingPhase>;
  GenericMeetingStage: ResolverTypeWrapper<GenericMeetingStage>;
  GitHubIntegration: ResolverTypeWrapper<GitHubIntegration>;
  GitHubSearchQuery: ResolverTypeWrapper<GitHubSearchQuery>;
  GitLabIntegration: ResolverTypeWrapper<GitLabIntegration>;
  GoogleAnalyzedEntity: ResolverTypeWrapper<GoogleAnalyzedEntity>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  IntegrationProvider: ResolversTypes['IntegrationProviderOAuth1'] | ResolversTypes['IntegrationProviderOAuth2'] | ResolversTypes['IntegrationProviderWebhook'];
  IntegrationProviderAuthStrategyEnum: IntegrationProviderAuthStrategyEnum;
  IntegrationProviderOAuth1: ResolverTypeWrapper<IntegrationProviderOAuth1>;
  IntegrationProviderOAuth2: ResolverTypeWrapper<IntegrationProviderOAuth2>;
  IntegrationProviderScopeEnum: IntegrationProviderScopeEnum;
  IntegrationProviderServiceEnum: IntegrationProviderServiceEnum;
  IntegrationProviderWebhook: ResolverTypeWrapper<IntegrationProviderWebhook>;
  Invoice: ResolverTypeWrapper<Invoice>;
  InvoiceConnection: ResolverTypeWrapper<InvoiceConnection>;
  InvoiceEdge: ResolverTypeWrapper<InvoiceEdge>;
  InvoiceLineItem: ResolverTypeWrapper<InvoiceLineItem>;
  InvoiceLineItemDetails: ResolverTypeWrapper<InvoiceLineItemDetails>;
  InvoiceLineItemEnum: InvoiceLineItemEnum;
  InvoiceStatusEnum: InvoiceStatusEnum;
  JiraDimensionField: ResolverTypeWrapper<JiraDimensionField>;
  JiraIssue: ResolverTypeWrapper<JiraIssue>;
  JiraIssueConnection: ResolverTypeWrapper<JiraIssueConnection>;
  JiraIssueEdge: ResolverTypeWrapper<JiraIssueEdge>;
  JiraRemoteAvatarUrls: ResolverTypeWrapper<JiraRemoteAvatarUrls>;
  JiraRemoteProject: ResolverTypeWrapper<JiraRemoteProject>;
  JiraRemoteProjectCategory: ResolverTypeWrapper<JiraRemoteProjectCategory>;
  JiraSearchQuery: ResolverTypeWrapper<JiraSearchQuery>;
  JiraServerIntegration: ResolverTypeWrapper<JiraServerIntegration>;
  JiraServerRemoteProject: ResolverTypeWrapper<JiraServerRemoteProject>;
  LoginSAMLPayload: ResolverTypeWrapper<LoginSamlPayload>;
  LoginsPayload: ResolverTypeWrapper<LoginsPayloadSource>;
  MassInvitation: ResolverTypeWrapper<MassInvitation>;
  MattermostIntegration: ResolverTypeWrapper<MattermostIntegration>;
  MeetingGreeting: ResolverTypeWrapper<MeetingGreeting>;
  MeetingMember: ResolversTypes['ActionMeetingMember'] | ResolversTypes['PokerMeetingMember'] | ResolversTypes['RetrospectiveMeetingMember'] | ResolversTypes['TeamPromptMeetingMember'];
  MeetingTemplate: ResolversTypes['PokerTemplate'] | ResolversTypes['ReflectTemplate'];
  MeetingTypeEnum: MeetingTypeEnum;
  MessageAllSlackUsersPayload: ResolversTypes['ErrorPayload'] | ResolversTypes['MessageAllSlackUsersSuccess'];
  MessageAllSlackUsersSuccess: ResolverTypeWrapper<MessageAllSlackUsersSuccess>;
  MessageSlackUserError: ResolverTypeWrapper<MessageSlackUserError>;
  Mutation: ResolverTypeWrapper<{}>;
  NewFeatureBroadcast: ResolverTypeWrapper<NewFeatureBroadcast>;
  NewMeeting: ResolversTypes['ActionMeeting'] | ResolversTypes['PokerMeeting'] | ResolversTypes['RetrospectiveMeeting'] | ResolversTypes['TeamPromptMeeting'];
  NewMeetingPhase: ResolversTypes['AgendaItemsPhase'] | ResolversTypes['CheckInPhase'] | ResolversTypes['DiscussPhase'] | ResolversTypes['EstimatePhase'] | ResolversTypes['GenericMeetingPhase'] | ResolversTypes['ReflectPhase'] | ResolversTypes['UpdatesPhase'];
  NewMeetingPhaseTypeEnum: NewMeetingPhaseTypeEnum;
  NewMeetingStage: ResolversTypes['AgendaItemsStage'] | ResolversTypes['CheckInStage'] | ResolversTypes['EstimateStage'] | ResolversTypes['GenericMeetingStage'] | ResolversTypes['RetroDiscussStage'] | ResolversTypes['UpdatesStage'];
  NewMeetingTeamMemberStage: ResolversTypes['CheckInStage'] | ResolversTypes['UpdatesStage'];
  NextPeriodCharges: ResolverTypeWrapper<NextPeriodCharges>;
  Notification: ResolversTypes['NotificationTeamInvitation'] | ResolversTypes['NotifyPaymentRejected'] | ResolversTypes['NotifyPromoteToOrgLeader'];
  NotificationConnection: ResolverTypeWrapper<NotificationConnection>;
  NotificationEdge: ResolverTypeWrapper<NotificationEdge>;
  NotificationEnum: NotificationEnum;
  NotificationStatusEnum: NotificationStatusEnum;
  NotificationTeamInvitation: ResolverTypeWrapper<NotificationTeamInvitation>;
  NotifyPaymentRejected: ResolverTypeWrapper<NotifyPaymentRejected>;
  NotifyPromoteToOrgLeader: ResolverTypeWrapper<NotifyPromoteToOrgLeader>;
  OrgUserCount: ResolverTypeWrapper<OrgUserCount>;
  OrgUserRole: OrgUserRole;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationUser: ResolverTypeWrapper<OrganizationUser>;
  OrganizationUserConnection: ResolverTypeWrapper<OrganizationUserConnection>;
  OrganizationUserEdge: ResolverTypeWrapper<OrganizationUserEdge>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PageInfoDateCursor: ResolverTypeWrapper<PageInfoDateCursor>;
  PingableServices: ResolverTypeWrapper<PingableServicesSource>;
  PokerMeeting: ResolverTypeWrapper<PokerMeeting>;
  PokerMeetingMember: ResolverTypeWrapper<PokerMeetingMember>;
  PokerMeetingSettings: ResolverTypeWrapper<PokerMeetingSettings>;
  PokerTemplate: ResolverTypeWrapper<PokerTemplate>;
  PokerTemplateConnection: ResolverTypeWrapper<PokerTemplateConnection>;
  PokerTemplateEdge: ResolverTypeWrapper<PokerTemplateEdge>;
  Query: ResolverTypeWrapper<{}>;
  Reactable: ResolversTypes['Comment'] | ResolversTypes['RetroReflection'];
  Reactji: ResolverTypeWrapper<Reactji>;
  ReflectPhase: ResolverTypeWrapper<ReflectPhase>;
  ReflectPrompt: ResolverTypeWrapper<ReflectPrompt>;
  ReflectTemplate: ResolverTypeWrapper<ReflectTemplate>;
  ReflectTemplateConnection: ResolverTypeWrapper<ReflectTemplateConnection>;
  ReflectTemplateEdge: ResolverTypeWrapper<ReflectTemplateEdge>;
  ReflectionGroupSortEnum: ReflectionGroupSortEnum;
  RemoveAllSlackAuthsPayload: ResolversTypes['ErrorPayload'] | ResolversTypes['RemoveAllSlackAuthsSuccess'];
  RemoveAllSlackAuthsSuccess: ResolverTypeWrapper<RemoveAllSlackAuthsSuccess>;
  RepoIntegration: ResolversTypes['JiraRemoteProject'] | ResolversTypes['JiraServerRemoteProject'];
  RepoIntegrationQueryPayload: ResolverTypeWrapper<RepoIntegrationQueryPayload>;
  RetroDiscussStage: ResolverTypeWrapper<RetroDiscussStage>;
  RetroReflection: ResolverTypeWrapper<RetroReflection>;
  RetroReflectionGroup: ResolverTypeWrapper<RetroReflectionGroup>;
  RetrospectiveMeeting: ResolverTypeWrapper<RetrospectiveMeeting>;
  RetrospectiveMeetingMember: ResolverTypeWrapper<RetrospectiveMeetingMember>;
  RetrospectiveMeetingSettings: ResolverTypeWrapper<RetrospectiveMeetingSettings>;
  ServiceField: ResolverTypeWrapper<ServiceField>;
  SharingScopeEnum: SharingScopeEnum;
  SignupsPayload: ResolverTypeWrapper<SignupsPayload>;
  SlackIntegration: ResolverTypeWrapper<SlackIntegration>;
  SlackNotification: ResolverTypeWrapper<SlackNotification>;
  SlackNotificationEventEnum: SlackNotificationEventEnum;
  SlackNotificationEventTypeEnum: SlackNotificationEventTypeEnum;
  StandardMutationError: ResolverTypeWrapper<StandardMutationError>;
  String: ResolverTypeWrapper<Scalars['String']>;
  StripeFailPaymentPayload: ResolverTypeWrapper<StripeFailPaymentPayload>;
  SuggestedAction: ResolversTypes['SuggestedActionCreateNewTeam'] | ResolversTypes['SuggestedActionInviteYourTeam'] | ResolversTypes['SuggestedActionTryActionMeeting'] | ResolversTypes['SuggestedActionTryRetroMeeting'] | ResolversTypes['SuggestedActionTryTheDemo'];
  SuggestedActionCreateNewTeam: ResolverTypeWrapper<SuggestedActionCreateNewTeam>;
  SuggestedActionInviteYourTeam: ResolverTypeWrapper<SuggestedActionInviteYourTeam>;
  SuggestedActionTryActionMeeting: ResolverTypeWrapper<SuggestedActionTryActionMeeting>;
  SuggestedActionTryRetroMeeting: ResolverTypeWrapper<SuggestedActionTryRetroMeeting>;
  SuggestedActionTryTheDemo: ResolverTypeWrapper<SuggestedActionTryTheDemo>;
  SuggestedActionTypeEnum: SuggestedActionTypeEnum;
  Task: ResolverTypeWrapper<Task>;
  TaskConnection: ResolverTypeWrapper<TaskConnection>;
  TaskEdge: ResolverTypeWrapper<TaskEdge>;
  TaskEditorDetails: ResolverTypeWrapper<TaskEditorDetails>;
  TaskEstimate: ResolverTypeWrapper<TaskEstimate>;
  TaskIntegration: ResolversTypes['JiraIssue'];
  TaskStatusEnum: TaskStatusEnum;
  Team: ResolverTypeWrapper<Team>;
  TeamDrawer: TeamDrawer;
  TeamIntegrations: ResolverTypeWrapper<TeamIntegrations>;
  TeamInvitation: ResolverTypeWrapper<TeamInvitation>;
  TeamInvitationPayload: ResolverTypeWrapper<TeamInvitationPayload>;
  TeamMeetingSettings: ResolversTypes['ActionMeetingSettings'] | ResolversTypes['PokerMeetingSettings'] | ResolversTypes['RetrospectiveMeetingSettings'] | ResolversTypes['TeamPromptMeetingSettings'];
  TeamMember: ResolverTypeWrapper<TeamMember>;
  TeamMemberIntegrationAuth: ResolversTypes['TeamMemberIntegrationAuthOAuth1'] | ResolversTypes['TeamMemberIntegrationAuthOAuth2'] | ResolversTypes['TeamMemberIntegrationAuthWebhook'];
  TeamMemberIntegrationAuthOAuth1: ResolverTypeWrapper<TeamMemberIntegrationAuthOAuth1>;
  TeamMemberIntegrationAuthOAuth2: ResolverTypeWrapper<TeamMemberIntegrationAuthOAuth2>;
  TeamMemberIntegrationAuthWebhook: ResolverTypeWrapper<TeamMemberIntegrationAuthWebhook>;
  TeamMemberIntegrations: ResolverTypeWrapper<TeamMemberIntegrations>;
  TeamNotification: ResolversTypes['NotificationTeamInvitation'];
  TeamPromptMeeting: ResolverTypeWrapper<TeamPromptMeeting>;
  TeamPromptMeetingMember: ResolverTypeWrapper<TeamPromptMeetingMember>;
  TeamPromptMeetingSettings: ResolverTypeWrapper<TeamPromptMeetingSettings>;
  TemplateDimension: ResolverTypeWrapper<TemplateDimension>;
  TemplateDimensionRef: ResolverTypeWrapper<TemplateDimensionRef>;
  TemplateScale: ResolverTypeWrapper<TemplateScale>;
  TemplateScaleRef: ResolverTypeWrapper<TemplateScaleRef>;
  TemplateScaleValue: ResolverTypeWrapper<TemplateScaleValue>;
  Threadable: ResolversTypes['Comment'] | ResolversTypes['Task'];
  ThreadableConnection: ResolverTypeWrapper<ThreadableConnection>;
  ThreadableEdge: ResolverTypeWrapper<ThreadableEdge>;
  TierEnum: TierEnum;
  TimelineEvent: ResolversTypes['TimelineEventCompletedActionMeeting'] | ResolversTypes['TimelineEventCompletedRetroMeeting'] | ResolversTypes['TimelineEventJoinedParabol'] | ResolversTypes['TimelineEventPokerComplete'] | ResolversTypes['TimelineEventTeamCreated'];
  TimelineEventCompletedActionMeeting: ResolverTypeWrapper<TimelineEventCompletedActionMeeting>;
  TimelineEventCompletedRetroMeeting: ResolverTypeWrapper<TimelineEventCompletedRetroMeeting>;
  TimelineEventConnection: ResolverTypeWrapper<TimelineEventConnection>;
  TimelineEventEdge: ResolverTypeWrapper<TimelineEventEdge>;
  TimelineEventEnum: TimelineEventEnum;
  TimelineEventJoinedParabol: ResolverTypeWrapper<TimelineEventJoinedParabol>;
  TimelineEventPokerComplete: ResolverTypeWrapper<TimelineEventPokerComplete>;
  TimelineEventTeamCreated: ResolverTypeWrapper<TimelineEventTeamCreated>;
  URL: ResolverTypeWrapper<Scalars['URL']>;
  UpdateWatchlistPayload: ResolversTypes['ErrorPayload'] | ResolversTypes['UpdateWatchlistSuccess'];
  UpdateWatchlistSuccess: ResolverTypeWrapper<UpdateWatchlistSuccess>;
  UpdatesPhase: ResolverTypeWrapper<UpdatesPhase>;
  UpdatesStage: ResolverTypeWrapper<UpdatesStage>;
  User: ResolverTypeWrapper<User>;
  UserFeatureFlags: ResolverTypeWrapper<UserFeatureFlags>;
  UserTiersCount: ResolverTypeWrapper<UserTiersCount>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActionMeeting: ActionMeeting;
  ActionMeetingMember: ActionMeetingMember;
  ActionMeetingSettings: ActionMeetingSettings;
  AddNewFeaturePayload: AddNewFeaturePayload;
  AgendaItem: AgendaItem;
  AgendaItemsPhase: AgendaItemsPhase;
  AgendaItemsStage: AgendaItemsStage;
  AtlassianIntegration: AtlassianIntegration;
  AtlassianTeamIntegration: AtlassianTeamIntegration;
  AuthIdentity: ResolversParentTypes['AuthIdentityGoogle'] | ResolversParentTypes['AuthIdentityLocal'];
  AuthIdentityGoogle: AuthIdentityGoogle;
  AuthIdentityLocal: AuthIdentityLocal;
  Boolean: Scalars['Boolean'];
  CheckInPhase: CheckInPhase;
  CheckInStage: CheckInStage;
  Comment: Comment;
  CommentorDetails: CommentorDetails;
  Company: Company;
  Coupon: Coupon;
  CreditCard: CreditCard;
  DateTime: Scalars['DateTime'];
  DeleteUserPayload: DeleteUserPayload;
  DisconnectSocketPayload: DisconnectSocketPayload;
  DiscussPhase: DiscussPhase;
  Discussion: Discussion;
  DiscussionThreadStage: ResolversParentTypes['AgendaItemsStage'] | ResolversParentTypes['EstimateStage'] | ResolversParentTypes['RetroDiscussStage'];
  DomainCountPayload: DomainCountPayload;
  DraftEnterpriseInvoicePayload: DraftEnterpriseInvoicePayload;
  Email: Scalars['Email'];
  EnableSAMLForDomainPayload: ResolversParentTypes['EnableSAMLForDomainSuccess'] | ResolversParentTypes['ErrorPayload'];
  EnableSAMLForDomainSuccess: EnableSamlForDomainSuccess;
  ErrorPayload: ErrorPayload;
  EstimatePhase: EstimatePhase;
  EstimateStage: EstimateStage;
  EstimateUserScore: EstimateUserScore;
  FlagConversionModalPayload: FlagConversionModalPayload;
  FlagOverLimitPayload: FlagOverLimitPayload;
  Float: Scalars['Float'];
  GenericMeetingPhase: GenericMeetingPhase;
  GenericMeetingStage: GenericMeetingStage;
  GitHubIntegration: GitHubIntegration;
  GitHubSearchQuery: GitHubSearchQuery;
  GitLabIntegration: GitLabIntegration;
  GoogleAnalyzedEntity: GoogleAnalyzedEntity;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  IntegrationProvider: ResolversParentTypes['IntegrationProviderOAuth1'] | ResolversParentTypes['IntegrationProviderOAuth2'] | ResolversParentTypes['IntegrationProviderWebhook'];
  IntegrationProviderOAuth1: IntegrationProviderOAuth1;
  IntegrationProviderOAuth2: IntegrationProviderOAuth2;
  IntegrationProviderWebhook: IntegrationProviderWebhook;
  Invoice: Invoice;
  InvoiceConnection: InvoiceConnection;
  InvoiceEdge: InvoiceEdge;
  InvoiceLineItem: InvoiceLineItem;
  InvoiceLineItemDetails: InvoiceLineItemDetails;
  JiraDimensionField: JiraDimensionField;
  JiraIssue: JiraIssue;
  JiraIssueConnection: JiraIssueConnection;
  JiraIssueEdge: JiraIssueEdge;
  JiraRemoteAvatarUrls: JiraRemoteAvatarUrls;
  JiraRemoteProject: JiraRemoteProject;
  JiraRemoteProjectCategory: JiraRemoteProjectCategory;
  JiraSearchQuery: JiraSearchQuery;
  JiraServerIntegration: JiraServerIntegration;
  JiraServerRemoteProject: JiraServerRemoteProject;
  LoginSAMLPayload: LoginSamlPayload;
  LoginsPayload: LoginsPayloadSource;
  MassInvitation: MassInvitation;
  MattermostIntegration: MattermostIntegration;
  MeetingGreeting: MeetingGreeting;
  MeetingMember: ResolversParentTypes['ActionMeetingMember'] | ResolversParentTypes['PokerMeetingMember'] | ResolversParentTypes['RetrospectiveMeetingMember'] | ResolversParentTypes['TeamPromptMeetingMember'];
  MeetingTemplate: ResolversParentTypes['PokerTemplate'] | ResolversParentTypes['ReflectTemplate'];
  MessageAllSlackUsersPayload: ResolversParentTypes['ErrorPayload'] | ResolversParentTypes['MessageAllSlackUsersSuccess'];
  MessageAllSlackUsersSuccess: MessageAllSlackUsersSuccess;
  MessageSlackUserError: MessageSlackUserError;
  Mutation: {};
  NewFeatureBroadcast: NewFeatureBroadcast;
  NewMeeting: ResolversParentTypes['ActionMeeting'] | ResolversParentTypes['PokerMeeting'] | ResolversParentTypes['RetrospectiveMeeting'] | ResolversParentTypes['TeamPromptMeeting'];
  NewMeetingPhase: ResolversParentTypes['AgendaItemsPhase'] | ResolversParentTypes['CheckInPhase'] | ResolversParentTypes['DiscussPhase'] | ResolversParentTypes['EstimatePhase'] | ResolversParentTypes['GenericMeetingPhase'] | ResolversParentTypes['ReflectPhase'] | ResolversParentTypes['UpdatesPhase'];
  NewMeetingStage: ResolversParentTypes['AgendaItemsStage'] | ResolversParentTypes['CheckInStage'] | ResolversParentTypes['EstimateStage'] | ResolversParentTypes['GenericMeetingStage'] | ResolversParentTypes['RetroDiscussStage'] | ResolversParentTypes['UpdatesStage'];
  NewMeetingTeamMemberStage: ResolversParentTypes['CheckInStage'] | ResolversParentTypes['UpdatesStage'];
  NextPeriodCharges: NextPeriodCharges;
  Notification: ResolversParentTypes['NotificationTeamInvitation'] | ResolversParentTypes['NotifyPaymentRejected'] | ResolversParentTypes['NotifyPromoteToOrgLeader'];
  NotificationConnection: NotificationConnection;
  NotificationEdge: NotificationEdge;
  NotificationTeamInvitation: NotificationTeamInvitation;
  NotifyPaymentRejected: NotifyPaymentRejected;
  NotifyPromoteToOrgLeader: NotifyPromoteToOrgLeader;
  OrgUserCount: OrgUserCount;
  Organization: Organization;
  OrganizationUser: OrganizationUser;
  OrganizationUserConnection: OrganizationUserConnection;
  OrganizationUserEdge: OrganizationUserEdge;
  PageInfo: PageInfo;
  PageInfoDateCursor: PageInfoDateCursor;
  PingableServices: PingableServicesSource;
  PokerMeeting: PokerMeeting;
  PokerMeetingMember: PokerMeetingMember;
  PokerMeetingSettings: PokerMeetingSettings;
  PokerTemplate: PokerTemplate;
  PokerTemplateConnection: PokerTemplateConnection;
  PokerTemplateEdge: PokerTemplateEdge;
  Query: {};
  Reactable: ResolversParentTypes['Comment'] | ResolversParentTypes['RetroReflection'];
  Reactji: Reactji;
  ReflectPhase: ReflectPhase;
  ReflectPrompt: ReflectPrompt;
  ReflectTemplate: ReflectTemplate;
  ReflectTemplateConnection: ReflectTemplateConnection;
  ReflectTemplateEdge: ReflectTemplateEdge;
  RemoveAllSlackAuthsPayload: ResolversParentTypes['ErrorPayload'] | ResolversParentTypes['RemoveAllSlackAuthsSuccess'];
  RemoveAllSlackAuthsSuccess: RemoveAllSlackAuthsSuccess;
  RepoIntegration: ResolversParentTypes['JiraRemoteProject'] | ResolversParentTypes['JiraServerRemoteProject'];
  RepoIntegrationQueryPayload: RepoIntegrationQueryPayload;
  RetroDiscussStage: RetroDiscussStage;
  RetroReflection: RetroReflection;
  RetroReflectionGroup: RetroReflectionGroup;
  RetrospectiveMeeting: RetrospectiveMeeting;
  RetrospectiveMeetingMember: RetrospectiveMeetingMember;
  RetrospectiveMeetingSettings: RetrospectiveMeetingSettings;
  ServiceField: ServiceField;
  SignupsPayload: SignupsPayload;
  SlackIntegration: SlackIntegration;
  SlackNotification: SlackNotification;
  StandardMutationError: StandardMutationError;
  String: Scalars['String'];
  StripeFailPaymentPayload: StripeFailPaymentPayload;
  SuggestedAction: ResolversParentTypes['SuggestedActionCreateNewTeam'] | ResolversParentTypes['SuggestedActionInviteYourTeam'] | ResolversParentTypes['SuggestedActionTryActionMeeting'] | ResolversParentTypes['SuggestedActionTryRetroMeeting'] | ResolversParentTypes['SuggestedActionTryTheDemo'];
  SuggestedActionCreateNewTeam: SuggestedActionCreateNewTeam;
  SuggestedActionInviteYourTeam: SuggestedActionInviteYourTeam;
  SuggestedActionTryActionMeeting: SuggestedActionTryActionMeeting;
  SuggestedActionTryRetroMeeting: SuggestedActionTryRetroMeeting;
  SuggestedActionTryTheDemo: SuggestedActionTryTheDemo;
  Task: Task;
  TaskConnection: TaskConnection;
  TaskEdge: TaskEdge;
  TaskEditorDetails: TaskEditorDetails;
  TaskEstimate: TaskEstimate;
  TaskIntegration: ResolversParentTypes['JiraIssue'];
  Team: Team;
  TeamIntegrations: TeamIntegrations;
  TeamInvitation: TeamInvitation;
  TeamInvitationPayload: TeamInvitationPayload;
  TeamMeetingSettings: ResolversParentTypes['ActionMeetingSettings'] | ResolversParentTypes['PokerMeetingSettings'] | ResolversParentTypes['RetrospectiveMeetingSettings'] | ResolversParentTypes['TeamPromptMeetingSettings'];
  TeamMember: TeamMember;
  TeamMemberIntegrationAuth: ResolversParentTypes['TeamMemberIntegrationAuthOAuth1'] | ResolversParentTypes['TeamMemberIntegrationAuthOAuth2'] | ResolversParentTypes['TeamMemberIntegrationAuthWebhook'];
  TeamMemberIntegrationAuthOAuth1: TeamMemberIntegrationAuthOAuth1;
  TeamMemberIntegrationAuthOAuth2: TeamMemberIntegrationAuthOAuth2;
  TeamMemberIntegrationAuthWebhook: TeamMemberIntegrationAuthWebhook;
  TeamMemberIntegrations: TeamMemberIntegrations;
  TeamNotification: ResolversParentTypes['NotificationTeamInvitation'];
  TeamPromptMeeting: TeamPromptMeeting;
  TeamPromptMeetingMember: TeamPromptMeetingMember;
  TeamPromptMeetingSettings: TeamPromptMeetingSettings;
  TemplateDimension: TemplateDimension;
  TemplateDimensionRef: TemplateDimensionRef;
  TemplateScale: TemplateScale;
  TemplateScaleRef: TemplateScaleRef;
  TemplateScaleValue: TemplateScaleValue;
  Threadable: ResolversParentTypes['Comment'] | ResolversParentTypes['Task'];
  ThreadableConnection: ThreadableConnection;
  ThreadableEdge: ThreadableEdge;
  TimelineEvent: ResolversParentTypes['TimelineEventCompletedActionMeeting'] | ResolversParentTypes['TimelineEventCompletedRetroMeeting'] | ResolversParentTypes['TimelineEventJoinedParabol'] | ResolversParentTypes['TimelineEventPokerComplete'] | ResolversParentTypes['TimelineEventTeamCreated'];
  TimelineEventCompletedActionMeeting: TimelineEventCompletedActionMeeting;
  TimelineEventCompletedRetroMeeting: TimelineEventCompletedRetroMeeting;
  TimelineEventConnection: TimelineEventConnection;
  TimelineEventEdge: TimelineEventEdge;
  TimelineEventJoinedParabol: TimelineEventJoinedParabol;
  TimelineEventPokerComplete: TimelineEventPokerComplete;
  TimelineEventTeamCreated: TimelineEventTeamCreated;
  URL: Scalars['URL'];
  UpdateWatchlistPayload: ResolversParentTypes['ErrorPayload'] | ResolversParentTypes['UpdateWatchlistSuccess'];
  UpdateWatchlistSuccess: UpdateWatchlistSuccess;
  UpdatesPhase: UpdatesPhase;
  UpdatesStage: UpdatesStage;
  User: User;
  UserFeatureFlags: UserFeatureFlags;
  UserTiersCount: UserTiersCount;
};

export type ActionMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ActionMeeting'] = ResolversParentTypes['ActionMeeting']> = {
  agendaItem?: Resolver<Maybe<ResolversTypes['AgendaItem']>, ParentType, ContextType, RequireFields<ActionMeetingAgendaItemArgs, 'agendaItemId'>>;
  agendaItemCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  agendaItems?: Resolver<Array<ResolversTypes['AgendaItem']>, ParentType, ContextType>;
  commentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  endedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  facilitator?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  facilitatorStageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  facilitatorUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingMembers?: Resolver<Array<ResolversTypes['ActionMeetingMember']>, ParentType, ContextType>;
  meetingNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  phases?: Resolver<Array<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  settings?: Resolver<ResolversTypes['ActionMeetingSettings'], ParentType, ContextType>;
  showConversionModal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  summarySentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerMeetingMember?: Resolver<Maybe<ResolversTypes['ActionMeetingMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ActionMeetingMemberResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ActionMeetingMember'] = ResolversParentTypes['ActionMeetingMember']> = {
  doneTasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCheckedIn?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ActionMeetingSettingsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ActionMeetingSettings'] = ResolversParentTypes['ActionMeetingSettings']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  phaseTypes?: Resolver<Array<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddNewFeaturePayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AddNewFeaturePayload'] = ResolversParentTypes['AddNewFeaturePayload']> = {
  newFeature?: Resolver<Maybe<ResolversTypes['NewFeatureBroadcast']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgendaItemResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AgendaItem'] = ResolversParentTypes['AgendaItem']> = {
  commentors?: Resolver<Maybe<Array<ResolversTypes['CommentorDetails']>>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meetingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  pinned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  pinnedParentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  teamMemberId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgendaItemsPhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AgendaItemsPhase'] = ResolversParentTypes['AgendaItemsPhase']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['AgendaItemsStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AgendaItemsStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AgendaItemsStage'] = ResolversParentTypes['AgendaItemsStage']> = {
  agendaItem?: Resolver<ResolversTypes['AgendaItem'], ParentType, ContextType>;
  agendaItemId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  discussion?: Resolver<ResolversTypes['Discussion'], ParentType, ContextType>;
  discussionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAsync?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isComplete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigableByFacilitator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  phaseType?: Resolver<Maybe<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  readyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduledEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedTimeLimit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeRemaining?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AtlassianIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AtlassianIntegration'] = ResolversParentTypes['AtlassianIntegration']> = {
  accessToken?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  accountId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  cloudIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  issues?: Resolver<ResolversTypes['JiraIssueConnection'], ParentType, ContextType, RequireFields<AtlassianIntegrationIssuesArgs, 'first' | 'isJQL'>>;
  jiraFields?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<AtlassianIntegrationJiraFieldsArgs, 'cloudId'>>;
  jiraSearchQueries?: Resolver<Array<ResolversTypes['JiraSearchQuery']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['JiraRemoteProject']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AtlassianTeamIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AtlassianTeamIntegration'] = ResolversParentTypes['AtlassianTeamIntegration']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  jiraDimensionFields?: Resolver<Array<ResolversTypes['JiraDimensionField']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthIdentityResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AuthIdentity'] = ResolversParentTypes['AuthIdentity']> = {
  __resolveType: TypeResolveFn<'AuthIdentityGoogle' | 'AuthIdentityLocal', ParentType, ContextType>;
  isEmailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AuthIdentityTypeEnum'], ParentType, ContextType>;
};

export type AuthIdentityGoogleResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AuthIdentityGoogle'] = ResolversParentTypes['AuthIdentityGoogle']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isEmailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AuthIdentityTypeEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthIdentityLocalResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['AuthIdentityLocal'] = ResolversParentTypes['AuthIdentityLocal']> = {
  isEmailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AuthIdentityTypeEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CheckInPhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['CheckInPhase'] = ResolversParentTypes['CheckInPhase']> = {
  checkInGreeting?: Resolver<ResolversTypes['MeetingGreeting'], ParentType, ContextType>;
  checkInQuestion?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['CheckInStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CheckInStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['CheckInStage'] = ResolversParentTypes['CheckInStage']> = {
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAsync?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isComplete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigableByFacilitator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingMember?: Resolver<ResolversTypes['MeetingMember'], ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  phaseType?: Resolver<Maybe<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  readyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduledEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedTimeLimit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  teamMemberId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeRemaining?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  discussionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isAnonymous?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  reactjis?: Resolver<Array<ResolversTypes['Reactji']>, ParentType, ContextType>;
  replies?: Resolver<Array<ResolversTypes['Threadable']>, ParentType, ContextType>;
  threadParentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  threadSortOrder?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentorDetailsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['CommentorDetails'] = ResolversParentTypes['CommentorDetails']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  preferredName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompanyResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Company'] = ResolversParentTypes['Company']> = {
  activeTeamCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  activeUserCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastMetAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  meetingCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  monthlyTeamStreakMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizations?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['TierEnum'], ParentType, ContextType>;
  userCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CouponResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Coupon'] = ResolversParentTypes['Coupon']> = {
  amountOff?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  percentOff?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreditCardResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['CreditCard'] = ResolversParentTypes['CreditCard']> = {
  brand?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiry?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  last4?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteUserPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['DeleteUserPayload'] = ResolversParentTypes['DeleteUserPayload']> = {
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DisconnectSocketPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['DisconnectSocketPayload'] = ResolversParentTypes['DisconnectSocketPayload']> = {
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscussPhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['DiscussPhase'] = ResolversParentTypes['DiscussPhase']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['RetroDiscussStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscussionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Discussion'] = ResolversParentTypes['Discussion']> = {
  commentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  commentors?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  discussionTopicId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  discussionTopicType?: Resolver<ResolversTypes['DiscussionTopicTypeEnum'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  thread?: Resolver<ResolversTypes['ThreadableConnection'], ParentType, ContextType, Partial<DiscussionThreadArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscussionThreadStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['DiscussionThreadStage'] = ResolversParentTypes['DiscussionThreadStage']> = {
  __resolveType: TypeResolveFn<'AgendaItemsStage' | 'EstimateStage' | 'RetroDiscussStage', ParentType, ContextType>;
  discussion?: Resolver<ResolversTypes['Discussion'], ParentType, ContextType>;
  discussionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type DomainCountPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['DomainCountPayload'] = ResolversParentTypes['DomainCountPayload']> = {
  domain?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DraftEnterpriseInvoicePayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['DraftEnterpriseInvoicePayload'] = ResolversParentTypes['DraftEnterpriseInvoicePayload']> = {
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface EmailScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Email'], any> {
  name: 'Email';
}

export type EnableSamlForDomainPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['EnableSAMLForDomainPayload'] = ResolversParentTypes['EnableSAMLForDomainPayload']> = {
  __resolveType: TypeResolveFn<'EnableSAMLForDomainSuccess' | 'ErrorPayload', ParentType, ContextType>;
};

export type EnableSamlForDomainSuccessResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['EnableSAMLForDomainSuccess'] = ResolversParentTypes['EnableSAMLForDomainSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ErrorPayload'] = ResolversParentTypes['ErrorPayload']> = {
  error?: Resolver<ResolversTypes['StandardMutationError'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimatePhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['EstimatePhase'] = ResolversParentTypes['EstimatePhase']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['EstimateStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimateStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['EstimateStage'] = ResolversParentTypes['EstimateStage']> = {
  creatorUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  dimensionRef?: Resolver<ResolversTypes['TemplateDimensionRef'], ParentType, ContextType>;
  dimensionRefIdx?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  discussion?: Resolver<ResolversTypes['Discussion'], ParentType, ContextType>;
  discussionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  finalScore?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hoveringUserIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  hoveringUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAsync?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isComplete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigableByFacilitator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isVoting?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  phaseType?: Resolver<Maybe<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  readyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduledEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  scores?: Resolver<Array<ResolversTypes['EstimateUserScore']>, ParentType, ContextType>;
  serviceField?: Resolver<ResolversTypes['ServiceField'], ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedTimeLimit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  taskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeRemaining?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimateUserScoreResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['EstimateUserScore'] = ResolversParentTypes['EstimateUserScore']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FlagConversionModalPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['FlagConversionModalPayload'] = ResolversParentTypes['FlagConversionModalPayload']> = {
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  org?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FlagOverLimitPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['FlagOverLimitPayload'] = ResolversParentTypes['FlagOverLimitPayload']> = {
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  users?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericMeetingPhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['GenericMeetingPhase'] = ResolversParentTypes['GenericMeetingPhase']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['GenericMeetingStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericMeetingStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['GenericMeetingStage'] = ResolversParentTypes['GenericMeetingStage']> = {
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAsync?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isComplete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigableByFacilitator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  phaseType?: Resolver<Maybe<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  readyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduledEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedTimeLimit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeRemaining?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GitHubIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['GitHubIntegration'] = ResolversParentTypes['GitHubIntegration']> = {
  accessToken?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  githubSearchQueries?: Resolver<Array<ResolversTypes['GitHubSearchQuery']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  login?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GitHubSearchQueryResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['GitHubSearchQuery'] = ResolversParentTypes['GitHubSearchQuery']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUsedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  queryString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GitLabIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['GitLabIntegration'] = ResolversParentTypes['GitLabIntegration']> = {
  auth?: Resolver<Maybe<ResolversTypes['TeamMemberIntegrationAuthOAuth2']>, ParentType, ContextType>;
  cloudProvider?: Resolver<Maybe<ResolversTypes['IntegrationProviderOAuth2']>, ParentType, ContextType>;
  sharedProviders?: Resolver<Array<ResolversTypes['IntegrationProviderOAuth2']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleAnalyzedEntityResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['GoogleAnalyzedEntity'] = ResolversParentTypes['GoogleAnalyzedEntity']> = {
  lemma?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  salience?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationProviderResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['IntegrationProvider'] = ResolversParentTypes['IntegrationProvider']> = {
  __resolveType: TypeResolveFn<'IntegrationProviderOAuth1' | 'IntegrationProviderOAuth2' | 'IntegrationProviderWebhook', ParentType, ContextType>;
  authStrategy?: Resolver<ResolversTypes['IntegrationProviderAuthStrategyEnum'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['IntegrationProviderScopeEnum'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type IntegrationProviderOAuth1Resolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['IntegrationProviderOAuth1'] = ResolversParentTypes['IntegrationProviderOAuth1']> = {
  authStrategy?: Resolver<ResolversTypes['IntegrationProviderAuthStrategyEnum'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['IntegrationProviderScopeEnum'], ParentType, ContextType>;
  serverBaseUrl?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationProviderOAuth2Resolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['IntegrationProviderOAuth2'] = ResolversParentTypes['IntegrationProviderOAuth2']> = {
  authStrategy?: Resolver<ResolversTypes['IntegrationProviderAuthStrategyEnum'], ParentType, ContextType>;
  clientId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['IntegrationProviderScopeEnum'], ParentType, ContextType>;
  serverBaseUrl?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationProviderWebhookResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['IntegrationProviderWebhook'] = ResolversParentTypes['IntegrationProviderWebhook']> = {
  authStrategy?: Resolver<ResolversTypes['IntegrationProviderAuthStrategyEnum'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['IntegrationProviderScopeEnum'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  webhookUrl?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = {
  amountDue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  billingLeaderEmails?: Resolver<Array<ResolversTypes['Email']>, ParentType, ContextType>;
  coupon?: Resolver<Maybe<ResolversTypes['Coupon']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  creditCard?: Resolver<Maybe<ResolversTypes['CreditCard']>, ParentType, ContextType>;
  endAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invoiceDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  lines?: Resolver<Array<ResolversTypes['InvoiceLineItem']>, ParentType, ContextType>;
  nextPeriodCharges?: Resolver<ResolversTypes['NextPeriodCharges'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orgName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  paidAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  payUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  picture?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  startAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  startingBalance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InvoiceStatusEnum'], ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['TierEnum'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['InvoiceConnection'] = ResolversParentTypes['InvoiceConnection']> = {
  edges?: Resolver<Array<ResolversTypes['InvoiceEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfoDateCursor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['InvoiceEdge'] = ResolversParentTypes['InvoiceEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Invoice'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceLineItemResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['InvoiceLineItem'] = ResolversParentTypes['InvoiceLineItem']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  details?: Resolver<Array<ResolversTypes['InvoiceLineItemDetails']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['InvoiceLineItemEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InvoiceLineItemDetailsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['InvoiceLineItemDetails'] = ResolversParentTypes['InvoiceLineItemDetails']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  parentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraDimensionFieldResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraDimensionField'] = ResolversParentTypes['JiraDimensionField']> = {
  cloudId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  dimensionName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fieldId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  fieldName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fieldType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  projectKey?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraIssueResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraIssue'] = ResolversParentTypes['JiraIssue']> = {
  cloudId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  cloudName?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  descriptionHTML?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  issueKey?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  possibleEstimationFieldNames?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['JiraRemoteProject']>, ParentType, ContextType>;
  projectKey?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  summary?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraIssueConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraIssueConnection'] = ResolversParentTypes['JiraIssueConnection']> = {
  edges?: Resolver<Array<ResolversTypes['JiraIssueEdge']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfoDateCursor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraIssueEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraIssueEdge'] = ResolversParentTypes['JiraIssueEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['JiraIssue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraRemoteAvatarUrlsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraRemoteAvatarUrls'] = ResolversParentTypes['JiraRemoteAvatarUrls']> = {
  x16?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  x24?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  x32?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  x48?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraRemoteProjectResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraRemoteProject'] = ResolversParentTypes['JiraRemoteProject']> = {
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  avatarUrls?: Resolver<ResolversTypes['JiraRemoteAvatarUrls'], ParentType, ContextType>;
  cloudId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projectCategory?: Resolver<ResolversTypes['JiraRemoteProjectCategory'], ParentType, ContextType>;
  self?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  simplified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  style?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraRemoteProjectCategoryResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraRemoteProjectCategory'] = ResolversParentTypes['JiraRemoteProjectCategory']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  self?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraSearchQueryResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraSearchQuery'] = ResolversParentTypes['JiraSearchQuery']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isJQL?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUsedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  projectKeyFilters?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  queryString?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraServerIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraServerIntegration'] = ResolversParentTypes['JiraServerIntegration']> = {
  auth?: Resolver<Maybe<ResolversTypes['TeamMemberIntegrationAuthOAuth1']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['JiraServerRemoteProject']>, ParentType, ContextType>;
  sharedProviders?: Resolver<Array<ResolversTypes['IntegrationProviderOAuth1']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JiraServerRemoteProjectResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['JiraServerRemoteProject'] = ResolversParentTypes['JiraServerRemoteProject']> = {
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  avatarUrls?: Resolver<ResolversTypes['JiraRemoteAvatarUrls'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projectCategory?: Resolver<ResolversTypes['JiraRemoteProjectCategory'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginSamlPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['LoginSAMLPayload'] = ResolversParentTypes['LoginSAMLPayload']> = {
  authToken?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginsPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['LoginsPayload'] = ResolversParentTypes['LoginsPayload']> = {
  byDomain?: Resolver<Array<ResolversTypes['DomainCountPayload']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MassInvitationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MassInvitation'] = ResolversParentTypes['MassInvitation']> = {
  expiration?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MattermostIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MattermostIntegration'] = ResolversParentTypes['MattermostIntegration']> = {
  auth?: Resolver<Maybe<ResolversTypes['TeamMemberIntegrationAuthWebhook']>, ParentType, ContextType>;
  sharedProviders?: Resolver<Array<ResolversTypes['IntegrationProviderWebhook']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeetingGreetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MeetingGreeting'] = ResolversParentTypes['MeetingGreeting']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  language?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeetingMemberResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MeetingMember'] = ResolversParentTypes['MeetingMember']> = {
  __resolveType: TypeResolveFn<'ActionMeetingMember' | 'PokerMeetingMember' | 'RetrospectiveMeetingMember' | 'TeamPromptMeetingMember', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCheckedIn?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type MeetingTemplateResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MeetingTemplate'] = ResolversParentTypes['MeetingTemplate']> = {
  __resolveType: TypeResolveFn<'PokerTemplate' | 'ReflectTemplate', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUsedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['SharingScopeEnum'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type MessageAllSlackUsersPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MessageAllSlackUsersPayload'] = ResolversParentTypes['MessageAllSlackUsersPayload']> = {
  __resolveType: TypeResolveFn<'ErrorPayload' | 'MessageAllSlackUsersSuccess', ParentType, ContextType>;
};

export type MessageAllSlackUsersSuccessResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MessageAllSlackUsersSuccess'] = ResolversParentTypes['MessageAllSlackUsersSuccess']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['MessageSlackUserError']>>, ParentType, ContextType>;
  messagedUserIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageSlackUserErrorResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['MessageSlackUserError'] = ResolversParentTypes['MessageSlackUserError']> = {
  error?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addNewFeature?: Resolver<Maybe<ResolversTypes['AddNewFeaturePayload']>, ParentType, ContextType, RequireFields<MutationAddNewFeatureArgs, 'actionButtonCopy' | 'snackbarMessage' | 'url'>>;
  autopauseUsers?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  backupOrganization?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationBackupOrganizationArgs, 'orgIds'>>;
  checkRethinkPgEquality?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationCheckRethinkPgEqualityArgs, 'tableName'>>;
  connectSocket?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  disconnectSocket?: Resolver<Maybe<ResolversTypes['DisconnectSocketPayload']>, ParentType, ContextType>;
  draftEnterpriseInvoice?: Resolver<Maybe<ResolversTypes['DraftEnterpriseInvoicePayload']>, ParentType, ContextType, RequireFields<MutationDraftEnterpriseInvoiceArgs, 'orgId' | 'quantity'>>;
  dumpHeap?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDumpHeapArgs, 'isDangerous'>>;
  enableSAMLForDomain?: Resolver<ResolversTypes['EnableSAMLForDomainPayload'], ParentType, ContextType, RequireFields<MutationEnableSamlForDomainArgs, 'domains' | 'metadata' | 'name'>>;
  endOldMeetings?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  flagConversionModal?: Resolver<Maybe<ResolversTypes['FlagConversionModalPayload']>, ParentType, ContextType, RequireFields<MutationFlagConversionModalArgs, 'active' | 'orgId'>>;
  flagOverLimit?: Resolver<Maybe<ResolversTypes['FlagOverLimitPayload']>, ParentType, ContextType, RequireFields<MutationFlagOverLimitArgs, 'copy' | 'orgId'>>;
  hardDeleteUser?: Resolver<ResolversTypes['DeleteUserPayload'], ParentType, ContextType, Partial<MutationHardDeleteUserArgs>>;
  lockTeams?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationLockTeamsArgs, 'isPaid' | 'teamIds'>>;
  loginSAML?: Resolver<ResolversTypes['LoginSAMLPayload'], ParentType, ContextType, RequireFields<MutationLoginSamlArgs, 'queryString' | 'samlName'>>;
  messageAllSlackUsers?: Resolver<ResolversTypes['MessageAllSlackUsersPayload'], ParentType, ContextType, RequireFields<MutationMessageAllSlackUsersArgs, 'message'>>;
  profileCPU?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  removeAllSlackAuths?: Resolver<ResolversTypes['RemoveAllSlackAuthsPayload'], ParentType, ContextType>;
  runScheduledJobs?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRunScheduledJobsArgs, 'seconds'>>;
  sendBatchNotificationEmails?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  sendUpcomingInvoiceEmails?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  setOrganizationDomain?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSetOrganizationDomainArgs, 'domain' | 'orgId'>>;
  stripeCreateInvoice?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationStripeCreateInvoiceArgs, 'invoiceId'>>;
  stripeFailPayment?: Resolver<Maybe<ResolversTypes['StripeFailPaymentPayload']>, ParentType, ContextType, RequireFields<MutationStripeFailPaymentArgs, 'invoiceId'>>;
  stripeInvoiceFinalized?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationStripeInvoiceFinalizedArgs, 'invoiceId'>>;
  stripeSucceedPayment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationStripeSucceedPaymentArgs, 'invoiceId'>>;
  stripeUpdateCreditCard?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationStripeUpdateCreditCardArgs, 'customerId'>>;
  stripeUpdateInvoiceItem?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationStripeUpdateInvoiceItemArgs, 'invoiceItemId'>>;
  updateEmail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUpdateEmailArgs, 'newEmail' | 'oldEmail'>>;
  updateOAuthRefreshTokens?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationUpdateOAuthRefreshTokensArgs, 'updatedBefore'>>;
  updateWatchlist?: Resolver<ResolversTypes['UpdateWatchlistPayload'], ParentType, ContextType, RequireFields<MutationUpdateWatchlistArgs, 'includeInWatchlist'>>;
};

export type NewFeatureBroadcastResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NewFeatureBroadcast'] = ResolversParentTypes['NewFeatureBroadcast']> = {
  actionButtonCopy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  snackbarMessage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NewMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NewMeeting'] = ResolversParentTypes['NewMeeting']> = {
  __resolveType: TypeResolveFn<'ActionMeeting' | 'PokerMeeting' | 'RetrospectiveMeeting' | 'TeamPromptMeeting', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  endedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  facilitator?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  facilitatorStageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  facilitatorUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingMembers?: Resolver<Array<ResolversTypes['MeetingMember']>, ParentType, ContextType>;
  meetingNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  phases?: Resolver<Array<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  showConversionModal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  summarySentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerMeetingMember?: Resolver<Maybe<ResolversTypes['MeetingMember']>, ParentType, ContextType>;
};

export type NewMeetingPhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NewMeetingPhase'] = ResolversParentTypes['NewMeetingPhase']> = {
  __resolveType: TypeResolveFn<'AgendaItemsPhase' | 'CheckInPhase' | 'DiscussPhase' | 'EstimatePhase' | 'GenericMeetingPhase' | 'ReflectPhase' | 'UpdatesPhase', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['NewMeetingStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type NewMeetingStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NewMeetingStage'] = ResolversParentTypes['NewMeetingStage']> = {
  __resolveType: TypeResolveFn<'AgendaItemsStage' | 'CheckInStage' | 'EstimateStage' | 'GenericMeetingStage' | 'RetroDiscussStage' | 'UpdatesStage', ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAsync?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isComplete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigableByFacilitator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  phaseType?: Resolver<Maybe<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  readyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduledEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedTimeLimit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeRemaining?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type NewMeetingTeamMemberStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NewMeetingTeamMemberStage'] = ResolversParentTypes['NewMeetingTeamMemberStage']> = {
  __resolveType: TypeResolveFn<'CheckInStage' | 'UpdatesStage', ParentType, ContextType>;
  meetingMember?: Resolver<ResolversTypes['MeetingMember'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  teamMemberId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type NextPeriodChargesResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NextPeriodCharges'] = ResolversParentTypes['NextPeriodCharges']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  interval?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nextPeriodEnd?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unitPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotificationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  __resolveType: TypeResolveFn<'NotificationTeamInvitation' | 'NotifyPaymentRejected' | 'NotifyPromoteToOrgLeader', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['NotificationStatusEnum'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NotificationEnum'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type NotificationConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NotificationConnection'] = ResolversParentTypes['NotificationConnection']> = {
  edges?: Resolver<Array<ResolversTypes['NotificationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfoDateCursor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotificationEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NotificationEdge'] = ResolversParentTypes['NotificationEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Notification'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotificationTeamInvitationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NotificationTeamInvitation'] = ResolversParentTypes['NotificationTeamInvitation']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invitation?: Resolver<ResolversTypes['TeamInvitation'], ParentType, ContextType>;
  invitationId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['NotificationStatusEnum'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NotificationEnum'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotifyPaymentRejectedResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NotifyPaymentRejected'] = ResolversParentTypes['NotifyPaymentRejected']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['NotificationStatusEnum'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NotificationEnum'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotifyPromoteToOrgLeaderResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['NotifyPromoteToOrgLeader'] = ResolversParentTypes['NotifyPromoteToOrgLeader']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['NotificationStatusEnum'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NotificationEnum'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrgUserCountResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['OrgUserCount'] = ResolversParentTypes['OrgUserCount']> = {
  activeUserCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  inactiveUserCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = {
  activeDomain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  billingLeaders?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  creditCard?: Resolver<Maybe<ResolversTypes['CreditCard']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActiveDomainTouched?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isBillingLeader?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orgUserCount?: Resolver<ResolversTypes['OrgUserCount'], ParentType, ContextType>;
  organizationUsers?: Resolver<ResolversTypes['OrganizationUserConnection'], ParentType, ContextType, Partial<OrganizationOrganizationUsersArgs>>;
  periodEnd?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  periodStart?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  picture?: Resolver<Maybe<ResolversTypes['URL']>, ParentType, ContextType>;
  retroMeetingsOffered?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  retroMeetingsRemaining?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  showConversionModal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  stripeId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  stripeSubscriptionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['TierEnum'], ParentType, ContextType>;
  upcomingInvoiceEmailSentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationUserResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['OrganizationUser'] = ResolversParentTypes['OrganizationUser']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inactive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  joinedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  newUserUntil?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  removedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['OrgUserRole']>, ParentType, ContextType>;
  tier?: Resolver<Maybe<ResolversTypes['TierEnum']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationUserConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['OrganizationUserConnection'] = ResolversParentTypes['OrganizationUserConnection']> = {
  edges?: Resolver<Array<ResolversTypes['OrganizationUserEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationUserEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['OrganizationUserEdge'] = ResolversParentTypes['OrganizationUserEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['OrganizationUser'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoDateCursorResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PageInfoDateCursor'] = ResolversParentTypes['PageInfoDateCursor']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PingableServicesResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PingableServices'] = ResolversParentTypes['PingableServices']> = {
  postgres?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  redis?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rethinkdb?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PokerMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PokerMeeting'] = ResolversParentTypes['PokerMeeting']> = {
  commentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  endedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  facilitator?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  facilitatorStageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  facilitatorUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingMembers?: Resolver<Array<ResolversTypes['PokerMeetingMember']>, ParentType, ContextType>;
  meetingNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  phases?: Resolver<Array<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  settings?: Resolver<ResolversTypes['PokerMeetingSettings'], ParentType, ContextType>;
  showConversionModal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  story?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<PokerMeetingStoryArgs, 'storyId'>>;
  storyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  summarySentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  templateId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  templateRefId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerMeetingMember?: Resolver<Maybe<ResolversTypes['PokerMeetingMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PokerMeetingMemberResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PokerMeetingMember'] = ResolversParentTypes['PokerMeetingMember']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCheckedIn?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isSpectating?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PokerMeetingSettingsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PokerMeetingSettings'] = ResolversParentTypes['PokerMeetingSettings']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  organizationTemplates?: Resolver<ResolversTypes['PokerTemplateConnection'], ParentType, ContextType, RequireFields<PokerMeetingSettingsOrganizationTemplatesArgs, 'first'>>;
  phaseTypes?: Resolver<Array<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  publicTemplates?: Resolver<ResolversTypes['PokerTemplateConnection'], ParentType, ContextType, RequireFields<PokerMeetingSettingsPublicTemplatesArgs, 'first'>>;
  selectedTemplate?: Resolver<ResolversTypes['PokerTemplate'], ParentType, ContextType>;
  selectedTemplateId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamTemplates?: Resolver<Array<ResolversTypes['PokerTemplate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PokerTemplateResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PokerTemplate'] = ResolversParentTypes['PokerTemplate']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dimension?: Resolver<ResolversTypes['TemplateDimension'], ParentType, ContextType, RequireFields<PokerTemplateDimensionArgs, 'dimensionId'>>;
  dimensions?: Resolver<Array<ResolversTypes['TemplateDimension']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUsedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['SharingScopeEnum'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PokerTemplateConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PokerTemplateConnection'] = ResolversParentTypes['PokerTemplateConnection']> = {
  edges?: Resolver<Array<ResolversTypes['PokerTemplateEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PokerTemplateEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['PokerTemplateEdge'] = ResolversParentTypes['PokerTemplateEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['PokerTemplate'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType, Partial<QueryCompanyArgs>>;
  dailyPulse?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<QueryDailyPulseArgs, 'after' | 'channelId' | 'email'>>;
  logins?: Resolver<ResolversTypes['LoginsPayload'], ParentType, ContextType, RequireFields<QueryLoginsArgs, 'isActive'>>;
  ping?: Resolver<ResolversTypes['PingableServices'], ParentType, ContextType>;
  pingActionTick?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  signups?: Resolver<ResolversTypes['SignupsPayload'], ParentType, ContextType, RequireFields<QuerySignupsArgs, 'isActive'>>;
  suCountTiersForUser?: Resolver<Maybe<ResolversTypes['UserTiersCount']>, ParentType, ContextType, RequireFields<QuerySuCountTiersForUserArgs, 'userId'>>;
  suOrgCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<QuerySuOrgCountArgs, 'minOrgSize' | 'tier'>>;
  suProOrgInfo?: Resolver<Maybe<Array<ResolversTypes['Organization']>>, ParentType, ContextType, RequireFields<QuerySuProOrgInfoArgs, 'includeInactive'>>;
  suUserCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<QuerySuUserCountArgs, 'tier'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, Partial<QueryUserArgs>>;
  users?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'userIds'>>;
};

export type ReactableResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Reactable'] = ResolversParentTypes['Reactable']> = {
  __resolveType: TypeResolveFn<'Comment' | 'RetroReflection', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reactjis?: Resolver<Array<ResolversTypes['Reactji']>, ParentType, ContextType>;
};

export type ReactjiResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Reactji'] = ResolversParentTypes['Reactji']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isViewerReactji?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReflectPhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ReflectPhase'] = ResolversParentTypes['ReflectPhase']> = {
  focusedPrompt?: Resolver<Maybe<ResolversTypes['ReflectPrompt']>, ParentType, ContextType>;
  focusedPromptId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  reflectPrompts?: Resolver<Array<ResolversTypes['ReflectPrompt']>, ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['GenericMeetingStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReflectPromptResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ReflectPrompt'] = ResolversParentTypes['ReflectPrompt']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  question?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  removedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  template?: Resolver<ResolversTypes['ReflectTemplate'], ParentType, ContextType>;
  templateId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReflectTemplateResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ReflectTemplate'] = ResolversParentTypes['ReflectTemplate']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUsedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  prompts?: Resolver<Array<ResolversTypes['ReflectPrompt']>, ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['SharingScopeEnum'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReflectTemplateConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ReflectTemplateConnection'] = ResolversParentTypes['ReflectTemplateConnection']> = {
  edges?: Resolver<Array<ResolversTypes['ReflectTemplateEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReflectTemplateEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ReflectTemplateEdge'] = ResolversParentTypes['ReflectTemplateEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['ReflectTemplate'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RemoveAllSlackAuthsPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RemoveAllSlackAuthsPayload'] = ResolversParentTypes['RemoveAllSlackAuthsPayload']> = {
  __resolveType: TypeResolveFn<'ErrorPayload' | 'RemoveAllSlackAuthsSuccess', ParentType, ContextType>;
};

export type RemoveAllSlackAuthsSuccessResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RemoveAllSlackAuthsSuccess'] = ResolversParentTypes['RemoveAllSlackAuthsSuccess']> = {
  slackAuthRes?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slackNotificationRes?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RepoIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RepoIntegration'] = ResolversParentTypes['RepoIntegration']> = {
  __resolveType: TypeResolveFn<'JiraRemoteProject' | 'JiraServerRemoteProject', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
};

export type RepoIntegrationQueryPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RepoIntegrationQueryPayload'] = ResolversParentTypes['RepoIntegrationQueryPayload']> = {
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['RepoIntegration']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RetroDiscussStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RetroDiscussStage'] = ResolversParentTypes['RetroDiscussStage']> = {
  discussion?: Resolver<ResolversTypes['Discussion'], ParentType, ContextType>;
  discussionId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAsync?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isComplete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigableByFacilitator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  phaseType?: Resolver<Maybe<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  readyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reflectionGroup?: Resolver<ResolversTypes['RetroReflectionGroup'], ParentType, ContextType>;
  reflectionGroupId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  scheduledEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedTimeLimit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeRemaining?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RetroReflectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RetroReflection'] = ResolversParentTypes['RetroReflection']> = {
  autoReflectionGroupId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  creatorId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  editorIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  entities?: Resolver<Array<ResolversTypes['GoogleAnalyzedEntity']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerCreator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<ResolversTypes['RetrospectiveMeeting'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  plaintextContent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prompt?: Resolver<ResolversTypes['ReflectPrompt'], ParentType, ContextType>;
  promptId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reactjis?: Resolver<Array<ResolversTypes['Reactji']>, ParentType, ContextType>;
  reflectionGroupId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  retroReflectionGroup?: Resolver<Maybe<ResolversTypes['RetroReflectionGroup']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RetroReflectionGroupResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RetroReflectionGroup'] = ResolversParentTypes['RetroReflectionGroup']> = {
  commentors?: Resolver<Maybe<Array<ResolversTypes['CommentorDetails']>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<ResolversTypes['RetrospectiveMeeting'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  prompt?: Resolver<ResolversTypes['ReflectPrompt'], ParentType, ContextType>;
  promptId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reflections?: Resolver<Array<ResolversTypes['RetroReflection']>, ParentType, ContextType>;
  smartTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  titleIsUserDefined?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerVoteCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  voteCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  voterIds?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RetrospectiveMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RetrospectiveMeeting'] = ResolversParentTypes['RetrospectiveMeeting']> = {
  autoGroupThreshold?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  commentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  endedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  facilitator?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  facilitatorStageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  facilitatorUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxVotesPerGroup?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingMembers?: Resolver<Array<ResolversTypes['RetrospectiveMeetingMember']>, ParentType, ContextType>;
  meetingNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  nextAutoGroupThreshold?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  phases?: Resolver<Array<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  reflectionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reflectionGroup?: Resolver<Maybe<ResolversTypes['RetroReflectionGroup']>, ParentType, ContextType, RequireFields<RetrospectiveMeetingReflectionGroupArgs, 'reflectionGroupId'>>;
  reflectionGroups?: Resolver<Array<ResolversTypes['RetroReflectionGroup']>, ParentType, ContextType, Partial<RetrospectiveMeetingReflectionGroupsArgs>>;
  settings?: Resolver<ResolversTypes['RetrospectiveMeetingSettings'], ParentType, ContextType>;
  showConversionModal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  summarySentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  templateId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  topicCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalVotes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerMeetingMember?: Resolver<Maybe<ResolversTypes['RetrospectiveMeetingMember']>, ParentType, ContextType>;
  votesRemaining?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RetrospectiveMeetingMemberResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RetrospectiveMeetingMember'] = ResolversParentTypes['RetrospectiveMeetingMember']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCheckedIn?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  votesRemaining?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RetrospectiveMeetingSettingsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['RetrospectiveMeetingSettings'] = ResolversParentTypes['RetrospectiveMeetingSettings']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxVotesPerGroup?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  organizationTemplates?: Resolver<ResolversTypes['ReflectTemplateConnection'], ParentType, ContextType, RequireFields<RetrospectiveMeetingSettingsOrganizationTemplatesArgs, 'first'>>;
  phaseTypes?: Resolver<Array<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  publicTemplates?: Resolver<ResolversTypes['ReflectTemplateConnection'], ParentType, ContextType, RequireFields<RetrospectiveMeetingSettingsPublicTemplatesArgs, 'first'>>;
  reflectTemplates?: Resolver<Array<ResolversTypes['ReflectTemplate']>, ParentType, ContextType>;
  selectedTemplate?: Resolver<ResolversTypes['ReflectTemplate'], ParentType, ContextType>;
  selectedTemplateId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamTemplates?: Resolver<Array<ResolversTypes['ReflectTemplate']>, ParentType, ContextType>;
  totalVotes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ServiceFieldResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ServiceField'] = ResolversParentTypes['ServiceField']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignupsPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SignupsPayload'] = ResolversParentTypes['SignupsPayload']> = {
  byDomain?: Resolver<Array<ResolversTypes['DomainCountPayload']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SlackIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SlackIntegration'] = ResolversParentTypes['SlackIntegration']> = {
  botAccessToken?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  botUserId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  defaultTeamChannelId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  notifications?: Resolver<Array<ResolversTypes['SlackNotification']>, ParentType, ContextType>;
  slackTeamId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  slackTeamName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slackUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  slackUserName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SlackNotificationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SlackNotification'] = ResolversParentTypes['SlackNotification']> = {
  channelId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  event?: Resolver<ResolversTypes['SlackNotificationEventEnum'], ParentType, ContextType>;
  eventType?: Resolver<ResolversTypes['SlackNotificationEventTypeEnum'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StandardMutationErrorResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['StandardMutationError'] = ResolversParentTypes['StandardMutationError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StripeFailPaymentPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['StripeFailPaymentPayload'] = ResolversParentTypes['StripeFailPaymentPayload']> = {
  error?: Resolver<Maybe<ResolversTypes['StandardMutationError']>, ParentType, ContextType>;
  notification?: Resolver<ResolversTypes['NotifyPaymentRejected'], ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SuggestedActionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SuggestedAction'] = ResolversParentTypes['SuggestedAction']> = {
  __resolveType: TypeResolveFn<'SuggestedActionCreateNewTeam' | 'SuggestedActionInviteYourTeam' | 'SuggestedActionTryActionMeeting' | 'SuggestedActionTryRetroMeeting' | 'SuggestedActionTryTheDemo', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  removedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SuggestedActionTypeEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type SuggestedActionCreateNewTeamResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SuggestedActionCreateNewTeam'] = ResolversParentTypes['SuggestedActionCreateNewTeam']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  removedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SuggestedActionTypeEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SuggestedActionInviteYourTeamResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SuggestedActionInviteYourTeam'] = ResolversParentTypes['SuggestedActionInviteYourTeam']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  removedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SuggestedActionTypeEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SuggestedActionTryActionMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SuggestedActionTryActionMeeting'] = ResolversParentTypes['SuggestedActionTryActionMeeting']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  removedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SuggestedActionTypeEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SuggestedActionTryRetroMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SuggestedActionTryRetroMeeting'] = ResolversParentTypes['SuggestedActionTryRetroMeeting']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  removedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SuggestedActionTypeEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SuggestedActionTryTheDemoResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['SuggestedActionTryTheDemo'] = ResolversParentTypes['SuggestedActionTryTheDemo']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  priority?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  removedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SuggestedActionTypeEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = {
  agendaItem?: Resolver<Maybe<ResolversTypes['AgendaItem']>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  discussionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  doneMeetingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  editors?: Resolver<Array<ResolversTypes['TaskEditorDetails']>, ParentType, ContextType>;
  estimates?: Resolver<Array<ResolversTypes['TaskEstimate']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integration?: Resolver<Maybe<ResolversTypes['TaskIntegration']>, ParentType, ContextType>;
  integrationHash?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  isHighlighted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, Partial<TaskIsHighlightedArgs>>;
  meetingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  plaintextContent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  replies?: Resolver<Array<ResolversTypes['Threadable']>, ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TaskStatusEnum'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  threadParentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  threadSortOrder?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TaskConnection'] = ResolversParentTypes['TaskConnection']> = {
  edges?: Resolver<Array<ResolversTypes['TaskEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfoDateCursor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TaskEdge'] = ResolversParentTypes['TaskEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Task'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskEditorDetailsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TaskEditorDetails'] = ResolversParentTypes['TaskEditorDetails']> = {
  preferredName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskEstimateResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TaskEstimate'] = ResolversParentTypes['TaskEstimate']> = {
  changeSource?: Resolver<ResolversTypes['ChangeSourceEnum'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  discussionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  jiraFieldId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  meetingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stageId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  taskId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskIntegrationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TaskIntegration'] = ResolversParentTypes['TaskIntegration']> = {
  __resolveType: TypeResolveFn<'JiraIssue', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type TeamResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  activeMeetings?: Resolver<Array<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  agendaItems?: Resolver<Array<ResolversTypes['AgendaItem']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  customPhaseItems?: Resolver<Maybe<Array<Maybe<ResolversTypes['ReflectPrompt']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integrations?: Resolver<ResolversTypes['TeamIntegrations'], ParentType, ContextType>;
  isArchived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isLead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isOnboardTeam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPaid?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastMeetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  lockMessageHTML?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  massInvitation?: Resolver<ResolversTypes['MassInvitation'], ParentType, ContextType, Partial<TeamMassInvitationArgs>>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType, RequireFields<TeamMeetingArgs, 'meetingId'>>;
  meetingSettings?: Resolver<ResolversTypes['TeamMeetingSettings'], ParentType, ContextType, RequireFields<TeamMeetingSettingsArgs, 'meetingType'>>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  scale?: Resolver<Maybe<ResolversTypes['TemplateScale']>, ParentType, ContextType, RequireFields<TeamScaleArgs, 'scaleId'>>;
  scales?: Resolver<Array<ResolversTypes['TemplateScale']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  tasks?: Resolver<ResolversTypes['TaskConnection'], ParentType, ContextType, Partial<TeamTasksArgs>>;
  teamInvitations?: Resolver<Array<ResolversTypes['TeamInvitation']>, ParentType, ContextType>;
  teamMembers?: Resolver<Array<ResolversTypes['TeamMember']>, ParentType, ContextType, Partial<TeamTeamMembersArgs>>;
  tier?: Resolver<ResolversTypes['TierEnum'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamIntegrationsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamIntegrations'] = ResolversParentTypes['TeamIntegrations']> = {
  atlassian?: Resolver<ResolversTypes['AtlassianTeamIntegration'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamInvitationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamInvitation'] = ResolversParentTypes['TeamInvitation']> = {
  acceptedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  acceptedBy?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  invitedBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inviter?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  meetingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamInvitationPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamInvitationPayload'] = ResolversParentTypes['TeamInvitationPayload']> = {
  meetingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  teamId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  teamInvitation?: Resolver<Maybe<ResolversTypes['TeamInvitation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMeetingSettingsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamMeetingSettings'] = ResolversParentTypes['TeamMeetingSettings']> = {
  __resolveType: TypeResolveFn<'ActionMeetingSettings' | 'PokerMeetingSettings' | 'RetrospectiveMeetingSettings' | 'TeamPromptMeetingSettings', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  phaseTypes?: Resolver<Array<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type TeamMemberResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamMember'] = ResolversParentTypes['TeamMember']> = {
  allAvailableRepoIntegrations?: Resolver<Array<ResolversTypes['RepoIntegration']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  integrations?: Resolver<ResolversTypes['TeamMemberIntegrations'], ParentType, ContextType>;
  isLead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNotRemoved?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isSelf?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isSpectatingPoker?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meetingMember?: Resolver<Maybe<ResolversTypes['MeetingMember']>, ParentType, ContextType, RequireFields<TeamMemberMeetingMemberArgs, 'meetingId'>>;
  openDrawer?: Resolver<Maybe<ResolversTypes['TeamDrawer']>, ParentType, ContextType>;
  picture?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  preferredName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  repoIntegrations?: Resolver<ResolversTypes['RepoIntegrationQueryPayload'], ParentType, ContextType>;
  tasks?: Resolver<Maybe<ResolversTypes['TaskConnection']>, ParentType, ContextType, Partial<TeamMemberTasksArgs>>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMemberIntegrationAuthResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamMemberIntegrationAuth'] = ResolversParentTypes['TeamMemberIntegrationAuth']> = {
  __resolveType: TypeResolveFn<'TeamMemberIntegrationAuthOAuth1' | 'TeamMemberIntegrationAuthOAuth2' | 'TeamMemberIntegrationAuthWebhook', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['IntegrationProvider'], ParentType, ContextType>;
  providerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type TeamMemberIntegrationAuthOAuth1Resolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamMemberIntegrationAuthOAuth1'] = ResolversParentTypes['TeamMemberIntegrationAuthOAuth1']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['IntegrationProviderOAuth1'], ParentType, ContextType>;
  providerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMemberIntegrationAuthOAuth2Resolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamMemberIntegrationAuthOAuth2'] = ResolversParentTypes['TeamMemberIntegrationAuthOAuth2']> = {
  accessToken?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['IntegrationProviderOAuth2'], ParentType, ContextType>;
  providerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  scopes?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMemberIntegrationAuthWebhookResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamMemberIntegrationAuthWebhook'] = ResolversParentTypes['TeamMemberIntegrationAuthWebhook']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  provider?: Resolver<ResolversTypes['IntegrationProviderWebhook'], ParentType, ContextType>;
  providerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  service?: Resolver<ResolversTypes['IntegrationProviderServiceEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMemberIntegrationsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamMemberIntegrations'] = ResolversParentTypes['TeamMemberIntegrations']> = {
  atlassian?: Resolver<Maybe<ResolversTypes['AtlassianIntegration']>, ParentType, ContextType>;
  github?: Resolver<Maybe<ResolversTypes['GitHubIntegration']>, ParentType, ContextType>;
  gitlab?: Resolver<ResolversTypes['GitLabIntegration'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  jiraServer?: Resolver<ResolversTypes['JiraServerIntegration'], ParentType, ContextType>;
  mattermost?: Resolver<ResolversTypes['MattermostIntegration'], ParentType, ContextType>;
  slack?: Resolver<Maybe<ResolversTypes['SlackIntegration']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamNotificationResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamNotification'] = ResolversParentTypes['TeamNotification']> = {
  __resolveType: TypeResolveFn<'NotificationTeamInvitation', ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['NotificationEnum']>, ParentType, ContextType>;
};

export type TeamPromptMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamPromptMeeting'] = ResolversParentTypes['TeamPromptMeeting']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdByUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  endedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  facilitator?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  facilitatorStageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  facilitatorUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingMembers?: Resolver<Array<ResolversTypes['MeetingMember']>, ParentType, ContextType>;
  meetingNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  phases?: Resolver<Array<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  responses?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
  settings?: Resolver<ResolversTypes['TeamPromptMeetingSettings'], ParentType, ContextType>;
  showConversionModal?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  summarySentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  viewerMeetingMember?: Resolver<Maybe<ResolversTypes['TeamPromptMeetingMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamPromptMeetingMemberResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamPromptMeetingMember'] = ResolversParentTypes['TeamPromptMeetingMember']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCheckedIn?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamPromptMeetingSettingsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TeamPromptMeetingSettings'] = ResolversParentTypes['TeamPromptMeetingSettings']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingType?: Resolver<ResolversTypes['MeetingTypeEnum'], ParentType, ContextType>;
  phaseTypes?: Resolver<Array<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateDimensionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TemplateDimension'] = ResolversParentTypes['TemplateDimension']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  removedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  scaleId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  selectedScale?: Resolver<ResolversTypes['TemplateScale'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  template?: Resolver<ResolversTypes['PokerTemplate'], ParentType, ContextType>;
  templateId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateDimensionRefResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TemplateDimensionRef'] = ResolversParentTypes['TemplateDimensionRef']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scale?: Resolver<ResolversTypes['TemplateScaleRef'], ParentType, ContextType>;
  scaleRefId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateScaleResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TemplateScale'] = ResolversParentTypes['TemplateScale']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['TemplateDimension']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isStarter?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  removedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['TemplateScaleValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateScaleRefResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TemplateScaleRef'] = ResolversParentTypes['TemplateScaleRef']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['TemplateScaleValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TemplateScaleValueResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TemplateScaleValue'] = ResolversParentTypes['TemplateScaleValue']> = {
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scaleId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ThreadableResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['Threadable'] = ResolversParentTypes['Threadable']> = {
  __resolveType: TypeResolveFn<'Comment' | 'Task', ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  discussionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  replies?: Resolver<Array<ResolversTypes['Threadable']>, ParentType, ContextType>;
  threadParentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  threadSortOrder?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export type ThreadableConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ThreadableConnection'] = ResolversParentTypes['ThreadableConnection']> = {
  edges?: Resolver<Array<ResolversTypes['ThreadableEdge']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ThreadableEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['ThreadableEdge'] = ResolversParentTypes['ThreadableEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Threadable'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineEventResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEvent'] = ResolversParentTypes['TimelineEvent']> = {
  __resolveType: TypeResolveFn<'TimelineEventCompletedActionMeeting' | 'TimelineEventCompletedRetroMeeting' | 'TimelineEventJoinedParabol' | 'TimelineEventPokerComplete' | 'TimelineEventTeamCreated', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interactionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  orgId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  seenCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  teamId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TimelineEventEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type TimelineEventCompletedActionMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEventCompletedActionMeeting'] = ResolversParentTypes['TimelineEventCompletedActionMeeting']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interactionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<ResolversTypes['ActionMeeting'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  seenCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TimelineEventEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineEventCompletedRetroMeetingResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEventCompletedRetroMeeting'] = ResolversParentTypes['TimelineEventCompletedRetroMeeting']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interactionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<ResolversTypes['RetrospectiveMeeting'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  seenCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TimelineEventEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineEventConnectionResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEventConnection'] = ResolversParentTypes['TimelineEventConnection']> = {
  edges?: Resolver<Array<ResolversTypes['TimelineEventEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfoDateCursor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineEventEdgeResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEventEdge'] = ResolversParentTypes['TimelineEventEdge']> = {
  cursor?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  node?: Resolver<ResolversTypes['TimelineEvent'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineEventJoinedParabolResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEventJoinedParabol'] = ResolversParentTypes['TimelineEventJoinedParabol']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interactionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  orgId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  seenCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  teamId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TimelineEventEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineEventPokerCompleteResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEventPokerComplete'] = ResolversParentTypes['TimelineEventPokerComplete']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interactionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<ResolversTypes['PokerMeeting'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  seenCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TimelineEventEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimelineEventTeamCreatedResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['TimelineEventTeamCreated'] = ResolversParentTypes['TimelineEventTeamCreated']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  interactionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  orgId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  seenCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TimelineEventEnum'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UpdateWatchlistPayloadResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['UpdateWatchlistPayload'] = ResolversParentTypes['UpdateWatchlistPayload']> = {
  __resolveType: TypeResolveFn<'ErrorPayload' | 'UpdateWatchlistSuccess', ParentType, ContextType>;
};

export type UpdateWatchlistSuccessResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['UpdateWatchlistSuccess'] = ResolversParentTypes['UpdateWatchlistSuccess']> = {
  success?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatesPhaseResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['UpdatesPhase'] = ResolversParentTypes['UpdatesPhase']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phaseType?: Resolver<ResolversTypes['NewMeetingPhaseTypeEnum'], ParentType, ContextType>;
  stages?: Resolver<Array<ResolversTypes['UpdatesStage']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatesStageResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['UpdatesStage'] = ResolversParentTypes['UpdatesStage']> = {
  endAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAsync?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isComplete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNavigableByFacilitator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isViewerReady?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType>;
  meetingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meetingMember?: Resolver<ResolversTypes['MeetingMember'], ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['NewMeetingPhase']>, ParentType, ContextType>;
  phaseType?: Resolver<Maybe<ResolversTypes['NewMeetingPhaseTypeEnum']>, ParentType, ContextType>;
  readyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduledEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedEndTime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  suggestedTimeLimit?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  teamMember?: Resolver<ResolversTypes['TeamMember'], ParentType, ContextType>;
  teamMemberId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  timeRemaining?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  viewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  archivedTasks?: Resolver<Maybe<ResolversTypes['TaskConnection']>, ParentType, ContextType, RequireFields<UserArchivedTasksArgs, 'first' | 'teamId'>>;
  archivedTasksCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<UserArchivedTasksCountArgs, 'teamId'>>;
  company?: Resolver<Maybe<ResolversTypes['Company']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  discussion?: Resolver<Maybe<ResolversTypes['Discussion']>, ParentType, ContextType, RequireFields<UserDiscussionArgs, 'id'>>;
  email?: Resolver<ResolversTypes['Email'], ParentType, ContextType>;
  featureFlags?: Resolver<ResolversTypes['UserFeatureFlags'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  identities?: Resolver<Maybe<Array<Maybe<ResolversTypes['AuthIdentity']>>>, ParentType, ContextType>;
  inactive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  invoiceDetails?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, RequireFields<UserInvoiceDetailsArgs, 'invoiceId'>>;
  invoices?: Resolver<Maybe<ResolversTypes['InvoiceConnection']>, ParentType, ContextType, RequireFields<UserInvoicesArgs, 'first' | 'orgId'>>;
  isAnyBillingLeader?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isConnected?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isPatientZero?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRemoved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isWatched?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastMetAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastSeenAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  lastSeenAtURLs?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  meeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType, RequireFields<UserMeetingArgs, 'meetingId'>>;
  meetingCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  meetingMember?: Resolver<Maybe<ResolversTypes['MeetingMember']>, ParentType, ContextType, RequireFields<UserMeetingMemberArgs, 'meetingId'>>;
  monthlyStreakCurrent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  monthlyStreakMax?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  newFeature?: Resolver<Maybe<ResolversTypes['NewFeatureBroadcast']>, ParentType, ContextType>;
  newFeatureId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  newMeeting?: Resolver<Maybe<ResolversTypes['NewMeeting']>, ParentType, ContextType, RequireFields<UserNewMeetingArgs, 'meetingId'>>;
  notifications?: Resolver<ResolversTypes['NotificationConnection'], ParentType, ContextType, RequireFields<UserNotificationsArgs, 'first'>>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<UserOrganizationArgs, 'orgId'>>;
  organizationUser?: Resolver<Maybe<ResolversTypes['OrganizationUser']>, ParentType, ContextType, RequireFields<UserOrganizationUserArgs, 'orgId'>>;
  organizationUsers?: Resolver<Array<ResolversTypes['OrganizationUser']>, ParentType, ContextType>;
  organizations?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType>;
  overLimitCopy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  payLaterClickCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  picture?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  preferredName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rasterPicture?: Resolver<ResolversTypes['URL'], ParentType, ContextType>;
  reasonRemoved?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  similarReflectionGroups?: Resolver<Array<ResolversTypes['RetroReflectionGroup']>, ParentType, ContextType, RequireFields<UserSimilarReflectionGroupsArgs, 'reflectionGroupId' | 'searchQuery'>>;
  suggestedActions?: Resolver<Array<ResolversTypes['SuggestedAction']>, ParentType, ContextType>;
  tasks?: Resolver<ResolversTypes['TaskConnection'], ParentType, ContextType, RequireFields<UserTasksArgs, 'archived' | 'first' | 'includeUnassigned'>>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType, RequireFields<UserTeamArgs, 'teamId'>>;
  teamInvitation?: Resolver<ResolversTypes['TeamInvitationPayload'], ParentType, ContextType, Partial<UserTeamInvitationArgs>>;
  teamMember?: Resolver<Maybe<ResolversTypes['TeamMember']>, ParentType, ContextType, RequireFields<UserTeamMemberArgs, 'teamId'>>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  tier?: Resolver<ResolversTypes['TierEnum'], ParentType, ContextType>;
  timeline?: Resolver<ResolversTypes['TimelineEventConnection'], ParentType, ContextType, RequireFields<UserTimelineArgs, 'first'>>;
  tms?: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  userOnTeam?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<UserUserOnTeamArgs, 'userId'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserFeatureFlagsResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['UserFeatureFlags'] = ResolversParentTypes['UserFeatureFlags']> = {
  gitlab?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  spotlight?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  standups?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserTiersCountResolvers<ContextType = InternalContext, ParentType extends ResolversParentTypes['UserTiersCount'] = ResolversParentTypes['UserTiersCount']> = {
  tierPersonalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tierProBillingLeaderCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tierProCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = InternalContext> = {
  ActionMeeting?: ActionMeetingResolvers<ContextType>;
  ActionMeetingMember?: ActionMeetingMemberResolvers<ContextType>;
  ActionMeetingSettings?: ActionMeetingSettingsResolvers<ContextType>;
  AddNewFeaturePayload?: AddNewFeaturePayloadResolvers<ContextType>;
  AgendaItem?: AgendaItemResolvers<ContextType>;
  AgendaItemsPhase?: AgendaItemsPhaseResolvers<ContextType>;
  AgendaItemsStage?: AgendaItemsStageResolvers<ContextType>;
  AtlassianIntegration?: AtlassianIntegrationResolvers<ContextType>;
  AtlassianTeamIntegration?: AtlassianTeamIntegrationResolvers<ContextType>;
  AuthIdentity?: AuthIdentityResolvers<ContextType>;
  AuthIdentityGoogle?: AuthIdentityGoogleResolvers<ContextType>;
  AuthIdentityLocal?: AuthIdentityLocalResolvers<ContextType>;
  CheckInPhase?: CheckInPhaseResolvers<ContextType>;
  CheckInStage?: CheckInStageResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  CommentorDetails?: CommentorDetailsResolvers<ContextType>;
  Company?: CompanyResolvers<ContextType>;
  Coupon?: CouponResolvers<ContextType>;
  CreditCard?: CreditCardResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteUserPayload?: DeleteUserPayloadResolvers<ContextType>;
  DisconnectSocketPayload?: DisconnectSocketPayloadResolvers<ContextType>;
  DiscussPhase?: DiscussPhaseResolvers<ContextType>;
  Discussion?: DiscussionResolvers<ContextType>;
  DiscussionThreadStage?: DiscussionThreadStageResolvers<ContextType>;
  DomainCountPayload?: DomainCountPayloadResolvers<ContextType>;
  DraftEnterpriseInvoicePayload?: DraftEnterpriseInvoicePayloadResolvers<ContextType>;
  Email?: GraphQLScalarType;
  EnableSAMLForDomainPayload?: EnableSamlForDomainPayloadResolvers<ContextType>;
  EnableSAMLForDomainSuccess?: EnableSamlForDomainSuccessResolvers<ContextType>;
  ErrorPayload?: ErrorPayloadResolvers<ContextType>;
  EstimatePhase?: EstimatePhaseResolvers<ContextType>;
  EstimateStage?: EstimateStageResolvers<ContextType>;
  EstimateUserScore?: EstimateUserScoreResolvers<ContextType>;
  FlagConversionModalPayload?: FlagConversionModalPayloadResolvers<ContextType>;
  FlagOverLimitPayload?: FlagOverLimitPayloadResolvers<ContextType>;
  GenericMeetingPhase?: GenericMeetingPhaseResolvers<ContextType>;
  GenericMeetingStage?: GenericMeetingStageResolvers<ContextType>;
  GitHubIntegration?: GitHubIntegrationResolvers<ContextType>;
  GitHubSearchQuery?: GitHubSearchQueryResolvers<ContextType>;
  GitLabIntegration?: GitLabIntegrationResolvers<ContextType>;
  GoogleAnalyzedEntity?: GoogleAnalyzedEntityResolvers<ContextType>;
  IntegrationProvider?: IntegrationProviderResolvers<ContextType>;
  IntegrationProviderOAuth1?: IntegrationProviderOAuth1Resolvers<ContextType>;
  IntegrationProviderOAuth2?: IntegrationProviderOAuth2Resolvers<ContextType>;
  IntegrationProviderWebhook?: IntegrationProviderWebhookResolvers<ContextType>;
  Invoice?: InvoiceResolvers<ContextType>;
  InvoiceConnection?: InvoiceConnectionResolvers<ContextType>;
  InvoiceEdge?: InvoiceEdgeResolvers<ContextType>;
  InvoiceLineItem?: InvoiceLineItemResolvers<ContextType>;
  InvoiceLineItemDetails?: InvoiceLineItemDetailsResolvers<ContextType>;
  JiraDimensionField?: JiraDimensionFieldResolvers<ContextType>;
  JiraIssue?: JiraIssueResolvers<ContextType>;
  JiraIssueConnection?: JiraIssueConnectionResolvers<ContextType>;
  JiraIssueEdge?: JiraIssueEdgeResolvers<ContextType>;
  JiraRemoteAvatarUrls?: JiraRemoteAvatarUrlsResolvers<ContextType>;
  JiraRemoteProject?: JiraRemoteProjectResolvers<ContextType>;
  JiraRemoteProjectCategory?: JiraRemoteProjectCategoryResolvers<ContextType>;
  JiraSearchQuery?: JiraSearchQueryResolvers<ContextType>;
  JiraServerIntegration?: JiraServerIntegrationResolvers<ContextType>;
  JiraServerRemoteProject?: JiraServerRemoteProjectResolvers<ContextType>;
  LoginSAMLPayload?: LoginSamlPayloadResolvers<ContextType>;
  LoginsPayload?: LoginsPayloadResolvers<ContextType>;
  MassInvitation?: MassInvitationResolvers<ContextType>;
  MattermostIntegration?: MattermostIntegrationResolvers<ContextType>;
  MeetingGreeting?: MeetingGreetingResolvers<ContextType>;
  MeetingMember?: MeetingMemberResolvers<ContextType>;
  MeetingTemplate?: MeetingTemplateResolvers<ContextType>;
  MessageAllSlackUsersPayload?: MessageAllSlackUsersPayloadResolvers<ContextType>;
  MessageAllSlackUsersSuccess?: MessageAllSlackUsersSuccessResolvers<ContextType>;
  MessageSlackUserError?: MessageSlackUserErrorResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NewFeatureBroadcast?: NewFeatureBroadcastResolvers<ContextType>;
  NewMeeting?: NewMeetingResolvers<ContextType>;
  NewMeetingPhase?: NewMeetingPhaseResolvers<ContextType>;
  NewMeetingStage?: NewMeetingStageResolvers<ContextType>;
  NewMeetingTeamMemberStage?: NewMeetingTeamMemberStageResolvers<ContextType>;
  NextPeriodCharges?: NextPeriodChargesResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  NotificationConnection?: NotificationConnectionResolvers<ContextType>;
  NotificationEdge?: NotificationEdgeResolvers<ContextType>;
  NotificationTeamInvitation?: NotificationTeamInvitationResolvers<ContextType>;
  NotifyPaymentRejected?: NotifyPaymentRejectedResolvers<ContextType>;
  NotifyPromoteToOrgLeader?: NotifyPromoteToOrgLeaderResolvers<ContextType>;
  OrgUserCount?: OrgUserCountResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationUser?: OrganizationUserResolvers<ContextType>;
  OrganizationUserConnection?: OrganizationUserConnectionResolvers<ContextType>;
  OrganizationUserEdge?: OrganizationUserEdgeResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PageInfoDateCursor?: PageInfoDateCursorResolvers<ContextType>;
  PingableServices?: PingableServicesResolvers<ContextType>;
  PokerMeeting?: PokerMeetingResolvers<ContextType>;
  PokerMeetingMember?: PokerMeetingMemberResolvers<ContextType>;
  PokerMeetingSettings?: PokerMeetingSettingsResolvers<ContextType>;
  PokerTemplate?: PokerTemplateResolvers<ContextType>;
  PokerTemplateConnection?: PokerTemplateConnectionResolvers<ContextType>;
  PokerTemplateEdge?: PokerTemplateEdgeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reactable?: ReactableResolvers<ContextType>;
  Reactji?: ReactjiResolvers<ContextType>;
  ReflectPhase?: ReflectPhaseResolvers<ContextType>;
  ReflectPrompt?: ReflectPromptResolvers<ContextType>;
  ReflectTemplate?: ReflectTemplateResolvers<ContextType>;
  ReflectTemplateConnection?: ReflectTemplateConnectionResolvers<ContextType>;
  ReflectTemplateEdge?: ReflectTemplateEdgeResolvers<ContextType>;
  RemoveAllSlackAuthsPayload?: RemoveAllSlackAuthsPayloadResolvers<ContextType>;
  RemoveAllSlackAuthsSuccess?: RemoveAllSlackAuthsSuccessResolvers<ContextType>;
  RepoIntegration?: RepoIntegrationResolvers<ContextType>;
  RepoIntegrationQueryPayload?: RepoIntegrationQueryPayloadResolvers<ContextType>;
  RetroDiscussStage?: RetroDiscussStageResolvers<ContextType>;
  RetroReflection?: RetroReflectionResolvers<ContextType>;
  RetroReflectionGroup?: RetroReflectionGroupResolvers<ContextType>;
  RetrospectiveMeeting?: RetrospectiveMeetingResolvers<ContextType>;
  RetrospectiveMeetingMember?: RetrospectiveMeetingMemberResolvers<ContextType>;
  RetrospectiveMeetingSettings?: RetrospectiveMeetingSettingsResolvers<ContextType>;
  ServiceField?: ServiceFieldResolvers<ContextType>;
  SignupsPayload?: SignupsPayloadResolvers<ContextType>;
  SlackIntegration?: SlackIntegrationResolvers<ContextType>;
  SlackNotification?: SlackNotificationResolvers<ContextType>;
  StandardMutationError?: StandardMutationErrorResolvers<ContextType>;
  StripeFailPaymentPayload?: StripeFailPaymentPayloadResolvers<ContextType>;
  SuggestedAction?: SuggestedActionResolvers<ContextType>;
  SuggestedActionCreateNewTeam?: SuggestedActionCreateNewTeamResolvers<ContextType>;
  SuggestedActionInviteYourTeam?: SuggestedActionInviteYourTeamResolvers<ContextType>;
  SuggestedActionTryActionMeeting?: SuggestedActionTryActionMeetingResolvers<ContextType>;
  SuggestedActionTryRetroMeeting?: SuggestedActionTryRetroMeetingResolvers<ContextType>;
  SuggestedActionTryTheDemo?: SuggestedActionTryTheDemoResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  TaskConnection?: TaskConnectionResolvers<ContextType>;
  TaskEdge?: TaskEdgeResolvers<ContextType>;
  TaskEditorDetails?: TaskEditorDetailsResolvers<ContextType>;
  TaskEstimate?: TaskEstimateResolvers<ContextType>;
  TaskIntegration?: TaskIntegrationResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  TeamIntegrations?: TeamIntegrationsResolvers<ContextType>;
  TeamInvitation?: TeamInvitationResolvers<ContextType>;
  TeamInvitationPayload?: TeamInvitationPayloadResolvers<ContextType>;
  TeamMeetingSettings?: TeamMeetingSettingsResolvers<ContextType>;
  TeamMember?: TeamMemberResolvers<ContextType>;
  TeamMemberIntegrationAuth?: TeamMemberIntegrationAuthResolvers<ContextType>;
  TeamMemberIntegrationAuthOAuth1?: TeamMemberIntegrationAuthOAuth1Resolvers<ContextType>;
  TeamMemberIntegrationAuthOAuth2?: TeamMemberIntegrationAuthOAuth2Resolvers<ContextType>;
  TeamMemberIntegrationAuthWebhook?: TeamMemberIntegrationAuthWebhookResolvers<ContextType>;
  TeamMemberIntegrations?: TeamMemberIntegrationsResolvers<ContextType>;
  TeamNotification?: TeamNotificationResolvers<ContextType>;
  TeamPromptMeeting?: TeamPromptMeetingResolvers<ContextType>;
  TeamPromptMeetingMember?: TeamPromptMeetingMemberResolvers<ContextType>;
  TeamPromptMeetingSettings?: TeamPromptMeetingSettingsResolvers<ContextType>;
  TemplateDimension?: TemplateDimensionResolvers<ContextType>;
  TemplateDimensionRef?: TemplateDimensionRefResolvers<ContextType>;
  TemplateScale?: TemplateScaleResolvers<ContextType>;
  TemplateScaleRef?: TemplateScaleRefResolvers<ContextType>;
  TemplateScaleValue?: TemplateScaleValueResolvers<ContextType>;
  Threadable?: ThreadableResolvers<ContextType>;
  ThreadableConnection?: ThreadableConnectionResolvers<ContextType>;
  ThreadableEdge?: ThreadableEdgeResolvers<ContextType>;
  TimelineEvent?: TimelineEventResolvers<ContextType>;
  TimelineEventCompletedActionMeeting?: TimelineEventCompletedActionMeetingResolvers<ContextType>;
  TimelineEventCompletedRetroMeeting?: TimelineEventCompletedRetroMeetingResolvers<ContextType>;
  TimelineEventConnection?: TimelineEventConnectionResolvers<ContextType>;
  TimelineEventEdge?: TimelineEventEdgeResolvers<ContextType>;
  TimelineEventJoinedParabol?: TimelineEventJoinedParabolResolvers<ContextType>;
  TimelineEventPokerComplete?: TimelineEventPokerCompleteResolvers<ContextType>;
  TimelineEventTeamCreated?: TimelineEventTeamCreatedResolvers<ContextType>;
  URL?: GraphQLScalarType;
  UpdateWatchlistPayload?: UpdateWatchlistPayloadResolvers<ContextType>;
  UpdateWatchlistSuccess?: UpdateWatchlistSuccessResolvers<ContextType>;
  UpdatesPhase?: UpdatesPhaseResolvers<ContextType>;
  UpdatesStage?: UpdatesStageResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserFeatureFlags?: UserFeatureFlagsResolvers<ContextType>;
  UserTiersCount?: UserTiersCountResolvers<ContextType>;
};

