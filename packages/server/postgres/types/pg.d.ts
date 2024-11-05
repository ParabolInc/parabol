import type { ColumnType } from "kysely";

export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[]
  ? U[]
  : ArrayTypeImpl<T>;

export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S[], I[], U[]>
  : T[];

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface _Migration {
  name: string;
  timestamp: string;
}

export interface _MigrationLock {
  id: string;
  is_locked: Generated<number>;
}

export interface AgendaItem {
  content: string;
  createdAt: Generated<Timestamp>;
  id: string;
  isActive: Generated<boolean>;
  isComplete: Generated<boolean>;
  meetingId: string | null;
  pinned: Generated<boolean>;
  pinnedParentId: string | null;
  sortOrder: string;
  teamId: string;
  teamMemberId: string;
  updatedAt: Generated<Timestamp>;
}

export interface AtlassianAuth {
  accessToken: string;
  accountId: string;
  cloudIds: Generated<string[]>;
  createdAt: Generated<Timestamp>;
  isActive: Generated<boolean>;
  jiraSearchQueries: Generated<ArrayType<Json>>;
  refreshToken: string;
  scope: string;
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface AzureDevOpsDimensionFieldMap {
  dimensionName: string;
  fieldId: string;
  fieldName: string;
  fieldType: string;
  id: Generated<number>;
  instanceId: string;
  projectKey: string;
  teamId: string;
  workItemType: string;
}

export interface Comment {
  content: Json;
  createdAt: Generated<Timestamp>;
  createdBy: string | null;
  discussionId: string;
  id: string;
  isActive: Generated<boolean>;
  isAnonymous: Generated<boolean>;
  plaintextContent: string;
  reactjis: Generated<string[]>;
  threadParentId: string | null;
  threadSortOrder: number;
  updatedAt: Generated<Timestamp>;
}

export interface Discussion {
  createdAt: Generated<Timestamp>;
  discussionTopicId: string;
  discussionTopicType: "agendaItem" | "githubIssue" | "jiraIssue" | "reflectionGroup" | "task" | "teamPromptResponse";
  id: string;
  meetingId: string;
  summary: string | null;
  teamId: string;
}

export interface DomainJoinRequest {
  createdAt: Generated<Timestamp>;
  createdBy: string;
  domain: string;
  expiresAt: Timestamp | null;
  id: Generated<number>;
  updatedAt: Generated<Timestamp>;
}

export interface EmailVerification {
  email: string;
  expiration: Timestamp;
  hashedPassword: string | null;
  id: Generated<number>;
  invitationToken: string | null;
  pseudoId: string | null;
  token: string;
}

export interface EmbeddingsJobQueue {
  embeddingsMetadataId: number | null;
  id: Generated<number>;
  jobData: Generated<Json>;
  jobType: string;
  model: string | null;
  priority: Generated<number>;
  retryAfter: Timestamp | null;
  retryCount: Generated<number>;
  startAt: Timestamp | null;
  state: Generated<"failed" | "queued" | "running">;
  stateMessage: string | null;
  updatedAt: Generated<Timestamp>;
}

export interface EmbeddingsMetadata {
  createdAt: Generated<Timestamp>;
  fullText: string | null;
  id: Generated<number>;
  language: "aa" | "ab" | "ae" | "af" | "ak" | "am" | "an" | "ar" | "as" | "av" | "ay" | "az" | "ba" | "be" | "bg" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv" | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en" | "eo" | "es" | "et" | "eu" | "fa" | "ff" | "fi" | "fj" | "fo" | "fr" | "fy" | "ga" | "gd" | "gl" | "gn" | "gu" | "gv" | "ha" | "he" | "hi" | "ho" | "hr" | "ht" | "hu" | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik" | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg" | "ki" | "kj" | "kk" | "kl" | "km" | "kn" | "ko" | "kr" | "ks" | "ku" | "kv" | "kw" | "ky" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "mg" | "mh" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my" | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no" | "nr" | "nv" | "ny" | "oc" | "oj" | "om" | "or" | "os" | "pa" | "pi" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "rw" | "sa" | "sc" | "sd" | "se" | "sg" | "sh" | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr" | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg" | "th" | "ti" | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "wo" | "xh" | "yi" | "yo" | "za" | "zh" | "zu" | null;
  objectType: "meetingTemplate" | "retrospectiveDiscussionTopic";
  refId: string;
  refUpdatedAt: Generated<Timestamp>;
  teamId: string;
  updatedAt: Generated<Timestamp>;
}

export interface FailedAuthRequest {
  email: string;
  id: Generated<number>;
  ip: string;
  time: Generated<Timestamp>;
}

export interface FeatureFlag {
  createdAt: Generated<Timestamp>;
  description: string | null;
  expiresAt: Timestamp;
  featureName: string;
  id: Generated<string>;
  scope: "Organization" | "Team" | "User";
  updatedAt: Generated<Timestamp>;
}

export interface FeatureFlagOwner {
  createdAt: Generated<Timestamp>;
  featureFlagId: string;
  orgId: string | null;
  teamId: string | null;
  userId: string | null;
}

export interface FreemailDomain {
  createdAt: Generated<Timestamp>;
  domain: string;
}

export interface GitHubAuth {
  accessToken: string;
  createdAt: Generated<Timestamp>;
  githubSearchQueries: Generated<ArrayType<Json>>;
  isActive: Generated<boolean>;
  login: string;
  scope: string;
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface GitHubDimensionFieldMap {
  dimensionName: string;
  id: Generated<number>;
  labelTemplate: string;
  nameWithOwner: string;
  teamId: string;
}

export interface GitLabDimensionFieldMap {
  dimensionName: string;
  id: Generated<number>;
  labelTemplate: string;
  projectId: number;
  providerId: number;
  teamId: string;
}

export interface Insight {
  challenges: string[];
  createdAt: Generated<Timestamp>;
  endDateTime: Timestamp;
  id: Generated<number>;
  meetingsCount: Generated<number>;
  startDateTime: Timestamp;
  teamId: string;
  updatedAt: Generated<Timestamp>;
  wins: string[];
}

export interface IntegrationProvider {
  authStrategy: "oauth1" | "oauth2" | "pat" | "sharedSecret" | "webhook";
  clientId: string | null;
  clientSecret: string | null;
  consumerKey: string | null;
  consumerSecret: string | null;
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  isActive: Generated<boolean>;
  orgId: string | null;
  scope: "global" | "org" | "team";
  scopeGlobal: Generated<boolean>;
  serverBaseUrl: string | null;
  service: "azureDevOps" | "gcal" | "gitlab" | "jiraServer" | "mattermost" | "msTeams";
  sharedSecret: string | null;
  teamId: string | null;
  tenantId: string | null;
  updatedAt: Generated<Timestamp>;
  webhookUrl: string | null;
}

export interface IntegrationSearchQuery {
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  lastUsedAt: Generated<Timestamp>;
  providerId: number | null;
  query: Generated<Json>;
  service: "azureDevOps" | "gcal" | "gitlab" | "jiraServer" | "mattermost" | "msTeams";
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface JiraDimensionFieldMap {
  cloudId: string;
  dimensionName: string;
  fieldId: string;
  fieldName: string;
  fieldType: string;
  id: Generated<number>;
  issueType: string;
  projectKey: string;
  teamId: string;
  updatedAt: Generated<Timestamp>;
}

export interface JiraServerDimensionFieldMap {
  dimensionName: string;
  fieldId: string;
  fieldName: string;
  fieldType: string;
  id: Generated<number>;
  issueType: string;
  projectId: string;
  providerId: number;
  teamId: string;
}

export interface MassInvitation {
  expiration: Timestamp;
  id: string;
  meetingId: string | null;
  teamMemberId: string;
}

export interface MeetingMember {
  id: string;
  isSpectating: boolean | null;
  meetingId: string;
  meetingType: "action" | "poker" | "retrospective" | "teamPrompt";
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string;
  votesRemaining: number | null;
}

export interface MeetingSeries {
  cancelledAt: Timestamp | null;
  createdAt: Generated<Timestamp>;
  duration: number;
  facilitatorId: string;
  gcalSeriesId: string | null;
  id: Generated<number>;
  meetingType: "action" | "poker" | "retrospective" | "teamPrompt";
  recurrenceRule: string;
  teamId: string;
  title: string;
  updatedAt: Generated<Timestamp>;
}

export interface MeetingSettings {
  disableAnonymity: boolean | null;
  id: string;
  jiraSearchQueries: Json | null;
  maxVotesPerGroup: number | null;
  meetingType: "action" | "poker" | "retrospective" | "teamPrompt";
  phaseTypes: string[];
  selectedTemplateId: string | null;
  teamId: string;
  totalVotes: number | null;
  videoMeetingURL: string | null;
}

export interface MeetingTemplate {
  createdAt: Generated<Timestamp>;
  hideEndingAt: Timestamp | null;
  hideStartingAt: Timestamp | null;
  id: string;
  illustrationUrl: string;
  isActive: Generated<boolean>;
  isFree: Generated<boolean>;
  isStarter: Generated<boolean>;
  lastUsedAt: Timestamp | null;
  mainCategory: string;
  name: string;
  orgId: string;
  parentTemplateId: string | null;
  scope: Generated<"ORGANIZATION" | "PUBLIC" | "TEAM" | "USER">;
  teamId: string;
  type: "action" | "poker" | "retrospective" | "teamPrompt";
  updatedAt: Generated<Timestamp>;
}

export interface MeetingTemplateUserFavorite {
  templateId: string;
  userId: string;
}

export interface NewFeature {
  actionButtonCopy: string;
  id: Generated<number>;
  snackbarMessage: string;
  url: string;
}

export interface NewMeeting {
  agendaItemCount: number | null;
  autogroupReflectionGroups: Json | null;
  commentCount: number | null;
  createdAt: Generated<Timestamp>;
  createdBy: string | null;
  disableAnonymity: boolean | null;
  endedAt: Timestamp | null;
  engagement: number | null;
  facilitatorStageId: string;
  facilitatorUserId: string | null;
  id: string;
  isLegacy: Generated<boolean>;
  maxVotesPerGroup: number | null;
  meetingCount: number;
  meetingNumber: number;
  meetingPrompt: string | null;
  meetingSeriesId: number | null;
  meetingType: "action" | "poker" | "retrospective" | "teamPrompt";
  name: string;
  phases: Json;
  recallBotId: string | null;
  reflectionCount: number | null;
  resetReflectionGroups: Json | null;
  scheduledEndTime: Timestamp | null;
  sentimentScore: number | null;
  showConversionModal: Generated<boolean>;
  slackTs: number | null;
  storyCount: number | null;
  summary: string | null;
  summarySentAt: Timestamp | null;
  taskCount: number | null;
  teamId: string;
  templateId: string | null;
  templateRefId: string | null;
  topicCount: number | null;
  totalVotes: number | null;
  transcription: Json | null;
  updatedAt: Generated<Timestamp>;
  usedReactjis: Json | null;
  videoMeetingURL: string | null;
}

export interface Notification {
  activeDomain: string | null;
  archivorUserId: string | null;
  authorId: string | null;
  brand: string | null;
  changeAuthorId: string | null;
  commentId: string | null;
  createdAt: Generated<Timestamp>;
  discussionId: string | null;
  domainJoinRequestId: number | null;
  email: string | null;
  evictorUserId: string | null;
  id: string;
  invitationId: string | null;
  involvement: "ASSIGNEE" | "MENTIONEE" | null;
  last4: number | null;
  meetingId: string | null;
  meetingName: string | null;
  name: string | null;
  orgId: string | null;
  orgName: string | null;
  orgPicture: string | null;
  picture: string | null;
  requestCreatedBy: string | null;
  responseId: number | null;
  retroDiscussStageIdx: number | null;
  retroReflectionId: string | null;
  scheduledLockAt: Timestamp | null;
  senderName: string | null;
  senderPicture: string | null;
  senderUserId: string | null;
  status: Generated<"CLICKED" | "READ" | "UNREAD">;
  taskId: string | null;
  teamId: string | null;
  type: "DISCUSSION_MENTIONED" | "KICKED_OUT" | "MEETING_STAGE_TIME_LIMIT_END" | "MENTIONED" | "PAYMENT_REJECTED" | "PROMOTE_TO_BILLING_LEADER" | "PROMPT_TO_JOIN_ORG" | "REQUEST_TO_JOIN_ORG" | "RESPONSE_MENTIONED" | "RESPONSE_REPLIED" | "TASK_INVOLVES" | "TEAM_ARCHIVED" | "TEAM_INVITATION" | "TEAMS_LIMIT_EXCEEDED" | "TEAMS_LIMIT_REMINDER";
  userId: string;
}

export interface Organization {
  activeDomain: string | null;
  createdAt: Generated<Timestamp>;
  creditCard: string | null;
  featureFlags: Generated<string[]>;
  id: string;
  isActiveDomainTouched: Generated<boolean>;
  lockedAt: Timestamp | null;
  name: string;
  payLaterClickCount: Generated<number>;
  periodEnd: Timestamp | null;
  periodStart: Timestamp | null;
  picture: string | null;
  scheduledLockAt: Timestamp | null;
  showConversionModal: Generated<boolean>;
  stripeId: string | null;
  stripeSubscriptionId: string | null;
  tier: Generated<"enterprise" | "starter" | "team">;
  tierLimitExceededAt: Timestamp | null;
  trialStartDate: Timestamp | null;
  upcomingInvoiceEmailSentAt: Timestamp | null;
  updatedAt: Generated<Timestamp>;
  useAI: Generated<boolean>;
}

export interface OrganizationApprovedDomain {
  addedByUserId: string;
  createdAt: Generated<Timestamp>;
  domain: string;
  id: Generated<number>;
  orgId: string;
  removedAt: Timestamp | null;
}

export interface OrganizationUser {
  id: string;
  inactive: Generated<boolean>;
  joinedAt: Generated<Timestamp>;
  orgId: string;
  removedAt: Timestamp | null;
  role: "BILLING_LEADER" | "ORG_ADMIN" | null;
  suggestedTier: "enterprise" | "starter" | "team" | null;
  tier: "enterprise" | "starter" | "team";
  trialStartDate: Timestamp | null;
  userId: string;
}

export interface OrganizationUserAudit {
  eventDate: Timestamp;
  eventType: "activated" | "added" | "inactivated" | "removed";
  id: Generated<number>;
  orgId: string;
  userId: string;
}

export interface PasswordResetRequest {
  email: string;
  id: Generated<number>;
  ip: string;
  isValid: Generated<boolean>;
  time: Generated<Timestamp>;
  token: string;
}

export interface Poll {
  createdAt: Generated<Timestamp>;
  createdById: string;
  deletedAt: Timestamp | null;
  discussionId: string;
  endedAt: Timestamp | null;
  id: Generated<number>;
  meetingId: string | null;
  teamId: string;
  threadSortOrder: number;
  title: string | null;
  updatedAt: Generated<Timestamp>;
}

export interface PollOption {
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  pollId: number;
  title: string | null;
  updatedAt: Generated<Timestamp>;
  voteUserIds: Generated<string[]>;
}

export interface PushInvitation {
  denialCount: Generated<number>;
  id: Generated<number>;
  lastDenialAt: Timestamp | null;
  teamId: string;
  userId: string;
}

export interface QueryMap {
  createdAt: Generated<Timestamp>;
  id: string;
  query: string;
}

export interface ReflectPrompt {
  createdAt: Generated<Timestamp>;
  description: string;
  groupColor: string;
  id: string;
  parentPromptId: string | null;
  question: string;
  removedAt: Timestamp | null;
  sortOrder: string;
  teamId: string;
  templateId: string;
  updatedAt: Generated<Timestamp>;
}

export interface RetroReflection {
  content: string;
  createdAt: Generated<Timestamp>;
  creatorId: string | null;
  entities: Generated<string[]>;
  id: string;
  isActive: Generated<boolean>;
  meetingId: string;
  plaintextContent: string;
  promptId: string;
  reactjis: Generated<string[]>;
  reflectionGroupId: string;
  sentimentScore: number | null;
  sortOrder: Generated<number>;
  updatedAt: Generated<Timestamp>;
}

export interface RetroReflectionGroup {
  createdAt: Generated<Timestamp>;
  discussionPromptQuestion: string | null;
  id: string;
  isActive: Generated<boolean>;
  meetingId: string;
  promptId: string;
  smartTitle: string | null;
  sortOrder: Generated<number>;
  title: string | null;
  updatedAt: Generated<Timestamp>;
  voterIds: Generated<string[]>;
}

export interface SAML {
  createdAt: Generated<Timestamp>;
  id: string;
  lastUpdatedBy: Generated<string>;
  metadata: string | null;
  metadataURL: string | null;
  orgId: string | null;
  updatedAt: Generated<Timestamp>;
  url: string | null;
}

export interface SAMLDomain {
  domain: string;
  samlId: string | null;
}

export interface ScheduledJob {
  id: Generated<number>;
  meetingId: string | null;
  orgId: string | null;
  runAt: Generated<Timestamp>;
  type: "LOCK_ORGANIZATION" | "MEETING_STAGE_TIME_LIMIT_END" | "WARN_ORGANIZATION";
}

export interface SlackAuth {
  botAccessToken: string | null;
  botUserId: string;
  createdAt: Generated<Timestamp>;
  defaultTeamChannelId: string;
  id: string;
  isActive: Generated<boolean>;
  slackTeamId: string;
  slackTeamName: string;
  slackUserId: string;
  slackUserName: string;
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface SlackNotification {
  channelId: string | null;
  event: "MEETING_STAGE_TIME_LIMIT_END" | "MEETING_STAGE_TIME_LIMIT_START" | "meetingEnd" | "meetingStart" | "STANDUP_RESPONSE_SUBMITTED" | "TOPIC_SHARED";
  id: string;
  teamId: string;
  userId: string;
}

export interface SuggestedAction {
  createdAt: Generated<Timestamp>;
  id: string;
  priority: Generated<number>;
  removedAt: Timestamp | null;
  teamId: string | null;
  type: "createNewTeam" | "inviteYourTeam" | "tryActionMeeting" | "tryRetroMeeting" | "tryTheDemo";
  userId: string;
}

export interface Task {
  content: Json;
  createdAt: Generated<Timestamp>;
  createdBy: string;
  discussionId: string | null;
  doneMeetingId: string | null;
  dueDate: Timestamp | null;
  id: string;
  integration: Json | null;
  integrationHash: string | null;
  meetingId: string | null;
  plaintextContent: string;
  sortOrder: Generated<number>;
  status: Generated<"active" | "done" | "future" | "stuck">;
  tags: Generated<string[]>;
  teamId: string;
  threadParentId: string | null;
  threadSortOrder: number | null;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface TaskEstimate {
  azureDevOpsFieldName: string | null;
  changeSource: "external" | "meeting" | "task";
  createdAt: Generated<Timestamp>;
  discussionId: string | null;
  githubLabelName: string | null;
  id: Generated<number>;
  jiraFieldId: string | null;
  label: string;
  meetingId: string | null;
  name: string;
  stageId: string | null;
  taskId: string;
  userId: string;
}

export interface Team {
  autoJoin: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  createdBy: string | null;
  id: string;
  isArchived: Generated<boolean>;
  isOnboardTeam: Generated<boolean>;
  isPaid: Generated<boolean>;
  jiraDimensionFields: Generated<ArrayType<Json>>;
  kudosEmojiUnicode: Generated<string>;
  lastMeetingType: Generated<"action" | "poker" | "retrospective" | "teamPrompt">;
  lockMessageHTML: string | null;
  name: string;
  orgId: string;
  qualAIMeetingsCount: Generated<number>;
  tier: "enterprise" | "starter" | "team";
  trialStartDate: Timestamp | null;
  updatedAt: Generated<Timestamp>;
}

export interface TeamInvitation {
  acceptedAt: Timestamp | null;
  acceptedBy: string | null;
  createdAt: Generated<Timestamp>;
  email: string;
  expiresAt: Timestamp;
  id: string;
  invitedBy: string;
  isMassInvite: Generated<boolean>;
  meetingId: string | null;
  teamId: string;
  token: string;
}

export interface TeamMeetingTemplate {
  lastUsedAt: Generated<Timestamp>;
  teamId: string;
  templateId: string;
}

export interface TeamMember {
  createdAt: Generated<Timestamp>;
  email: string;
  id: string;
  isLead: Generated<boolean>;
  isNotRemoved: Generated<boolean>;
  isSpectatingPoker: Generated<boolean>;
  openDrawer: "agenda" | "manageTeam" | null;
  picture: string;
  preferredName: string;
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface TeamMemberIntegrationAuth {
  accessToken: string | null;
  accessTokenSecret: string | null;
  channel: string | null;
  createdAt: Generated<Timestamp>;
  expiresAt: Timestamp | null;
  isActive: Generated<boolean>;
  providerId: number;
  refreshToken: string | null;
  scopes: string | null;
  service: "azureDevOps" | "gcal" | "gitlab" | "jiraServer" | "mattermost" | "msTeams";
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface TeamPromptResponse {
  content: Json;
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  meetingId: string;
  plaintextContent: string;
  reactjis: Generated<string[]>;
  sortOrder: number;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface TemplateDimension {
  createdAt: Generated<Timestamp>;
  description: Generated<string>;
  id: string;
  name: string;
  removedAt: Timestamp | null;
  scaleId: string;
  sortOrder: string;
  teamId: string;
  templateId: string;
  updatedAt: Generated<Timestamp>;
}

export interface TemplateRef {
  createdAt: Generated<Timestamp | null>;
  id: string;
  template: Json;
}

export interface TemplateScale {
  createdAt: Generated<Timestamp>;
  id: string;
  isStarter: Generated<boolean>;
  name: string;
  parentScaleId: string | null;
  removedAt: Timestamp | null;
  teamId: string;
  updatedAt: Generated<Timestamp>;
}

export interface TemplateScaleRef {
  createdAt: Generated<Timestamp | null>;
  id: string;
  scale: Json;
}

export interface TemplateScaleValue {
  color: string;
  id: Generated<number>;
  label: string;
  sortOrder: string;
  templateScaleId: string;
}

export interface TimelineEvent {
  createdAt: Generated<Timestamp>;
  id: string;
  interactionCount: Generated<number>;
  isActive: Generated<boolean>;
  meetingId: string | null;
  orgId: string | null;
  seenCount: Generated<number>;
  teamId: string | null;
  type: "actionComplete" | "createdTeam" | "joinedParabol" | "POKER_COMPLETE" | "retroComplete" | "TEAM_PROMPT_COMPLETE";
  userId: string;
}

export interface User {
  createdAt: Generated<Timestamp>;
  domain: Generated<string | null>;
  email: string;
  favoriteTemplateIds: Generated<string[]>;
  featureFlags: Generated<string[]>;
  freeCustomPokerTemplatesRemaining: Generated<number>;
  freeCustomRetroTemplatesRemaining: Generated<number>;
  id: string;
  identities: Generated<ArrayType<Json>>;
  inactive: Generated<boolean>;
  isPatient0: Generated<boolean>;
  isRemoved: Generated<boolean>;
  isWatched: Generated<boolean>;
  lastSeenAt: Generated<Timestamp>;
  lastSeenAtURLs: string[] | null;
  newFeatureId: number | null;
  overLimitCopy: string | null;
  payLaterClickCount: Generated<number>;
  picture: string;
  preferredName: string;
  pseudoId: string | null;
  reasonRemoved: string | null;
  rol: "su" | null;
  sendSummaryEmail: Generated<boolean>;
  tier: Generated<"enterprise" | "starter" | "team">;
  tms: Generated<string[]>;
  trialStartDate: Timestamp | null;
  updatedAt: Generated<Timestamp>;
}

export interface DB {
  _migration: _Migration;
  _migrationLock: _MigrationLock;
  AgendaItem: AgendaItem;
  AtlassianAuth: AtlassianAuth;
  AzureDevOpsDimensionFieldMap: AzureDevOpsDimensionFieldMap;
  Comment: Comment;
  Discussion: Discussion;
  DomainJoinRequest: DomainJoinRequest;
  EmailVerification: EmailVerification;
  EmbeddingsJobQueue: EmbeddingsJobQueue;
  EmbeddingsMetadata: EmbeddingsMetadata;
  FailedAuthRequest: FailedAuthRequest;
  FeatureFlag: FeatureFlag;
  FeatureFlagOwner: FeatureFlagOwner;
  FreemailDomain: FreemailDomain;
  GitHubAuth: GitHubAuth;
  GitHubDimensionFieldMap: GitHubDimensionFieldMap;
  GitLabDimensionFieldMap: GitLabDimensionFieldMap;
  Insight: Insight;
  IntegrationProvider: IntegrationProvider;
  IntegrationSearchQuery: IntegrationSearchQuery;
  JiraDimensionFieldMap: JiraDimensionFieldMap;
  JiraServerDimensionFieldMap: JiraServerDimensionFieldMap;
  MassInvitation: MassInvitation;
  MeetingMember: MeetingMember;
  MeetingSeries: MeetingSeries;
  MeetingSettings: MeetingSettings;
  MeetingTemplate: MeetingTemplate;
  MeetingTemplateUserFavorite: MeetingTemplateUserFavorite;
  NewFeature: NewFeature;
  NewMeeting: NewMeeting;
  Notification: Notification;
  Organization: Organization;
  OrganizationApprovedDomain: OrganizationApprovedDomain;
  OrganizationUser: OrganizationUser;
  OrganizationUserAudit: OrganizationUserAudit;
  PasswordResetRequest: PasswordResetRequest;
  Poll: Poll;
  PollOption: PollOption;
  PushInvitation: PushInvitation;
  QueryMap: QueryMap;
  ReflectPrompt: ReflectPrompt;
  RetroReflection: RetroReflection;
  RetroReflectionGroup: RetroReflectionGroup;
  SAML: SAML;
  SAMLDomain: SAMLDomain;
  ScheduledJob: ScheduledJob;
  SlackAuth: SlackAuth;
  SlackNotification: SlackNotification;
  SuggestedAction: SuggestedAction;
  Task: Task;
  TaskEstimate: TaskEstimate;
  Team: Team;
  TeamInvitation: TeamInvitation;
  TeamMeetingTemplate: TeamMeetingTemplate;
  TeamMember: TeamMember;
  TeamMemberIntegrationAuth: TeamMemberIntegrationAuth;
  TeamPromptResponse: TeamPromptResponse;
  TemplateDimension: TemplateDimension;
  TemplateRef: TemplateRef;
  TemplateScale: TemplateScale;
  TemplateScaleRef: TemplateScaleRef;
  TemplateScaleValue: TemplateScaleValue;
  TimelineEvent: TimelineEvent;
  User: User;
}
