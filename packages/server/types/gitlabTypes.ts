// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * A `AlertManagementHttpIntegrationID` is a global ID. It is encoded as a string.
   *
   * An example `AlertManagementHttpIntegrationID` is: `"gid://gitlab/AlertManagement::HttpIntegration/1"`.
   */
  AlertManagementHttpIntegrationID: string;
  /**
   * A `AnalyticsDevopsAdoptionEnabledNamespaceID` is a global ID. It is encoded as a string.
   *
   * An example `AnalyticsDevopsAdoptionEnabledNamespaceID` is: `"gid://gitlab/Analytics::DevopsAdoption::EnabledNamespace/1"`.
   */
  AnalyticsDevopsAdoptionEnabledNamespaceID: string;
  /**
   * A `AuditEventsExternalAuditEventDestinationID` is a global ID. It is encoded as a string.
   *
   * An example `AuditEventsExternalAuditEventDestinationID` is: `"gid://gitlab/AuditEvents::ExternalAuditEventDestination/1"`.
   */
  AuditEventsExternalAuditEventDestinationID: string;
  /**
   * A `AwardableID` is a global ID. It is encoded as a string.
   *
   * An example `AwardableID` is: `"gid://gitlab/Awardable/1"`.
   */
  AwardableID: string;
  /**
   * Represents non-fractional signed whole numeric values. Since the value may
   * exceed the size of a 32-bit integer, it's encoded as a string.
   */
  BigInt: string;
  /**
   * A `BoardID` is a global ID. It is encoded as a string.
   *
   * An example `BoardID` is: `"gid://gitlab/Board/1"`.
   */
  BoardID: string;
  /**
   * A `BoardsEpicBoardID` is a global ID. It is encoded as a string.
   *
   * An example `BoardsEpicBoardID` is: `"gid://gitlab/Boards::EpicBoard/1"`.
   */
  BoardsEpicBoardID: string;
  /**
   * A `BoardsEpicListID` is a global ID. It is encoded as a string.
   *
   * An example `BoardsEpicListID` is: `"gid://gitlab/Boards::EpicList/1"`.
   */
  BoardsEpicListID: string;
  /**
   * A `CiBuildID` is a global ID. It is encoded as a string.
   *
   * An example `CiBuildID` is: `"gid://gitlab/Ci::Build/1"`.
   */
  CiBuildID: string;
  /**
   * A `CiPipelineID` is a global ID. It is encoded as a string.
   *
   * An example `CiPipelineID` is: `"gid://gitlab/Ci::Pipeline/1"`.
   */
  CiPipelineID: string;
  /**
   * A `CiRunnerID` is a global ID. It is encoded as a string.
   *
   * An example `CiRunnerID` is: `"gid://gitlab/Ci::Runner/1"`.
   */
  CiRunnerID: string;
  /**
   * A `ClustersAgentID` is a global ID. It is encoded as a string.
   *
   * An example `ClustersAgentID` is: `"gid://gitlab/Clusters::Agent/1"`.
   */
  ClustersAgentID: string;
  /**
   * A `ClustersAgentTokenID` is a global ID. It is encoded as a string.
   *
   * An example `ClustersAgentTokenID` is: `"gid://gitlab/Clusters::AgentToken/1"`.
   */
  ClustersAgentTokenID: string;
  /**
   * A `ClustersClusterID` is a global ID. It is encoded as a string.
   *
   * An example `ClustersClusterID` is: `"gid://gitlab/Clusters::Cluster/1"`.
   */
  ClustersClusterID: string;
  /**
   * A `ComplianceManagementFrameworkID` is a global ID. It is encoded as a string.
   *
   * An example `ComplianceManagementFrameworkID` is: `"gid://gitlab/ComplianceManagement::Framework/1"`.
   */
  ComplianceManagementFrameworkID: string;
  /**
   * A `ContainerRepositoryID` is a global ID. It is encoded as a string.
   *
   * An example `ContainerRepositoryID` is: `"gid://gitlab/ContainerRepository/1"`.
   */
  ContainerRepositoryID: string;
  /**
   * A `CustomEmojiID` is a global ID. It is encoded as a string.
   *
   * An example `CustomEmojiID` is: `"gid://gitlab/CustomEmoji/1"`.
   */
  CustomEmojiID: string;
  /**
   * A `CustomerRelationsContactID` is a global ID. It is encoded as a string.
   *
   * An example `CustomerRelationsContactID` is: `"gid://gitlab/CustomerRelations::Contact/1"`.
   */
  CustomerRelationsContactID: string;
  /**
   * A `CustomerRelationsOrganizationID` is a global ID. It is encoded as a string.
   *
   * An example `CustomerRelationsOrganizationID` is: `"gid://gitlab/CustomerRelations::Organization/1"`.
   */
  CustomerRelationsOrganizationID: string;
  /**
   * A `DastProfileID` is a global ID. It is encoded as a string.
   *
   * An example `DastProfileID` is: `"gid://gitlab/Dast::Profile/1"`.
   */
  DastProfileID: string;
  /**
   * A `DastProfileScheduleID` is a global ID. It is encoded as a string.
   *
   * An example `DastProfileScheduleID` is: `"gid://gitlab/Dast::ProfileSchedule/1"`.
   */
  DastProfileScheduleID: string;
  /**
   * A `DastScannerProfileID` is a global ID. It is encoded as a string.
   *
   * An example `DastScannerProfileID` is: `"gid://gitlab/DastScannerProfile/1"`.
   */
  DastScannerProfileID: string;
  /**
   * A `DastSiteProfileID` is a global ID. It is encoded as a string.
   *
   * An example `DastSiteProfileID` is: `"gid://gitlab/DastSiteProfile/1"`.
   */
  DastSiteProfileID: string;
  /**
   * A `DastSiteTokenID` is a global ID. It is encoded as a string.
   *
   * An example `DastSiteTokenID` is: `"gid://gitlab/DastSiteToken/1"`.
   */
  DastSiteTokenID: string;
  /**
   * A `DastSiteValidationID` is a global ID. It is encoded as a string.
   *
   * An example `DastSiteValidationID` is: `"gid://gitlab/DastSiteValidation/1"`.
   */
  DastSiteValidationID: string;
  /** Date represented in ISO 8601 */
  Date: string;
  /**
   * A `DesignManagementDesignAtVersionID` is a global ID. It is encoded as a string.
   *
   * An example `DesignManagementDesignAtVersionID` is: `"gid://gitlab/DesignManagement::DesignAtVersion/1"`.
   */
  DesignManagementDesignAtVersionID: string;
  /**
   * A `DesignManagementDesignID` is a global ID. It is encoded as a string.
   *
   * An example `DesignManagementDesignID` is: `"gid://gitlab/DesignManagement::Design/1"`.
   */
  DesignManagementDesignID: string;
  /**
   * A `DesignManagementVersionID` is a global ID. It is encoded as a string.
   *
   * An example `DesignManagementVersionID` is: `"gid://gitlab/DesignManagement::Version/1"`.
   */
  DesignManagementVersionID: string;
  /**
   * A `DiffNoteID` is a global ID. It is encoded as a string.
   *
   * An example `DiffNoteID` is: `"gid://gitlab/DiffNote/1"`.
   */
  DiffNoteID: string;
  /**
   * A `DiscussionID` is a global ID. It is encoded as a string.
   *
   * An example `DiscussionID` is: `"gid://gitlab/Discussion/1"`.
   */
  DiscussionID: string;
  /**
   * Duration between two instants, represented as a fractional number of seconds.
   *
   * For example: 12.3334
   */
  Duration: string;
  /**
   * A `EnvironmentID` is a global ID. It is encoded as a string.
   *
   * An example `EnvironmentID` is: `"gid://gitlab/Environment/1"`.
   */
  EnvironmentID: string;
  /**
   * A `EpicID` is a global ID. It is encoded as a string.
   *
   * An example `EpicID` is: `"gid://gitlab/Epic/1"`.
   */
  EpicID: string;
  /**
   * A `EpicTreeSortingID` is a global ID. It is encoded as a string.
   *
   * An example `EpicTreeSortingID` is: `"gid://gitlab/EpicTreeSorting/1"`.
   */
  EpicTreeSortingID: string;
  /**
   * A `GitlabErrorTrackingDetailedErrorID` is a global ID. It is encoded as a string.
   *
   * An example `GitlabErrorTrackingDetailedErrorID` is: `"gid://gitlab/Gitlab::ErrorTracking::DetailedError/1"`.
   */
  GitlabErrorTrackingDetailedErrorID: string;
  /**
   * A global identifier.
   *
   * A global identifier represents an object uniquely across the application.
   * An example of such an identifier is `"gid://gitlab/User/1"`.
   *
   * Global identifiers are encoded as strings.
   */
  GlobalID: string;
  /**
   * A `GroupID` is a global ID. It is encoded as a string.
   *
   * An example `GroupID` is: `"gid://gitlab/Group/1"`.
   */
  GroupID: string;
  /** An ISO 8601-encoded date */
  ISO8601Date: string;
  /**
   * A `IncidentManagementEscalationPolicyID` is a global ID. It is encoded as a string.
   *
   * An example `IncidentManagementEscalationPolicyID` is: `"gid://gitlab/IncidentManagement::EscalationPolicy/1"`.
   */
  IncidentManagementEscalationPolicyID: string;
  /**
   * A `IncidentManagementEscalationRuleID` is a global ID. It is encoded as a string.
   *
   * An example `IncidentManagementEscalationRuleID` is: `"gid://gitlab/IncidentManagement::EscalationRule/1"`.
   */
  IncidentManagementEscalationRuleID: string;
  /**
   * A `IncidentManagementOncallParticipantID` is a global ID. It is encoded as a string.
   *
   * An example `IncidentManagementOncallParticipantID` is: `"gid://gitlab/IncidentManagement::OncallParticipant/1"`.
   */
  IncidentManagementOncallParticipantID: string;
  /**
   * A `IncidentManagementOncallRotationID` is a global ID. It is encoded as a string.
   *
   * An example `IncidentManagementOncallRotationID` is: `"gid://gitlab/IncidentManagement::OncallRotation/1"`.
   */
  IncidentManagementOncallRotationID: string;
  /**
   * A `IntegrationsPrometheusID` is a global ID. It is encoded as a string.
   *
   * An example `IntegrationsPrometheusID` is: `"gid://gitlab/Integrations::Prometheus/1"`.
   * The older format `"gid://gitlab/PrometheusService/1"` was deprecated in 14.1.
   */
  IntegrationsPrometheusID: string;
  /**
   * A `IssuableID` is a global ID. It is encoded as a string.
   *
   * An example `IssuableID` is: `"gid://gitlab/Issuable/1"`.
   */
  IssuableID: string;
  /**
   * A `IssueID` is a global ID. It is encoded as a string.
   *
   * An example `IssueID` is: `"gid://gitlab/Issue/1"`.
   */
  IssueID: string;
  /**
   * A `IterationID` is a global ID. It is encoded as a string.
   *
   * An example `IterationID` is: `"gid://gitlab/Iteration/1"`.
   * The older format `"gid://gitlab/EEIteration/1"` was deprecated in 13.3.
   */
  IterationID: string;
  /**
   * A `IterationsCadenceID` is a global ID. It is encoded as a string.
   *
   * An example `IterationsCadenceID` is: `"gid://gitlab/Iterations::Cadence/1"`.
   */
  IterationsCadenceID: string;
  /** Represents untyped JSON */
  JSON: string;
  /**
   * A `CommitStatusID` is a global ID. It is encoded as a string.
   *
   * An example `CommitStatusID` is: `"gid://gitlab/CommitStatus/1"`.
   */
  JobID: string;
  /** JSON object as raw string */
  JsonString: string;
  /**
   * A `LabelID` is a global ID. It is encoded as a string.
   *
   * An example `LabelID` is: `"gid://gitlab/Label/1"`.
   */
  LabelID: string;
  /**
   * A `ListID` is a global ID. It is encoded as a string.
   *
   * An example `ListID` is: `"gid://gitlab/List/1"`.
   */
  ListID: string;
  /**
   * A `MergeRequestID` is a global ID. It is encoded as a string.
   *
   * An example `MergeRequestID` is: `"gid://gitlab/MergeRequest/1"`.
   */
  MergeRequestID: string;
  /**
   * A `MetricsDashboardAnnotationID` is a global ID. It is encoded as a string.
   *
   * An example `MetricsDashboardAnnotationID` is: `"gid://gitlab/Metrics::Dashboard::Annotation/1"`.
   */
  MetricsDashboardAnnotationID: string;
  /**
   * A `MilestoneID` is a global ID. It is encoded as a string.
   *
   * An example `MilestoneID` is: `"gid://gitlab/Milestone/1"`.
   */
  MilestoneID: string;
  /**
   * A `NamespaceID` is a global ID. It is encoded as a string.
   *
   * An example `NamespaceID` is: `"gid://gitlab/Namespace/1"`.
   */
  NamespaceID: string;
  /**
   * A `NoteID` is a global ID. It is encoded as a string.
   *
   * An example `NoteID` is: `"gid://gitlab/Note/1"`.
   */
  NoteID: string;
  /**
   * A `NoteableID` is a global ID. It is encoded as a string.
   *
   * An example `NoteableID` is: `"gid://gitlab/Noteable/1"`.
   */
  NoteableID: string;
  /**
   * A `PackagesConanFileMetadatumID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesConanFileMetadatumID` is: `"gid://gitlab/Packages::Conan::FileMetadatum/1"`.
   */
  PackagesConanFileMetadatumID: string;
  /**
   * A `PackagesConanMetadatumID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesConanMetadatumID` is: `"gid://gitlab/Packages::Conan::Metadatum/1"`.
   */
  PackagesConanMetadatumID: string;
  /**
   * A `PackagesDependencyID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesDependencyID` is: `"gid://gitlab/Packages::Dependency/1"`.
   */
  PackagesDependencyID: string;
  /**
   * A `PackagesDependencyLinkID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesDependencyLinkID` is: `"gid://gitlab/Packages::DependencyLink/1"`.
   */
  PackagesDependencyLinkID: string;
  /**
   * A `PackagesMavenMetadatumID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesMavenMetadatumID` is: `"gid://gitlab/Packages::Maven::Metadatum/1"`.
   */
  PackagesMavenMetadatumID: string;
  /**
   * A `PackagesNugetDependencyLinkMetadatumID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesNugetDependencyLinkMetadatumID` is: `"gid://gitlab/Packages::Nuget::DependencyLinkMetadatum/1"`.
   */
  PackagesNugetDependencyLinkMetadatumID: string;
  /**
   * A `PackagesNugetMetadatumID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesNugetMetadatumID` is: `"gid://gitlab/Packages::Nuget::Metadatum/1"`.
   */
  PackagesNugetMetadatumID: string;
  /**
   * A `PackagesPackageFileID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesPackageFileID` is: `"gid://gitlab/Packages::PackageFile/1"`.
   */
  PackagesPackageFileID: string;
  /**
   * A `PackagesPackageID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesPackageID` is: `"gid://gitlab/Packages::Package/1"`.
   */
  PackagesPackageID: string;
  /**
   * A `PackagesPypiMetadatumID` is a global ID. It is encoded as a string.
   *
   * An example `PackagesPypiMetadatumID` is: `"gid://gitlab/Packages::Pypi::Metadatum/1"`.
   */
  PackagesPypiMetadatumID: string;
  /**
   * A `PathLockID` is a global ID. It is encoded as a string.
   *
   * An example `PathLockID` is: `"gid://gitlab/PathLock/1"`.
   */
  PathLockID: string;
  /** String or integer. */
  PayloadAlertFieldPathSegment: string;
  /**
   * A `ProjectID` is a global ID. It is encoded as a string.
   *
   * An example `ProjectID` is: `"gid://gitlab/Project/1"`.
   */
  ProjectID: string;
  /**
   * A `ReleasesLinkID` is a global ID. It is encoded as a string.
   *
   * An example `ReleasesLinkID` is: `"gid://gitlab/Releases::Link/1"`.
   */
  ReleasesLinkID: string;
  /**
   * A `SnippetID` is a global ID. It is encoded as a string.
   *
   * An example `SnippetID` is: `"gid://gitlab/Snippet/1"`.
   */
  SnippetID: string;
  /**
   * A `TerraformStateID` is a global ID. It is encoded as a string.
   *
   * An example `TerraformStateID` is: `"gid://gitlab/Terraform::State/1"`.
   */
  TerraformStateID: string;
  /**
   * Time represented in ISO 8601.
   *
   * For example: "2021-03-09T14:58:50+00:00".
   *
   * See `https://www.iso.org/iso-8601-date-and-time-format.html`.
   */
  Time: string;
  /**
   * A `TodoID` is a global ID. It is encoded as a string.
   *
   * An example `TodoID` is: `"gid://gitlab/Todo/1"`.
   */
  TodoID: string;
  /**
   * A `TodoableID` is a global ID. It is encoded as a string.
   *
   * An example `TodoableID` is: `"gid://gitlab/Todoable/1"`.
   */
  TodoableID: string;
  /** A regexp containing patterns sourced from user input */
  UntrustedRegexp: string;
  Upload: string;
  /**
   * A `UserID` is a global ID. It is encoded as a string.
   *
   * An example `UserID` is: `"gid://gitlab/User/1"`.
   */
  UserID: string;
  /**
   * A `VulnerabilitiesExternalIssueLinkID` is a global ID. It is encoded as a string.
   *
   * An example `VulnerabilitiesExternalIssueLinkID` is: `"gid://gitlab/Vulnerabilities::ExternalIssueLink/1"`.
   */
  VulnerabilitiesExternalIssueLinkID: string;
  /**
   * A `VulnerabilitiesScannerID` is a global ID. It is encoded as a string.
   *
   * An example `VulnerabilitiesScannerID` is: `"gid://gitlab/Vulnerabilities::Scanner/1"`.
   */
  VulnerabilitiesScannerID: string;
  /**
   * A `VulnerabilityID` is a global ID. It is encoded as a string.
   *
   * An example `VulnerabilityID` is: `"gid://gitlab/Vulnerability/1"`.
   */
  VulnerabilityID: string;
};

/** Represents the access level of a relationship between a User and object that it is related to */
export type AccessLevel = {
  __typename?: 'AccessLevel';
  /** Integer representation of access level. */
  integerValue?: Maybe<Scalars['Int']>;
  /** String representation of access level. */
  stringValue?: Maybe<AccessLevelEnum>;
};

/** Access level to a resource */
export type AccessLevelEnum =
  /** Developer access. */
  | 'DEVELOPER'
  /** Guest access. */
  | 'GUEST'
  /** Maintainer access. */
  | 'MAINTAINER'
  /** Minimal access. */
  | 'MINIMAL_ACCESS'
  /** No access. */
  | 'NO_ACCESS'
  /** Owner access. */
  | 'OWNER'
  /** Reporter access. */
  | 'REPORTER';

/** Autogenerated input type of AddProjectToSecurityDashboard */
export type AddProjectToSecurityDashboardInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the project to be added to Instance Security Dashboard. */
  id: Scalars['ProjectID'];
};

/** Autogenerated return type of AddProjectToSecurityDashboard */
export type AddProjectToSecurityDashboardPayload = {
  __typename?: 'AddProjectToSecurityDashboardPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Project that was added to the Instance Security Dashboard. */
  project?: Maybe<Project>;
};

/** Autogenerated input type of AdminSidekiqQueuesDeleteJobs */
export type AdminSidekiqQueuesDeleteJobsInput = {
  /** Delete jobs matching caller_id in the context metadata. */
  callerId?: InputMaybe<Scalars['String']>;
  /** Delete jobs matching client_id in the context metadata. */
  clientId?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Delete jobs matching feature_category in the context metadata. */
  featureCategory?: InputMaybe<Scalars['String']>;
  /** Delete jobs matching project in the context metadata. */
  project?: InputMaybe<Scalars['String']>;
  /** Name of the queue to delete jobs from. */
  queueName: Scalars['String'];
  /** Delete jobs matching related_class in the context metadata. */
  relatedClass?: InputMaybe<Scalars['String']>;
  /** Delete jobs matching remote_ip in the context metadata. */
  remoteIp?: InputMaybe<Scalars['String']>;
  /** Delete jobs matching root_namespace in the context metadata. */
  rootNamespace?: InputMaybe<Scalars['String']>;
  /** Delete jobs matching subscription_plan in the context metadata. */
  subscriptionPlan?: InputMaybe<Scalars['String']>;
  /** Delete jobs matching user in the context metadata. */
  user?: InputMaybe<Scalars['String']>;
  /** Delete jobs with the given worker class. */
  workerClass?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of AdminSidekiqQueuesDeleteJobs */
export type AdminSidekiqQueuesDeleteJobsPayload = {
  __typename?: 'AdminSidekiqQueuesDeleteJobsPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Information about the status of the deletion request. */
  result?: Maybe<DeleteJobsResponse>;
};

/** Configuration details for an Agent */
export type AgentConfiguration = {
  __typename?: 'AgentConfiguration';
  /** Name of the agent. */
  agentName?: Maybe<Scalars['String']>;
};

/** The connection type for AgentConfiguration. */
export type AgentConfigurationConnection = {
  __typename?: 'AgentConfigurationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AgentConfigurationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<AgentConfiguration>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type AgentConfigurationEdge = {
  __typename?: 'AgentConfigurationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<AgentConfiguration>;
};

/** Information about a connected Agent */
export type AgentMetadata = {
  __typename?: 'AgentMetadata';
  /** Agent version commit. */
  commit?: Maybe<Scalars['String']>;
  /** Name of the pod running the Agent. */
  podName?: Maybe<Scalars['String']>;
  /** Namespace of the pod running the Agent. */
  podNamespace?: Maybe<Scalars['String']>;
  /** Agent version tag. */
  version?: Maybe<Scalars['String']>;
};

/** Describes an alert from the project's Alert Management */
export type AlertManagementAlert = NoteableInterface & {
  __typename?: 'AlertManagementAlert';
  /** Assignees of the alert. */
  assignees?: Maybe<UserCoreConnection>;
  /** Timestamp the alert was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** Description of the alert. */
  description?: Maybe<Scalars['String']>;
  /** Alert details. */
  details?: Maybe<Scalars['JSON']>;
  /** URL of the alert detail page. */
  detailsUrl: Scalars['String'];
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** Timestamp the alert ended. */
  endedAt?: Maybe<Scalars['Time']>;
  /** Environment for the alert. */
  environment?: Maybe<Environment>;
  /** Number of events of this alert. */
  eventCount?: Maybe<Scalars['Int']>;
  /** List of hosts the alert came from. */
  hosts?: Maybe<Array<Scalars['String']>>;
  /** Internal ID of the alert. */
  iid: Scalars['ID'];
  /** Issue attached to the alert. */
  issue?: Maybe<Issue>;
  /**
   * Internal ID of the GitLab issue attached to the alert. Deprecated in 13.10: Use issue field.
   * @deprecated Use issue field. Deprecated in 13.10.
   */
  issueIid?: Maybe<Scalars['ID']>;
  /** URL for metrics embed for the alert. */
  metricsDashboardUrl?: Maybe<Scalars['String']>;
  /** Monitoring tool the alert came from. */
  monitoringTool?: Maybe<Scalars['String']>;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** Alert condition for Prometheus. */
  prometheusAlert?: Maybe<PrometheusAlert>;
  /** Runbook for the alert as defined in alert details. */
  runbook?: Maybe<Scalars['String']>;
  /** Service the alert came from. */
  service?: Maybe<Scalars['String']>;
  /** Severity of the alert. */
  severity?: Maybe<AlertManagementSeverity>;
  /** Timestamp the alert was raised. */
  startedAt?: Maybe<Scalars['Time']>;
  /** Status of the alert. */
  status?: Maybe<AlertManagementStatus>;
  /** Title of the alert. */
  title?: Maybe<Scalars['String']>;
  /** To-do items of the current user for the alert. */
  todos?: Maybe<TodoConnection>;
  /** Timestamp the alert was last updated. */
  updatedAt?: Maybe<Scalars['Time']>;
};


/** Describes an alert from the project's Alert Management */
export type AlertManagementAlertAssigneesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Describes an alert from the project's Alert Management */
export type AlertManagementAlertDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Describes an alert from the project's Alert Management */
export type AlertManagementAlertNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Describes an alert from the project's Alert Management */
export type AlertManagementAlertTodosArgs = {
  action?: InputMaybe<Array<TodoActionEnum>>;
  after?: InputMaybe<Scalars['String']>;
  authorId?: InputMaybe<Array<Scalars['ID']>>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  state?: InputMaybe<Array<TodoStateEnum>>;
  type?: InputMaybe<Array<TodoTargetEnum>>;
};

/** The connection type for AlertManagementAlert. */
export type AlertManagementAlertConnection = {
  __typename?: 'AlertManagementAlertConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AlertManagementAlertEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<AlertManagementAlert>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type AlertManagementAlertEdge = {
  __typename?: 'AlertManagementAlertEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<AlertManagementAlert>;
};

/** Values for sorting alerts */
export type AlertManagementAlertSort =
  /** Created at ascending order. */
  | 'CREATED_ASC'
  /** Created at descending order. */
  | 'CREATED_DESC'
  /** Created time by ascending order. */
  | 'CREATED_TIME_ASC'
  /** Created time by descending order. */
  | 'CREATED_TIME_DESC'
  /** End time by ascending order. */
  | 'ENDED_AT_ASC'
  /** End time by descending order. */
  | 'ENDED_AT_DESC'
  /** Events count by ascending order. */
  | 'EVENT_COUNT_ASC'
  /** Events count by descending order. */
  | 'EVENT_COUNT_DESC'
  /** Severity from less critical to more critical. */
  | 'SEVERITY_ASC'
  /** Severity from more critical to less critical. */
  | 'SEVERITY_DESC'
  /** Start time by ascending order. */
  | 'STARTED_AT_ASC'
  /** Start time by descending order. */
  | 'STARTED_AT_DESC'
  /** Status by order: `Ignored > Resolved > Acknowledged > Triggered`. */
  | 'STATUS_ASC'
  /** Status by order: `Triggered > Acknowledged > Resolved > Ignored`. */
  | 'STATUS_DESC'
  /** Updated at ascending order. */
  | 'UPDATED_ASC'
  /** Updated at descending order. */
  | 'UPDATED_DESC'
  /** Created time by ascending order. */
  | 'UPDATED_TIME_ASC'
  /** Created time by descending order. */
  | 'UPDATED_TIME_DESC'
  /** Created at ascending order. */
  | 'created_asc'
  /** Created at descending order. */
  | 'created_desc'
  /** Updated at ascending order. */
  | 'updated_asc'
  /** Updated at descending order. */
  | 'updated_desc';

/** Represents total number of alerts for the represented categories */
export type AlertManagementAlertStatusCountsType = {
  __typename?: 'AlertManagementAlertStatusCountsType';
  /** Number of alerts with status ACKNOWLEDGED for the project */
  acknowledged?: Maybe<Scalars['Int']>;
  /** Total number of alerts for the project. */
  all?: Maybe<Scalars['Int']>;
  /** Number of alerts with status IGNORED for the project */
  ignored?: Maybe<Scalars['Int']>;
  /** Number of alerts with status TRIGGERED or ACKNOWLEDGED for the project. */
  open?: Maybe<Scalars['Int']>;
  /** Number of alerts with status RESOLVED for the project */
  resolved?: Maybe<Scalars['Int']>;
  /** Number of alerts with status TRIGGERED for the project */
  triggered?: Maybe<Scalars['Int']>;
};

/** Filters the alerts based on given domain */
export type AlertManagementDomainFilter =
  /** Alerts for operations domain. */
  | 'operations'
  /** Alerts for threat monitoring domain. */
  | 'threat_monitoring';

/** An endpoint and credentials used to accept alerts for a project */
export type AlertManagementHttpIntegration = AlertManagementIntegration & {
  __typename?: 'AlertManagementHttpIntegration';
  /** Whether the endpoint is currently accepting alerts. */
  active?: Maybe<Scalars['Boolean']>;
  /** URL at which Prometheus metrics can be queried to populate the metrics dashboard. */
  apiUrl?: Maybe<Scalars['String']>;
  /** ID of the integration. */
  id: Scalars['ID'];
  /** Name of the integration. */
  name?: Maybe<Scalars['String']>;
  /** Extract alert fields from payload example for custom mapping. */
  payloadAlertFields?: Maybe<Array<AlertManagementPayloadAlertField>>;
  /** The custom mapping of GitLab alert attributes to fields from the payload_example. */
  payloadAttributeMappings?: Maybe<Array<AlertManagementPayloadAlertMappingField>>;
  /** Example of an alert payload. */
  payloadExample?: Maybe<Scalars['JsonString']>;
  /** Token used to authenticate alert notification requests. */
  token?: Maybe<Scalars['String']>;
  /** Type of integration. */
  type: AlertManagementIntegrationType;
  /** Endpoint which accepts alert notifications. */
  url?: Maybe<Scalars['String']>;
};

/** The connection type for AlertManagementHttpIntegration. */
export type AlertManagementHttpIntegrationConnection = {
  __typename?: 'AlertManagementHttpIntegrationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AlertManagementHttpIntegrationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<AlertManagementHttpIntegration>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type AlertManagementHttpIntegrationEdge = {
  __typename?: 'AlertManagementHttpIntegrationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<AlertManagementHttpIntegration>;
};

export type AlertManagementIntegration = {
  /** Whether the endpoint is currently accepting alerts. */
  active?: Maybe<Scalars['Boolean']>;
  /** URL at which Prometheus metrics can be queried to populate the metrics dashboard. */
  apiUrl?: Maybe<Scalars['String']>;
  /** ID of the integration. */
  id: Scalars['ID'];
  /** Name of the integration. */
  name?: Maybe<Scalars['String']>;
  /** Token used to authenticate alert notification requests. */
  token?: Maybe<Scalars['String']>;
  /** Type of integration. */
  type: AlertManagementIntegrationType;
  /** Endpoint which accepts alert notifications. */
  url?: Maybe<Scalars['String']>;
};

/** The connection type for AlertManagementIntegration. */
export type AlertManagementIntegrationConnection = {
  __typename?: 'AlertManagementIntegrationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AlertManagementIntegrationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<AlertManagementIntegration>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type AlertManagementIntegrationEdge = {
  __typename?: 'AlertManagementIntegrationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<AlertManagementIntegration>;
};

/** Values of types of integrations */
export type AlertManagementIntegrationType =
  /** Integration with any monitoring tool. */
  | 'HTTP'
  /** Prometheus integration. */
  | 'PROMETHEUS';

/** Parsed field from an alert used for custom mappings */
export type AlertManagementPayloadAlertField = {
  __typename?: 'AlertManagementPayloadAlertField';
  /** Human-readable label of the payload path. */
  label?: Maybe<Scalars['String']>;
  /** Path to value inside payload JSON. */
  path?: Maybe<Array<Scalars['PayloadAlertFieldPathSegment']>>;
  /** Type of the parsed value. */
  type?: Maybe<AlertManagementPayloadAlertFieldType>;
};

/** Field that are available while modifying the custom mapping attributes for an HTTP integration */
export type AlertManagementPayloadAlertFieldInput = {
  /** GitLab alert field name. */
  fieldName: AlertManagementPayloadAlertFieldName;
  /** Human-readable label of the payload path. */
  label?: InputMaybe<Scalars['String']>;
  /** Path to value inside payload JSON. */
  path: Array<Scalars['PayloadAlertFieldPathSegment']>;
  /** Type of the parsed value. */
  type: AlertManagementPayloadAlertFieldType;
};

/** Values for alert field names used in the custom mapping */
export type AlertManagementPayloadAlertFieldName =
  /** A high-level summary of the problem. */
  | 'DESCRIPTION'
  /** The resolved time of the incident. */
  | 'END_TIME'
  /** The unique identifier of the alert. This can be used to group occurrences of the same alert. */
  | 'FINGERPRINT'
  /** The name of the associated GitLab environment. */
  | 'GITLAB_ENVIRONMENT_NAME'
  /** One or more hosts, as to where this incident occurred. */
  | 'HOSTS'
  /** The name of the associated monitoring tool. */
  | 'MONITORING_TOOL'
  /** The affected service. */
  | 'SERVICE'
  /** The severity of the alert. */
  | 'SEVERITY'
  /** The time of the incident. */
  | 'START_TIME'
  /** The title of the incident. */
  | 'TITLE';

/** Values for alert field types used in the custom mapping */
export type AlertManagementPayloadAlertFieldType =
  /** Array field type. */
  | 'ARRAY'
  /** DateTime field type. */
  | 'DATETIME'
  /** String field type. */
  | 'STRING';

/** Parsed field (with its name) from an alert used for custom mappings */
export type AlertManagementPayloadAlertMappingField = {
  __typename?: 'AlertManagementPayloadAlertMappingField';
  /** GitLab alert field name. */
  fieldName?: Maybe<AlertManagementPayloadAlertFieldName>;
  /** Human-readable label of the payload path. */
  label?: Maybe<Scalars['String']>;
  /** Path to value inside payload JSON. */
  path?: Maybe<Array<Scalars['PayloadAlertFieldPathSegment']>>;
  /** Type of the parsed value. */
  type?: Maybe<AlertManagementPayloadAlertFieldType>;
};

/** An endpoint and credentials used to accept Prometheus alerts for a project */
export type AlertManagementPrometheusIntegration = AlertManagementIntegration & {
  __typename?: 'AlertManagementPrometheusIntegration';
  /** Whether the endpoint is currently accepting alerts. */
  active?: Maybe<Scalars['Boolean']>;
  /** URL at which Prometheus metrics can be queried to populate the metrics dashboard. */
  apiUrl?: Maybe<Scalars['String']>;
  /** ID of the integration. */
  id: Scalars['ID'];
  /** Name of the integration. */
  name?: Maybe<Scalars['String']>;
  /** Token used to authenticate alert notification requests. */
  token?: Maybe<Scalars['String']>;
  /** Type of integration. */
  type: AlertManagementIntegrationType;
  /** Endpoint which accepts alert notifications. */
  url?: Maybe<Scalars['String']>;
};

/** Alert severity values */
export type AlertManagementSeverity =
  /** Critical severity */
  | 'CRITICAL'
  /** High severity */
  | 'HIGH'
  /** Info severity */
  | 'INFO'
  /** Low severity */
  | 'LOW'
  /** Medium severity */
  | 'MEDIUM'
  /** Unknown severity */
  | 'UNKNOWN';

/** Alert status values */
export type AlertManagementStatus =
  /** Someone is actively investigating the problem. */
  | 'ACKNOWLEDGED'
  /** No action will be taken. */
  | 'IGNORED'
  /** The problem has been addressed. */
  | 'RESOLVED'
  /** Investigation has not started. */
  | 'TRIGGERED';

/** Autogenerated input type of AlertSetAssignees */
export type AlertSetAssigneesInput = {
  /** Usernames to assign to the alert. Replaces existing assignees by default. */
  assigneeUsernames: Array<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the alert to mutate. */
  iid: Scalars['String'];
  /** Operation to perform. Defaults to REPLACE. */
  operationMode?: InputMaybe<MutationOperationMode>;
  /** Project the alert to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of AlertSetAssignees */
export type AlertSetAssigneesPayload = {
  __typename?: 'AlertSetAssigneesPayload';
  /** Alert after mutation. */
  alert?: Maybe<AlertManagementAlert>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue created after mutation. */
  issue?: Maybe<Issue>;
  /** To-do item after mutation. */
  todo?: Maybe<Todo>;
};

/** Autogenerated input type of AlertTodoCreate */
export type AlertTodoCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the alert to mutate. */
  iid: Scalars['String'];
  /** Project the alert to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of AlertTodoCreate */
export type AlertTodoCreatePayload = {
  __typename?: 'AlertTodoCreatePayload';
  /** Alert after mutation. */
  alert?: Maybe<AlertManagementAlert>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue created after mutation. */
  issue?: Maybe<Issue>;
  /** To-do item after mutation. */
  todo?: Maybe<Todo>;
};

/** Data associated with configuring API fuzzing scans in GitLab CI */
export type ApiFuzzingCiConfiguration = {
  __typename?: 'ApiFuzzingCiConfiguration';
  /** All available scan modes. */
  scanModes?: Maybe<Array<ApiFuzzingScanMode>>;
  /** All default scan profiles. */
  scanProfiles?: Maybe<Array<ApiFuzzingScanProfile>>;
};

/** Autogenerated input type of ApiFuzzingCiConfigurationCreate */
export type ApiFuzzingCiConfigurationCreateInput = {
  /**
   * File path or URL to the file that defines the API surface for scanning. Must
   * be in the format specified by the `scanMode` argument.
   */
  apiSpecificationFile: Scalars['String'];
  /** CI variable containing the password for authenticating with the target API. */
  authPassword?: InputMaybe<Scalars['String']>;
  /** CI variable containing the username for authenticating with the target API. */
  authUsername?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the project. */
  projectPath: Scalars['ID'];
  /** Mode for API fuzzing scans. */
  scanMode: ApiFuzzingScanMode;
  /** Name of a default profile to use for scanning. Ex: Quick-10. */
  scanProfile?: InputMaybe<Scalars['String']>;
  /** URL for the target of API fuzzing scans. */
  target: Scalars['String'];
};

/** Autogenerated return type of ApiFuzzingCiConfigurationCreate */
export type ApiFuzzingCiConfigurationCreatePayload = {
  __typename?: 'ApiFuzzingCiConfigurationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** A YAML snippet that can be inserted into the project's `.gitlab-ci.yml` to set up API fuzzing scans. */
  configurationYaml?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Location at which the project's `.gitlab-ci.yml` file can be edited in the browser. */
  gitlabCiYamlEditPath?: Maybe<Scalars['String']>;
};

/** All possible ways to specify the API surface for an API fuzzing scan. */
export type ApiFuzzingScanMode =
  /** The API surface is specified by a HAR file. */
  | 'HAR'
  /** The API surface is specified by a OPENAPI file. */
  | 'OPENAPI'
  /** The API surface is specified by a POSTMAN file. */
  | 'POSTMAN';

/** An API Fuzzing scan profile. */
export type ApiFuzzingScanProfile = {
  __typename?: 'ApiFuzzingScanProfile';
  /** Short description of the profile. */
  description?: Maybe<Scalars['String']>;
  /** Unique name of the profile. */
  name?: Maybe<Scalars['String']>;
  /** Syntax highlighted HTML representation of the YAML. */
  yaml?: Maybe<Scalars['String']>;
};

/** Describes a rule for who can approve merge requests. */
export type ApprovalRule = {
  __typename?: 'ApprovalRule';
  /** Number of required approvals. */
  approvalsRequired?: Maybe<Scalars['Int']>;
  /** Indicates if the rule is satisfied. */
  approved?: Maybe<Scalars['Boolean']>;
  /** List of users defined in the rule that approved the merge request. */
  approvedBy?: Maybe<UserCoreConnection>;
  /** Indicates if the rule contains approvers from a hidden group. */
  containsHiddenGroups?: Maybe<Scalars['Boolean']>;
  /** List of all users eligible to approve the merge request (defined explicitly and from associated groups). */
  eligibleApprovers?: Maybe<Array<UserCore>>;
  /** List of groups added as approvers for the rule. */
  groups?: Maybe<GroupConnection>;
  /** ID of the rule. */
  id: Scalars['GlobalID'];
  /** Name of the rule. */
  name?: Maybe<Scalars['String']>;
  /** Indicates if the rule was overridden for the merge request. */
  overridden?: Maybe<Scalars['Boolean']>;
  /** Named section of the Code Owners file that the rule applies to. */
  section?: Maybe<Scalars['String']>;
  /** Source rule used to create the rule. */
  sourceRule?: Maybe<ApprovalRule>;
  /** Type of the rule. */
  type?: Maybe<ApprovalRuleType>;
  /** List of users added as approvers for the rule. */
  users?: Maybe<UserCoreConnection>;
};


/** Describes a rule for who can approve merge requests. */
export type ApprovalRuleApprovedByArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Describes a rule for who can approve merge requests. */
export type ApprovalRuleGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Describes a rule for who can approve merge requests. */
export type ApprovalRuleUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The kind of an approval rule. */
export type ApprovalRuleType =
  /** A `any_approver` approval rule. */
  | 'ANY_APPROVER'
  /** A `code_owner` approval rule. */
  | 'CODE_OWNER'
  /** A `regular` approval rule. */
  | 'REGULAR'
  /** A `report_approver` approval rule. */
  | 'REPORT_APPROVER';

/** Assignee ID wildcard values */
export type AssigneeWildcardId =
  /** An assignee is assigned. */
  | 'ANY'
  /** No assignee is assigned. */
  | 'NONE';

/** User availability status */
export type AvailabilityEnum =
  /** Busy */
  | 'BUSY'
  /** Not Set */
  | 'NOT_SET';

/** An emoji awarded by a user */
export type AwardEmoji = {
  __typename?: 'AwardEmoji';
  /** Emoji description. */
  description: Scalars['String'];
  /** Emoji as an icon. */
  emoji: Scalars['String'];
  /** Emoji name. */
  name: Scalars['String'];
  /** Emoji in Unicode. */
  unicode: Scalars['String'];
  /** Unicode version for this emoji. */
  unicodeVersion: Scalars['String'];
  /** User who awarded the emoji. */
  user: UserCore;
};

/** Autogenerated input type of AwardEmojiAdd */
export type AwardEmojiAddInput = {
  /** Global ID of the awardable resource. */
  awardableId: Scalars['AwardableID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Emoji name. */
  name: Scalars['String'];
};

/** Autogenerated return type of AwardEmojiAdd */
export type AwardEmojiAddPayload = {
  __typename?: 'AwardEmojiAddPayload';
  /** Award emoji after mutation. */
  awardEmoji?: Maybe<AwardEmoji>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** The connection type for AwardEmoji. */
export type AwardEmojiConnection = {
  __typename?: 'AwardEmojiConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<AwardEmojiEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<AwardEmoji>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type AwardEmojiEdge = {
  __typename?: 'AwardEmojiEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<AwardEmoji>;
};

/** Autogenerated input type of AwardEmojiRemove */
export type AwardEmojiRemoveInput = {
  /** Global ID of the awardable resource. */
  awardableId: Scalars['AwardableID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Emoji name. */
  name: Scalars['String'];
};

/** Autogenerated return type of AwardEmojiRemove */
export type AwardEmojiRemovePayload = {
  __typename?: 'AwardEmojiRemovePayload';
  /** Award emoji after mutation. */
  awardEmoji?: Maybe<AwardEmoji>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of AwardEmojiToggle */
export type AwardEmojiToggleInput = {
  /** Global ID of the awardable resource. */
  awardableId: Scalars['AwardableID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Emoji name. */
  name: Scalars['String'];
};

/** Autogenerated return type of AwardEmojiToggle */
export type AwardEmojiTogglePayload = {
  __typename?: 'AwardEmojiTogglePayload';
  /** Award emoji after mutation. */
  awardEmoji?: Maybe<AwardEmoji>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Indicates the status of the emoji. True if the toggle awarded the emoji, and false if the toggle removed the emoji. */
  toggledOn: Scalars['Boolean'];
};

export type BaseService = Service & {
  __typename?: 'BaseService';
  /** Indicates if the service is active. */
  active?: Maybe<Scalars['Boolean']>;
  /** Class name of the service. */
  type?: Maybe<Scalars['String']>;
};

export type Blob = Entry & {
  __typename?: 'Blob';
  /** Flat path of the entry. */
  flatPath: Scalars['String'];
  /** ID of the entry. */
  id: Scalars['ID'];
  /** LFS ID of the blob. */
  lfsOid?: Maybe<Scalars['String']>;
  /** Blob mode in numeric format. */
  mode?: Maybe<Scalars['String']>;
  /** Name of the entry. */
  name: Scalars['String'];
  /** Path of the entry. */
  path: Scalars['String'];
  /** Last commit SHA for the entry. */
  sha: Scalars['String'];
  /** Type of tree entry. */
  type: EntryType;
  /** Web path of the blob. */
  webPath?: Maybe<Scalars['String']>;
  /** Web URL of the blob. */
  webUrl?: Maybe<Scalars['String']>;
};

/** The connection type for Blob. */
export type BlobConnection = {
  __typename?: 'BlobConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<BlobEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Blob>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type BlobEdge = {
  __typename?: 'BlobEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Blob>;
};

/** Represents how the blob content should be displayed */
export type BlobViewer = {
  __typename?: 'BlobViewer';
  /** Shows whether the blob should be displayed collapsed. */
  collapsed: Scalars['Boolean'];
  /** Content file type. */
  fileType: Scalars['String'];
  /** Shows whether the blob content is loaded asynchronously. */
  loadAsync: Scalars['Boolean'];
  /** Loading partial name. */
  loadingPartialName: Scalars['String'];
  /** Error rendering the blob content. */
  renderError?: Maybe<Scalars['String']>;
  /** Shows whether the blob is too large to be displayed. */
  tooLarge: Scalars['Boolean'];
  /** Type of blob viewer. */
  type: BlobViewersType;
};

/** Types of blob viewers */
export type BlobViewersType =
  /** Auxiliary blob viewers type. */
  | 'auxiliary'
  /** Rich blob viewers type. */
  | 'rich'
  /** Simple blob viewers type. */
  | 'simple';

/** Represents a project or group issue board */
export type Board = {
  __typename?: 'Board';
  /** Board assignee. */
  assignee?: Maybe<UserCore>;
  /** Timestamp of when the board was created. */
  createdAt: Scalars['Time'];
  /** Epics associated with board issues. */
  epics?: Maybe<BoardEpicConnection>;
  /** Whether or not backlog list is hidden. */
  hideBacklogList?: Maybe<Scalars['Boolean']>;
  /** Whether or not closed list is hidden. */
  hideClosedList?: Maybe<Scalars['Boolean']>;
  /** ID (global ID) of the board. */
  id: Scalars['ID'];
  /** Board iteration. */
  iteration?: Maybe<Iteration>;
  /** Board iteration cadence. */
  iterationCadence?: Maybe<IterationCadence>;
  /** Labels of the board. */
  labels?: Maybe<LabelConnection>;
  /** Lists of the board. */
  lists?: Maybe<BoardListConnection>;
  /** Board milestone. */
  milestone?: Maybe<Milestone>;
  /** Name of the board. */
  name?: Maybe<Scalars['String']>;
  /** Timestamp of when the board was last updated. */
  updatedAt: Scalars['Time'];
  /** Web path of the board. */
  webPath: Scalars['String'];
  /** Web URL of the board. */
  webUrl: Scalars['String'];
  /** Weight of the board. */
  weight?: Maybe<Scalars['Int']>;
};


/** Represents a project or group issue board */
export type BoardEpicsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  issueFilters?: InputMaybe<BoardIssueInput>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a project or group issue board */
export type BoardLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a project or group issue board */
export type BoardListsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['ListID']>;
  issueFilters?: InputMaybe<BoardIssueInput>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for Board. */
export type BoardConnection = {
  __typename?: 'BoardConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<BoardEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Board>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type BoardEdge = {
  __typename?: 'BoardEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Board>;
};

/** Represents an epic on an issue board */
export type BoardEpic = CurrentUserTodos & Eventable & NoteableInterface & {
  __typename?: 'BoardEpic';
  /** Ancestors (parents) of the epic. */
  ancestors?: Maybe<EpicConnection>;
  /** Author of the epic. */
  author: UserCore;
  /** List of award emojis associated with the epic. */
  awardEmoji?: Maybe<AwardEmojiConnection>;
  /** Children (sub-epics) of the epic. */
  children?: Maybe<EpicConnection>;
  /** Timestamp of when the epic was closed. */
  closedAt?: Maybe<Scalars['Time']>;
  /** Indicates if the epic is confidential. */
  confidential?: Maybe<Scalars['Boolean']>;
  /** Timestamp of when the epic was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** To-do items for the current user. */
  currentUserTodos: TodoConnection;
  /** Number of open and closed descendant epics and issues. */
  descendantCounts?: Maybe<EpicDescendantCount>;
  /** Total weight of open and closed issues in the epic and its descendants. */
  descendantWeightSum?: Maybe<EpicDescendantWeights>;
  /** Description of the epic. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** Number of downvotes the epic has received. */
  downvotes: Scalars['Int'];
  /** Due date of the epic. */
  dueDate?: Maybe<Scalars['Time']>;
  /** Fixed due date of the epic. */
  dueDateFixed?: Maybe<Scalars['Time']>;
  /** Inherited due date of the epic from milestones. */
  dueDateFromMilestones?: Maybe<Scalars['Time']>;
  /** Indicates if the due date has been manually set. */
  dueDateIsFixed?: Maybe<Scalars['Boolean']>;
  /** List of events associated with the object. */
  events?: Maybe<EventConnection>;
  /** Group to which the epic belongs. */
  group: Group;
  /** Indicates if the epic has children. */
  hasChildren: Scalars['Boolean'];
  /** Indicates if the epic has direct issues. */
  hasIssues: Scalars['Boolean'];
  /** Indicates if the epic has a parent epic. */
  hasParent: Scalars['Boolean'];
  /** Current health status of the epic. */
  healthStatus?: Maybe<EpicHealthStatus>;
  /** ID of the epic. */
  id: Scalars['ID'];
  /** Internal ID of the epic. */
  iid: Scalars['ID'];
  /** A list of issues associated with the epic. */
  issues?: Maybe<EpicIssueConnection>;
  /** Labels assigned to the epic. */
  labels?: Maybe<LabelConnection>;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** Parent epic of the epic. */
  parent?: Maybe<Epic>;
  /** List of participants for the epic. */
  participants?: Maybe<UserCoreConnection>;
  /** Internal reference of the epic. Returned in shortened format by default. */
  reference: Scalars['String'];
  /** URI path of the epic-issue relationship. */
  relationPath?: Maybe<Scalars['String']>;
  /** Relative position of the epic in the epic tree. */
  relativePosition?: Maybe<Scalars['Int']>;
  /** Start date of the epic. */
  startDate?: Maybe<Scalars['Time']>;
  /** Fixed start date of the epic. */
  startDateFixed?: Maybe<Scalars['Time']>;
  /** Inherited start date of the epic from milestones. */
  startDateFromMilestones?: Maybe<Scalars['Time']>;
  /** Indicates if the start date has been manually set. */
  startDateIsFixed?: Maybe<Scalars['Boolean']>;
  /** State of the epic. */
  state: EpicState;
  /** Indicates the currently logged in user is subscribed to the epic. */
  subscribed: Scalars['Boolean'];
  /** Title of the epic. */
  title?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  /** Timestamp of when the epic was updated. */
  updatedAt?: Maybe<Scalars['Time']>;
  /** Number of upvotes the epic has received. */
  upvotes: Scalars['Int'];
  /** Number of user discussions in the epic. */
  userDiscussionsCount: Scalars['Int'];
  /** Number of user notes of the epic. */
  userNotesCount: Scalars['Int'];
  /** Permissions for the current user on the resource */
  userPermissions: EpicPermissions;
  /** User preferences for the epic on the issue board. */
  userPreferences?: Maybe<BoardEpicUserPreferences>;
  /** Web path of the epic. */
  webPath: Scalars['String'];
  /** Web URL of the epic. */
  webUrl: Scalars['String'];
};


/** Represents an epic on an issue board */
export type BoardEpicAncestorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['ID']>;
  iidStartsWith?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  in?: InputMaybe<Array<IssuableSearchableField>>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  includeDescendantGroups?: InputMaybe<Scalars['Boolean']>;
  labelName?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedEpicFilterInput>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<EpicSort>;
  state?: InputMaybe<EpicState>;
  timeframe?: InputMaybe<Timeframe>;
};


/** Represents an epic on an issue board */
export type BoardEpicAwardEmojiArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic on an issue board */
export type BoardEpicChildrenArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['ID']>;
  iidStartsWith?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  in?: InputMaybe<Array<IssuableSearchableField>>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  includeDescendantGroups?: InputMaybe<Scalars['Boolean']>;
  labelName?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedEpicFilterInput>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<EpicSort>;
  state?: InputMaybe<EpicState>;
  timeframe?: InputMaybe<Timeframe>;
};


/** Represents an epic on an issue board */
export type BoardEpicCurrentUserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<TodoStateEnum>;
};


/** Represents an epic on an issue board */
export type BoardEpicDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic on an issue board */
export type BoardEpicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic on an issue board */
export type BoardEpicIssuesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic on an issue board */
export type BoardEpicLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic on an issue board */
export type BoardEpicNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic on an issue board */
export type BoardEpicParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic on an issue board */
export type BoardEpicReferenceArgs = {
  full?: InputMaybe<Scalars['Boolean']>;
};

/** The connection type for BoardEpic. */
export type BoardEpicConnection = {
  __typename?: 'BoardEpicConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<BoardEpicEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<BoardEpic>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of BoardEpicCreate */
export type BoardEpicCreateInput = {
  /** Global ID of the board that the epic is in. */
  boardId: Scalars['BoardsEpicBoardID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Group the epic to create is in. */
  groupPath: Scalars['ID'];
  /** Global ID of the epic board list in which epic will be created. */
  listId: Scalars['BoardsEpicListID'];
  /** Title of the epic. */
  title: Scalars['String'];
};

/** Autogenerated return type of BoardEpicCreate */
export type BoardEpicCreatePayload = {
  __typename?: 'BoardEpicCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Epic after creation. */
  epic?: Maybe<Epic>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type BoardEpicEdge = {
  __typename?: 'BoardEpicEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<BoardEpic>;
};

/** Represents user preferences for a board epic */
export type BoardEpicUserPreferences = {
  __typename?: 'BoardEpicUserPreferences';
  /** Indicates epic should be displayed as collapsed. */
  collapsed: Scalars['Boolean'];
};

export type BoardIssueInput = {
  /** Filter by assignee username. */
  assigneeUsername?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter by assignee wildcard. Incompatible with assigneeUsername. */
  assigneeWildcardId?: InputMaybe<AssigneeWildcardId>;
  /** Filter by author username. */
  authorUsername?: InputMaybe<Scalars['String']>;
  /** Filter by epic ID. Incompatible with epicWildcardId. */
  epicId?: InputMaybe<Scalars['EpicID']>;
  /** Filter by epic ID wildcard. Incompatible with epicId. */
  epicWildcardId?: InputMaybe<EpicWildcardId>;
  /** List of IIDs of issues. For example `["1", "2"]`. */
  iids?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by a list of iteration IDs. Incompatible with iterationWildcardId. */
  iterationId?: InputMaybe<Array<Scalars['IterationID']>>;
  /** Filter by iteration title. */
  iterationTitle?: InputMaybe<Scalars['String']>;
  /** Filter by iteration ID wildcard. */
  iterationWildcardId?: InputMaybe<IterationWildcardId>;
  /** Filter by label name. */
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter by milestone title. */
  milestoneTitle?: InputMaybe<Scalars['String']>;
  /** Filter by milestone ID wildcard. */
  milestoneWildcardId?: InputMaybe<MilestoneWildcardId>;
  /** Filter by reaction emoji applied by the current user. Wildcard values "NONE" and "ANY" are supported. */
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  /** List of negated arguments. */
  not?: InputMaybe<NegatedBoardIssueInput>;
  /** Filter by release tag. */
  releaseTag?: InputMaybe<Scalars['String']>;
  /** Search query for issue title or description. */
  search?: InputMaybe<Scalars['String']>;
  /** Filter by the given issue types. */
  types?: InputMaybe<Array<IssueType>>;
  /** Filter by weight. */
  weight?: InputMaybe<Scalars['String']>;
  /** Filter by weight ID wildcard. Incompatible with weight. */
  weightWildcardId?: InputMaybe<WeightWildcardId>;
};

/** Represents a list for an issue board */
export type BoardList = {
  __typename?: 'BoardList';
  /** Assignee in the list. */
  assignee?: Maybe<UserCore>;
  /** Indicates if the list is collapsed for this user. */
  collapsed?: Maybe<Scalars['Boolean']>;
  /** ID (global ID) of the list. */
  id: Scalars['ID'];
  /** Board issues. */
  issues?: Maybe<IssueConnection>;
  /** Count of issues in the list. */
  issuesCount?: Maybe<Scalars['Int']>;
  /** Iteration of the list. */
  iteration?: Maybe<Iteration>;
  /** Label of the list. */
  label?: Maybe<Label>;
  /** Current limit metric for the list. */
  limitMetric?: Maybe<ListLimitMetric>;
  /** Type of the list. */
  listType: Scalars['String'];
  /** Maximum number of issues in the list. */
  maxIssueCount?: Maybe<Scalars['Int']>;
  /** Maximum weight of issues in the list. */
  maxIssueWeight?: Maybe<Scalars['Int']>;
  /** Milestone of the list. */
  milestone?: Maybe<Milestone>;
  /** Position of list within the board. */
  position?: Maybe<Scalars['Int']>;
  /** Title of the list. */
  title: Scalars['String'];
  /** Total weight of all issues in the list. */
  totalWeight?: Maybe<Scalars['Int']>;
};


/** Represents a list for an issue board */
export type BoardListIssuesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<BoardIssueInput>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for BoardList. */
export type BoardListConnection = {
  __typename?: 'BoardListConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<BoardListEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<BoardList>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of BoardListCreate */
export type BoardListCreateInput = {
  /** Global ID of an existing user. */
  assigneeId?: InputMaybe<Scalars['UserID']>;
  /** Create the backlog list. */
  backlog?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the issue board to mutate. */
  boardId: Scalars['BoardID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of an existing iteration. */
  iterationId?: InputMaybe<Scalars['IterationID']>;
  /** Global ID of an existing label. */
  labelId?: InputMaybe<Scalars['LabelID']>;
  /** Global ID of an existing milestone. */
  milestoneId?: InputMaybe<Scalars['MilestoneID']>;
};

/** Autogenerated return type of BoardListCreate */
export type BoardListCreatePayload = {
  __typename?: 'BoardListCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue list in the issue board. */
  list?: Maybe<BoardList>;
};

/** An edge in a connection. */
export type BoardListEdge = {
  __typename?: 'BoardListEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<BoardList>;
};

/** Autogenerated input type of BoardListUpdateLimitMetrics */
export type BoardListUpdateLimitMetricsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** New limit metric type for the list. */
  limitMetric?: InputMaybe<ListLimitMetric>;
  /** Global ID of the list. */
  listId: Scalars['ListID'];
  /** New maximum issue count limit. */
  maxIssueCount?: InputMaybe<Scalars['Int']>;
  /** New maximum issue weight limit. */
  maxIssueWeight?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of BoardListUpdateLimitMetrics */
export type BoardListUpdateLimitMetricsPayload = {
  __typename?: 'BoardListUpdateLimitMetricsPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Updated list. */
  list?: Maybe<BoardList>;
};

export type Branch = {
  __typename?: 'Branch';
  /** Commit for the branch. */
  commit?: Maybe<Commit>;
  /** Name of the branch. */
  name: Scalars['String'];
};

/** Autogenerated input type of BulkEnableDevopsAdoptionNamespaces */
export type BulkEnableDevopsAdoptionNamespacesInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Display namespace ID. */
  displayNamespaceId?: InputMaybe<Scalars['NamespaceID']>;
  /** List of Namespace IDs. */
  namespaceIds: Array<Scalars['NamespaceID']>;
};

/** Autogenerated return type of BulkEnableDevopsAdoptionNamespaces */
export type BulkEnableDevopsAdoptionNamespacesPayload = {
  __typename?: 'BulkEnableDevopsAdoptionNamespacesPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Enabled namespaces after mutation. */
  enabledNamespaces?: Maybe<Array<DevopsAdoptionEnabledNamespace>>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Represents the total number of issues and their weights for a particular day */
export type BurnupChartDailyTotals = {
  __typename?: 'BurnupChartDailyTotals';
  /** Number of closed issues as of this day. */
  completedCount: Scalars['Int'];
  /** Total weight of closed issues as of this day. */
  completedWeight: Scalars['Int'];
  /** Date for burnup totals. */
  date: Scalars['ISO8601Date'];
  /** Number of issues as of this day. */
  scopeCount: Scalars['Int'];
  /** Total weight of issues as of this day. */
  scopeWeight: Scalars['Int'];
};

export type CiApplicationSettings = {
  __typename?: 'CiApplicationSettings';
  /** Whether to keep the latest jobs artifacts. */
  keepLatestArtifact?: Maybe<Scalars['Boolean']>;
};

export type CiBuildNeed = {
  __typename?: 'CiBuildNeed';
  /** ID of the job we need to complete. */
  id: Scalars['ID'];
  /** Name of the job we need to complete. */
  name?: Maybe<Scalars['String']>;
};

/** The connection type for CiBuildNeed. */
export type CiBuildNeedConnection = {
  __typename?: 'CiBuildNeedConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiBuildNeedEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiBuildNeed>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiBuildNeedEdge = {
  __typename?: 'CiBuildNeedEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiBuildNeed>;
};

/** Autogenerated input type of CiCdSettingsUpdate */
export type CiCdSettingsUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full Path of the project the settings belong to. */
  fullPath: Scalars['ID'];
  /** Indicates CI job tokens generated in this project have restricted access to resources. */
  jobTokenScopeEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Indicates if the latest artifact should be kept for this project. */
  keepLatestArtifact?: InputMaybe<Scalars['Boolean']>;
  /** Indicates if merge pipelines are enabled for the project. */
  mergePipelinesEnabled?: InputMaybe<Scalars['Boolean']>;
  /** Indicates if merge trains are enabled for the project. */
  mergeTrainsEnabled?: InputMaybe<Scalars['Boolean']>;
};

/** Autogenerated return type of CiCdSettingsUpdate */
export type CiCdSettingsUpdatePayload = {
  __typename?: 'CiCdSettingsUpdatePayload';
  /** CI/CD settings after mutation. */
  ciCdSettings: ProjectCiCdSetting;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type CiConfig = {
  __typename?: 'CiConfig';
  /** Linting errors. */
  errors?: Maybe<Array<Scalars['String']>>;
  /** Merged CI configuration YAML. */
  mergedYaml?: Maybe<Scalars['String']>;
  /** Stages of the pipeline. */
  stages?: Maybe<CiConfigStageConnection>;
  /** Status of linting, can be either valid or invalid. */
  status?: Maybe<CiConfigStatus>;
};


export type CiConfigStagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CiConfigGroup = {
  __typename?: 'CiConfigGroup';
  /** Jobs in group. */
  jobs?: Maybe<CiConfigJobConnection>;
  /** Name of the job group. */
  name?: Maybe<Scalars['String']>;
  /** Size of the job group. */
  size?: Maybe<Scalars['Int']>;
};


export type CiConfigGroupJobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for CiConfigGroup. */
export type CiConfigGroupConnection = {
  __typename?: 'CiConfigGroupConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiConfigGroupEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiConfigGroup>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiConfigGroupEdge = {
  __typename?: 'CiConfigGroupEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiConfigGroup>;
};

export type CiConfigJob = {
  __typename?: 'CiConfigJob';
  /** Override a set of commands that are executed after the job. */
  afterScript?: Maybe<Array<Scalars['String']>>;
  /** Allow job to fail. */
  allowFailure?: Maybe<Scalars['Boolean']>;
  /** Override a set of commands that are executed before the job. */
  beforeScript?: Maybe<Array<Scalars['String']>>;
  /** Name of an environment to which the job deploys. */
  environment?: Maybe<Scalars['String']>;
  /** Limit when jobs are not created. */
  except?: Maybe<CiConfigJobRestriction>;
  /** Name of the job group. */
  groupName?: Maybe<Scalars['String']>;
  /** Name of the job. */
  name?: Maybe<Scalars['String']>;
  /** Builds that must complete before the jobs run. */
  needs?: Maybe<CiConfigNeedConnection>;
  /** Jobs are created when these conditions do not apply. */
  only?: Maybe<CiConfigJobRestriction>;
  /** Shell script that is executed by a runner. */
  script?: Maybe<Array<Scalars['String']>>;
  /** Name of the job stage. */
  stage?: Maybe<Scalars['String']>;
  /** List of tags that are used to select a runner. */
  tags?: Maybe<Array<Scalars['String']>>;
  /** When to run the job. */
  when?: Maybe<Scalars['String']>;
};


export type CiConfigJobNeedsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for CiConfigJob. */
export type CiConfigJobConnection = {
  __typename?: 'CiConfigJobConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiConfigJobEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiConfigJob>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiConfigJobEdge = {
  __typename?: 'CiConfigJobEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiConfigJob>;
};

export type CiConfigJobRestriction = {
  __typename?: 'CiConfigJobRestriction';
  /** Git refs the job restriction applies to. */
  refs?: Maybe<Array<Scalars['String']>>;
};

export type CiConfigNeed = {
  __typename?: 'CiConfigNeed';
  /** Name of the need. */
  name?: Maybe<Scalars['String']>;
};

/** The connection type for CiConfigNeed. */
export type CiConfigNeedConnection = {
  __typename?: 'CiConfigNeedConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiConfigNeedEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiConfigNeed>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiConfigNeedEdge = {
  __typename?: 'CiConfigNeedEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiConfigNeed>;
};

export type CiConfigStage = {
  __typename?: 'CiConfigStage';
  /** Groups of jobs for the stage. */
  groups?: Maybe<CiConfigGroupConnection>;
  /** Name of the stage. */
  name?: Maybe<Scalars['String']>;
};


export type CiConfigStageGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for CiConfigStage. */
export type CiConfigStageConnection = {
  __typename?: 'CiConfigStageConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiConfigStageEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiConfigStage>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiConfigStageEdge = {
  __typename?: 'CiConfigStageEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiConfigStage>;
};

/** Values for YAML processor result */
export type CiConfigStatus =
  /** Configuration file is not valid. */
  | 'INVALID'
  /** Configuration file is valid. */
  | 'VALID';

export type CiGroup = {
  __typename?: 'CiGroup';
  /** Detailed status of the group. */
  detailedStatus?: Maybe<DetailedStatus>;
  /** ID for a group. */
  id: Scalars['String'];
  /** Jobs in group. */
  jobs?: Maybe<CiJobConnection>;
  /** Name of the job group. */
  name?: Maybe<Scalars['String']>;
  /** Size of the group. */
  size?: Maybe<Scalars['Int']>;
};


export type CiGroupJobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for CiGroup. */
export type CiGroupConnection = {
  __typename?: 'CiGroupConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiGroupEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiGroup>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiGroupEdge = {
  __typename?: 'CiGroupEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiGroup>;
};

export type CiJob = {
  __typename?: 'CiJob';
  /** Indicates the job is active. */
  active: Scalars['Boolean'];
  /** Whether the job is allowed to fail. */
  allowFailure: Scalars['Boolean'];
  /** Artifacts generated by the job. */
  artifacts?: Maybe<CiJobArtifactConnection>;
  /** Indicates the job can be canceled. */
  cancelable: Scalars['Boolean'];
  /** Path to the commit that triggered the job. */
  commitPath?: Maybe<Scalars['String']>;
  /** Coverage level of the job. */
  coverage?: Maybe<Scalars['Float']>;
  /** When the job was created. */
  createdAt: Scalars['Time'];
  /** Whether the job was created by a tag. */
  createdByTag: Scalars['Boolean'];
  /** Detailed status of the job. */
  detailedStatus?: Maybe<DetailedStatus>;
  /** Duration of the job in seconds. */
  duration?: Maybe<Scalars['Int']>;
  /** When a job has finished running. */
  finishedAt?: Maybe<Scalars['Time']>;
  /** ID of the job. */
  id?: Maybe<Scalars['JobID']>;
  /** Whether the job has a manual action. */
  manualJob?: Maybe<Scalars['Boolean']>;
  /** Name of the job. */
  name?: Maybe<Scalars['String']>;
  /** References to builds that must complete before the jobs run. */
  needs?: Maybe<CiBuildNeedConnection>;
  /** Pipeline the job belongs to. */
  pipeline?: Maybe<Pipeline>;
  /** Indicates the job can be played. */
  playable: Scalars['Boolean'];
  /** When the job was enqueued and marked as pending. */
  queuedAt?: Maybe<Scalars['Time']>;
  /** How long the job was enqueued before starting. */
  queuedDuration?: Maybe<Scalars['Duration']>;
  /** Ref name of the job. */
  refName?: Maybe<Scalars['String']>;
  /** Path to the ref. */
  refPath?: Maybe<Scalars['String']>;
  /** Indicates the job can be retried. */
  retryable: Scalars['Boolean'];
  /** Schedule for the build. */
  scheduledAt?: Maybe<Scalars['Time']>;
  /** Type of job scheduling. Value is `dag` if the job uses the `needs` keyword, and `stage` otherwise. */
  schedulingType?: Maybe<Scalars['String']>;
  /** Short SHA1 ID of the commit. */
  shortSha: Scalars['String'];
  /** Stage of the job. */
  stage?: Maybe<CiStage>;
  /** When the job was started. */
  startedAt?: Maybe<Scalars['Time']>;
  /** Status of the job. */
  status?: Maybe<CiJobStatus>;
  /** Indicates the job is stuck. */
  stuck: Scalars['Boolean'];
  /** Tags for the current job. */
  tags?: Maybe<Array<Scalars['String']>>;
  /** Whether the job was triggered. */
  triggered?: Maybe<Scalars['Boolean']>;
  /** Permissions for the current user on the resource */
  userPermissions: JobPermissions;
};


export type CiJobArtifactsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type CiJobNeedsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CiJobArtifact = {
  __typename?: 'CiJobArtifact';
  /** URL for downloading the artifact's file. */
  downloadPath?: Maybe<Scalars['String']>;
  /** File type of the artifact. */
  fileType?: Maybe<JobArtifactFileType>;
};

/** The connection type for CiJobArtifact. */
export type CiJobArtifactConnection = {
  __typename?: 'CiJobArtifactConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiJobArtifactEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiJobArtifact>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiJobArtifactEdge = {
  __typename?: 'CiJobArtifactEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiJobArtifact>;
};

/** The connection type for CiJob. */
export type CiJobConnection = {
  __typename?: 'CiJobConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiJobEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiJob>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiJobEdge = {
  __typename?: 'CiJobEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiJob>;
};

export type CiJobStatus =
  /** A job that is canceled. */
  | 'CANCELED'
  /** A job that is created. */
  | 'CREATED'
  /** A job that is failed. */
  | 'FAILED'
  /** A job that is manual. */
  | 'MANUAL'
  /** A job that is pending. */
  | 'PENDING'
  /** A job that is preparing. */
  | 'PREPARING'
  /** A job that is running. */
  | 'RUNNING'
  /** A job that is scheduled. */
  | 'SCHEDULED'
  /** A job that is skipped. */
  | 'SKIPPED'
  /** A job that is success. */
  | 'SUCCESS'
  /** A job that is waiting for resource. */
  | 'WAITING_FOR_RESOURCE';

/** Autogenerated input type of CiJobTokenScopeAddProject */
export type CiJobTokenScopeAddProjectInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project that the CI job token scope belongs to. */
  projectPath: Scalars['ID'];
  /** Project to be added to the CI job token scope. */
  targetProjectPath: Scalars['ID'];
};

/** Autogenerated return type of CiJobTokenScopeAddProject */
export type CiJobTokenScopeAddProjectPayload = {
  __typename?: 'CiJobTokenScopeAddProjectPayload';
  /** CI job token's scope of access. */
  ciJobTokenScope?: Maybe<CiJobTokenScopeType>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of CiJobTokenScopeRemoveProject */
export type CiJobTokenScopeRemoveProjectInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project that the CI job token scope belongs to. */
  projectPath: Scalars['ID'];
  /** Project to be removed from the CI job token scope. */
  targetProjectPath: Scalars['ID'];
};

/** Autogenerated return type of CiJobTokenScopeRemoveProject */
export type CiJobTokenScopeRemoveProjectPayload = {
  __typename?: 'CiJobTokenScopeRemoveProjectPayload';
  /** CI job token's scope of access. */
  ciJobTokenScope?: Maybe<CiJobTokenScopeType>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type CiJobTokenScopeType = {
  __typename?: 'CiJobTokenScopeType';
  /** Allow list of projects that can be accessed by CI Job tokens created by this project. */
  projects: ProjectConnection;
};


export type CiJobTokenScopeTypeProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type CiMinutesNamespaceMonthlyUsage = {
  __typename?: 'CiMinutesNamespaceMonthlyUsage';
  /** Total number of minutes used by all projects in the namespace. */
  minutes?: Maybe<Scalars['Int']>;
  /** Month related to the usage data. */
  month?: Maybe<Scalars['String']>;
  /** CI minutes usage data for projects in the namespace. */
  projects?: Maybe<CiMinutesProjectMonthlyUsageConnection>;
};


export type CiMinutesNamespaceMonthlyUsageProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for CiMinutesNamespaceMonthlyUsage. */
export type CiMinutesNamespaceMonthlyUsageConnection = {
  __typename?: 'CiMinutesNamespaceMonthlyUsageConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiMinutesNamespaceMonthlyUsageEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiMinutesNamespaceMonthlyUsage>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiMinutesNamespaceMonthlyUsageEdge = {
  __typename?: 'CiMinutesNamespaceMonthlyUsageEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiMinutesNamespaceMonthlyUsage>;
};

export type CiMinutesProjectMonthlyUsage = {
  __typename?: 'CiMinutesProjectMonthlyUsage';
  /** Number of CI minutes used by the project in the month. */
  minutes?: Maybe<Scalars['Int']>;
  /** Name of the project. */
  name?: Maybe<Scalars['String']>;
};

/** The connection type for CiMinutesProjectMonthlyUsage. */
export type CiMinutesProjectMonthlyUsageConnection = {
  __typename?: 'CiMinutesProjectMonthlyUsageConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiMinutesProjectMonthlyUsageEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiMinutesProjectMonthlyUsage>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiMinutesProjectMonthlyUsageEdge = {
  __typename?: 'CiMinutesProjectMonthlyUsageEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiMinutesProjectMonthlyUsage>;
};

export type CiRunner = {
  __typename?: 'CiRunner';
  /** Access level of the runner. */
  accessLevel: CiRunnerAccessLevel;
  /** Indicates the runner is allowed to receive jobs. */
  active: Scalars['Boolean'];
  /** Admin URL of the runner. Only available for adminstrators. */
  adminUrl?: Maybe<Scalars['String']>;
  /** Last contact from the runner. */
  contactedAt?: Maybe<Scalars['Time']>;
  /** Description of the runner. */
  description?: Maybe<Scalars['String']>;
  /** ID of the runner. */
  id: Scalars['CiRunnerID'];
  /** IP address of the runner. */
  ipAddress?: Maybe<Scalars['String']>;
  /** Number of jobs processed by the runner (limited to 1000, plus one to indicate that more items exist). */
  jobCount?: Maybe<Scalars['Int']>;
  /** Indicates the runner is locked. */
  locked?: Maybe<Scalars['Boolean']>;
  /** Maximum timeout (in seconds) for jobs processed by the runner. */
  maximumTimeout?: Maybe<Scalars['Int']>;
  /** Private projects' "minutes cost factor" associated with the runner (GitLab.com only). */
  privateProjectsMinutesCostFactor?: Maybe<Scalars['Float']>;
  /** Number of projects that the runner is associated with. */
  projectCount?: Maybe<Scalars['Int']>;
  /** Public projects' "minutes cost factor" associated with the runner (GitLab.com only). */
  publicProjectsMinutesCostFactor?: Maybe<Scalars['Float']>;
  /** Revision of the runner. */
  revision?: Maybe<Scalars['String']>;
  /** Indicates the runner is able to run untagged jobs. */
  runUntagged: Scalars['Boolean'];
  /** Type of the runner. */
  runnerType: CiRunnerType;
  /** First eight characters of the runner's token used to authenticate new job requests. Used as the runner's unique ID. */
  shortSha?: Maybe<Scalars['String']>;
  /** Status of the runner. */
  status: CiRunnerStatus;
  /** Tags associated with the runner. */
  tagList?: Maybe<Array<Scalars['String']>>;
  /** Permissions for the current user on the resource */
  userPermissions: RunnerPermissions;
  /** Version of the runner. */
  version?: Maybe<Scalars['String']>;
};

export type CiRunnerAccessLevel =
  /** A runner that is not protected. */
  | 'NOT_PROTECTED'
  /** A runner that is ref protected. */
  | 'REF_PROTECTED';

/** The connection type for CiRunner. */
export type CiRunnerConnection = {
  __typename?: 'CiRunnerConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiRunnerEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiRunner>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiRunnerEdge = {
  __typename?: 'CiRunnerEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiRunner>;
  /** Web URL of the runner. The value depends on where you put this field in the query. You can use it for projects or groups. */
  webUrl?: Maybe<Scalars['String']>;
};

/** Values for sorting runners */
export type CiRunnerSort =
  /** Ordered by contacted_at in ascending order. */
  | 'CONTACTED_ASC'
  /** Ordered by contacted_at in descending order. */
  | 'CONTACTED_DESC'
  /** Ordered by created_at in ascending order. */
  | 'CREATED_ASC'
  /** Ordered by created_at in descending order. */
  | 'CREATED_DESC';

export type CiRunnerStatus =
  /** A runner that is not paused. */
  | 'ACTIVE'
  /** A runner that has never contacted this instance. */
  | 'NOT_CONNECTED'
  /** A runner that has not contacted this instance within the last 2 hours. */
  | 'OFFLINE'
  /** A runner that contacted this instance within the last 2 hours. */
  | 'ONLINE'
  /** A runner that is paused. */
  | 'PAUSED';

export type CiRunnerType =
  /** A runner that is group type. */
  | 'GROUP_TYPE'
  /** A runner that is instance type. */
  | 'INSTANCE_TYPE'
  /** A runner that is project type. */
  | 'PROJECT_TYPE';

export type CiStage = {
  __typename?: 'CiStage';
  /** Detailed status of the stage. */
  detailedStatus?: Maybe<DetailedStatus>;
  /** Group of jobs for the stage. */
  groups?: Maybe<CiGroupConnection>;
  /** ID of the stage. */
  id: Scalars['ID'];
  /** Jobs for the stage. */
  jobs?: Maybe<CiJobConnection>;
  /** Name of the stage. */
  name?: Maybe<Scalars['String']>;
  /** Status of the pipeline stage. */
  status?: Maybe<Scalars['String']>;
};


export type CiStageGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type CiStageJobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for CiStage. */
export type CiStageConnection = {
  __typename?: 'CiStageConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CiStageEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CiStage>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CiStageEdge = {
  __typename?: 'CiStageEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CiStage>;
};

/** GitLab CI/CD configuration template. */
export type CiTemplate = {
  __typename?: 'CiTemplate';
  /** Contents of the CI template. */
  content: Scalars['String'];
  /** Name of the CI template. */
  name: Scalars['String'];
};

export type ClusterAgent = {
  __typename?: 'ClusterAgent';
  /** Active connections for the cluster agent */
  connections?: Maybe<ConnectedAgentConnection>;
  /** Timestamp the cluster agent was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** User object, containing information about the person who created the agent. */
  createdByUser?: Maybe<UserCore>;
  /** ID of the cluster agent. */
  id: Scalars['ID'];
  /** Name of the cluster agent. */
  name?: Maybe<Scalars['String']>;
  /** Project this cluster agent is associated with. */
  project?: Maybe<Project>;
  /** Tokens associated with the cluster agent. */
  tokens?: Maybe<ClusterAgentTokenConnection>;
  /** Timestamp the cluster agent was updated. */
  updatedAt?: Maybe<Scalars['Time']>;
  /** Web path of the cluster agent. */
  webPath?: Maybe<Scalars['String']>;
};


export type ClusterAgentConnectionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ClusterAgentTokensArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for ClusterAgent. */
export type ClusterAgentConnection = {
  __typename?: 'ClusterAgentConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ClusterAgentEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ClusterAgent>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of ClusterAgentDelete */
export type ClusterAgentDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the cluster agent that will be deleted. */
  id: Scalars['ClustersAgentID'];
};

/** Autogenerated return type of ClusterAgentDelete */
export type ClusterAgentDeletePayload = {
  __typename?: 'ClusterAgentDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type ClusterAgentEdge = {
  __typename?: 'ClusterAgentEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ClusterAgent>;
};

export type ClusterAgentToken = {
  __typename?: 'ClusterAgentToken';
  /** Cluster agent this token is associated with. */
  clusterAgent?: Maybe<ClusterAgent>;
  /** Timestamp the token was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** User who created the token. */
  createdByUser?: Maybe<UserCore>;
  /** Description of the token. */
  description?: Maybe<Scalars['String']>;
  /** Global ID of the token. */
  id: Scalars['ClustersAgentTokenID'];
  /** Timestamp the token was last used. */
  lastUsedAt?: Maybe<Scalars['Time']>;
  /** Name given to the token. */
  name?: Maybe<Scalars['String']>;
};

/** The connection type for ClusterAgentToken. */
export type ClusterAgentTokenConnection = {
  __typename?: 'ClusterAgentTokenConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ClusterAgentTokenEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ClusterAgentToken>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of ClusterAgentTokenCreate */
export type ClusterAgentTokenCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the cluster agent that will be associated with the new token. */
  clusterAgentId: Scalars['ClustersAgentID'];
  /** Description of the token. */
  description?: InputMaybe<Scalars['String']>;
  /** Name of the token. */
  name: Scalars['String'];
};

/** Autogenerated return type of ClusterAgentTokenCreate */
export type ClusterAgentTokenCreatePayload = {
  __typename?: 'ClusterAgentTokenCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Token secret value. Make sure you save it - you won't be able to access it again. */
  secret?: Maybe<Scalars['String']>;
  /** Token created after mutation. */
  token?: Maybe<ClusterAgentToken>;
};

/** Autogenerated input type of ClusterAgentTokenDelete */
export type ClusterAgentTokenDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the cluster agent token that will be deleted. */
  id: Scalars['ClustersAgentTokenID'];
};

/** Autogenerated return type of ClusterAgentTokenDelete */
export type ClusterAgentTokenDeletePayload = {
  __typename?: 'ClusterAgentTokenDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type ClusterAgentTokenEdge = {
  __typename?: 'ClusterAgentTokenEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ClusterAgentToken>;
};

/** Represents the code coverage activity for a group */
export type CodeCoverageActivity = {
  __typename?: 'CodeCoverageActivity';
  /** Average percentage of the different code coverage results available for the group. */
  averageCoverage?: Maybe<Scalars['Float']>;
  /** Number of different code coverage results available for the group. */
  coverageCount?: Maybe<Scalars['Int']>;
  /** Date when the code coverage was created. */
  date: Scalars['Date'];
  /** Number of projects with code coverage results for the group. */
  projectCount?: Maybe<Scalars['Int']>;
};

/** The connection type for CodeCoverageActivity. */
export type CodeCoverageActivityConnection = {
  __typename?: 'CodeCoverageActivityConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CodeCoverageActivityEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CodeCoverageActivity>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CodeCoverageActivityEdge = {
  __typename?: 'CodeCoverageActivityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CodeCoverageActivity>;
};

/** Represents the code coverage summary for a project */
export type CodeCoverageSummary = {
  __typename?: 'CodeCoverageSummary';
  /** Average percentage of the different code coverage results available for the project. */
  averageCoverage?: Maybe<Scalars['Float']>;
  /** Number of different code coverage results available. */
  coverageCount?: Maybe<Scalars['Int']>;
  /** Latest date when the code coverage was created for the project. */
  lastUpdatedOn?: Maybe<Scalars['Date']>;
};

/** Represents a code quality degradation on the pipeline. */
export type CodeQualityDegradation = {
  __typename?: 'CodeQualityDegradation';
  /** Description of the code quality degradation. */
  description: Scalars['String'];
  /** Unique fingerprint to identify the code quality degradation. For example, an MD5 hash. */
  fingerprint: Scalars['String'];
  /** Line on which the code quality degradation occurred. */
  line: Scalars['Int'];
  /** Relative path to the file containing the code quality degradation. */
  path: Scalars['String'];
  /** Status of the degradation (BLOCKER, CRITICAL, MAJOR, MINOR, INFO). */
  severity: CodeQualityDegradationSeverity;
};

/** The connection type for CodeQualityDegradation. */
export type CodeQualityDegradationConnection = {
  __typename?: 'CodeQualityDegradationConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CodeQualityDegradationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CodeQualityDegradation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CodeQualityDegradationEdge = {
  __typename?: 'CodeQualityDegradationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CodeQualityDegradation>;
};

export type CodeQualityDegradationSeverity =
  /** Code Quality degradation has a status of blocker. */
  | 'BLOCKER'
  /** Code Quality degradation has a status of critical. */
  | 'CRITICAL'
  /** Code Quality degradation has a status of info. */
  | 'INFO'
  /** Code Quality degradation has a status of major. */
  | 'MAJOR'
  /** Code Quality degradation has a status of minor. */
  | 'MINOR';

export type Commit = {
  __typename?: 'Commit';
  /** Author of the commit. */
  author?: Maybe<UserCore>;
  /** Commit authors gravatar. */
  authorGravatar?: Maybe<Scalars['String']>;
  /** Commit authors name. */
  authorName?: Maybe<Scalars['String']>;
  /** Timestamp of when the commit was authored. */
  authoredDate?: Maybe<Scalars['Time']>;
  /** Description of the commit message. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** ID (global ID) of the commit. */
  id: Scalars['ID'];
  /** Raw commit message. */
  message?: Maybe<Scalars['String']>;
  /** Pipelines of the commit ordered latest first. */
  pipelines?: Maybe<PipelineConnection>;
  /** SHA1 ID of the commit. */
  sha: Scalars['String'];
  /** Short SHA1 ID of the commit. */
  shortId: Scalars['String'];
  /** Rendered HTML of the commit signature. */
  signatureHtml?: Maybe<Scalars['String']>;
  /** Title of the commit message. */
  title?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  /** Web path of the commit. */
  webPath: Scalars['String'];
  /** Web URL of the commit. */
  webUrl: Scalars['String'];
};


export type CommitPipelinesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  ref?: InputMaybe<Scalars['String']>;
  sha?: InputMaybe<Scalars['String']>;
  source?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<PipelineStatusEnum>;
};

export type CommitAction = {
  /** Action to perform: create, delete, move, update, or chmod. */
  action: CommitActionMode;
  /** Content of the file. */
  content?: InputMaybe<Scalars['String']>;
  /** Encoding of the file. Default is text. */
  encoding?: InputMaybe<CommitEncoding>;
  /** Enables/disables the execute flag on the file. */
  executeFilemode?: InputMaybe<Scalars['Boolean']>;
  /** Full path to the file. */
  filePath: Scalars['String'];
  /** Last known file commit ID. */
  lastCommitId?: InputMaybe<Scalars['String']>;
  /** Original full path to the file being moved. */
  previousPath?: InputMaybe<Scalars['String']>;
};

/** Mode of a commit action */
export type CommitActionMode =
  /** Chmod command. */
  | 'CHMOD'
  /** Create command. */
  | 'CREATE'
  /** Delete command. */
  | 'DELETE'
  /** Move command. */
  | 'MOVE'
  /** Update command. */
  | 'UPDATE';

/** The connection type for Commit. */
export type CommitConnection = {
  __typename?: 'CommitConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CommitEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Commit>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of CommitCreate */
export type CommitCreateInput = {
  /** Array of action hashes to commit as a batch. */
  actions: Array<CommitAction>;
  /** Name of the branch to commit into, it can be a new branch. */
  branch: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Raw commit message. */
  message: Scalars['String'];
  /** Project full path the branch is associated with. */
  projectPath: Scalars['ID'];
  /** If on a new branch, name of the original branch. */
  startBranch?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of CommitCreate */
export type CommitCreatePayload = {
  __typename?: 'CommitCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Commit after mutation. */
  commit?: Maybe<Commit>;
  /** ETag path for the commit's pipeline. */
  commitPipelinePath?: Maybe<Scalars['String']>;
  /** Contents of the commit. */
  content?: Maybe<Array<Scalars['String']>>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type CommitEdge = {
  __typename?: 'CommitEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Commit>;
};

export type CommitEncoding =
  /** Base64 encoding. */
  | 'BASE64'
  /** Text encoding. */
  | 'TEXT';

/** Represents a ComplianceFramework associated with a Project */
export type ComplianceFramework = {
  __typename?: 'ComplianceFramework';
  /** Hexadecimal representation of compliance framework's label color. */
  color: Scalars['String'];
  /** Description of the compliance framework. */
  description: Scalars['String'];
  /** Compliance framework ID. */
  id: Scalars['ID'];
  /** Name of the compliance framework. */
  name: Scalars['String'];
  /**
   * Full path of the compliance pipeline configuration stored in a project
   * repository, such as `.gitlab/.compliance-gitlab-ci.yml@compliance/hipaa`
   * **(ULTIMATE)**.
   */
  pipelineConfigurationFullPath?: Maybe<Scalars['String']>;
};

/** The connection type for ComplianceFramework. */
export type ComplianceFrameworkConnection = {
  __typename?: 'ComplianceFrameworkConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ComplianceFrameworkEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ComplianceFramework>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ComplianceFrameworkEdge = {
  __typename?: 'ComplianceFrameworkEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ComplianceFramework>;
};

export type ComplianceFrameworkInput = {
  /** New color representation of the compliance framework in hex format. e.g. #FCA121. */
  color?: InputMaybe<Scalars['String']>;
  /** New description for the compliance framework. */
  description?: InputMaybe<Scalars['String']>;
  /** New name for the compliance framework. */
  name?: InputMaybe<Scalars['String']>;
  /**
   * Full path of the compliance pipeline configuration stored in a project
   * repository, such as `.gitlab/.compliance-gitlab-ci.yml@compliance/hipaa`
   * **(ULTIMATE)**.
   */
  pipelineConfigurationFullPath?: InputMaybe<Scalars['String']>;
};

/** Composer metadata */
export type ComposerMetadata = {
  __typename?: 'ComposerMetadata';
  /** Data of the Composer JSON file. */
  composerJson: PackageComposerJsonType;
  /** Target SHA of the package. */
  targetSha: Scalars['String'];
};

/** Conan file metadata */
export type ConanFileMetadata = PackageFileMetadata & {
  __typename?: 'ConanFileMetadata';
  /** Type of the Conan file. */
  conanFileType: ConanMetadatumFileTypeEnum;
  /** Reference of the Conan package. */
  conanPackageReference?: Maybe<Scalars['String']>;
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** ID of the metadatum. */
  id: Scalars['PackagesConanFileMetadatumID'];
  /** Revision of the package. */
  packageRevision?: Maybe<Scalars['String']>;
  /** Revision of the Conan recipe. */
  recipeRevision: Scalars['String'];
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
};

/** Conan metadata */
export type ConanMetadata = {
  __typename?: 'ConanMetadata';
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** ID of the metadatum. */
  id: Scalars['PackagesConanMetadatumID'];
  /** Channel of the Conan package. */
  packageChannel: Scalars['String'];
  /** Username of the Conan package. */
  packageUsername: Scalars['String'];
  /** Recipe of the Conan package. */
  recipe: Scalars['String'];
  /** Recipe path of the Conan package. */
  recipePath: Scalars['String'];
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
};

/** Conan file types */
export type ConanMetadatumFileTypeEnum =
  /** A package file type. */
  | 'PACKAGE_FILE'
  /** A recipe file type. */
  | 'RECIPE_FILE';

/** Autogenerated input type of ConfigureDependencyScanning */
export type ConfigureDependencyScanningInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the project. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of ConfigureDependencyScanning */
export type ConfigureDependencyScanningPayload = {
  __typename?: 'ConfigureDependencyScanningPayload';
  /** Branch that has the new/modified `.gitlab-ci.yml` file. */
  branch?: Maybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Redirect path to use when the response is successful. */
  successPath?: Maybe<Scalars['String']>;
};

/** Autogenerated input type of ConfigureSast */
export type ConfigureSastInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** SAST CI configuration for the project. */
  configuration: SastCiConfigurationInput;
  /** Full path of the project. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of ConfigureSast */
export type ConfigureSastPayload = {
  __typename?: 'ConfigureSastPayload';
  /** Branch that has the new/modified `.gitlab-ci.yml` file. */
  branch?: Maybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Redirect path to use when the response is successful. */
  successPath?: Maybe<Scalars['String']>;
};

/** Autogenerated input type of ConfigureSecretDetection */
export type ConfigureSecretDetectionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the project. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of ConfigureSecretDetection */
export type ConfigureSecretDetectionPayload = {
  __typename?: 'ConfigureSecretDetectionPayload';
  /** Branch that has the new/modified `.gitlab-ci.yml` file. */
  branch?: Maybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Redirect path to use when the response is successful. */
  successPath?: Maybe<Scalars['String']>;
};

/** Connection details for an Agent */
export type ConnectedAgent = {
  __typename?: 'ConnectedAgent';
  /** When the connection was established. */
  connectedAt?: Maybe<Scalars['Time']>;
  /** ID of the connection. */
  connectionId?: Maybe<Scalars['BigInt']>;
  /** Information about the Agent. */
  metadata?: Maybe<AgentMetadata>;
};

/** The connection type for ConnectedAgent. */
export type ConnectedAgentConnection = {
  __typename?: 'ConnectedAgentConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ConnectedAgentEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ConnectedAgent>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ConnectedAgentEdge = {
  __typename?: 'ConnectedAgentEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ConnectedAgent>;
};

/** A tag expiration policy designed to keep only the images that matter most */
export type ContainerExpirationPolicy = {
  __typename?: 'ContainerExpirationPolicy';
  /** This container expiration policy schedule. */
  cadence: ContainerExpirationPolicyCadenceEnum;
  /** Timestamp of when the container expiration policy was created. */
  createdAt: Scalars['Time'];
  /** Indicates whether this container expiration policy is enabled. */
  enabled: Scalars['Boolean'];
  /** Number of tags to retain. */
  keepN?: Maybe<ContainerExpirationPolicyKeepEnum>;
  /** Tags with names matching this regex pattern will expire. */
  nameRegex?: Maybe<Scalars['UntrustedRegexp']>;
  /** Tags with names matching this regex pattern will be preserved. */
  nameRegexKeep?: Maybe<Scalars['UntrustedRegexp']>;
  /** Next time that this container expiration policy will get executed. */
  nextRunAt?: Maybe<Scalars['Time']>;
  /** Tags older that this will expire. */
  olderThan?: Maybe<ContainerExpirationPolicyOlderThanEnum>;
  /** Timestamp of when the container expiration policy was updated. */
  updatedAt: Scalars['Time'];
};

export type ContainerExpirationPolicyCadenceEnum =
  /** Every day */
  | 'EVERY_DAY'
  /** Every month */
  | 'EVERY_MONTH'
  /** Every three months */
  | 'EVERY_THREE_MONTHS'
  /** Every two weeks */
  | 'EVERY_TWO_WEEKS'
  /** Every week */
  | 'EVERY_WEEK';

export type ContainerExpirationPolicyKeepEnum =
  /** 50 tags per image name */
  | 'FIFTY_TAGS'
  /** 5 tags per image name */
  | 'FIVE_TAGS'
  /** 100 tags per image name */
  | 'ONE_HUNDRED_TAGS'
  /** 1 tag per image name */
  | 'ONE_TAG'
  /** 10 tags per image name */
  | 'TEN_TAGS'
  /** 25 tags per image name */
  | 'TWENTY_FIVE_TAGS';

export type ContainerExpirationPolicyOlderThanEnum =
  /** 14 days until tags are automatically removed */
  | 'FOURTEEN_DAYS'
  /** 90 days until tags are automatically removed */
  | 'NINETY_DAYS'
  /** 7 days until tags are automatically removed */
  | 'SEVEN_DAYS'
  /** 60 days until tags are automatically removed */
  | 'SIXTY_DAYS'
  /** 30 days until tags are automatically removed */
  | 'THIRTY_DAYS';

/** A container repository */
export type ContainerRepository = {
  __typename?: 'ContainerRepository';
  /** Can the current user delete the container repository. */
  canDelete: Scalars['Boolean'];
  /** Timestamp when the container repository was created. */
  createdAt: Scalars['Time'];
  /** Tags cleanup status for the container repository. */
  expirationPolicyCleanupStatus?: Maybe<ContainerRepositoryCleanupStatus>;
  /** Timestamp when the cleanup done by the expiration policy was started on the container repository. */
  expirationPolicyStartedAt?: Maybe<Scalars['Time']>;
  /** ID of the container repository. */
  id: Scalars['ID'];
  /** URL of the container repository. */
  location: Scalars['String'];
  /** Name of the container repository. */
  name: Scalars['String'];
  /** Path of the container repository. */
  path: Scalars['String'];
  /** Project of the container registry. */
  project: Project;
  /** Status of the container repository. */
  status?: Maybe<ContainerRepositoryStatus>;
  /** Number of tags associated with this image. */
  tagsCount: Scalars['Int'];
  /** Timestamp when the container repository was updated. */
  updatedAt: Scalars['Time'];
};

/** Status of the tags cleanup of a container repository */
export type ContainerRepositoryCleanupStatus =
  /** Tags cleanup is ongoing. */
  | 'ONGOING'
  /** Tags cleanup is scheduled and is going to be executed shortly. */
  | 'SCHEDULED'
  /** Tags cleanup has been partially executed. There are still remaining tags to delete. */
  | 'UNFINISHED'
  /** Tags cleanup is not scheduled. This is the default state. */
  | 'UNSCHEDULED';

/** The connection type for ContainerRepository. */
export type ContainerRepositoryConnection = {
  __typename?: 'ContainerRepositoryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ContainerRepositoryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ContainerRepository>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Details of a container repository */
export type ContainerRepositoryDetails = {
  __typename?: 'ContainerRepositoryDetails';
  /** Can the current user delete the container repository. */
  canDelete: Scalars['Boolean'];
  /** Timestamp when the container repository was created. */
  createdAt: Scalars['Time'];
  /** Tags cleanup status for the container repository. */
  expirationPolicyCleanupStatus?: Maybe<ContainerRepositoryCleanupStatus>;
  /** Timestamp when the cleanup done by the expiration policy was started on the container repository. */
  expirationPolicyStartedAt?: Maybe<Scalars['Time']>;
  /** ID of the container repository. */
  id: Scalars['ID'];
  /** URL of the container repository. */
  location: Scalars['String'];
  /** Name of the container repository. */
  name: Scalars['String'];
  /** Path of the container repository. */
  path: Scalars['String'];
  /** Project of the container registry. */
  project: Project;
  /** Status of the container repository. */
  status?: Maybe<ContainerRepositoryStatus>;
  /** Tags of the container repository. */
  tags?: Maybe<ContainerRepositoryTagConnection>;
  /** Number of tags associated with this image. */
  tagsCount: Scalars['Int'];
  /** Timestamp when the container repository was updated. */
  updatedAt: Scalars['Time'];
};


/** Details of a container repository */
export type ContainerRepositoryDetailsTagsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type ContainerRepositoryEdge = {
  __typename?: 'ContainerRepositoryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ContainerRepository>;
};

/** Values for sorting container repositories */
export type ContainerRepositorySort =
  /** Created at ascending order. */
  | 'CREATED_ASC'
  /** Created at descending order. */
  | 'CREATED_DESC'
  /** Name by ascending order. */
  | 'NAME_ASC'
  /** Name by descending order. */
  | 'NAME_DESC'
  /** Updated at ascending order. */
  | 'UPDATED_ASC'
  /** Updated at descending order. */
  | 'UPDATED_DESC'
  /** Created at ascending order. */
  | 'created_asc'
  /** Created at descending order. */
  | 'created_desc'
  /** Updated at ascending order. */
  | 'updated_asc'
  /** Updated at descending order. */
  | 'updated_desc';

/** Status of a container repository */
export type ContainerRepositoryStatus =
  /** Delete Failed status. */
  | 'DELETE_FAILED'
  /** Delete Scheduled status. */
  | 'DELETE_SCHEDULED';

/** A tag from a container repository */
export type ContainerRepositoryTag = {
  __typename?: 'ContainerRepositoryTag';
  /** Can the current user delete this tag. */
  canDelete: Scalars['Boolean'];
  /** Timestamp when the tag was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** Digest of the tag. */
  digest?: Maybe<Scalars['String']>;
  /** URL of the tag. */
  location: Scalars['String'];
  /** Name of the tag. */
  name: Scalars['String'];
  /** Path of the tag. */
  path: Scalars['String'];
  /** Revision of the tag. */
  revision?: Maybe<Scalars['String']>;
  /** Short revision of the tag. */
  shortRevision?: Maybe<Scalars['String']>;
  /** Size of the tag. */
  totalSize?: Maybe<Scalars['BigInt']>;
};

/** The connection type for ContainerRepositoryTag. */
export type ContainerRepositoryTagConnection = {
  __typename?: 'ContainerRepositoryTagConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ContainerRepositoryTagEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ContainerRepositoryTag>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ContainerRepositoryTagEdge = {
  __typename?: 'ContainerRepositoryTagEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ContainerRepositoryTag>;
};

/** Autogenerated input type of CreateAlertIssue */
export type CreateAlertIssueInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the alert to mutate. */
  iid: Scalars['String'];
  /** Project the alert to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of CreateAlertIssue */
export type CreateAlertIssuePayload = {
  __typename?: 'CreateAlertIssuePayload';
  /** Alert after mutation. */
  alert?: Maybe<AlertManagementAlert>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue created after mutation. */
  issue?: Maybe<Issue>;
  /** To-do item after mutation. */
  todo?: Maybe<Todo>;
};

/** Autogenerated input type of CreateAnnotation */
export type CreateAnnotationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the cluster to add an annotation to. */
  clusterId?: InputMaybe<Scalars['ClustersClusterID']>;
  /** Path to a file defining the dashboard on which the annotation should be added. */
  dashboardPath: Scalars['String'];
  /** Description of the annotation. */
  description: Scalars['String'];
  /** Timestamp indicating ending moment to which the annotation relates. */
  endingAt?: InputMaybe<Scalars['Time']>;
  /** Global ID of the environment to add an annotation to. */
  environmentId?: InputMaybe<Scalars['EnvironmentID']>;
  /** Timestamp indicating starting moment to which the annotation relates. */
  startingAt: Scalars['Time'];
};

/** Autogenerated return type of CreateAnnotation */
export type CreateAnnotationPayload = {
  __typename?: 'CreateAnnotationPayload';
  /** Created annotation. */
  annotation?: Maybe<MetricsDashboardAnnotation>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of CreateBoard */
export type CreateBoardInput = {
  /** ID of user to be assigned to the board. */
  assigneeId?: InputMaybe<Scalars['UserID']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the group with which the resource is associated. */
  groupPath?: InputMaybe<Scalars['ID']>;
  /** Whether or not backlog list is hidden. */
  hideBacklogList?: InputMaybe<Scalars['Boolean']>;
  /** Whether or not closed list is hidden. */
  hideClosedList?: InputMaybe<Scalars['Boolean']>;
  /** ID of iteration cadence to be assigned to the board. */
  iterationCadenceId?: InputMaybe<Scalars['IterationsCadenceID']>;
  /** ID of iteration to be assigned to the board. */
  iterationId?: InputMaybe<Scalars['IterationID']>;
  /** IDs of labels to be added to the board. */
  labelIds?: InputMaybe<Array<Scalars['LabelID']>>;
  /** Labels of the issue. */
  labels?: InputMaybe<Array<Scalars['String']>>;
  /** ID of milestone to be assigned to the board. */
  milestoneId?: InputMaybe<Scalars['MilestoneID']>;
  /** Board name. */
  name?: InputMaybe<Scalars['String']>;
  /** Full path of the project with which the resource is associated. */
  projectPath?: InputMaybe<Scalars['ID']>;
  /** Weight value to be assigned to the board. */
  weight?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of CreateBoard */
export type CreateBoardPayload = {
  __typename?: 'CreateBoardPayload';
  /** Board after mutation. */
  board?: Maybe<Board>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of CreateBranch */
export type CreateBranchInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Name of the branch. */
  name: Scalars['String'];
  /** Project full path the branch is associated with. */
  projectPath: Scalars['ID'];
  /** Branch name or commit SHA to create branch from. */
  ref: Scalars['String'];
};

/** Autogenerated return type of CreateBranch */
export type CreateBranchPayload = {
  __typename?: 'CreateBranchPayload';
  /** Branch after mutation. */
  branch?: Maybe<Branch>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of CreateClusterAgent */
export type CreateClusterAgentInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Name of the cluster agent. */
  name: Scalars['String'];
  /** Full path of the associated project for this cluster agent. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of CreateClusterAgent */
export type CreateClusterAgentPayload = {
  __typename?: 'CreateClusterAgentPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Cluster agent created after mutation. */
  clusterAgent?: Maybe<ClusterAgent>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of CreateComplianceFramework */
export type CreateComplianceFrameworkInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the namespace to add the compliance framework to. */
  namespacePath: Scalars['ID'];
  /** Parameters to update the compliance framework with. */
  params: ComplianceFrameworkInput;
};

/** Autogenerated return type of CreateComplianceFramework */
export type CreateComplianceFrameworkPayload = {
  __typename?: 'CreateComplianceFrameworkPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Created compliance framework. */
  framework?: Maybe<ComplianceFramework>;
};

/** Autogenerated input type of CreateCustomEmoji */
export type CreateCustomEmojiInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Namespace full path the emoji is associated with. */
  groupPath: Scalars['ID'];
  /** Name of the emoji. */
  name: Scalars['String'];
  /** Location of the emoji file. */
  url: Scalars['String'];
};

/** Autogenerated return type of CreateCustomEmoji */
export type CreateCustomEmojiPayload = {
  __typename?: 'CreateCustomEmojiPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** New custom emoji. */
  customEmoji?: Maybe<CustomEmoji>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of CreateDiffNote */
export type CreateDiffNoteInput = {
  /** Content of the note. */
  body: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Confidentiality flag of a note. Default is false. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the resource to add a note to. */
  noteableId: Scalars['NoteableID'];
  /** Position of this note on a diff. */
  position: DiffPositionInput;
};

/** Autogenerated return type of CreateDiffNote */
export type CreateDiffNotePayload = {
  __typename?: 'CreateDiffNotePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Note after mutation. */
  note?: Maybe<Note>;
};

/** Autogenerated input type of CreateEpic */
export type CreateEpicInput = {
  /** IDs of labels to be added to the epic. */
  addLabelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates if the epic is confidential. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Description of the epic. */
  description?: InputMaybe<Scalars['String']>;
  /** End date of the epic. */
  dueDateFixed?: InputMaybe<Scalars['String']>;
  /** Indicates end date should be sourced from due_date_fixed field not the issue milestones. */
  dueDateIsFixed?: InputMaybe<Scalars['Boolean']>;
  /** Group the epic to mutate is in. */
  groupPath: Scalars['ID'];
  /** IDs of labels to be removed from the epic. */
  removeLabelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** Start date of the epic. */
  startDateFixed?: InputMaybe<Scalars['String']>;
  /** Indicates start date should be sourced from start_date_fixed field not the issue milestones. */
  startDateIsFixed?: InputMaybe<Scalars['Boolean']>;
  /** Title of the epic. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of CreateEpic */
export type CreateEpicPayload = {
  __typename?: 'CreateEpicPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Created epic. */
  epic?: Maybe<Epic>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of CreateImageDiffNote */
export type CreateImageDiffNoteInput = {
  /** Content of the note. */
  body: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Confidentiality flag of a note. Default is false. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the resource to add a note to. */
  noteableId: Scalars['NoteableID'];
  /** Position of this note on a diff. */
  position: DiffImagePositionInput;
};

/** Autogenerated return type of CreateImageDiffNote */
export type CreateImageDiffNotePayload = {
  __typename?: 'CreateImageDiffNotePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Note after mutation. */
  note?: Maybe<Note>;
};

/** Autogenerated input type of CreateIssue */
export type CreateIssueInput = {
  /** Array of user IDs to assign to the issue. */
  assigneeIds?: InputMaybe<Array<Scalars['UserID']>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates the issue is confidential. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Timestamp when the issue was created. Available only for admins and project owners. */
  createdAt?: InputMaybe<Scalars['Time']>;
  /** Description of the issue. */
  description?: InputMaybe<Scalars['String']>;
  /** ID of a discussion to resolve. Also pass `merge_request_to_resolve_discussions_of`. */
  discussionToResolve?: InputMaybe<Scalars['String']>;
  /** Due date of the issue. */
  dueDate?: InputMaybe<Scalars['ISO8601Date']>;
  /** ID of an epic to associate the issue with. */
  epicId?: InputMaybe<Scalars['EpicID']>;
  /** Desired health status. */
  healthStatus?: InputMaybe<HealthStatus>;
  /** IID (internal ID) of a project issue. Only admins and project owners can modify. */
  iid?: InputMaybe<Scalars['Int']>;
  /** Global iteration cadence ID. Required when `iterationWildcardId` is provided. */
  iterationCadenceId?: InputMaybe<Scalars['IterationsCadenceID']>;
  /** Global iteration ID. Mutually exlusive argument with `iterationWildcardId`. */
  iterationId?: InputMaybe<Scalars['IterationID']>;
  /**
   * Iteration wildcard ID. Supported values are: `CURRENT`. Mutually exclusive
   * argument with `iterationId`. iterationCadenceId also required when this
   * argument is provided.
   */
  iterationWildcardId?: InputMaybe<IssueCreationIterationWildcardId>;
  /** IDs of labels to be added to the issue. */
  labelIds?: InputMaybe<Array<Scalars['LabelID']>>;
  /** Labels of the issue. */
  labels?: InputMaybe<Array<Scalars['String']>>;
  /** Indicates discussion is locked on the issue. */
  locked?: InputMaybe<Scalars['Boolean']>;
  /** IID of a merge request for which to resolve discussions. */
  mergeRequestToResolveDiscussionsOf?: InputMaybe<Scalars['MergeRequestID']>;
  /** ID of the milestone to assign to the issue. On update milestone will be removed if set to null. */
  milestoneId?: InputMaybe<Scalars['MilestoneID']>;
  /** Project full path the issue is associated with. */
  projectPath: Scalars['ID'];
  /** Title of the issue. */
  title: Scalars['String'];
  /** Type of the issue. */
  type?: InputMaybe<IssueType>;
  /** Weight of the issue. */
  weight?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of CreateIssue */
export type CreateIssuePayload = {
  __typename?: 'CreateIssuePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of CreateIteration */
export type CreateIterationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the iteration. */
  description?: InputMaybe<Scalars['String']>;
  /** End date of the iteration. */
  dueDate?: InputMaybe<Scalars['String']>;
  /** Full path of the group with which the resource is associated. */
  groupPath?: InputMaybe<Scalars['ID']>;
  /** Global ID of the iterations cadence to be assigned to newly created iteration. */
  iterationsCadenceId?: InputMaybe<Scalars['IterationsCadenceID']>;
  /** Full path of the project with which the resource is associated. */
  projectPath?: InputMaybe<Scalars['ID']>;
  /** Start date of the iteration. */
  startDate?: InputMaybe<Scalars['String']>;
  /** Title of the iteration. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of CreateIteration */
export type CreateIterationPayload = {
  __typename?: 'CreateIterationPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Created iteration. */
  iteration?: Maybe<Iteration>;
};

/** Autogenerated input type of CreateNote */
export type CreateNoteInput = {
  /** Content of the note. */
  body: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Confidentiality flag of a note. Default is false. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the discussion this note is in reply to. */
  discussionId?: InputMaybe<Scalars['DiscussionID']>;
  /** Global ID of the resource to add a note to. */
  noteableId: Scalars['NoteableID'];
};

/** Autogenerated return type of CreateNote */
export type CreateNotePayload = {
  __typename?: 'CreateNotePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Note after mutation. */
  note?: Maybe<Note>;
};

/** Autogenerated input type of CreateRequirement */
export type CreateRequirementInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the requirement. */
  description?: InputMaybe<Scalars['String']>;
  /** Full project path the requirement is associated with. */
  projectPath: Scalars['ID'];
  /** Title of the requirement. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of CreateRequirement */
export type CreateRequirementPayload = {
  __typename?: 'CreateRequirementPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Requirement after mutation. */
  requirement?: Maybe<Requirement>;
};

/** Autogenerated input type of CreateSnippet */
export type CreateSnippetInput = {
  /** Actions to perform over the snippet repository and blobs. */
  blobActions?: InputMaybe<Array<SnippetBlobActionInputType>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the snippet. */
  description?: InputMaybe<Scalars['String']>;
  /** Full path of the project the snippet is associated with. */
  projectPath?: InputMaybe<Scalars['ID']>;
  /** Title of the snippet. */
  title: Scalars['String'];
  /** Paths to files uploaded in the snippet description. */
  uploadedFiles?: InputMaybe<Array<Scalars['String']>>;
  /** Visibility level of the snippet. */
  visibilityLevel: VisibilityLevelsEnum;
};

/** Autogenerated return type of CreateSnippet */
export type CreateSnippetPayload = {
  __typename?: 'CreateSnippetPayload';
  /**
   * CAPTCHA site key which must be used to render a challenge for the user to
   * solve to obtain a valid captchaResponse value. Included only when an operation
   * was not completed because "NeedsCaptchaResponse" is true. Deprecated in 13.11:
   * Use spam protection with HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  captchaSiteKey?: Maybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /**
   * Indicates whether the operation was detected as possible spam and not
   * completed. If CAPTCHA is enabled, the request must be resubmitted with a valid
   * CAPTCHA response and spam_log_id included for the operation to be completed.
   * Included only when an operation was not completed because
   * "NeedsCaptchaResponse" is true. Deprecated in 13.11: Use spam protection with
   * HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  needsCaptchaResponse?: Maybe<Scalars['Boolean']>;
  /** Snippet after mutation. */
  snippet?: Maybe<Snippet>;
  /**
   * Indicates whether the operation was detected as definite spam. There is no
   * option to resubmit the request with a CAPTCHA response. Deprecated in 13.11:
   * Use spam protection with HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  spam?: Maybe<Scalars['Boolean']>;
  /**
   * Spam log ID which must be passed along with a valid CAPTCHA response for an
   * operation to be completed. Included only when an operation was not completed
   * because "NeedsCaptchaResponse" is true. Deprecated in 13.11: Use spam
   * protection with HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  spamLogId?: Maybe<Scalars['Int']>;
};

/** Autogenerated input type of CreateTestCase */
export type CreateTestCaseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Test case description. */
  description?: InputMaybe<Scalars['String']>;
  /** IDs of labels to be added to the test case. */
  labelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** Project full path to create the test case in. */
  projectPath: Scalars['ID'];
  /** Test case title. */
  title: Scalars['String'];
};

/** Autogenerated return type of CreateTestCase */
export type CreateTestCasePayload = {
  __typename?: 'CreateTestCasePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Test case created. */
  testCase?: Maybe<Issue>;
};

/** Represents the current license */
export type CurrentLicense = {
  __typename?: 'CurrentLicense';
  /** Date when the license was activated. */
  activatedAt?: Maybe<Scalars['Date']>;
  /** Number of billable users on the system. */
  billableUsersCount?: Maybe<Scalars['Int']>;
  /** Date, including grace period, when licensed features will be blocked. */
  blockChangesAt?: Maybe<Scalars['Date']>;
  /** Company of the licensee. */
  company?: Maybe<Scalars['String']>;
  /** Email of the licensee. */
  email?: Maybe<Scalars['String']>;
  /** Date when the license expires. */
  expiresAt?: Maybe<Scalars['Date']>;
  /** ID of the license. */
  id: Scalars['ID'];
  /** Date when the license was last synced. */
  lastSync?: Maybe<Scalars['Time']>;
  /** Highest number of billable users on the system during the term of the current license. */
  maximumUserCount?: Maybe<Scalars['Int']>;
  /** Name of the licensee. */
  name?: Maybe<Scalars['String']>;
  /** Name of the subscription plan. */
  plan: Scalars['String'];
  /** Date when the license started. */
  startsAt?: Maybe<Scalars['Date']>;
  /** Type of the license. */
  type: Scalars['String'];
  /** Number of paid users in the license. */
  usersInLicenseCount?: Maybe<Scalars['Int']>;
  /** Number of users over the paid users in the license. */
  usersOverLicenseCount?: Maybe<Scalars['Int']>;
};

export type CurrentUserTodos = {
  /** To-do items for the current user. */
  currentUserTodos: TodoConnection;
};


export type CurrentUserTodosCurrentUserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<TodoStateEnum>;
};

/** A custom emoji uploaded by user */
export type CustomEmoji = {
  __typename?: 'CustomEmoji';
  /** Whether the emoji is an external link. */
  external: Scalars['Boolean'];
  /** ID of the emoji. */
  id: Scalars['CustomEmojiID'];
  /** Name of the emoji. */
  name: Scalars['String'];
  /** Link to file of the emoji. */
  url: Scalars['String'];
};

/** The connection type for CustomEmoji. */
export type CustomEmojiConnection = {
  __typename?: 'CustomEmojiConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CustomEmojiEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CustomEmoji>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type CustomEmojiEdge = {
  __typename?: 'CustomEmojiEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CustomEmoji>;
};

export type CustomerRelationsContact = {
  __typename?: 'CustomerRelationsContact';
  /** Timestamp the contact was created. */
  createdAt: Scalars['Time'];
  /** Description of or notes for the contact. */
  description?: Maybe<Scalars['String']>;
  /** Email address of the contact. */
  email?: Maybe<Scalars['String']>;
  /** First name of the contact. */
  firstName: Scalars['String'];
  /** Internal ID of the contact. */
  id: Scalars['ID'];
  /** Last name of the contact. */
  lastName: Scalars['String'];
  /** Organization of the contact. */
  organization?: Maybe<CustomerRelationsOrganization>;
  /** Phone number of the contact. */
  phone?: Maybe<Scalars['String']>;
  /** Timestamp the contact was last updated. */
  updatedAt: Scalars['Time'];
};

/** The connection type for CustomerRelationsContact. */
export type CustomerRelationsContactConnection = {
  __typename?: 'CustomerRelationsContactConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CustomerRelationsContactEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CustomerRelationsContact>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of CustomerRelationsContactCreate */
export type CustomerRelationsContactCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of or notes for the contact. */
  description?: InputMaybe<Scalars['String']>;
  /** Email address of the contact. */
  email?: InputMaybe<Scalars['String']>;
  /** First name of the contact. */
  firstName: Scalars['String'];
  /** Group for the contact. */
  groupId: Scalars['GroupID'];
  /** Last name of the contact. */
  lastName: Scalars['String'];
  /** Organization for the contact. */
  organizationId?: InputMaybe<Scalars['CustomerRelationsOrganizationID']>;
  /** Phone number of the contact. */
  phone?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of CustomerRelationsContactCreate */
export type CustomerRelationsContactCreatePayload = {
  __typename?: 'CustomerRelationsContactCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Contact after the mutation. */
  contact?: Maybe<CustomerRelationsContact>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type CustomerRelationsContactEdge = {
  __typename?: 'CustomerRelationsContactEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CustomerRelationsContact>;
};

/** Autogenerated input type of CustomerRelationsContactUpdate */
export type CustomerRelationsContactUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of or notes for the contact. */
  description?: InputMaybe<Scalars['String']>;
  /** Email address of the contact. */
  email?: InputMaybe<Scalars['String']>;
  /** First name of the contact. */
  firstName?: InputMaybe<Scalars['String']>;
  /** Global ID of the contact. */
  id: Scalars['CustomerRelationsContactID'];
  /** Last name of the contact. */
  lastName?: InputMaybe<Scalars['String']>;
  /** Organization of the contact. */
  organizationId?: InputMaybe<Scalars['CustomerRelationsOrganizationID']>;
  /** Phone number of the contact. */
  phone?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of CustomerRelationsContactUpdate */
export type CustomerRelationsContactUpdatePayload = {
  __typename?: 'CustomerRelationsContactUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Contact after the mutation. */
  contact?: Maybe<CustomerRelationsContact>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type CustomerRelationsOrganization = {
  __typename?: 'CustomerRelationsOrganization';
  /** Timestamp the organization was created. */
  createdAt: Scalars['Time'];
  /** Standard billing rate for the organization. */
  defaultRate?: Maybe<Scalars['Float']>;
  /** Description of or notes for the organization. */
  description?: Maybe<Scalars['String']>;
  /** Internal ID of the organization. */
  id: Scalars['ID'];
  /** Name of the organization. */
  name: Scalars['String'];
  /** Timestamp the organization was last updated. */
  updatedAt: Scalars['Time'];
};

/** The connection type for CustomerRelationsOrganization. */
export type CustomerRelationsOrganizationConnection = {
  __typename?: 'CustomerRelationsOrganizationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CustomerRelationsOrganizationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<CustomerRelationsOrganization>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of CustomerRelationsOrganizationCreate */
export type CustomerRelationsOrganizationCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Standard billing rate for the organization. */
  defaultRate?: InputMaybe<Scalars['Float']>;
  /** Description of or notes for the organization. */
  description?: InputMaybe<Scalars['String']>;
  /** Group for the organization. */
  groupId: Scalars['GroupID'];
  /** Name of the organization. */
  name: Scalars['String'];
};

/** Autogenerated return type of CustomerRelationsOrganizationCreate */
export type CustomerRelationsOrganizationCreatePayload = {
  __typename?: 'CustomerRelationsOrganizationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Organization after the mutation. */
  organization?: Maybe<CustomerRelationsOrganization>;
};

/** An edge in a connection. */
export type CustomerRelationsOrganizationEdge = {
  __typename?: 'CustomerRelationsOrganizationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<CustomerRelationsOrganization>;
};

/** Autogenerated input type of CustomerRelationsOrganizationUpdate */
export type CustomerRelationsOrganizationUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Standard billing rate for the organization. */
  defaultRate?: InputMaybe<Scalars['Float']>;
  /** Description of or notes for the organization. */
  description?: InputMaybe<Scalars['String']>;
  /** Global ID of the organization. */
  id: Scalars['CustomerRelationsOrganizationID'];
  /** Name of the organization. */
  name?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of CustomerRelationsOrganizationUpdate */
export type CustomerRelationsOrganizationUpdatePayload = {
  __typename?: 'CustomerRelationsOrganizationUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Organization after the mutation. */
  organization: CustomerRelationsOrganization;
};

/** Autogenerated input type of DastOnDemandScanCreate */
export type DastOnDemandScanCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the scanner profile to be used for the scan. */
  dastScannerProfileId?: InputMaybe<Scalars['DastScannerProfileID']>;
  /** ID of the site profile to be used for the scan. */
  dastSiteProfileId: Scalars['DastSiteProfileID'];
  /** Project the site profile belongs to. */
  fullPath: Scalars['ID'];
};

/** Autogenerated return type of DastOnDemandScanCreate */
export type DastOnDemandScanCreatePayload = {
  __typename?: 'DastOnDemandScanCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** URL of the pipeline that was created. */
  pipelineUrl?: Maybe<Scalars['String']>;
};

/** Represents a DAST Profile */
export type DastProfile = {
  __typename?: 'DastProfile';
  /** Associated branch. */
  branch?: Maybe<DastProfileBranch>;
  /** Associated profile schedule. */
  dastProfileSchedule?: Maybe<DastProfileSchedule>;
  /** Associated scanner profile. */
  dastScannerProfile?: Maybe<DastScannerProfile>;
  /** Associated site profile. */
  dastSiteProfile?: Maybe<DastSiteProfile>;
  /** Description of the scan. */
  description?: Maybe<Scalars['String']>;
  /** Relative web path to the edit page of a profile. */
  editPath?: Maybe<Scalars['String']>;
  /** ID of the profile. */
  id: Scalars['DastProfileID'];
  /** Name of the profile. */
  name?: Maybe<Scalars['String']>;
};

/** Represents a DAST Profile Branch */
export type DastProfileBranch = {
  __typename?: 'DastProfileBranch';
  /** Indicates whether or not the branch exists. */
  exists?: Maybe<Scalars['Boolean']>;
  /** Name of the branch. */
  name?: Maybe<Scalars['String']>;
};

/** Represents DAST Profile Cadence. */
export type DastProfileCadence = {
  __typename?: 'DastProfileCadence';
  /** Duration of the DAST profile cadence. */
  duration?: Maybe<Scalars['Int']>;
  /** Unit for the duration of DAST profile cadence. */
  unit?: Maybe<DastProfileCadenceUnit>;
};

/** Represents DAST Profile Cadence. */
export type DastProfileCadenceInput = {
  /** Duration of the DAST Profile Cadence. */
  duration?: InputMaybe<Scalars['Int']>;
  /** Unit for the duration of DAST Profile Cadence. */
  unit?: InputMaybe<DastProfileCadenceUnit>;
};

/** Unit for the duration of Dast Profile Cadence. */
export type DastProfileCadenceUnit =
  /** DAST Profile Cadence duration in days. */
  | 'DAY'
  /** DAST Profile Cadence duration in months. */
  | 'MONTH'
  /** DAST Profile Cadence duration in weeks. */
  | 'WEEK'
  /** DAST Profile Cadence duration in years. */
  | 'YEAR';

/** The connection type for DastProfile. */
export type DastProfileConnection = {
  __typename?: 'DastProfileConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DastProfileEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DastProfile>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of DastProfileCreate */
export type DastProfileCreateInput = {
  /** Associated branch. */
  branchName?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Represents a DAST Profile Schedule. */
  dastProfileSchedule?: InputMaybe<DastProfileScheduleInput>;
  /** ID of the scanner profile to be associated. */
  dastScannerProfileId: Scalars['DastScannerProfileID'];
  /** ID of the site profile to be associated. */
  dastSiteProfileId: Scalars['DastSiteProfileID'];
  /** Description of the profile. Defaults to an empty string. */
  description?: InputMaybe<Scalars['String']>;
  /** Project the profile belongs to. */
  fullPath: Scalars['ID'];
  /** Name of the profile. */
  name: Scalars['String'];
  /** Run scan using profile after creation. Defaults to false. */
  runAfterCreate?: InputMaybe<Scalars['Boolean']>;
};

/** Autogenerated return type of DastProfileCreate */
export type DastProfileCreatePayload = {
  __typename?: 'DastProfileCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Created profile. */
  dastProfile?: Maybe<DastProfile>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** URL of the pipeline that was created. Requires `runAfterCreate` to be set to `true`. */
  pipelineUrl?: Maybe<Scalars['String']>;
};

/** Autogenerated input type of DastProfileDelete */
export type DastProfileDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the profile to be deleted. */
  id: Scalars['DastProfileID'];
};

/** Autogenerated return type of DastProfileDelete */
export type DastProfileDeletePayload = {
  __typename?: 'DastProfileDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type DastProfileEdge = {
  __typename?: 'DastProfileEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DastProfile>;
};

/** Autogenerated input type of DastProfileRun */
export type DastProfileRunInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the profile to be used for the scan. */
  id: Scalars['DastProfileID'];
};

/** Autogenerated return type of DastProfileRun */
export type DastProfileRunPayload = {
  __typename?: 'DastProfileRunPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** URL of the pipeline that was created. */
  pipelineUrl?: Maybe<Scalars['String']>;
};

/** Represents a DAST profile schedule. */
export type DastProfileSchedule = {
  __typename?: 'DastProfileSchedule';
  /** Status of the DAST profile schedule. */
  active?: Maybe<Scalars['Boolean']>;
  /** Cadence of the DAST profile schedule. */
  cadence?: Maybe<DastProfileCadence>;
  /** ID of the DAST profile schedule. */
  id: Scalars['DastProfileScheduleID'];
  /** Next run time of the DAST profile schedule in the given timezone. */
  nextRunAt?: Maybe<Scalars['Time']>;
  /** Start time of the DAST profile schedule in the given timezone. */
  startsAt?: Maybe<Scalars['Time']>;
  /** Time zone of the start time of the DAST profile schedule. */
  timezone?: Maybe<Scalars['String']>;
};

/** Input type for DAST Profile Schedules */
export type DastProfileScheduleInput = {
  /** Status of a Dast Profile Schedule. */
  active?: InputMaybe<Scalars['Boolean']>;
  /** Cadence of a Dast Profile Schedule. */
  cadence?: InputMaybe<DastProfileCadenceInput>;
  /** Start time of a Dast Profile Schedule. */
  startsAt?: InputMaybe<Scalars['Time']>;
  /** Time Zone for the Start time of a Dast Profile Schedule. */
  timezone?: InputMaybe<Scalars['String']>;
};

/** Autogenerated input type of DastProfileUpdate */
export type DastProfileUpdateInput = {
  /** Associated branch. */
  branchName?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Represents a DAST profile schedule. */
  dastProfileSchedule?: InputMaybe<DastProfileScheduleInput>;
  /** ID of the scanner profile to be associated. */
  dastScannerProfileId?: InputMaybe<Scalars['DastScannerProfileID']>;
  /** ID of the site profile to be associated. */
  dastSiteProfileId?: InputMaybe<Scalars['DastSiteProfileID']>;
  /** Description of the profile. Defaults to an empty string. */
  description?: InputMaybe<Scalars['String']>;
  /** ID of the profile to be deleted. */
  id: Scalars['DastProfileID'];
  /** Name of the profile. */
  name?: InputMaybe<Scalars['String']>;
  /** Run scan using profile after update. Defaults to false. */
  runAfterUpdate?: InputMaybe<Scalars['Boolean']>;
};

/** Autogenerated return type of DastProfileUpdate */
export type DastProfileUpdatePayload = {
  __typename?: 'DastProfileUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Updated profile. */
  dastProfile?: Maybe<DastProfile>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /**
   * The URL of the pipeline that was created. Requires the input argument
   * `runAfterUpdate` to be set to `true` when calling the mutation, otherwise no
   * pipeline will be created.
   */
  pipelineUrl?: Maybe<Scalars['String']>;
};

export type DastScanTypeEnum =
  /** Active DAST scan. This scan will make active attacks against the target site. */
  | 'ACTIVE'
  /** Passive DAST scan. This scan will not make active attacks against the target site. */
  | 'PASSIVE';

/** Represents a DAST scanner profile */
export type DastScannerProfile = {
  __typename?: 'DastScannerProfile';
  /** Relative web path to the edit page of a scanner profile. */
  editPath?: Maybe<Scalars['String']>;
  /** ID of the DAST scanner profile. */
  id: Scalars['DastScannerProfileID'];
  /** Name of the DAST scanner profile. */
  profileName?: Maybe<Scalars['String']>;
  /** List of security policy names that are referencing given project. */
  referencedInSecurityPolicies?: Maybe<Array<Scalars['String']>>;
  /** Indicates the type of DAST scan that will run. Either a Passive Scan or an Active Scan. */
  scanType?: Maybe<DastScanTypeEnum>;
  /** Indicates if debug messages should be included in DAST console output. True to include the debug messages. */
  showDebugMessages: Scalars['Boolean'];
  /** Maximum number of minutes allowed for the spider to traverse the site. */
  spiderTimeout?: Maybe<Scalars['Int']>;
  /** Maximum number of seconds allowed for the site under test to respond to a request. */
  targetTimeout?: Maybe<Scalars['Int']>;
  /**
   * Indicates if the AJAX spider should be used to crawl the target site. True to
   * run the AJAX spider in addition to the traditional spider, and false to run
   * only the traditional spider.
   */
  useAjaxSpider: Scalars['Boolean'];
};

/** The connection type for DastScannerProfile. */
export type DastScannerProfileConnection = {
  __typename?: 'DastScannerProfileConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DastScannerProfileEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DastScannerProfile>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of DastScannerProfileCreate */
export type DastScannerProfileCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project the scanner profile belongs to. */
  fullPath: Scalars['ID'];
  /** Name of the scanner profile. */
  profileName: Scalars['String'];
  /** Indicates the type of DAST scan that will run. Either a Passive Scan or an Active Scan. */
  scanType?: InputMaybe<DastScanTypeEnum>;
  /** Indicates if debug messages should be included in DAST console output. True to include the debug messages. */
  showDebugMessages?: InputMaybe<Scalars['Boolean']>;
  /** Maximum number of minutes allowed for the spider to traverse the site. */
  spiderTimeout?: InputMaybe<Scalars['Int']>;
  /** Maximum number of seconds allowed for the site under test to respond to a request. */
  targetTimeout?: InputMaybe<Scalars['Int']>;
  /**
   * Indicates if the AJAX spider should be used to crawl the target site. True to
   * run the AJAX spider in addition to the traditional spider, and false to run
   * only the traditional spider.
   */
  useAjaxSpider?: InputMaybe<Scalars['Boolean']>;
};

/** Autogenerated return type of DastScannerProfileCreate */
export type DastScannerProfileCreatePayload = {
  __typename?: 'DastScannerProfileCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** ID of the scanner profile. */
  id?: Maybe<Scalars['DastScannerProfileID']>;
};

/** Autogenerated input type of DastScannerProfileDelete */
export type DastScannerProfileDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the scanner profile to be deleted. */
  id: Scalars['DastScannerProfileID'];
};

/** Autogenerated return type of DastScannerProfileDelete */
export type DastScannerProfileDeletePayload = {
  __typename?: 'DastScannerProfileDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type DastScannerProfileEdge = {
  __typename?: 'DastScannerProfileEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DastScannerProfile>;
};

/** Autogenerated input type of DastScannerProfileUpdate */
export type DastScannerProfileUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the scanner profile to be updated. */
  id: Scalars['DastScannerProfileID'];
  /** Name of the scanner profile. */
  profileName: Scalars['String'];
  /** Indicates the type of DAST scan that will run. Either a Passive Scan or an Active Scan. */
  scanType?: InputMaybe<DastScanTypeEnum>;
  /** Indicates if debug messages should be included in DAST console output. True to include the debug messages. */
  showDebugMessages?: InputMaybe<Scalars['Boolean']>;
  /** Maximum number of minutes allowed for the spider to traverse the site. */
  spiderTimeout: Scalars['Int'];
  /** Maximum number of seconds allowed for the site under test to respond to a request. */
  targetTimeout: Scalars['Int'];
  /**
   * Indicates if the AJAX spider should be used to crawl the target site. True to
   * run the AJAX spider in addition to the traditional spider, and false to run
   * only the traditional spider.
   */
  useAjaxSpider?: InputMaybe<Scalars['Boolean']>;
};

/** Autogenerated return type of DastScannerProfileUpdate */
export type DastScannerProfileUpdatePayload = {
  __typename?: 'DastScannerProfileUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** ID of the scanner profile. */
  id?: Maybe<Scalars['DastScannerProfileID']>;
};

/** Represents a DAST Site Profile */
export type DastSiteProfile = {
  __typename?: 'DastSiteProfile';
  /** Target authentication details. */
  auth?: Maybe<DastSiteProfileAuth>;
  /** Relative web path to the edit page of a site profile. */
  editPath?: Maybe<Scalars['String']>;
  /** URLs to skip during an authenticated scan. */
  excludedUrls?: Maybe<Array<Scalars['String']>>;
  /** ID of the site profile. */
  id: Scalars['DastSiteProfileID'];
  /** Normalized URL of the target to be scanned. */
  normalizedTargetUrl?: Maybe<Scalars['String']>;
  /** Name of the site profile. */
  profileName?: Maybe<Scalars['String']>;
  /** List of security policy names that are referencing given project. */
  referencedInSecurityPolicies?: Maybe<Array<Scalars['String']>>;
  /** Comma-separated list of request header names and values to be added to every request made by DAST. */
  requestHeaders?: Maybe<Scalars['String']>;
  /** Type of target to be scanned. */
  targetType?: Maybe<DastTargetTypeEnum>;
  /** URL of the target to be scanned. */
  targetUrl?: Maybe<Scalars['String']>;
  /** Permissions for the current user on the resource */
  userPermissions: DastSiteProfilePermissions;
  /** Current validation status of the site profile. */
  validationStatus?: Maybe<DastSiteProfileValidationStatusEnum>;
};

/** Input type for DastSiteProfile authentication */
export type DastSiteProfileAuth = {
  __typename?: 'DastSiteProfileAuth';
  /** Indicates whether authentication is enabled. */
  enabled?: Maybe<Scalars['Boolean']>;
  /** Redacted password to authenticate with on the target website. */
  password?: Maybe<Scalars['String']>;
  /** Name of password field at the sign-in HTML form. */
  passwordField?: Maybe<Scalars['String']>;
  /** The URL of the page containing the sign-in HTML form on the target website. */
  url?: Maybe<Scalars['String']>;
  /** Username to authenticate with on the target website. */
  username?: Maybe<Scalars['String']>;
  /** Name of username field at the sign-in HTML form. */
  usernameField?: Maybe<Scalars['String']>;
};

/** Input type for DastSiteProfile authentication */
export type DastSiteProfileAuthInput = {
  /** Indicates whether authentication is enabled. */
  enabled?: InputMaybe<Scalars['Boolean']>;
  /** Password to authenticate with on the target website. */
  password?: InputMaybe<Scalars['String']>;
  /** Name of password field at the sign-in HTML form. */
  passwordField?: InputMaybe<Scalars['String']>;
  /** The URL of the page containing the sign-in HTML form on the target website. */
  url?: InputMaybe<Scalars['String']>;
  /** Username to authenticate with on the target website. */
  username?: InputMaybe<Scalars['String']>;
  /** Name of username field at the sign-in HTML form. */
  usernameField?: InputMaybe<Scalars['String']>;
};

/** The connection type for DastSiteProfile. */
export type DastSiteProfileConnection = {
  __typename?: 'DastSiteProfileConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DastSiteProfileEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DastSiteProfile>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of DastSiteProfileCreate */
export type DastSiteProfileCreateInput = {
  /** Parameters for authentication. */
  auth?: InputMaybe<DastSiteProfileAuthInput>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** URLs to skip during an authenticated scan. Defaults to `[]`. */
  excludedUrls?: InputMaybe<Array<Scalars['String']>>;
  /** Project the site profile belongs to. */
  fullPath: Scalars['ID'];
  /** Name of the site profile. */
  profileName: Scalars['String'];
  /** Comma-separated list of request header names and values to be added to every request made by DAST. */
  requestHeaders?: InputMaybe<Scalars['String']>;
  /** Type of target to be scanned. */
  targetType?: InputMaybe<DastTargetTypeEnum>;
  /** URL of the target to be scanned. */
  targetUrl?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of DastSiteProfileCreate */
export type DastSiteProfileCreatePayload = {
  __typename?: 'DastSiteProfileCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** ID of the site profile. */
  id?: Maybe<Scalars['DastSiteProfileID']>;
};

/** Autogenerated input type of DastSiteProfileDelete */
export type DastSiteProfileDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the site profile to be deleted. */
  id: Scalars['DastSiteProfileID'];
};

/** Autogenerated return type of DastSiteProfileDelete */
export type DastSiteProfileDeletePayload = {
  __typename?: 'DastSiteProfileDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type DastSiteProfileEdge = {
  __typename?: 'DastSiteProfileEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DastSiteProfile>;
};

/** Check permissions for the current user on site profile */
export type DastSiteProfilePermissions = {
  __typename?: 'DastSiteProfilePermissions';
  /** Indicates the user can perform `create_on_demand_dast_scan` on this resource */
  createOnDemandDastScan: Scalars['Boolean'];
};

/** Autogenerated input type of DastSiteProfileUpdate */
export type DastSiteProfileUpdateInput = {
  /** Parameters for authentication. */
  auth?: InputMaybe<DastSiteProfileAuthInput>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** URLs to skip during an authenticated scan. */
  excludedUrls?: InputMaybe<Array<Scalars['String']>>;
  /** ID of the site profile to be updated. */
  id: Scalars['DastSiteProfileID'];
  /** Name of the site profile. */
  profileName: Scalars['String'];
  /** Comma-separated list of request header names and values to be added to every request made by DAST. */
  requestHeaders?: InputMaybe<Scalars['String']>;
  /** Type of target to be scanned. */
  targetType?: InputMaybe<DastTargetTypeEnum>;
  /** URL of the target to be scanned. */
  targetUrl?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of DastSiteProfileUpdate */
export type DastSiteProfileUpdatePayload = {
  __typename?: 'DastSiteProfileUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** ID of the site profile. */
  id?: Maybe<Scalars['DastSiteProfileID']>;
};

export type DastSiteProfileValidationStatusEnum =
  /** Site validation process finished but failed. */
  | 'FAILED_VALIDATION'
  /** Site validation process is in progress. */
  | 'INPROGRESS_VALIDATION'
  /** No site validation exists. */
  | 'NONE'
  /** Site validation process finished successfully. */
  | 'PASSED_VALIDATION'
  /** Site validation process has not started. */
  | 'PENDING_VALIDATION';

/** Autogenerated input type of DastSiteTokenCreate */
export type DastSiteTokenCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project the site token belongs to. */
  fullPath: Scalars['ID'];
  /** URL of the target to be validated. */
  targetUrl?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of DastSiteTokenCreate */
export type DastSiteTokenCreatePayload = {
  __typename?: 'DastSiteTokenCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** ID of the site token. */
  id?: Maybe<Scalars['DastSiteTokenID']>;
  /** Current validation status of the target. */
  status?: Maybe<DastSiteProfileValidationStatusEnum>;
  /** Token string. */
  token?: Maybe<Scalars['String']>;
};

/** Represents a DAST Site Validation */
export type DastSiteValidation = {
  __typename?: 'DastSiteValidation';
  /** Global ID of the site validation. */
  id: Scalars['DastSiteValidationID'];
  /** Normalized URL of the target to be validated. */
  normalizedTargetUrl?: Maybe<Scalars['String']>;
  /** Status of the site validation. */
  status: DastSiteProfileValidationStatusEnum;
};

/** The connection type for DastSiteValidation. */
export type DastSiteValidationConnection = {
  __typename?: 'DastSiteValidationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DastSiteValidationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DastSiteValidation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of DastSiteValidationCreate */
export type DastSiteValidationCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the site token. */
  dastSiteTokenId: Scalars['DastSiteTokenID'];
  /** Project the site profile belongs to. */
  fullPath: Scalars['ID'];
  /** Validation strategy to be used. */
  strategy?: InputMaybe<DastSiteValidationStrategyEnum>;
  /** Path to be requested during validation. */
  validationPath: Scalars['String'];
};

/** Autogenerated return type of DastSiteValidationCreate */
export type DastSiteValidationCreatePayload = {
  __typename?: 'DastSiteValidationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** ID of the site validation. */
  id?: Maybe<Scalars['DastSiteValidationID']>;
  /** Current validation status. */
  status?: Maybe<DastSiteProfileValidationStatusEnum>;
};

/** An edge in a connection. */
export type DastSiteValidationEdge = {
  __typename?: 'DastSiteValidationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DastSiteValidation>;
};

/** Autogenerated input type of DastSiteValidationRevoke */
export type DastSiteValidationRevokeInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project the site validation belongs to. */
  fullPath: Scalars['ID'];
  /** Normalized URL of the target to be revoked. */
  normalizedTargetUrl: Scalars['String'];
};

/** Autogenerated return type of DastSiteValidationRevoke */
export type DastSiteValidationRevokePayload = {
  __typename?: 'DastSiteValidationRevokePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type DastSiteValidationStatusEnum =
  /** Site validation process finished but failed. */
  | 'FAILED_VALIDATION'
  /** Site validation process is in progress. */
  | 'INPROGRESS_VALIDATION'
  /** Site validation process finished successfully. */
  | 'PASSED_VALIDATION'
  /** Site validation process has not started. */
  | 'PENDING_VALIDATION';

export type DastSiteValidationStrategyEnum =
  /** Header validation. */
  | 'HEADER'
  /** Meta tag validation. */
  | 'META_TAG'
  /** Text file validation. */
  | 'TEXT_FILE';

export type DastTargetTypeEnum =
  /** API target. */
  | 'API'
  /** Website target. */
  | 'WEBSITE';

/** Color of the data visualization palette */
export type DataVisualizationColorEnum =
  /** Aqua color */
  | 'AQUA'
  /** Blue color */
  | 'BLUE'
  /** Green color */
  | 'GREEN'
  /** Magenta color */
  | 'MAGENTA'
  /** Orange color */
  | 'ORANGE';

/** Weight of the data visualization palette */
export type DataVisualizationWeightEnum =
  /** 50 weight */
  | 'WEIGHT_50'
  /** 100 weight */
  | 'WEIGHT_100'
  /** 200 weight */
  | 'WEIGHT_200'
  /** 300 weight */
  | 'WEIGHT_300'
  /** 400 weight */
  | 'WEIGHT_400'
  /** 500 weight */
  | 'WEIGHT_500'
  /** 600 weight */
  | 'WEIGHT_600'
  /** 700 weight */
  | 'WEIGHT_700'
  /** 800 weight */
  | 'WEIGHT_800'
  /** 900 weight */
  | 'WEIGHT_900'
  /** 950 weight */
  | 'WEIGHT_950';

/** Autogenerated input type of DeleteAnnotation */
export type DeleteAnnotationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the annotation to delete. */
  id: Scalars['MetricsDashboardAnnotationID'];
};

/** Autogenerated return type of DeleteAnnotation */
export type DeleteAnnotationPayload = {
  __typename?: 'DeleteAnnotationPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** The response from the AdminSidekiqQueuesDeleteJobs mutation */
export type DeleteJobsResponse = {
  __typename?: 'DeleteJobsResponse';
  /** Whether or not the entire queue was processed in time; if not, retrying the same request is safe. */
  completed?: Maybe<Scalars['Boolean']>;
  /** Number of matching jobs deleted. */
  deletedJobs?: Maybe<Scalars['Int']>;
  /** Queue size after processing. */
  queueSize?: Maybe<Scalars['Int']>;
};

/** Represents metadata associated with a dependency link */
export type DependencyLinkMetadata = NugetDependencyLinkMetadata;

/** Dependency proxy blob */
export type DependencyProxyBlob = {
  __typename?: 'DependencyProxyBlob';
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** Name of the blob. */
  fileName: Scalars['String'];
  /** Size of the blob file. */
  size: Scalars['String'];
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
};

/** The connection type for DependencyProxyBlob. */
export type DependencyProxyBlobConnection = {
  __typename?: 'DependencyProxyBlobConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DependencyProxyBlobEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DependencyProxyBlob>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DependencyProxyBlobEdge = {
  __typename?: 'DependencyProxyBlobEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DependencyProxyBlob>;
};

/** Group-level Dependency Proxy TTL policy settings */
export type DependencyProxyImageTtlGroupPolicy = {
  __typename?: 'DependencyProxyImageTtlGroupPolicy';
  /** Timestamp of creation. */
  createdAt?: Maybe<Scalars['Time']>;
  /** Indicates whether the policy is enabled or disabled. */
  enabled: Scalars['Boolean'];
  /** Number of days to retain a cached image file. */
  ttl?: Maybe<Scalars['Int']>;
  /** Timestamp of the most recent update. */
  updatedAt?: Maybe<Scalars['Time']>;
};

/** Dependency proxy manifest */
export type DependencyProxyManifest = {
  __typename?: 'DependencyProxyManifest';
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** Digest of the manifest. */
  digest: Scalars['String'];
  /** Name of the manifest. */
  fileName: Scalars['String'];
  /** Name of the image. */
  imageName: Scalars['String'];
  /** Size of the manifest file. */
  size: Scalars['String'];
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
};

/** The connection type for DependencyProxyManifest. */
export type DependencyProxyManifestConnection = {
  __typename?: 'DependencyProxyManifestConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DependencyProxyManifestEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DependencyProxyManifest>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DependencyProxyManifestEdge = {
  __typename?: 'DependencyProxyManifestEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DependencyProxyManifest>;
};

/** Group-level Dependency Proxy settings */
export type DependencyProxySetting = {
  __typename?: 'DependencyProxySetting';
  /** Indicates whether the dependency proxy is enabled for the group. */
  enabled: Scalars['Boolean'];
};

/** All environment deployment tiers. */
export type DeploymentTier =
  /** Development. */
  | 'DEVELOPMENT'
  /** Other. */
  | 'OTHER'
  /** Production. */
  | 'PRODUCTION'
  /** Staging. */
  | 'STAGING'
  /** Testing. */
  | 'TESTING';

/** A single design */
export type Design = CurrentUserTodos & DesignFields & NoteableInterface & {
  __typename?: 'Design';
  /** To-do items for the current user. */
  currentUserTodos: TodoConnection;
  /** Diff refs for this design. */
  diffRefs: DiffRefs;
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** How this design was changed in the current version. */
  event: DesignVersionEvent;
  /** Filename of the design. */
  filename: Scalars['String'];
  /** Full path to the design file. */
  fullPath: Scalars['String'];
  /** ID of this design. */
  id: Scalars['ID'];
  /** URL of the full-sized image. */
  image: Scalars['String'];
  /** The URL of the design resized to fit within the bounds of 432x230. This will be `null` if the image has not been generated */
  imageV432x230?: Maybe<Scalars['String']>;
  /** Issue the design belongs to. */
  issue: Issue;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** Total count of user-created notes for this design. */
  notesCount: Scalars['Int'];
  /** Project the design belongs to. */
  project: Project;
  /** All versions related to this design ordered newest first. */
  versions: DesignVersionConnection;
};


/** A single design */
export type DesignCurrentUserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<TodoStateEnum>;
};


/** A single design */
export type DesignDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A single design */
export type DesignNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A single design */
export type DesignVersionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  earlierOrEqualToId?: InputMaybe<Scalars['DesignManagementVersionID']>;
  earlierOrEqualToSha?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** A design pinned to a specific version. The image field reflects the design as of the associated version */
export type DesignAtVersion = DesignFields & {
  __typename?: 'DesignAtVersion';
  /** Underlying design. */
  design: Design;
  /** Diff refs for this design. */
  diffRefs: DiffRefs;
  /** How this design was changed in the current version. */
  event: DesignVersionEvent;
  /** Filename of the design. */
  filename: Scalars['String'];
  /** Full path to the design file. */
  fullPath: Scalars['String'];
  /** ID of this design. */
  id: Scalars['ID'];
  /** URL of the full-sized image. */
  image: Scalars['String'];
  /** The URL of the design resized to fit within the bounds of 432x230. This will be `null` if the image has not been generated */
  imageV432x230?: Maybe<Scalars['String']>;
  /** Issue the design belongs to. */
  issue: Issue;
  /** Total count of user-created notes for this design. */
  notesCount: Scalars['Int'];
  /** Project the design belongs to. */
  project: Project;
  /** Version this design-at-versions is pinned to. */
  version: DesignVersion;
};

/** The connection type for DesignAtVersion. */
export type DesignAtVersionConnection = {
  __typename?: 'DesignAtVersionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DesignAtVersionEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DesignAtVersion>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DesignAtVersionEdge = {
  __typename?: 'DesignAtVersionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DesignAtVersion>;
};

/** A collection of designs */
export type DesignCollection = {
  __typename?: 'DesignCollection';
  /** Copy state of the design collection. */
  copyState?: Maybe<DesignCollectionCopyState>;
  /** Find a specific design. */
  design?: Maybe<Design>;
  /** Find a design as of a version. */
  designAtVersion?: Maybe<DesignAtVersion>;
  /** All designs for the design collection. */
  designs: DesignConnection;
  /** Issue associated with the design collection. */
  issue: Issue;
  /** Project associated with the design collection. */
  project: Project;
  /** A specific version. */
  version?: Maybe<DesignVersion>;
  /** All versions related to all designs, ordered newest first. */
  versions: DesignVersionConnection;
};


/** A collection of designs */
export type DesignCollectionDesignArgs = {
  filename?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['DesignManagementDesignID']>;
};


/** A collection of designs */
export type DesignCollectionDesignAtVersionArgs = {
  id: Scalars['DesignManagementDesignAtVersionID'];
};


/** A collection of designs */
export type DesignCollectionDesignsArgs = {
  after?: InputMaybe<Scalars['String']>;
  atVersion?: InputMaybe<Scalars['DesignManagementVersionID']>;
  before?: InputMaybe<Scalars['String']>;
  filenames?: InputMaybe<Array<Scalars['String']>>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['DesignManagementDesignID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A collection of designs */
export type DesignCollectionVersionArgs = {
  id?: InputMaybe<Scalars['DesignManagementVersionID']>;
  sha?: InputMaybe<Scalars['String']>;
};


/** A collection of designs */
export type DesignCollectionVersionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  earlierOrEqualToId?: InputMaybe<Scalars['DesignManagementVersionID']>;
  earlierOrEqualToSha?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Copy state of a DesignCollection */
export type DesignCollectionCopyState =
  /** The DesignCollection encountered an error during a copy */
  | 'ERROR'
  /** The DesignCollection is being copied */
  | 'IN_PROGRESS'
  /** The DesignCollection has no copy in progress */
  | 'READY';

/** The connection type for Design. */
export type DesignConnection = {
  __typename?: 'DesignConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DesignEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Design>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DesignEdge = {
  __typename?: 'DesignEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Design>;
};

export type DesignFields = {
  /** Diff refs for this design. */
  diffRefs: DiffRefs;
  /** How this design was changed in the current version. */
  event: DesignVersionEvent;
  /** Filename of the design. */
  filename: Scalars['String'];
  /** Full path to the design file. */
  fullPath: Scalars['String'];
  /** ID of this design. */
  id: Scalars['ID'];
  /** URL of the full-sized image. */
  image: Scalars['String'];
  /** The URL of the design resized to fit within the bounds of 432x230. This will be `null` if the image has not been generated */
  imageV432x230?: Maybe<Scalars['String']>;
  /** Issue the design belongs to. */
  issue: Issue;
  /** Total count of user-created notes for this design. */
  notesCount: Scalars['Int'];
  /** Project the design belongs to. */
  project: Project;
};

export type DesignManagement = {
  __typename?: 'DesignManagement';
  /** Find a design as of a version. */
  designAtVersion?: Maybe<DesignAtVersion>;
  /** Find a version. */
  version?: Maybe<DesignVersion>;
};


export type DesignManagementDesignAtVersionArgs = {
  id: Scalars['DesignManagementDesignAtVersionID'];
};


export type DesignManagementVersionArgs = {
  id: Scalars['DesignManagementVersionID'];
};

/** Autogenerated input type of DesignManagementDelete */
export type DesignManagementDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Filenames of the designs to delete. */
  filenames: Array<Scalars['String']>;
  /** IID of the issue to modify designs for. */
  iid: Scalars['ID'];
  /** Project where the issue is to upload designs for. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of DesignManagementDelete */
export type DesignManagementDeletePayload = {
  __typename?: 'DesignManagementDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** New version in which the designs are deleted. */
  version?: Maybe<DesignVersion>;
};

/** Autogenerated input type of DesignManagementMove */
export type DesignManagementMoveInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the design to move. */
  id: Scalars['DesignManagementDesignID'];
  /** ID of the immediately following design. */
  next?: InputMaybe<Scalars['DesignManagementDesignID']>;
  /** ID of the immediately preceding design. */
  previous?: InputMaybe<Scalars['DesignManagementDesignID']>;
};

/** Autogenerated return type of DesignManagementMove */
export type DesignManagementMovePayload = {
  __typename?: 'DesignManagementMovePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Current state of the collection. */
  designCollection?: Maybe<DesignCollection>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DesignManagementUpload */
export type DesignManagementUploadInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Files to upload. */
  files: Array<Scalars['Upload']>;
  /** IID of the issue to modify designs for. */
  iid: Scalars['ID'];
  /** Project where the issue is to upload designs for. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of DesignManagementUpload */
export type DesignManagementUploadPayload = {
  __typename?: 'DesignManagementUploadPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Designs that were uploaded by the mutation. */
  designs: Array<Design>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Any designs that were skipped from the upload due to there being no change to their content since their last version */
  skippedDesigns: Array<Design>;
};

/** A specific version in which designs were added, modified or deleted */
export type DesignVersion = {
  __typename?: 'DesignVersion';
  /** Author of the version. */
  author: UserCore;
  /** Timestamp of when the version was created. */
  createdAt: Scalars['Time'];
  /** A particular design as of this version, provided it is visible at this version. */
  designAtVersion: DesignAtVersion;
  /** All designs that were changed in the version. */
  designs: DesignConnection;
  /** All designs that are visible at this version, as of this version. */
  designsAtVersion: DesignAtVersionConnection;
  /** ID of the design version. */
  id: Scalars['ID'];
  /** SHA of the design version. */
  sha: Scalars['ID'];
};


/** A specific version in which designs were added, modified or deleted */
export type DesignVersionDesignAtVersionArgs = {
  designId?: InputMaybe<Scalars['DesignManagementDesignID']>;
  filename?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['DesignManagementDesignAtVersionID']>;
};


/** A specific version in which designs were added, modified or deleted */
export type DesignVersionDesignsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A specific version in which designs were added, modified or deleted */
export type DesignVersionDesignsAtVersionArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filenames?: InputMaybe<Array<Scalars['String']>>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['DesignManagementDesignID']>>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for DesignVersion. */
export type DesignVersionConnection = {
  __typename?: 'DesignVersionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DesignVersionEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DesignVersion>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DesignVersionEdge = {
  __typename?: 'DesignVersionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DesignVersion>;
};

/** Mutation event of a design within a version */
export type DesignVersionEvent =
  /** A creation event */
  | 'CREATION'
  /** A deletion event */
  | 'DELETION'
  /** A modification event */
  | 'MODIFICATION'
  /** No change. */
  | 'NONE';

/** Autogenerated input type of DestroyBoard */
export type DestroyBoardInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the board to destroy. */
  id: Scalars['BoardID'];
};

/** Autogenerated input type of DestroyBoardList */
export type DestroyBoardListInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the list to destroy. Only label lists are accepted. */
  listId: Scalars['ListID'];
};

/** Autogenerated return type of DestroyBoardList */
export type DestroyBoardListPayload = {
  __typename?: 'DestroyBoardListPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** List after mutation. */
  list?: Maybe<BoardList>;
};

/** Autogenerated return type of DestroyBoard */
export type DestroyBoardPayload = {
  __typename?: 'DestroyBoardPayload';
  /** Board after mutation. */
  board?: Maybe<Board>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroyComplianceFramework */
export type DestroyComplianceFrameworkInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the compliance framework to destroy. */
  id: Scalars['ComplianceManagementFrameworkID'];
};

/** Autogenerated return type of DestroyComplianceFramework */
export type DestroyComplianceFrameworkPayload = {
  __typename?: 'DestroyComplianceFrameworkPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroyContainerRepository */
export type DestroyContainerRepositoryInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the container repository. */
  id: Scalars['ContainerRepositoryID'];
};

/** Autogenerated return type of DestroyContainerRepository */
export type DestroyContainerRepositoryPayload = {
  __typename?: 'DestroyContainerRepositoryPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Container repository policy after scheduling the deletion. */
  containerRepository: ContainerRepository;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroyContainerRepositoryTags */
export type DestroyContainerRepositoryTagsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the container repository. */
  id: Scalars['ContainerRepositoryID'];
  /** Container repository tag(s) to delete. Total number can't be greater than 20 */
  tagNames: Array<Scalars['String']>;
};

/** Autogenerated return type of DestroyContainerRepositoryTags */
export type DestroyContainerRepositoryTagsPayload = {
  __typename?: 'DestroyContainerRepositoryTagsPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Deleted container repository tags. */
  deletedTagNames: Array<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroyCustomEmoji */
export type DestroyCustomEmojiInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the custom emoji to destroy. */
  id: Scalars['CustomEmojiID'];
};

/** Autogenerated return type of DestroyCustomEmoji */
export type DestroyCustomEmojiPayload = {
  __typename?: 'DestroyCustomEmojiPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Deleted custom emoji. */
  customEmoji?: Maybe<CustomEmoji>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroyEpicBoard */
export type DestroyEpicBoardInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the board to destroy. */
  id: Scalars['BoardsEpicBoardID'];
};

/** Autogenerated return type of DestroyEpicBoard */
export type DestroyEpicBoardPayload = {
  __typename?: 'DestroyEpicBoardPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Epic board after mutation. */
  epicBoard?: Maybe<EpicBoard>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroyNote */
export type DestroyNoteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the note to destroy. */
  id: Scalars['NoteID'];
};

/** Autogenerated return type of DestroyNote */
export type DestroyNotePayload = {
  __typename?: 'DestroyNotePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Note after mutation. */
  note?: Maybe<Note>;
};

/** Autogenerated input type of DestroyPackageFile */
export type DestroyPackageFileInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the Package file. */
  id: Scalars['PackagesPackageFileID'];
};

/** Autogenerated return type of DestroyPackageFile */
export type DestroyPackageFilePayload = {
  __typename?: 'DestroyPackageFilePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroyPackage */
export type DestroyPackageInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the Package. */
  id: Scalars['PackagesPackageID'];
};

/** Autogenerated return type of DestroyPackage */
export type DestroyPackagePayload = {
  __typename?: 'DestroyPackagePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of DestroySnippet */
export type DestroySnippetInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the snippet to destroy. */
  id: Scalars['SnippetID'];
};

/** Autogenerated return type of DestroySnippet */
export type DestroySnippetPayload = {
  __typename?: 'DestroySnippetPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Snippet after mutation. */
  snippet?: Maybe<Snippet>;
};

export type DetailedStatus = {
  __typename?: 'DetailedStatus';
  /** Action information for the status. This includes method, button title, icon, path, and title. */
  action?: Maybe<StatusAction>;
  /** Path of the details for the status. */
  detailsPath?: Maybe<Scalars['String']>;
  /** Favicon of the status. */
  favicon?: Maybe<Scalars['String']>;
  /** Group of the status. */
  group?: Maybe<Scalars['String']>;
  /** Indicates if the status has further details. */
  hasDetails?: Maybe<Scalars['Boolean']>;
  /** Icon of the status. */
  icon?: Maybe<Scalars['String']>;
  /** ID for a detailed status. */
  id: Scalars['String'];
  /** Label of the status. */
  label?: Maybe<Scalars['String']>;
  /** Text of the status. */
  text?: Maybe<Scalars['String']>;
  /** Tooltip associated with the status. */
  tooltip?: Maybe<Scalars['String']>;
};

/** Enabled namespace for DevopsAdoption */
export type DevopsAdoptionEnabledNamespace = {
  __typename?: 'DevopsAdoptionEnabledNamespace';
  /** Namespace where data should be displayed. */
  displayNamespace?: Maybe<Namespace>;
  /** ID of the enabled namespace. */
  id: Scalars['ID'];
  /** Metrics snapshot for previous month for the enabled namespace. */
  latestSnapshot?: Maybe<DevopsAdoptionSnapshot>;
  /** Namespace which should be calculated. */
  namespace?: Maybe<Namespace>;
  /** Data snapshots of the namespace. */
  snapshots?: Maybe<DevopsAdoptionSnapshotConnection>;
};


/** Enabled namespace for DevopsAdoption */
export type DevopsAdoptionEnabledNamespaceSnapshotsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endTimeAfter?: InputMaybe<Scalars['Time']>;
  endTimeBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for DevopsAdoptionEnabledNamespace. */
export type DevopsAdoptionEnabledNamespaceConnection = {
  __typename?: 'DevopsAdoptionEnabledNamespaceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DevopsAdoptionEnabledNamespaceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DevopsAdoptionEnabledNamespace>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DevopsAdoptionEnabledNamespaceEdge = {
  __typename?: 'DevopsAdoptionEnabledNamespaceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DevopsAdoptionEnabledNamespace>;
};

/** Snapshot */
export type DevopsAdoptionSnapshot = {
  __typename?: 'DevopsAdoptionSnapshot';
  /** Total number of projects with existing CODEOWNERS file. */
  codeOwnersUsedCount?: Maybe<Scalars['Int']>;
  /** Total number of projects with enabled coverage fuzzing. */
  coverageFuzzingEnabledCount?: Maybe<Scalars['Int']>;
  /** Total number of projects with enabled DAST. */
  dastEnabledCount?: Maybe<Scalars['Int']>;
  /** Total number of projects with enabled dependency scanning. */
  dependencyScanningEnabledCount?: Maybe<Scalars['Int']>;
  /** At least one deployment succeeded. */
  deploySucceeded: Scalars['Boolean'];
  /** End time for the snapshot where the data points were collected. */
  endTime: Scalars['Time'];
  /** At least one issue was opened. */
  issueOpened: Scalars['Boolean'];
  /** At least one merge request was approved. */
  mergeRequestApproved: Scalars['Boolean'];
  /** At least one merge request was opened. */
  mergeRequestOpened: Scalars['Boolean'];
  /** At least one pipeline succeeded. */
  pipelineSucceeded: Scalars['Boolean'];
  /** Time the snapshot was recorded. */
  recordedAt: Scalars['Time'];
  /** At least one runner was used. */
  runnerConfigured: Scalars['Boolean'];
  /** Total number of projects with enabled SAST. */
  sastEnabledCount?: Maybe<Scalars['Int']>;
  /**
   * At least one security scan succeeded. Deprecated in 14.1: Substituted with specific security metrics. Always false.
   * @deprecated Substituted with specific security metrics. Always false. Deprecated in 14.1.
   */
  securityScanSucceeded: Scalars['Boolean'];
  /** Start time for the snapshot where the data points were collected. */
  startTime: Scalars['Time'];
  /** Total number of projects. */
  totalProjectsCount?: Maybe<Scalars['Int']>;
  /** Total number of projects with vulnerability management used at least once. */
  vulnerabilityManagementUsedCount?: Maybe<Scalars['Int']>;
};

/** The connection type for DevopsAdoptionSnapshot. */
export type DevopsAdoptionSnapshotConnection = {
  __typename?: 'DevopsAdoptionSnapshotConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DevopsAdoptionSnapshotEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<DevopsAdoptionSnapshot>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DevopsAdoptionSnapshotEdge = {
  __typename?: 'DevopsAdoptionSnapshotEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<DevopsAdoptionSnapshot>;
};

export type DiffImagePositionInput = {
  /** Merge base of the branch the comment was made on. */
  baseSha?: InputMaybe<Scalars['String']>;
  /** SHA of the HEAD at the time the comment was made. */
  headSha: Scalars['String'];
  /** Total height of the image. */
  height: Scalars['Int'];
  /**
   * The paths of the file that was changed. Both of the properties of this input
   * are optional, but at least one of them is required
   */
  paths: DiffPathsInput;
  /** SHA of the branch being compared against. */
  startSha: Scalars['String'];
  /** Total width of the image. */
  width: Scalars['Int'];
  /** X position of the note. */
  x: Scalars['Int'];
  /** Y position of the note. */
  y: Scalars['Int'];
};

export type DiffPathsInput = {
  /** Path of the file on the HEAD SHA. */
  newPath?: InputMaybe<Scalars['String']>;
  /** Path of the file on the start SHA. */
  oldPath?: InputMaybe<Scalars['String']>;
};

export type DiffPosition = {
  __typename?: 'DiffPosition';
  /** Information about the branch, HEAD, and base at the time of commenting. */
  diffRefs: DiffRefs;
  /** Path of the file that was changed. */
  filePath: Scalars['String'];
  /** Total height of the image. */
  height?: Maybe<Scalars['Int']>;
  /** Line on HEAD SHA that was changed. */
  newLine?: Maybe<Scalars['Int']>;
  /** Path of the file on the HEAD SHA. */
  newPath?: Maybe<Scalars['String']>;
  /** Line on start SHA that was changed. */
  oldLine?: Maybe<Scalars['Int']>;
  /** Path of the file on the start SHA. */
  oldPath?: Maybe<Scalars['String']>;
  /** Type of file the position refers to. */
  positionType: DiffPositionType;
  /** Total width of the image. */
  width?: Maybe<Scalars['Int']>;
  /** X position of the note. */
  x?: Maybe<Scalars['Int']>;
  /** Y position of the note. */
  y?: Maybe<Scalars['Int']>;
};

export type DiffPositionInput = {
  /** Merge base of the branch the comment was made on. */
  baseSha?: InputMaybe<Scalars['String']>;
  /** SHA of the HEAD at the time the comment was made. */
  headSha: Scalars['String'];
  /** Line on HEAD SHA that was changed. */
  newLine?: InputMaybe<Scalars['Int']>;
  /** Line on start SHA that was changed. */
  oldLine?: InputMaybe<Scalars['Int']>;
  /**
   * The paths of the file that was changed. Both of the properties of this input
   * are optional, but at least one of them is required
   */
  paths: DiffPathsInput;
  /** SHA of the branch being compared against. */
  startSha: Scalars['String'];
};

/** Type of file the position refers to */
export type DiffPositionType =
  /** An image. */
  | 'image'
  /** Text file. */
  | 'text';

export type DiffRefs = {
  __typename?: 'DiffRefs';
  /** Merge base of the branch the comment was made on. */
  baseSha?: Maybe<Scalars['String']>;
  /** SHA of the HEAD at the time the comment was made. */
  headSha: Scalars['String'];
  /** SHA of the branch being compared against. */
  startSha: Scalars['String'];
};

/** Changes to a single file */
export type DiffStats = {
  __typename?: 'DiffStats';
  /** Number of lines added to this file. */
  additions: Scalars['Int'];
  /** Number of lines deleted from this file. */
  deletions: Scalars['Int'];
  /** File path, relative to repository root. */
  path: Scalars['String'];
};

/** Aggregated summary of changes */
export type DiffStatsSummary = {
  __typename?: 'DiffStatsSummary';
  /** Number of lines added. */
  additions: Scalars['Int'];
  /** Number of lines changed. */
  changes: Scalars['Int'];
  /** Number of lines deleted. */
  deletions: Scalars['Int'];
  /** Number of files changed. */
  fileCount: Scalars['Int'];
};

/** Autogenerated input type of DisableDevopsAdoptionNamespace */
export type DisableDevopsAdoptionNamespaceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** One or many IDs of the enabled namespaces to disable. */
  id: Array<Scalars['AnalyticsDevopsAdoptionEnabledNamespaceID']>;
};

/** Autogenerated return type of DisableDevopsAdoptionNamespace */
export type DisableDevopsAdoptionNamespacePayload = {
  __typename?: 'DisableDevopsAdoptionNamespacePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type Discussion = ResolvableInterface & {
  __typename?: 'Discussion';
  /** Timestamp of the discussion's creation. */
  createdAt: Scalars['Time'];
  /** ID of this discussion. */
  id: Scalars['DiscussionID'];
  /** Object which the discussion belongs to. */
  noteable?: Maybe<NoteableType>;
  /** All notes in the discussion. */
  notes: NoteConnection;
  /** ID used to reply to this discussion. */
  replyId: Scalars['DiscussionID'];
  /** Indicates if the object can be resolved. */
  resolvable: Scalars['Boolean'];
  /** Indicates if the object is resolved. */
  resolved: Scalars['Boolean'];
  /** Timestamp of when the object was resolved. */
  resolvedAt?: Maybe<Scalars['Time']>;
  /** User who resolved the object. */
  resolvedBy?: Maybe<UserCore>;
};


export type DiscussionNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for Discussion. */
export type DiscussionConnection = {
  __typename?: 'DiscussionConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<DiscussionEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Discussion>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DiscussionEdge = {
  __typename?: 'DiscussionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Discussion>;
};

/** Autogenerated input type of DiscussionToggleResolve */
export type DiscussionToggleResolveInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the discussion. */
  id: Scalars['DiscussionID'];
  /** Will resolve the discussion when true, and unresolve the discussion when false. */
  resolve: Scalars['Boolean'];
};

/** Autogenerated return type of DiscussionToggleResolve */
export type DiscussionToggleResolvePayload = {
  __typename?: 'DiscussionToggleResolvePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Discussion after mutation. */
  discussion?: Maybe<Discussion>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** All information related to DORA metrics. */
export type Dora = {
  __typename?: 'Dora';
  /** DORA metrics for the current group or project. */
  metrics?: Maybe<Array<DoraMetric>>;
};


/** All information related to DORA metrics. */
export type DoraMetricsArgs = {
  endDate?: InputMaybe<Scalars['Date']>;
  environmentTier?: InputMaybe<DeploymentTier>;
  interval?: InputMaybe<DoraMetricBucketingInterval>;
  metric: DoraMetricType;
  startDate?: InputMaybe<Scalars['Date']>;
};

export type DoraMetric = {
  __typename?: 'DoraMetric';
  /** Date of the data point. */
  date?: Maybe<Scalars['String']>;
  /** Value of the data point. */
  value?: Maybe<Scalars['Int']>;
};

/** All possible ways that DORA metrics can be aggregated. */
export type DoraMetricBucketingInterval =
  /** All data points are combined into a single value. */
  | 'ALL'
  /** Data points are combined into chunks by day. */
  | 'DAILY'
  /** Data points are combined into chunks by month. */
  | 'MONTHLY';

/** All supported DORA metric types. */
export type DoraMetricType =
  /** Deployment frequency. */
  | 'DEPLOYMENT_FREQUENCY'
  /** Lead time for changes. */
  | 'LEAD_TIME_FOR_CHANGES';

/** Autogenerated input type of EchoCreate */
export type EchoCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Errors to return to the user. */
  errors?: InputMaybe<Array<Scalars['String']>>;
  /** Messages to return to the user. */
  messages?: InputMaybe<Array<Scalars['String']>>;
};

/** Autogenerated return type of EchoCreate */
export type EchoCreatePayload = {
  __typename?: 'EchoCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Messages returned to the user. */
  echoes?: Maybe<Array<Scalars['String']>>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of EnableDevopsAdoptionNamespace */
export type EnableDevopsAdoptionNamespaceInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Display namespace ID. */
  displayNamespaceId?: InputMaybe<Scalars['NamespaceID']>;
  /** Namespace ID. */
  namespaceId: Scalars['NamespaceID'];
};

/** Autogenerated return type of EnableDevopsAdoptionNamespace */
export type EnableDevopsAdoptionNamespacePayload = {
  __typename?: 'EnableDevopsAdoptionNamespacePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Enabled namespace after mutation. */
  enabledNamespace?: Maybe<DevopsAdoptionEnabledNamespace>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type Entry = {
  /** Flat path of the entry. */
  flatPath: Scalars['String'];
  /** ID of the entry. */
  id: Scalars['ID'];
  /** Name of the entry. */
  name: Scalars['String'];
  /** Path of the entry. */
  path: Scalars['String'];
  /** Last commit SHA for the entry. */
  sha: Scalars['String'];
  /** Type of tree entry. */
  type: EntryType;
};

/** Type of a tree entry */
export type EntryType =
  /** File tree type. */
  | 'blob'
  /** Commit tree type. */
  | 'commit'
  /** Directory tree type. */
  | 'tree';

/** Describes where code is deployed for a project */
export type Environment = {
  __typename?: 'Environment';
  /** ID of the environment. */
  id: Scalars['ID'];
  /** Most severe open alert for the environment. If multiple alerts have equal severity, the most recent is returned. */
  latestOpenedMostSevereAlert?: Maybe<AlertManagementAlert>;
  /** Metrics dashboard schema for the environment. */
  metricsDashboard?: Maybe<MetricsDashboard>;
  /** Human-readable name of the environment. */
  name: Scalars['String'];
  /** Path to the environment. */
  path: Scalars['String'];
  /** State of the environment, for example: available/stopped. */
  state: Scalars['String'];
};


/** Describes where code is deployed for a project */
export type EnvironmentMetricsDashboardArgs = {
  path: Scalars['String'];
};

/** The connection type for Environment. */
export type EnvironmentConnection = {
  __typename?: 'EnvironmentConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EnvironmentEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Environment>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type EnvironmentEdge = {
  __typename?: 'EnvironmentEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Environment>;
};

/** Autogenerated input type of EnvironmentsCanaryIngressUpdate */
export type EnvironmentsCanaryIngressUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the environment to update. */
  id: Scalars['EnvironmentID'];
  /** Weight of the Canary Ingress. */
  weight: Scalars['Int'];
};

/** Autogenerated return type of EnvironmentsCanaryIngressUpdate */
export type EnvironmentsCanaryIngressUpdatePayload = {
  __typename?: 'EnvironmentsCanaryIngressUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Represents an epic */
export type Epic = CurrentUserTodos & Eventable & NoteableInterface & {
  __typename?: 'Epic';
  /** Ancestors (parents) of the epic. */
  ancestors?: Maybe<EpicConnection>;
  /** Author of the epic. */
  author: UserCore;
  /** List of award emojis associated with the epic. */
  awardEmoji?: Maybe<AwardEmojiConnection>;
  /** Children (sub-epics) of the epic. */
  children?: Maybe<EpicConnection>;
  /** Timestamp of when the epic was closed. */
  closedAt?: Maybe<Scalars['Time']>;
  /** Indicates if the epic is confidential. */
  confidential?: Maybe<Scalars['Boolean']>;
  /** Timestamp of when the epic was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** To-do items for the current user. */
  currentUserTodos: TodoConnection;
  /** Number of open and closed descendant epics and issues. */
  descendantCounts?: Maybe<EpicDescendantCount>;
  /** Total weight of open and closed issues in the epic and its descendants. */
  descendantWeightSum?: Maybe<EpicDescendantWeights>;
  /** Description of the epic. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** Number of downvotes the epic has received. */
  downvotes: Scalars['Int'];
  /** Due date of the epic. */
  dueDate?: Maybe<Scalars['Time']>;
  /** Fixed due date of the epic. */
  dueDateFixed?: Maybe<Scalars['Time']>;
  /** Inherited due date of the epic from milestones. */
  dueDateFromMilestones?: Maybe<Scalars['Time']>;
  /** Indicates if the due date has been manually set. */
  dueDateIsFixed?: Maybe<Scalars['Boolean']>;
  /** List of events associated with the object. */
  events?: Maybe<EventConnection>;
  /** Group to which the epic belongs. */
  group: Group;
  /** Indicates if the epic has children. */
  hasChildren: Scalars['Boolean'];
  /** Indicates if the epic has direct issues. */
  hasIssues: Scalars['Boolean'];
  /** Indicates if the epic has a parent epic. */
  hasParent: Scalars['Boolean'];
  /** Current health status of the epic. */
  healthStatus?: Maybe<EpicHealthStatus>;
  /** ID of the epic. */
  id: Scalars['ID'];
  /** Internal ID of the epic. */
  iid: Scalars['ID'];
  /** A list of issues associated with the epic. */
  issues?: Maybe<EpicIssueConnection>;
  /** Labels assigned to the epic. */
  labels?: Maybe<LabelConnection>;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** Parent epic of the epic. */
  parent?: Maybe<Epic>;
  /** List of participants for the epic. */
  participants?: Maybe<UserCoreConnection>;
  /** Internal reference of the epic. Returned in shortened format by default. */
  reference: Scalars['String'];
  /** URI path of the epic-issue relationship. */
  relationPath?: Maybe<Scalars['String']>;
  /** Relative position of the epic in the epic tree. */
  relativePosition?: Maybe<Scalars['Int']>;
  /** Start date of the epic. */
  startDate?: Maybe<Scalars['Time']>;
  /** Fixed start date of the epic. */
  startDateFixed?: Maybe<Scalars['Time']>;
  /** Inherited start date of the epic from milestones. */
  startDateFromMilestones?: Maybe<Scalars['Time']>;
  /** Indicates if the start date has been manually set. */
  startDateIsFixed?: Maybe<Scalars['Boolean']>;
  /** State of the epic. */
  state: EpicState;
  /** Indicates the currently logged in user is subscribed to the epic. */
  subscribed: Scalars['Boolean'];
  /** Title of the epic. */
  title?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  /** Timestamp of when the epic was updated. */
  updatedAt?: Maybe<Scalars['Time']>;
  /** Number of upvotes the epic has received. */
  upvotes: Scalars['Int'];
  /** Number of user discussions in the epic. */
  userDiscussionsCount: Scalars['Int'];
  /** Number of user notes of the epic. */
  userNotesCount: Scalars['Int'];
  /** Permissions for the current user on the resource */
  userPermissions: EpicPermissions;
  /** Web path of the epic. */
  webPath: Scalars['String'];
  /** Web URL of the epic. */
  webUrl: Scalars['String'];
};


/** Represents an epic */
export type EpicAncestorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['ID']>;
  iidStartsWith?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  in?: InputMaybe<Array<IssuableSearchableField>>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  includeDescendantGroups?: InputMaybe<Scalars['Boolean']>;
  labelName?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedEpicFilterInput>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<EpicSort>;
  state?: InputMaybe<EpicState>;
  timeframe?: InputMaybe<Timeframe>;
};


/** Represents an epic */
export type EpicAwardEmojiArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic */
export type EpicChildrenArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['ID']>;
  iidStartsWith?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  in?: InputMaybe<Array<IssuableSearchableField>>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  includeDescendantGroups?: InputMaybe<Scalars['Boolean']>;
  labelName?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedEpicFilterInput>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<EpicSort>;
  state?: InputMaybe<EpicState>;
  timeframe?: InputMaybe<Timeframe>;
};


/** Represents an epic */
export type EpicCurrentUserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<TodoStateEnum>;
};


/** Represents an epic */
export type EpicDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic */
export type EpicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic */
export type EpicIssuesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic */
export type EpicLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic */
export type EpicNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic */
export type EpicParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic */
export type EpicReferenceArgs = {
  full?: InputMaybe<Scalars['Boolean']>;
};

/** Autogenerated input type of EpicAddIssue */
export type EpicAddIssueInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Group the epic to mutate belongs to. */
  groupPath: Scalars['ID'];
  /** IID of the epic to mutate. */
  iid: Scalars['ID'];
  /** IID of the issue to be added. */
  issueIid: Scalars['String'];
  /** Full path of the project the issue belongs to. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of EpicAddIssue */
export type EpicAddIssuePayload = {
  __typename?: 'EpicAddIssuePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Epic after mutation. */
  epic?: Maybe<Epic>;
  /** Epic-issue relationship. */
  epicIssue?: Maybe<EpicIssue>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Represents an epic board */
export type EpicBoard = {
  __typename?: 'EpicBoard';
  /** Whether or not backlog list is hidden. */
  hideBacklogList?: Maybe<Scalars['Boolean']>;
  /** Whether or not closed list is hidden. */
  hideClosedList?: Maybe<Scalars['Boolean']>;
  /** Global ID of the epic board. */
  id: Scalars['BoardsEpicBoardID'];
  /** Labels of the board. */
  labels?: Maybe<LabelConnection>;
  /** Epic board lists. */
  lists?: Maybe<EpicListConnection>;
  /** Name of the epic board. */
  name?: Maybe<Scalars['String']>;
  /** Web path of the epic board. */
  webPath: Scalars['String'];
  /** Web URL of the epic board. */
  webUrl: Scalars['String'];
};


/** Represents an epic board */
export type EpicBoardLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents an epic board */
export type EpicBoardListsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  epicFilters?: InputMaybe<EpicFilters>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['BoardsEpicListID']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for EpicBoard. */
export type EpicBoardConnection = {
  __typename?: 'EpicBoardConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EpicBoardEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<EpicBoard>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of EpicBoardCreate */
export type EpicBoardCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the group with which the resource is associated. */
  groupPath?: InputMaybe<Scalars['ID']>;
  /** Whether or not backlog list is hidden. */
  hideBacklogList?: InputMaybe<Scalars['Boolean']>;
  /** Whether or not closed list is hidden. */
  hideClosedList?: InputMaybe<Scalars['Boolean']>;
  /** IDs of labels to be added to the board. */
  labelIds?: InputMaybe<Array<Scalars['LabelID']>>;
  /** Labels of the issue. */
  labels?: InputMaybe<Array<Scalars['String']>>;
  /** Board name. */
  name?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of EpicBoardCreate */
export type EpicBoardCreatePayload = {
  __typename?: 'EpicBoardCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Created epic board. */
  epicBoard?: Maybe<EpicBoard>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type EpicBoardEdge = {
  __typename?: 'EpicBoardEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<EpicBoard>;
};

/** Autogenerated input type of EpicBoardListCreate */
export type EpicBoardListCreateInput = {
  /** Create the backlog list. */
  backlog?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the issue board to mutate. */
  boardId: Scalars['BoardsEpicBoardID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of an existing label. */
  labelId?: InputMaybe<Scalars['LabelID']>;
};

/** Autogenerated return type of EpicBoardListCreate */
export type EpicBoardListCreatePayload = {
  __typename?: 'EpicBoardListCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Epic list in the epic board. */
  list?: Maybe<EpicList>;
};

/** Autogenerated input type of EpicBoardListDestroy */
export type EpicBoardListDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the epic board list to destroy. */
  listId: Scalars['BoardsEpicListID'];
};

/** Autogenerated return type of EpicBoardListDestroy */
export type EpicBoardListDestroyPayload = {
  __typename?: 'EpicBoardListDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Epic board list. `null` if the board was destroyed successfully. */
  list?: Maybe<EpicList>;
};

/** Autogenerated input type of EpicBoardUpdate */
export type EpicBoardUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Whether or not backlog list is hidden. */
  hideBacklogList?: InputMaybe<Scalars['Boolean']>;
  /** Whether or not closed list is hidden. */
  hideClosedList?: InputMaybe<Scalars['Boolean']>;
  /** Epic board global ID. */
  id: Scalars['BoardsEpicBoardID'];
  /** IDs of labels to be added to the board. */
  labelIds?: InputMaybe<Array<Scalars['LabelID']>>;
  /** Labels of the issue. */
  labels?: InputMaybe<Array<Scalars['String']>>;
  /** Board name. */
  name?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of EpicBoardUpdate */
export type EpicBoardUpdatePayload = {
  __typename?: 'EpicBoardUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Updated epic board. */
  epicBoard?: Maybe<EpicBoard>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** The connection type for Epic. */
export type EpicConnection = {
  __typename?: 'EpicConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EpicEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Epic>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Counts of descendent epics */
export type EpicDescendantCount = {
  __typename?: 'EpicDescendantCount';
  /** Number of closed child epics. */
  closedEpics?: Maybe<Scalars['Int']>;
  /** Number of closed epic issues. */
  closedIssues?: Maybe<Scalars['Int']>;
  /** Number of opened child epics. */
  openedEpics?: Maybe<Scalars['Int']>;
  /** Number of opened epic issues. */
  openedIssues?: Maybe<Scalars['Int']>;
};

/** Total weight of open and closed descendant issues */
export type EpicDescendantWeights = {
  __typename?: 'EpicDescendantWeights';
  /** Total weight of completed (closed) issues in this epic, including epic descendants. */
  closedIssues?: Maybe<Scalars['Int']>;
  /** Total weight of opened issues in this epic, including epic descendants. */
  openedIssues?: Maybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type EpicEdge = {
  __typename?: 'EpicEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Epic>;
};

export type EpicFilters = {
  /** Filter by author username. */
  authorUsername?: InputMaybe<Scalars['String']>;
  /** Filter by label name. */
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter by reaction emoji applied by the current user. Wildcard values "NONE" and "ANY" are supported. */
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  /** Negated epic arguments. */
  not?: InputMaybe<NegatedEpicBoardIssueInput>;
  /** Search query for epic title or description. */
  search?: InputMaybe<Scalars['String']>;
};

/** Health status of child issues */
export type EpicHealthStatus = {
  __typename?: 'EpicHealthStatus';
  /** Number of issues at risk. */
  issuesAtRisk?: Maybe<Scalars['Int']>;
  /** Number of issues that need attention. */
  issuesNeedingAttention?: Maybe<Scalars['Int']>;
  /** Number of issues on track. */
  issuesOnTrack?: Maybe<Scalars['Int']>;
};

/** Relationship between an epic and an issue */
export type EpicIssue = CurrentUserTodos & NoteableInterface & {
  __typename?: 'EpicIssue';
  /** Alert associated to this issue. */
  alertManagementAlert?: Maybe<AlertManagementAlert>;
  /** Assignees of the issue. */
  assignees?: Maybe<UserCoreConnection>;
  /** User that created the issue. */
  author: UserCore;
  /** Indicates the issue is blocked. */
  blocked: Scalars['Boolean'];
  /** Count of issues blocking this issue. */
  blockedByCount?: Maybe<Scalars['Int']>;
  /** Issues blocking this issue. */
  blockedByIssues?: Maybe<IssueConnection>;
  /** Count of issues this issue is blocking. */
  blockingCount: Scalars['Int'];
  /** Timestamp of when the issue was closed. */
  closedAt?: Maybe<Scalars['Time']>;
  /** Indicates the issue is confidential. */
  confidential: Scalars['Boolean'];
  /** User specific email address for the issue. */
  createNoteEmail?: Maybe<Scalars['String']>;
  /** Timestamp of when the issue was created. */
  createdAt: Scalars['Time'];
  /** To-do items for the current user. */
  currentUserTodos: TodoConnection;
  /** Customer relations contacts of the issue. */
  customerRelationsContacts?: Maybe<CustomerRelationsContactConnection>;
  /** Description of the issue. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Collection of design images associated with this issue. */
  designCollection?: Maybe<DesignCollection>;
  /** Indicates discussion is locked on the issue. */
  discussionLocked: Scalars['Boolean'];
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** Number of downvotes the issue has received. */
  downvotes: Scalars['Int'];
  /** Due date of the issue. */
  dueDate?: Maybe<Scalars['Time']>;
  /** Indicates if a project has email notifications disabled: `true` if email notifications are disabled. */
  emailsDisabled: Scalars['Boolean'];
  /** Epic to which this issue belongs. */
  epic?: Maybe<Epic>;
  /** ID of the epic-issue relation. */
  epicIssueId: Scalars['ID'];
  /** Current health status. */
  healthStatus?: Maybe<HealthStatus>;
  /**
   * Indicates the issue is hidden because the author has been banned. Will always
   * return `null` if `ban_user_feature_flag` feature flag is disabled.
   */
  hidden?: Maybe<Scalars['Boolean']>;
  /** Human-readable time estimate of the issue. */
  humanTimeEstimate?: Maybe<Scalars['String']>;
  /** Human-readable total time reported as spent on the issue. */
  humanTotalTimeSpent?: Maybe<Scalars['String']>;
  /** Global ID of the epic-issue relation. */
  id?: Maybe<Scalars['ID']>;
  /** Internal ID of the issue. */
  iid: Scalars['ID'];
  /** Iteration of the issue. */
  iteration?: Maybe<Iteration>;
  /** Labels of the issue. */
  labels?: Maybe<LabelConnection>;
  /** Number of merge requests that close the issue on merge. */
  mergeRequestsCount: Scalars['Int'];
  /** Metric images associated to the issue. */
  metricImages?: Maybe<Array<MetricImage>>;
  /** Milestone of the issue. */
  milestone?: Maybe<Milestone>;
  /** Indicates if issue got moved from other project. */
  moved?: Maybe<Scalars['Boolean']>;
  /** Updated Issue after it got moved to another project. */
  movedTo?: Maybe<Issue>;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** List of participants in the issue. */
  participants?: Maybe<UserCoreConnection>;
  /** ID of the issue project. */
  projectId: Scalars['Int'];
  /** Internal reference of the issue. Returned in shortened format by default. */
  reference: Scalars['String'];
  /** URI path of the epic-issue relation. */
  relationPath?: Maybe<Scalars['String']>;
  /** Relative position of the issue (used for positioning in epic tree and issue boards). */
  relativePosition?: Maybe<Scalars['Int']>;
  /** Severity level of the incident. */
  severity?: Maybe<IssuableSeverity>;
  /** Timestamp of when the issue SLA expires. */
  slaDueAt?: Maybe<Scalars['Time']>;
  /** State of the issue. */
  state: IssueState;
  /** Indicates whether an issue is published to the status page. */
  statusPagePublishedIncident?: Maybe<Scalars['Boolean']>;
  /** Indicates the currently logged in user is subscribed to the issue. */
  subscribed: Scalars['Boolean'];
  /** Task completion status of the issue. */
  taskCompletionStatus: TaskCompletionStatus;
  /** Time estimate of the issue. */
  timeEstimate: Scalars['Int'];
  /** Timelogs on the issue. */
  timelogs: TimelogConnection;
  /** Title of the issue. */
  title: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  /** Total time reported as spent on the issue. */
  totalTimeSpent: Scalars['Int'];
  /** Type of the issue. */
  type?: Maybe<IssueType>;
  /** Timestamp of when the issue was last updated. */
  updatedAt: Scalars['Time'];
  /** User that last updated the issue. */
  updatedBy?: Maybe<UserCore>;
  /** Number of upvotes the issue has received. */
  upvotes: Scalars['Int'];
  /** Number of user discussions in the issue. */
  userDiscussionsCount: Scalars['Int'];
  /** Number of user notes of the issue. */
  userNotesCount: Scalars['Int'];
  /** Permissions for the current user on the resource */
  userPermissions: IssuePermissions;
  /** Web path of the issue. */
  webPath: Scalars['String'];
  /** Web URL of the issue. */
  webUrl: Scalars['String'];
  /** Weight of the issue. */
  weight?: Maybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueAssigneesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueBlockedByIssuesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueCurrentUserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<TodoStateEnum>;
};


/** Relationship between an epic and an issue */
export type EpicIssueCustomerRelationsContactsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueReferenceArgs = {
  full?: InputMaybe<Scalars['Boolean']>;
};


/** Relationship between an epic and an issue */
export type EpicIssueTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for EpicIssue. */
export type EpicIssueConnection = {
  __typename?: 'EpicIssueConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EpicIssueEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<EpicIssue>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total weight of issues collection. */
  weight: Scalars['Int'];
};

/** An edge in a connection. */
export type EpicIssueEdge = {
  __typename?: 'EpicIssueEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<EpicIssue>;
};

/** Represents an epic board list */
export type EpicList = {
  __typename?: 'EpicList';
  /** Indicates if this list is collapsed for this user. */
  collapsed?: Maybe<Scalars['Boolean']>;
  /** List epics. */
  epics?: Maybe<EpicConnection>;
  /** Count of epics in the list. */
  epicsCount?: Maybe<Scalars['Int']>;
  /** Global ID of the board list. */
  id: Scalars['BoardsEpicListID'];
  /** Label of the list. */
  label?: Maybe<Label>;
  /** Type of the list. */
  listType: Scalars['String'];
  /** Position of the list within the board. */
  position?: Maybe<Scalars['Int']>;
  /** Title of the list. */
  title: Scalars['String'];
};


/** Represents an epic board list */
export type EpicListEpicsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filters?: InputMaybe<EpicFilters>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for EpicList. */
export type EpicListConnection = {
  __typename?: 'EpicListConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EpicListEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<EpicList>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type EpicListEdge = {
  __typename?: 'EpicListEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<EpicList>;
};

/** Autogenerated input type of EpicMoveList */
export type EpicMoveListInput = {
  /** Global ID of the board that the epic is in. */
  boardId: Scalars['BoardsEpicBoardID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the epic to mutate. */
  epicId: Scalars['EpicID'];
  /** ID of the board list that the epic will be moved from. Required if moving between lists. */
  fromListId?: InputMaybe<Scalars['BoardsEpicListID']>;
  /** ID of epic that should be placed after the current epic. */
  moveAfterId?: InputMaybe<Scalars['EpicID']>;
  /** ID of epic that should be placed before the current epic. */
  moveBeforeId?: InputMaybe<Scalars['EpicID']>;
  /** ID of the list the epic will be in after mutation. */
  toListId: Scalars['BoardsEpicListID'];
};

/** Autogenerated return type of EpicMoveList */
export type EpicMoveListPayload = {
  __typename?: 'EpicMoveListPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Epic after mutation. */
  epic?: Maybe<Epic>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Check permissions for the current user on an epic */
export type EpicPermissions = {
  __typename?: 'EpicPermissions';
  /** Indicates the user can perform `admin_epic` on this resource */
  adminEpic: Scalars['Boolean'];
  /** Indicates the user can perform `award_emoji` on this resource */
  awardEmoji: Scalars['Boolean'];
  /** Indicates the user can perform `create_epic` on this resource */
  createEpic: Scalars['Boolean'];
  /** Indicates the user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_epic` on this resource */
  destroyEpic: Scalars['Boolean'];
  /** Indicates the user can perform `read_epic` on this resource */
  readEpic: Scalars['Boolean'];
  /** Indicates the user can perform `read_epic_iid` on this resource */
  readEpicIid: Scalars['Boolean'];
  /** Indicates the user can perform `update_epic` on this resource */
  updateEpic: Scalars['Boolean'];
};

/** Autogenerated input type of EpicSetSubscription */
export type EpicSetSubscriptionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Group the epic to mutate belongs to. */
  groupPath: Scalars['ID'];
  /** IID of the epic to mutate. */
  iid: Scalars['ID'];
  /** Desired state of the subscription. */
  subscribedState: Scalars['Boolean'];
};

/** Autogenerated return type of EpicSetSubscription */
export type EpicSetSubscriptionPayload = {
  __typename?: 'EpicSetSubscriptionPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Epic after mutation. */
  epic?: Maybe<Epic>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Roadmap sort values */
export type EpicSort =
  /** Sort by end date in ascending order. */
  | 'END_DATE_ASC'
  /** Sort by end date in descending order. */
  | 'END_DATE_DESC'
  /** Sort by start date in ascending order. */
  | 'START_DATE_ASC'
  /** Sort by start date in descending order. */
  | 'START_DATE_DESC'
  /** Sort by title in ascending order. */
  | 'TITLE_ASC'
  /** Sort by title in descending order. */
  | 'TITLE_DESC'
  /** End date at ascending order. */
  | 'end_date_asc'
  /** End date at descending order. */
  | 'end_date_desc'
  /** Start date at ascending order. */
  | 'start_date_asc'
  /** Start date at descending order. */
  | 'start_date_desc';

/** State of an epic */
export type EpicState =
  /** All epics. */
  | 'all'
  /** Closed epics. */
  | 'closed'
  /** Open epics. */
  | 'opened';

/** State event of an epic */
export type EpicStateEvent =
  /** Close the epic. */
  | 'CLOSE'
  /** Reopen the epic. */
  | 'REOPEN';

/** A node of an epic tree. */
export type EpicTreeNodeFieldsInputType = {
  /** ID of the epic issue or issue the epic or issue is switched with. */
  adjacentReferenceId?: InputMaybe<Scalars['EpicTreeSortingID']>;
  /** ID of the epic issue or epic that is being moved. */
  id: Scalars['EpicTreeSortingID'];
  /** ID of the new parent epic. */
  newParentId?: InputMaybe<Scalars['EpicID']>;
  /** Type of switch. Valid values are `after` or `before`. */
  relativePosition?: InputMaybe<MoveType>;
};

/** Autogenerated input type of EpicTreeReorder */
export type EpicTreeReorderInput = {
  /** ID of the base epic of the tree. */
  baseEpicId: Scalars['EpicID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Parameters for updating the tree positions. */
  moved: EpicTreeNodeFieldsInputType;
};

/** Autogenerated return type of EpicTreeReorder */
export type EpicTreeReorderPayload = {
  __typename?: 'EpicTreeReorderPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Epic ID wildcard values */
export type EpicWildcardId =
  /** Any epic is assigned. */
  | 'ANY'
  /** No epic is assigned. */
  | 'NONE';

/** Autogenerated input type of EscalationPolicyCreate */
export type EscalationPolicyCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the escalation policy. */
  description?: InputMaybe<Scalars['String']>;
  /** Name of the escalation policy. */
  name: Scalars['String'];
  /** Project to create the escalation policy for. */
  projectPath: Scalars['ID'];
  /** Steps of the escalation policy. */
  rules: Array<EscalationRuleInput>;
};

/** Autogenerated return type of EscalationPolicyCreate */
export type EscalationPolicyCreatePayload = {
  __typename?: 'EscalationPolicyCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Escalation policy. */
  escalationPolicy?: Maybe<EscalationPolicyType>;
};

/** Autogenerated input type of EscalationPolicyDestroy */
export type EscalationPolicyDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Escalation policy internal ID to remove. */
  id: Scalars['IncidentManagementEscalationPolicyID'];
};

/** Autogenerated return type of EscalationPolicyDestroy */
export type EscalationPolicyDestroyPayload = {
  __typename?: 'EscalationPolicyDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Escalation policy. */
  escalationPolicy?: Maybe<EscalationPolicyType>;
};

/** Represents an escalation policy */
export type EscalationPolicyType = {
  __typename?: 'EscalationPolicyType';
  /** Description of the escalation policy. */
  description?: Maybe<Scalars['String']>;
  /** ID of the escalation policy. */
  id?: Maybe<Scalars['IncidentManagementEscalationPolicyID']>;
  /** Name of the escalation policy. */
  name?: Maybe<Scalars['String']>;
  /** Steps of the escalation policy. */
  rules?: Maybe<Array<EscalationRuleType>>;
};

/** The connection type for EscalationPolicyType. */
export type EscalationPolicyTypeConnection = {
  __typename?: 'EscalationPolicyTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EscalationPolicyTypeEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<EscalationPolicyType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type EscalationPolicyTypeEdge = {
  __typename?: 'EscalationPolicyTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<EscalationPolicyType>;
};

/** Autogenerated input type of EscalationPolicyUpdate */
export type EscalationPolicyUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the escalation policy. */
  description?: InputMaybe<Scalars['String']>;
  /** ID of the on-call schedule to create the on-call rotation in. */
  id: Scalars['IncidentManagementEscalationPolicyID'];
  /** Name of the escalation policy. */
  name?: InputMaybe<Scalars['String']>;
  /** Steps of the escalation policy. */
  rules?: InputMaybe<Array<EscalationRuleInput>>;
};

/** Autogenerated return type of EscalationPolicyUpdate */
export type EscalationPolicyUpdatePayload = {
  __typename?: 'EscalationPolicyUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Escalation policy. */
  escalationPolicy?: Maybe<EscalationPolicyType>;
};

/** Represents an escalation rule */
export type EscalationRuleInput = {
  /** Time in seconds before the rule is activated. */
  elapsedTimeSeconds: Scalars['Int'];
  /** On-call schedule to notify. */
  oncallScheduleIid?: InputMaybe<Scalars['ID']>;
  /** Status required to prevent the rule from activating. */
  status: EscalationRuleStatus;
  /** Username of the user to notify. */
  username?: InputMaybe<Scalars['String']>;
};

/** Escalation rule statuses */
export type EscalationRuleStatus =
  /** . */
  | 'ACKNOWLEDGED'
  /** . */
  | 'RESOLVED';

/** Represents an escalation rule for an escalation policy */
export type EscalationRuleType = {
  __typename?: 'EscalationRuleType';
  /** Time in seconds before the rule is activated. */
  elapsedTimeSeconds?: Maybe<Scalars['Int']>;
  /** ID of the escalation policy. */
  id?: Maybe<Scalars['IncidentManagementEscalationRuleID']>;
  /** On-call schedule to notify. */
  oncallSchedule?: Maybe<IncidentManagementOncallSchedule>;
  /** Status required to prevent the rule from activating. */
  status?: Maybe<EscalationRuleStatus>;
  /** User to notify. */
  user?: Maybe<UserCore>;
};

/** Representing an event */
export type Event = {
  __typename?: 'Event';
  /** Action of the event. */
  action: EventAction;
  /** Author of this event. */
  author: UserCore;
  /** When this event was created. */
  createdAt: Scalars['Time'];
  /** ID of the event. */
  id: Scalars['ID'];
  /** When this event was updated. */
  updatedAt: Scalars['Time'];
};

/** Event action */
export type EventAction =
  /** Approved action */
  | 'APPROVED'
  /** Closed action */
  | 'CLOSED'
  /** Commented action */
  | 'COMMENTED'
  /** Created action */
  | 'CREATED'
  /** Destroyed action */
  | 'DESTROYED'
  /** Expired action */
  | 'EXPIRED'
  /** Joined action */
  | 'JOINED'
  /** Left action */
  | 'LEFT'
  /** Merged action */
  | 'MERGED'
  /** Pushed action */
  | 'PUSHED'
  /** Reopened action */
  | 'REOPENED'
  /** Updated action */
  | 'UPDATED';

/** The connection type for Event. */
export type EventConnection = {
  __typename?: 'EventConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<EventEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Event>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type EventEdge = {
  __typename?: 'EventEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Event>;
};

export type Eventable = {
  /** List of events associated with the object. */
  events?: Maybe<EventConnection>;
};


export type EventableEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated input type of ExportRequirements */
export type ExportRequirementsInput = {
  /** Filter requirements by author username. */
  authorUsername?: InputMaybe<Array<Scalars['String']>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full project path the requirements are associated with. */
  projectPath: Scalars['ID'];
  /** Search query for requirement title. */
  search?: InputMaybe<Scalars['String']>;
  /** List of selected requirements fields to be exported. */
  selectedFields?: InputMaybe<Array<Scalars['String']>>;
  /** List requirements by sort order. */
  sort?: InputMaybe<Sort>;
  /** Filter requirements by state. */
  state?: InputMaybe<RequirementState>;
};

/** Autogenerated return type of ExportRequirements */
export type ExportRequirementsPayload = {
  __typename?: 'ExportRequirementsPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Represents an external resource to send audit events to */
export type ExternalAuditEventDestination = {
  __typename?: 'ExternalAuditEventDestination';
  /** External destination to send audit events to. */
  destinationUrl: Scalars['String'];
  /** Group the destination belongs to. */
  group: Group;
  /** ID of the destination. */
  id: Scalars['ID'];
};

/** Autogenerated input type of ExternalAuditEventDestinationCreate */
export type ExternalAuditEventDestinationCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Destination URL. */
  destinationUrl: Scalars['String'];
  /** Group path. */
  groupPath: Scalars['ID'];
};

/** Autogenerated return type of ExternalAuditEventDestinationCreate */
export type ExternalAuditEventDestinationCreatePayload = {
  __typename?: 'ExternalAuditEventDestinationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Destination created. */
  externalAuditEventDestination?: Maybe<ExternalAuditEventDestination>;
};

/** Autogenerated input type of ExternalAuditEventDestinationDestroy */
export type ExternalAuditEventDestinationDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of external audit event destination to destroy. */
  id: Scalars['AuditEventsExternalAuditEventDestinationID'];
};

/** Autogenerated return type of ExternalAuditEventDestinationDestroy */
export type ExternalAuditEventDestinationDestroyPayload = {
  __typename?: 'ExternalAuditEventDestinationDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of ExternalAuditEventDestinationUpdate */
export type ExternalAuditEventDestinationUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Destination URL to change. */
  destinationUrl?: InputMaybe<Scalars['String']>;
  /** ID of external audit event destination to destroy. */
  id: Scalars['AuditEventsExternalAuditEventDestinationID'];
};

/** Autogenerated return type of ExternalAuditEventDestinationUpdate */
export type ExternalAuditEventDestinationUpdatePayload = {
  __typename?: 'ExternalAuditEventDestinationUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Updated destination. */
  externalAuditEventDestination?: Maybe<ExternalAuditEventDestination>;
};

/** Represents an external issue */
export type ExternalIssue = {
  __typename?: 'ExternalIssue';
  /** Timestamp of when the issue was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** Type of external tracker. */
  externalTracker?: Maybe<Scalars['String']>;
  /** Relative reference of the issue in the external tracker. */
  relativeReference?: Maybe<Scalars['String']>;
  /** Status of the issue in the external tracker. */
  status?: Maybe<Scalars['String']>;
  /** Title of the issue in the external tracker. */
  title?: Maybe<Scalars['String']>;
  /** Timestamp of when the issue was updated. */
  updatedAt?: Maybe<Scalars['Time']>;
  /** URL to the issue in the external tracker. */
  webUrl?: Maybe<Scalars['String']>;
};

export type GeoNode = {
  __typename?: 'GeoNode';
  /** Maximum concurrency of container repository sync for this secondary node. */
  containerRepositoriesMaxCapacity?: Maybe<Scalars['Int']>;
  /** Indicates whether this Geo node is enabled. */
  enabled?: Maybe<Scalars['Boolean']>;
  /** Maximum concurrency of LFS/attachment backfill for this secondary node. */
  filesMaxCapacity?: Maybe<Scalars['Int']>;
  /** Find group wiki repository registries on this Geo node. */
  groupWikiRepositoryRegistries?: Maybe<GroupWikiRepositoryRegistryConnection>;
  /** ID of this GeoNode. */
  id: Scalars['ID'];
  /** URL defined on the primary node secondary nodes should use to contact it. */
  internalUrl?: Maybe<Scalars['String']>;
  /** Find LFS object registries on this Geo node. */
  lfsObjectRegistries?: Maybe<LfsObjectRegistryConnection>;
  /** Find merge request diff registries on this Geo node. */
  mergeRequestDiffRegistries?: Maybe<MergeRequestDiffRegistryConnection>;
  /** Interval (in days) in which the repository verification is valid. After expiry, it is reverted. */
  minimumReverificationInterval?: Maybe<Scalars['Int']>;
  /** Unique identifier for this Geo node. */
  name?: Maybe<Scalars['String']>;
  /** Package file registries of the GeoNode. */
  packageFileRegistries?: Maybe<PackageFileRegistryConnection>;
  /** Find Pages Deployment registries on this Geo node */
  pagesDeploymentRegistries?: Maybe<PagesDeploymentRegistryConnection>;
  /** Find pipeline artifact registries on this Geo node. */
  pipelineArtifactRegistries?: Maybe<PipelineArtifactRegistryConnection>;
  /** Indicates whether this Geo node is the primary. */
  primary?: Maybe<Scalars['Boolean']>;
  /** Maximum concurrency of repository backfill for this secondary node. */
  reposMaxCapacity?: Maybe<Scalars['Int']>;
  /** Namespaces that should be synced, if `selective_sync_type` == `namespaces`. */
  selectiveSyncNamespaces?: Maybe<NamespaceConnection>;
  /** Repository storages whose projects should be synced, if `selective_sync_type` == `shards`. */
  selectiveSyncShards?: Maybe<Array<Scalars['String']>>;
  /** Indicates if syncing is limited to only specific groups, or shards. */
  selectiveSyncType?: Maybe<Scalars['String']>;
  /** Find snippet repository registries on this Geo node. */
  snippetRepositoryRegistries?: Maybe<SnippetRepositoryRegistryConnection>;
  /** Indicates if this secondary node will replicate blobs in Object Storage. */
  syncObjectStorage?: Maybe<Scalars['Boolean']>;
  /** Find terraform state version registries on this Geo node. */
  terraformStateVersionRegistries?: Maybe<TerraformStateVersionRegistryConnection>;
  /** Find Upload registries on this Geo node */
  uploadRegistries?: Maybe<UploadRegistryConnection>;
  /** User-facing URL for this Geo node. */
  url?: Maybe<Scalars['String']>;
  /** Maximum concurrency of repository verification for this secondary node. */
  verificationMaxCapacity?: Maybe<Scalars['Int']>;
};


export type GeoNodeGroupWikiRepositoryRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodeLfsObjectRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodeMergeRequestDiffRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodePackageFileRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodePagesDeploymentRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodePipelineArtifactRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodeSelectiveSyncNamespacesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodeSnippetRepositoryRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodeTerraformStateVersionRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GeoNodeUploadRegistriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated input type of GitlabSubscriptionActivate */
export type GitlabSubscriptionActivateInput = {
  /** Activation code received after purchasing a GitLab subscription. */
  activationCode: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of GitlabSubscriptionActivate */
export type GitlabSubscriptionActivatePayload = {
  __typename?: 'GitlabSubscriptionActivatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Current license. */
  license?: Maybe<CurrentLicense>;
};

export type GrafanaIntegration = {
  __typename?: 'GrafanaIntegration';
  /** Timestamp of the issue's creation. */
  createdAt: Scalars['Time'];
  /** Indicates whether Grafana integration is enabled. */
  enabled: Scalars['Boolean'];
  /** URL for the Grafana host for the Grafana integration. */
  grafanaUrl: Scalars['String'];
  /** Internal ID of the Grafana integration. */
  id: Scalars['ID'];
  /** Timestamp of the issue's last activity. */
  updatedAt: Scalars['Time'];
};

export type Group = {
  __typename?: 'Group';
  /** Size limit for repositories in the namespace in bytes. */
  actualRepositorySizeLimit?: Maybe<Scalars['Float']>;
  /** Additional storage purchased for the root namespace in bytes. */
  additionalPurchasedStorageSize?: Maybe<Scalars['Float']>;
  /** Indicates whether Auto DevOps is enabled for all projects within this group. */
  autoDevopsEnabled?: Maybe<Scalars['Boolean']>;
  /** Avatar URL of the group. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Number of billable users in the group. */
  billableMembersCount?: Maybe<Scalars['Int']>;
  /** A single board of the group. */
  board?: Maybe<Board>;
  /** Boards of the group. */
  boards?: Maybe<BoardConnection>;
  /** Represents the code coverage activity for this group. */
  codeCoverageActivities?: Maybe<CodeCoverageActivityConnection>;
  /** Compliance frameworks available to projects in this namespace. */
  complianceFrameworks?: Maybe<ComplianceFrameworkConnection>;
  /** Find contacts of this group. */
  contacts?: Maybe<CustomerRelationsContactConnection>;
  /** Container repositories of the group. */
  containerRepositories?: Maybe<ContainerRepositoryConnection>;
  /** Number of container repositories in the group. */
  containerRepositoriesCount: Scalars['Int'];
  /** Includes at least one project where the repository size exceeds the limit. */
  containsLockedProjects: Scalars['Boolean'];
  /**
   * Custom emoji within this namespace. Available only when feature flag
   * `custom_emoji` is enabled. This flag is disabled by default, because the
   * feature is experimental and is subject to change without notice.
   */
  customEmoji?: Maybe<CustomEmojiConnection>;
  /** Number of dependency proxy blobs cached in the group. */
  dependencyProxyBlobCount: Scalars['Int'];
  /** Dependency Proxy blobs. */
  dependencyProxyBlobs?: Maybe<DependencyProxyBlobConnection>;
  /** Number of dependency proxy images cached in the group. */
  dependencyProxyImageCount: Scalars['Int'];
  /** Prefix for pulling images when using the dependency proxy. */
  dependencyProxyImagePrefix: Scalars['String'];
  /** Dependency proxy TTL policy for the group. */
  dependencyProxyImageTtlPolicy?: Maybe<DependencyProxyImageTtlGroupPolicy>;
  /** Dependency Proxy manifests. */
  dependencyProxyManifests?: Maybe<DependencyProxyManifestConnection>;
  /** Dependency Proxy settings for the group. */
  dependencyProxySetting?: Maybe<DependencyProxySetting>;
  /** Total size of the dependency proxy cached images. */
  dependencyProxyTotalSize: Scalars['String'];
  /** List of descendant groups of this group. */
  descendantGroups?: Maybe<GroupConnection>;
  /** Description of the namespace. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Group's DORA metrics. */
  dora?: Maybe<Dora>;
  /** Indicates if a group has email notifications disabled. */
  emailsDisabled?: Maybe<Scalars['Boolean']>;
  /** Find a single epic. */
  epic?: Maybe<Epic>;
  /** Find a single epic board. */
  epicBoard?: Maybe<EpicBoard>;
  /** Find epic boards. */
  epicBoards?: Maybe<EpicBoardConnection>;
  /** Find epics. */
  epics?: Maybe<EpicConnection>;
  /** Indicates if Epics are enabled for namespace */
  epicsEnabled?: Maybe<Scalars['Boolean']>;
  /** Full name of the namespace. */
  fullName: Scalars['String'];
  /** Full path of the namespace. */
  fullPath: Scalars['ID'];
  /** A membership of a user within this group. */
  groupMembers?: Maybe<GroupMemberConnection>;
  /** ID of the namespace. */
  id: Scalars['ID'];
  /** Status of the temporary storage increase. */
  isTemporaryStorageIncreaseEnabled: Scalars['Boolean'];
  /** Issues for projects in this group. */
  issues?: Maybe<IssueConnection>;
  /** Find iteration cadences. */
  iterationCadences?: Maybe<IterationCadenceConnection>;
  /** Find iterations. */
  iterations?: Maybe<IterationConnection>;
  /** Label available on this group. */
  label?: Maybe<Label>;
  /** Labels available on this group. */
  labels?: Maybe<LabelConnection>;
  /** Indicates if Large File Storage (LFS) is enabled for namespace. */
  lfsEnabled?: Maybe<Scalars['Boolean']>;
  /** Indicates if a group is disabled from getting mentioned. */
  mentionsDisabled?: Maybe<Scalars['Boolean']>;
  /** Merge requests for projects in this group. */
  mergeRequests?: Maybe<MergeRequestConnection>;
  /** Milestones of the group. */
  milestones?: Maybe<MilestoneConnection>;
  /** Name of the namespace. */
  name: Scalars['String'];
  /** Find organizations of this group. */
  organizations?: Maybe<CustomerRelationsOrganizationConnection>;
  /** Package settings for the namespace. */
  packageSettings?: Maybe<PackageSettings>;
  /** Packages of the group. */
  packages?: Maybe<PackageConnection>;
  /** Parent group. */
  parent?: Maybe<Group>;
  /** Path of the namespace. */
  path: Scalars['String'];
  /** Permission level required to create projects in the group. */
  projectCreationLevel?: Maybe<Scalars['String']>;
  /** Projects within this namespace. */
  projects: ProjectConnection;
  /** Number of projects in the root namespace where the repository size exceeds the limit. */
  repositorySizeExcessProjectCount: Scalars['Int'];
  /** Indicates if users can request access to namespace. */
  requestAccessEnabled?: Maybe<Scalars['Boolean']>;
  /** Indicates if all users in this group are required to set up two-factor authentication. */
  requireTwoFactorAuthentication?: Maybe<Scalars['Boolean']>;
  /** Aggregated storage statistics of the namespace. Only available for root namespaces. */
  rootStorageStatistics?: Maybe<RootStorageStatistics>;
  /** Find runners visible to the current user. */
  runners?: Maybe<CiRunnerConnection>;
  /** Indicates if sharing a project with another group within this group is prevented. */
  shareWithGroupLock?: Maybe<Scalars['Boolean']>;
  /** Shared runners availability for the namespace and its descendants. */
  sharedRunnersSetting?: Maybe<SharedRunnersSetting>;
  /** Group statistics. */
  stats?: Maybe<GroupStats>;
  /** Total storage limit of the root namespace in bytes. */
  storageSizeLimit?: Maybe<Scalars['Float']>;
  /** Permission level required to create subgroups within the group. */
  subgroupCreationLevel?: Maybe<Scalars['String']>;
  /** Date until the temporary storage increase is active. */
  temporaryStorageIncreaseEndsOn?: Maybe<Scalars['Time']>;
  /** Time logged on issues and merge requests in the group and its subgroups. */
  timelogs: TimelogConnection;
  /** Total repository size of all projects in the root namespace in bytes. */
  totalRepositorySize?: Maybe<Scalars['Float']>;
  /** Total excess repository size of all projects in the root namespace in bytes. */
  totalRepositorySizeExcess?: Maybe<Scalars['Float']>;
  /** Time before two-factor authentication is enforced. */
  twoFactorGracePeriod?: Maybe<Scalars['Int']>;
  /** Permissions for the current user on the resource */
  userPermissions: GroupPermissions;
  /** Visibility of the namespace. */
  visibility?: Maybe<Scalars['String']>;
  /** Vulnerabilities reported on the projects in the group and its subgroups. */
  vulnerabilities?: Maybe<VulnerabilityConnection>;
  /** The historical number of vulnerabilities per day for the projects in the group and its subgroups. */
  vulnerabilitiesCountByDay?: Maybe<VulnerabilitiesCountByDayConnection>;
  /** Represents vulnerable project counts for each grade. */
  vulnerabilityGrades: Array<VulnerableProjectsByGrade>;
  /** Vulnerability scanners reported on the project vulnerabilities of the group and its subgroups. */
  vulnerabilityScanners?: Maybe<VulnerabilityScannerConnection>;
  /** Counts for each vulnerability severity in the group and its subgroups. */
  vulnerabilitySeveritiesCount?: Maybe<VulnerabilitySeveritiesCount>;
  /** Web URL of the group. */
  webUrl: Scalars['String'];
};


export type GroupBoardArgs = {
  id: Scalars['BoardID'];
};


export type GroupBoardsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['BoardID']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupCodeCoverageActivitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  startDate: Scalars['Date'];
};


export type GroupComplianceFrameworksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['ComplianceManagementFrameworkID']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupContactsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupContainerRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<ContainerRepositorySort>;
};


export type GroupCustomEmojiArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupDependencyProxyBlobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupDependencyProxyManifestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupDescendantGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  includeParentDescendants?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  owned?: InputMaybe<Scalars['Boolean']>;
  search?: InputMaybe<Scalars['String']>;
};


export type GroupEpicArgs = {
  authorUsername?: InputMaybe<Scalars['String']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  iid?: InputMaybe<Scalars['ID']>;
  iidStartsWith?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  in?: InputMaybe<Array<IssuableSearchableField>>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  includeDescendantGroups?: InputMaybe<Scalars['Boolean']>;
  labelName?: InputMaybe<Array<Scalars['String']>>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedEpicFilterInput>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<EpicSort>;
  state?: InputMaybe<EpicState>;
  timeframe?: InputMaybe<Timeframe>;
};


export type GroupEpicBoardArgs = {
  id: Scalars['BoardsEpicBoardID'];
};


export type GroupEpicBoardsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupEpicsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['ID']>;
  iidStartsWith?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  in?: InputMaybe<Array<IssuableSearchableField>>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  includeDescendantGroups?: InputMaybe<Scalars['Boolean']>;
  labelName?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedEpicFilterInput>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<EpicSort>;
  state?: InputMaybe<EpicState>;
  timeframe?: InputMaybe<Timeframe>;
};


export type GroupGroupMembersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<Array<GroupMemberRelation>>;
  search?: InputMaybe<Scalars['String']>;
};


export type GroupIssuesArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeId?: InputMaybe<Scalars['String']>;
  assigneeUsernames?: InputMaybe<Array<Scalars['String']>>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  closedAfter?: InputMaybe<Scalars['Time']>;
  closedBefore?: InputMaybe<Scalars['Time']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  epicId?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  includeSubepics?: InputMaybe<Scalars['Boolean']>;
  includeSubgroups?: InputMaybe<Scalars['Boolean']>;
  iterationId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  iterationWildcardId?: InputMaybe<IterationWildcardId>;
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  last?: InputMaybe<Scalars['Int']>;
  milestoneTitle?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneWildcardId?: InputMaybe<MilestoneWildcardId>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedIssueFilterInput>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<IssueSort>;
  state?: InputMaybe<IssuableState>;
  types?: InputMaybe<Array<IssueType>>;
  updatedAfter?: InputMaybe<Scalars['Time']>;
  updatedBefore?: InputMaybe<Scalars['Time']>;
  weight?: InputMaybe<Scalars['String']>;
};


export type GroupIterationCadencesArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  after?: InputMaybe<Scalars['String']>;
  automatic?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  durationInWeeks?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['IterationsCadenceID']>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
};


export type GroupIterationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['ID']>;
  iid?: InputMaybe<Scalars['ID']>;
  includeAncestors?: InputMaybe<Scalars['Boolean']>;
  iterationCadenceIds?: InputMaybe<Array<Scalars['IterationsCadenceID']>>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<IterationState>;
  timeframe?: InputMaybe<Timeframe>;
  title?: InputMaybe<Scalars['String']>;
};


export type GroupLabelArgs = {
  title: Scalars['String'];
};


export type GroupLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  includeDescendantGroups?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  onlyGroupLabels?: InputMaybe<Scalars['Boolean']>;
  searchTerm?: InputMaybe<Scalars['String']>;
};


export type GroupMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  includeSubgroups?: InputMaybe<Scalars['Boolean']>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


export type GroupMilestonesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  containingDate?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  includeAncestors?: InputMaybe<Scalars['Boolean']>;
  includeDescendants?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  searchTitle?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MilestoneSort>;
  state?: InputMaybe<MilestoneStateEnum>;
  timeframe?: InputMaybe<Timeframe>;
  title?: InputMaybe<Scalars['String']>;
};


export type GroupOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupPackagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  includeVersionless?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  packageName?: InputMaybe<Scalars['String']>;
  packageType?: InputMaybe<PackageTypeEnum>;
  sort?: InputMaybe<PackageGroupSort>;
  status?: InputMaybe<PackageStatus>;
};


export type GroupProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasCodeCoverage?: InputMaybe<Scalars['Boolean']>;
  hasVulnerabilities?: InputMaybe<Scalars['Boolean']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  includeSubgroups?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<NamespaceProjectSort>;
};


export type GroupRunnersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  membership?: InputMaybe<RunnerMembershipFilter>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<CiRunnerSort>;
  status?: InputMaybe<CiRunnerStatus>;
  tagList?: InputMaybe<Array<Scalars['String']>>;
  type?: InputMaybe<CiRunnerType>;
};


export type GroupTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['Time']>;
  endTime?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['GroupID']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  startDate?: InputMaybe<Scalars['Time']>;
  startTime?: InputMaybe<Scalars['Time']>;
  username?: InputMaybe<Scalars['String']>;
};


export type GroupVulnerabilitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasIssues?: InputMaybe<Scalars['Boolean']>;
  hasResolution?: InputMaybe<Scalars['Boolean']>;
  image?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  reportType?: InputMaybe<Array<VulnerabilityReportType>>;
  scanner?: InputMaybe<Array<Scalars['String']>>;
  scannerId?: InputMaybe<Array<Scalars['VulnerabilitiesScannerID']>>;
  severity?: InputMaybe<Array<VulnerabilitySeverity>>;
  sort?: InputMaybe<VulnerabilitySort>;
  state?: InputMaybe<Array<VulnerabilityState>>;
};


export type GroupVulnerabilitiesCountByDayArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate: Scalars['ISO8601Date'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  startDate: Scalars['ISO8601Date'];
};


export type GroupVulnerabilityGradesArgs = {
  includeSubgroups?: InputMaybe<Scalars['Boolean']>;
};


export type GroupVulnerabilityScannersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type GroupVulnerabilitySeveritiesCountArgs = {
  hasIssues?: InputMaybe<Scalars['Boolean']>;
  hasResolution?: InputMaybe<Scalars['Boolean']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  reportType?: InputMaybe<Array<VulnerabilityReportType>>;
  scanner?: InputMaybe<Array<Scalars['String']>>;
  scannerId?: InputMaybe<Array<Scalars['VulnerabilitiesScannerID']>>;
  severity?: InputMaybe<Array<VulnerabilitySeverity>>;
  state?: InputMaybe<Array<VulnerabilityState>>;
};

/** The connection type for Group. */
export type GroupConnection = {
  __typename?: 'GroupConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<GroupEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Group>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type GroupEdge = {
  __typename?: 'GroupEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Group>;
};

/** Represents a Group Membership */
export type GroupMember = MemberInterface & {
  __typename?: 'GroupMember';
  /** GitLab::Access level. */
  accessLevel?: Maybe<AccessLevel>;
  /** Date and time the membership was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** User that authorized membership. */
  createdBy?: Maybe<UserCore>;
  /** Date and time the membership expires. */
  expiresAt?: Maybe<Scalars['Time']>;
  /** Group that a User is a member of. */
  group?: Maybe<Group>;
  /** ID of the member. */
  id: Scalars['ID'];
  /** Date and time the membership was last updated. */
  updatedAt?: Maybe<Scalars['Time']>;
  /** User that is associated with the member object. */
  user?: Maybe<UserCore>;
  /** Permissions for the current user on the resource */
  userPermissions: GroupPermissions;
};

/** The connection type for GroupMember. */
export type GroupMemberConnection = {
  __typename?: 'GroupMemberConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<GroupMemberEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<GroupMember>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type GroupMemberEdge = {
  __typename?: 'GroupMemberEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<GroupMember>;
};

/** Group member relation */
export type GroupMemberRelation =
  /** Members in the group's subgroups. */
  | 'DESCENDANTS'
  /** Members in the group itself. */
  | 'DIRECT'
  /** Members in the group's ancestor groups. */
  | 'INHERITED';

/** User permission on groups */
export type GroupPermission =
  /** Groups where the user can create projects. */
  | 'CREATE_PROJECTS';

export type GroupPermissions = {
  __typename?: 'GroupPermissions';
  /** Indicates the user can perform `create_projects` on this resource */
  createProjects: Scalars['Boolean'];
  /** Indicates the user can perform `read_group` on this resource */
  readGroup: Scalars['Boolean'];
};

/** Contains release-related statistics about a group */
export type GroupReleaseStats = {
  __typename?: 'GroupReleaseStats';
  /** Total number of releases in all descendant projects of the group. */
  releasesCount?: Maybe<Scalars['Int']>;
  /** Percentage of the group's descendant projects that have at least one release. */
  releasesPercentage?: Maybe<Scalars['Int']>;
};

/** Contains statistics about a group */
export type GroupStats = {
  __typename?: 'GroupStats';
  /** Statistics related to releases within the group. */
  releaseStats?: Maybe<GroupReleaseStats>;
};

/** Autogenerated input type of GroupUpdate */
export type GroupUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the group that will be updated. */
  fullPath: Scalars['ID'];
  /** Shared runners availability for the namespace and its descendants. */
  sharedRunnersSetting: SharedRunnersSetting;
};

/** Autogenerated return type of GroupUpdate */
export type GroupUpdatePayload = {
  __typename?: 'GroupUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Group after update. */
  group?: Maybe<Group>;
};

/** Represents the Geo sync and verification state of a group wiki repository */
export type GroupWikiRepositoryRegistry = {
  __typename?: 'GroupWikiRepositoryRegistry';
  /** Timestamp when the GroupWikiRepositoryRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the Group Wiki Repository. */
  groupWikiRepositoryId: Scalars['ID'];
  /** ID of the GroupWikiRepositoryRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the GroupWikiRepositoryRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the GroupWikiRepositoryRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** Timestamp after which the GroupWikiRepositoryRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the GroupWikiRepositoryRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the GroupWikiRepositoryRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for GroupWikiRepositoryRegistry. */
export type GroupWikiRepositoryRegistryConnection = {
  __typename?: 'GroupWikiRepositoryRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<GroupWikiRepositoryRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<GroupWikiRepositoryRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type GroupWikiRepositoryRegistryEdge = {
  __typename?: 'GroupWikiRepositoryRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<GroupWikiRepositoryRegistry>;
};

/** Health status of an issue or epic */
export type HealthStatus =
  /** At risk */
  | 'atRisk'
  /** Needs attention */
  | 'needsAttention'
  /** On track */
  | 'onTrack';

/** Autogenerated input type of HttpIntegrationCreate */
export type HttpIntegrationCreateInput = {
  /** Whether the integration is receiving alerts. */
  active: Scalars['Boolean'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Name of the integration. */
  name: Scalars['String'];
  /** Custom mapping of GitLab alert attributes to fields from the payload example. */
  payloadAttributeMappings?: InputMaybe<Array<AlertManagementPayloadAlertFieldInput>>;
  /** Example of an alert payload. */
  payloadExample?: InputMaybe<Scalars['JsonString']>;
  /** Project to create the integration in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of HttpIntegrationCreate */
export type HttpIntegrationCreatePayload = {
  __typename?: 'HttpIntegrationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** HTTP integration. */
  integration?: Maybe<AlertManagementHttpIntegration>;
};

/** Autogenerated input type of HttpIntegrationDestroy */
export type HttpIntegrationDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the integration to remove. */
  id: Scalars['AlertManagementHttpIntegrationID'];
};

/** Autogenerated return type of HttpIntegrationDestroy */
export type HttpIntegrationDestroyPayload = {
  __typename?: 'HttpIntegrationDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** HTTP integration. */
  integration?: Maybe<AlertManagementHttpIntegration>;
};

/** Autogenerated input type of HttpIntegrationResetToken */
export type HttpIntegrationResetTokenInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the integration to mutate. */
  id: Scalars['AlertManagementHttpIntegrationID'];
};

/** Autogenerated return type of HttpIntegrationResetToken */
export type HttpIntegrationResetTokenPayload = {
  __typename?: 'HttpIntegrationResetTokenPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** HTTP integration. */
  integration?: Maybe<AlertManagementHttpIntegration>;
};

/** Autogenerated input type of HttpIntegrationUpdate */
export type HttpIntegrationUpdateInput = {
  /** Whether the integration is receiving alerts. */
  active?: InputMaybe<Scalars['Boolean']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the integration to mutate. */
  id: Scalars['AlertManagementHttpIntegrationID'];
  /** Name of the integration. */
  name?: InputMaybe<Scalars['String']>;
  /** Custom mapping of GitLab alert attributes to fields from the payload example. */
  payloadAttributeMappings?: InputMaybe<Array<AlertManagementPayloadAlertFieldInput>>;
  /** Example of an alert payload. */
  payloadExample?: InputMaybe<Scalars['JsonString']>;
};

/** Autogenerated return type of HttpIntegrationUpdate */
export type HttpIntegrationUpdatePayload = {
  __typename?: 'HttpIntegrationUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** HTTP integration. */
  integration?: Maybe<AlertManagementHttpIntegration>;
};

/** Describes an incident management on-call rotation */
export type IncidentManagementOncallRotation = {
  __typename?: 'IncidentManagementOncallRotation';
  /** Active period for the on-call rotation. */
  activePeriod?: Maybe<OncallRotationActivePeriodType>;
  /** End date and time of the on-call rotation. */
  endsAt?: Maybe<Scalars['Time']>;
  /** ID of the on-call rotation. */
  id: Scalars['IncidentManagementOncallRotationID'];
  /** Length of the on-call schedule, in the units specified by lengthUnit. */
  length?: Maybe<Scalars['Int']>;
  /** Unit of the on-call rotation length. */
  lengthUnit?: Maybe<OncallRotationUnitEnum>;
  /** Name of the on-call rotation. */
  name: Scalars['String'];
  /** Participants of the on-call rotation. */
  participants?: Maybe<OncallParticipantTypeConnection>;
  /** Blocks of time for which a participant is on-call within a given time frame. Time frame cannot exceed one month. */
  shifts?: Maybe<IncidentManagementOncallShiftConnection>;
  /** Start date of the on-call rotation. */
  startsAt?: Maybe<Scalars['Time']>;
};


/** Describes an incident management on-call rotation */
export type IncidentManagementOncallRotationParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Describes an incident management on-call rotation */
export type IncidentManagementOncallRotationShiftsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endTime: Scalars['Time'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  startTime: Scalars['Time'];
};

/** The connection type for IncidentManagementOncallRotation. */
export type IncidentManagementOncallRotationConnection = {
  __typename?: 'IncidentManagementOncallRotationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<IncidentManagementOncallRotationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<IncidentManagementOncallRotation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type IncidentManagementOncallRotationEdge = {
  __typename?: 'IncidentManagementOncallRotationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<IncidentManagementOncallRotation>;
};

/** Describes an incident management on-call schedule */
export type IncidentManagementOncallSchedule = {
  __typename?: 'IncidentManagementOncallSchedule';
  /** Description of the on-call schedule. */
  description?: Maybe<Scalars['String']>;
  /** Internal ID of the on-call schedule. */
  iid: Scalars['ID'];
  /** Name of the on-call schedule. */
  name: Scalars['String'];
  oncallUsers?: Maybe<Array<UserCore>>;
  /** On-call rotation for the on-call schedule. */
  rotation?: Maybe<IncidentManagementOncallRotation>;
  /** On-call rotations for the on-call schedule. */
  rotations: IncidentManagementOncallRotationConnection;
  /** Time zone of the on-call schedule. */
  timezone: Scalars['String'];
};


/** Describes an incident management on-call schedule */
export type IncidentManagementOncallScheduleRotationArgs = {
  id: Scalars['IncidentManagementOncallRotationID'];
};


/** Describes an incident management on-call schedule */
export type IncidentManagementOncallScheduleRotationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for IncidentManagementOncallSchedule. */
export type IncidentManagementOncallScheduleConnection = {
  __typename?: 'IncidentManagementOncallScheduleConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<IncidentManagementOncallScheduleEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<IncidentManagementOncallSchedule>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type IncidentManagementOncallScheduleEdge = {
  __typename?: 'IncidentManagementOncallScheduleEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<IncidentManagementOncallSchedule>;
};

/** A block of time for which a participant is on-call. */
export type IncidentManagementOncallShift = {
  __typename?: 'IncidentManagementOncallShift';
  /** End time of the on-call shift. */
  endsAt?: Maybe<Scalars['Time']>;
  /** Participant assigned to the on-call shift. */
  participant?: Maybe<OncallParticipantType>;
  /** Start time of the on-call shift. */
  startsAt?: Maybe<Scalars['Time']>;
};

/** The connection type for IncidentManagementOncallShift. */
export type IncidentManagementOncallShiftConnection = {
  __typename?: 'IncidentManagementOncallShiftConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<IncidentManagementOncallShiftEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<IncidentManagementOncallShift>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type IncidentManagementOncallShiftEdge = {
  __typename?: 'IncidentManagementOncallShiftEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<IncidentManagementOncallShift>;
};

export type InstanceSecurityDashboard = {
  __typename?: 'InstanceSecurityDashboard';
  /** Projects selected in Instance Security Dashboard. */
  projects: ProjectConnection;
  /** Represents vulnerable project counts for each grade. */
  vulnerabilityGrades: Array<VulnerableProjectsByGrade>;
  /** Vulnerability scanners reported on the vulnerabilities from projects selected in Instance Security Dashboard. */
  vulnerabilityScanners?: Maybe<VulnerabilityScannerConnection>;
  /** Counts for each vulnerability severity from projects selected in Instance Security Dashboard. */
  vulnerabilitySeveritiesCount?: Maybe<VulnerabilitySeveritiesCount>;
};


export type InstanceSecurityDashboardProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};


export type InstanceSecurityDashboardVulnerabilityScannersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type InstanceSecurityDashboardVulnerabilitySeveritiesCountArgs = {
  hasIssues?: InputMaybe<Scalars['Boolean']>;
  hasResolution?: InputMaybe<Scalars['Boolean']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  reportType?: InputMaybe<Array<VulnerabilityReportType>>;
  scanner?: InputMaybe<Array<Scalars['String']>>;
  scannerId?: InputMaybe<Array<Scalars['VulnerabilitiesScannerID']>>;
  severity?: InputMaybe<Array<VulnerabilitySeverity>>;
  state?: InputMaybe<Array<VulnerabilityState>>;
};

/** Represents an issuable. */
export type Issuable = Epic | Issue | MergeRequest;

/** Fields to perform the search in */
export type IssuableSearchableField =
  /** Search in description field. */
  | 'DESCRIPTION'
  /** Search in title field. */
  | 'TITLE';

/** Incident severity */
export type IssuableSeverity =
  /** Critical severity */
  | 'CRITICAL'
  /** High severity */
  | 'HIGH'
  /** Low severity */
  | 'LOW'
  /** Medium severity */
  | 'MEDIUM'
  /** Unknown severity */
  | 'UNKNOWN';

/** State of a GitLab issue or merge request */
export type IssuableState =
  /** All available. */
  | 'all'
  /** In closed state. */
  | 'closed'
  /** Discussion has been locked. */
  | 'locked'
  /** In open state. */
  | 'opened';

export type Issue = CurrentUserTodos & NoteableInterface & {
  __typename?: 'Issue';
  /** Alert associated to this issue. */
  alertManagementAlert?: Maybe<AlertManagementAlert>;
  /** Assignees of the issue. */
  assignees?: Maybe<UserCoreConnection>;
  /** User that created the issue. */
  author: UserCore;
  /** Indicates the issue is blocked. */
  blocked: Scalars['Boolean'];
  /** Count of issues blocking this issue. */
  blockedByCount?: Maybe<Scalars['Int']>;
  /** Issues blocking this issue. */
  blockedByIssues?: Maybe<IssueConnection>;
  /** Count of issues this issue is blocking. */
  blockingCount: Scalars['Int'];
  /** Timestamp of when the issue was closed. */
  closedAt?: Maybe<Scalars['Time']>;
  /** Indicates the issue is confidential. */
  confidential: Scalars['Boolean'];
  /** User specific email address for the issue. */
  createNoteEmail?: Maybe<Scalars['String']>;
  /** Timestamp of when the issue was created. */
  createdAt: Scalars['Time'];
  /** To-do items for the current user. */
  currentUserTodos: TodoConnection;
  /** Customer relations contacts of the issue. */
  customerRelationsContacts?: Maybe<CustomerRelationsContactConnection>;
  /** Description of the issue. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Collection of design images associated with this issue. */
  designCollection?: Maybe<DesignCollection>;
  /** Indicates discussion is locked on the issue. */
  discussionLocked: Scalars['Boolean'];
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** Number of downvotes the issue has received. */
  downvotes: Scalars['Int'];
  /** Due date of the issue. */
  dueDate?: Maybe<Scalars['Time']>;
  /** Indicates if a project has email notifications disabled: `true` if email notifications are disabled. */
  emailsDisabled: Scalars['Boolean'];
  /** Epic to which this issue belongs. */
  epic?: Maybe<Epic>;
  /** Current health status. */
  healthStatus?: Maybe<HealthStatus>;
  /**
   * Indicates the issue is hidden because the author has been banned. Will always
   * return `null` if `ban_user_feature_flag` feature flag is disabled.
   */
  hidden?: Maybe<Scalars['Boolean']>;
  /** Human-readable time estimate of the issue. */
  humanTimeEstimate?: Maybe<Scalars['String']>;
  /** Human-readable total time reported as spent on the issue. */
  humanTotalTimeSpent?: Maybe<Scalars['String']>;
  /** ID of the issue. */
  id: Scalars['ID'];
  /** Internal ID of the issue. */
  iid: Scalars['ID'];
  /** Iteration of the issue. */
  iteration?: Maybe<Iteration>;
  /** Labels of the issue. */
  labels?: Maybe<LabelConnection>;
  /** Number of merge requests that close the issue on merge. */
  mergeRequestsCount: Scalars['Int'];
  /** Metric images associated to the issue. */
  metricImages?: Maybe<Array<MetricImage>>;
  /** Milestone of the issue. */
  milestone?: Maybe<Milestone>;
  /** Indicates if issue got moved from other project. */
  moved?: Maybe<Scalars['Boolean']>;
  /** Updated Issue after it got moved to another project. */
  movedTo?: Maybe<Issue>;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** List of participants in the issue. */
  participants?: Maybe<UserCoreConnection>;
  /** ID of the issue project. */
  projectId: Scalars['Int'];
  /** Internal reference of the issue. Returned in shortened format by default. */
  reference: Scalars['String'];
  /** Relative position of the issue (used for positioning in epic tree and issue boards). */
  relativePosition?: Maybe<Scalars['Int']>;
  /** Severity level of the incident. */
  severity?: Maybe<IssuableSeverity>;
  /** Timestamp of when the issue SLA expires. */
  slaDueAt?: Maybe<Scalars['Time']>;
  /** State of the issue. */
  state: IssueState;
  /** Indicates whether an issue is published to the status page. */
  statusPagePublishedIncident?: Maybe<Scalars['Boolean']>;
  /** Indicates the currently logged in user is subscribed to the issue. */
  subscribed: Scalars['Boolean'];
  /** Task completion status of the issue. */
  taskCompletionStatus: TaskCompletionStatus;
  /** Time estimate of the issue. */
  timeEstimate: Scalars['Int'];
  /** Timelogs on the issue. */
  timelogs: TimelogConnection;
  /** Title of the issue. */
  title: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  /** Total time reported as spent on the issue. */
  totalTimeSpent: Scalars['Int'];
  /** Type of the issue. */
  type?: Maybe<IssueType>;
  /** Timestamp of when the issue was last updated. */
  updatedAt: Scalars['Time'];
  /** User that last updated the issue. */
  updatedBy?: Maybe<UserCore>;
  /** Number of upvotes the issue has received. */
  upvotes: Scalars['Int'];
  /** Number of user discussions in the issue. */
  userDiscussionsCount: Scalars['Int'];
  /** Number of user notes of the issue. */
  userNotesCount: Scalars['Int'];
  /** Permissions for the current user on the resource */
  userPermissions: IssuePermissions;
  /** Web path of the issue. */
  webPath: Scalars['String'];
  /** Web URL of the issue. */
  webUrl: Scalars['String'];
  /** Weight of the issue. */
  weight?: Maybe<Scalars['Int']>;
};


export type IssueAssigneesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IssueBlockedByIssuesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IssueCurrentUserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<TodoStateEnum>;
};


export type IssueCustomerRelationsContactsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IssueDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IssueLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IssueNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IssueParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type IssueReferenceArgs = {
  full?: InputMaybe<Scalars['Boolean']>;
};


export type IssueTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for Issue. */
export type IssueConnection = {
  __typename?: 'IssueConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<IssueEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Issue>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total weight of issues collection. */
  weight: Scalars['Int'];
};

/** Iteration ID wildcard values for issue creation */
export type IssueCreationIterationWildcardId =
  /** Current iteration. */
  | 'CURRENT';

/** An edge in a connection. */
export type IssueEdge = {
  __typename?: 'IssueEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Issue>;
};

/** Autogenerated input type of IssueMove */
export type IssueMoveInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
  /** Project to move the issue to. */
  targetProjectPath: Scalars['ID'];
};

/** Autogenerated input type of IssueMoveList */
export type IssueMoveListInput = {
  /** Global ID of the board that the issue is in. */
  boardId: Scalars['BoardID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the parent epic. NULL when removing the association. */
  epicId?: InputMaybe<Scalars['EpicID']>;
  /** ID of the board list that the issue will be moved from. */
  fromListId?: InputMaybe<Scalars['ID']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** ID of issue that should be placed after the current issue. */
  moveAfterId?: InputMaybe<Scalars['ID']>;
  /** ID of issue that should be placed before the current issue. */
  moveBeforeId?: InputMaybe<Scalars['ID']>;
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
  /** ID of the board list that the issue will be moved to. */
  toListId?: InputMaybe<Scalars['ID']>;
};

/** Autogenerated return type of IssueMoveList */
export type IssueMoveListPayload = {
  __typename?: 'IssueMoveListPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated return type of IssueMove */
export type IssueMovePayload = {
  __typename?: 'IssueMovePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Check permissions for the current user on a issue */
export type IssuePermissions = {
  __typename?: 'IssuePermissions';
  /** Indicates the user can perform `admin_issue` on this resource */
  adminIssue: Scalars['Boolean'];
  /** Indicates the user can perform `create_design` on this resource */
  createDesign: Scalars['Boolean'];
  /** Indicates the user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_design` on this resource */
  destroyDesign: Scalars['Boolean'];
  /** Indicates the user can perform `read_design` on this resource */
  readDesign: Scalars['Boolean'];
  /** Indicates the user can perform `read_issue` on this resource */
  readIssue: Scalars['Boolean'];
  /** Indicates the user can perform `reopen_issue` on this resource */
  reopenIssue: Scalars['Boolean'];
  /** Indicates the user can perform `update_issue` on this resource */
  updateIssue: Scalars['Boolean'];
};

/** Autogenerated input type of IssueSetAssignees */
export type IssueSetAssigneesInput = {
  /** Usernames to assign to the resource. Replaces existing assignees by default. */
  assigneeUsernames: Array<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Operation to perform. Defaults to REPLACE. */
  operationMode?: InputMaybe<MutationOperationMode>;
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of IssueSetAssignees */
export type IssueSetAssigneesPayload = {
  __typename?: 'IssueSetAssigneesPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetConfidential */
export type IssueSetConfidentialInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Whether or not to set the issue as a confidential. */
  confidential: Scalars['Boolean'];
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of IssueSetConfidential */
export type IssueSetConfidentialPayload = {
  __typename?: 'IssueSetConfidentialPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetDueDate */
export type IssueSetDueDateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Desired due date for the issue. Due date is removed if null. */
  dueDate?: InputMaybe<Scalars['Time']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of IssueSetDueDate */
export type IssueSetDueDatePayload = {
  __typename?: 'IssueSetDueDatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetEpic */
export type IssueSetEpicInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the epic to be assigned to the issue, epic will be removed if absent or set to null */
  epicId?: InputMaybe<Scalars['EpicID']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of IssueSetEpic */
export type IssueSetEpicPayload = {
  __typename?: 'IssueSetEpicPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetIteration */
export type IssueSetIterationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Iteration to assign to the issue. */
  iterationId?: InputMaybe<Scalars['IterationID']>;
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of IssueSetIteration */
export type IssueSetIterationPayload = {
  __typename?: 'IssueSetIterationPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetLocked */
export type IssueSetLockedInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Whether or not to lock discussion on the issue. */
  locked: Scalars['Boolean'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of IssueSetLocked */
export type IssueSetLockedPayload = {
  __typename?: 'IssueSetLockedPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetSeverity */
export type IssueSetSeverityInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
  /** Set the incident severity level. */
  severity: IssuableSeverity;
};

/** Autogenerated return type of IssueSetSeverity */
export type IssueSetSeverityPayload = {
  __typename?: 'IssueSetSeverityPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetSubscription */
export type IssueSetSubscriptionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
  /** Desired state of the subscription. */
  subscribedState: Scalars['Boolean'];
};

/** Autogenerated return type of IssueSetSubscription */
export type IssueSetSubscriptionPayload = {
  __typename?: 'IssueSetSubscriptionPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of IssueSetWeight */
export type IssueSetWeightInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
  /** The desired weight for the issue. If set to null, weight is removed. */
  weight?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of IssueSetWeight */
export type IssueSetWeightPayload = {
  __typename?: 'IssueSetWeightPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Values for sorting issues */
export type IssueSort =
  /** Blocking issues count by ascending order. */
  | 'BLOCKING_ISSUES_ASC'
  /** Blocking issues count by descending order. */
  | 'BLOCKING_ISSUES_DESC'
  /** Created at ascending order. */
  | 'CREATED_ASC'
  /** Created at descending order. */
  | 'CREATED_DESC'
  /** Due date by ascending order. */
  | 'DUE_DATE_ASC'
  /** Due date by descending order. */
  | 'DUE_DATE_DESC'
  /** Label priority by ascending order. */
  | 'LABEL_PRIORITY_ASC'
  /** Label priority by descending order. */
  | 'LABEL_PRIORITY_DESC'
  /** Milestone due date by ascending order. */
  | 'MILESTONE_DUE_ASC'
  /** Milestone due date by descending order. */
  | 'MILESTONE_DUE_DESC'
  /** Number of upvotes (awarded "thumbs up" emoji) by ascending order. */
  | 'POPULARITY_ASC'
  /** Number of upvotes (awarded "thumbs up" emoji) by descending order. */
  | 'POPULARITY_DESC'
  /** Priority by ascending order. */
  | 'PRIORITY_ASC'
  /** Priority by descending order. */
  | 'PRIORITY_DESC'
  /** Published issues shown last. */
  | 'PUBLISHED_ASC'
  /** Published issues shown first. */
  | 'PUBLISHED_DESC'
  /** Relative position by ascending order. */
  | 'RELATIVE_POSITION_ASC'
  /** Severity from less critical to more critical. */
  | 'SEVERITY_ASC'
  /** Severity from more critical to less critical. */
  | 'SEVERITY_DESC'
  /** Issues with earliest SLA due time shown first. */
  | 'SLA_DUE_AT_ASC'
  /** Issues with latest SLA due time shown first. */
  | 'SLA_DUE_AT_DESC'
  /** Title by ascending order. */
  | 'TITLE_ASC'
  /** Title by descending order. */
  | 'TITLE_DESC'
  /** Updated at ascending order. */
  | 'UPDATED_ASC'
  /** Updated at descending order. */
  | 'UPDATED_DESC'
  /** Weight by ascending order. */
  | 'WEIGHT_ASC'
  /** Weight by descending order. */
  | 'WEIGHT_DESC'
  /** Created at ascending order. */
  | 'created_asc'
  /** Created at descending order. */
  | 'created_desc'
  /** Updated at ascending order. */
  | 'updated_asc'
  /** Updated at descending order. */
  | 'updated_desc';

/** State of a GitLab issue */
export type IssueState =
  /** All available. */
  | 'all'
  /** In closed state. */
  | 'closed'
  /** Discussion has been locked. */
  | 'locked'
  /** In open state. */
  | 'opened';

/** Values for issue state events */
export type IssueStateEvent =
  /** Closes the issue. */
  | 'CLOSE'
  /** Reopens the issue. */
  | 'REOPEN';

/** Represents total number of issues for the represented statuses */
export type IssueStatusCountsType = {
  __typename?: 'IssueStatusCountsType';
  /** Number of issues with status ALL for the project */
  all?: Maybe<Scalars['Int']>;
  /** Number of issues with status CLOSED for the project */
  closed?: Maybe<Scalars['Int']>;
  /** Number of issues with status OPENED for the project */
  opened?: Maybe<Scalars['Int']>;
};

/** Issue type */
export type IssueType =
  /** Incident issue type */
  | 'INCIDENT'
  /** Issue issue type */
  | 'ISSUE'
  /** Requirement issue type */
  | 'REQUIREMENT'
  /** Test Case issue type */
  | 'TEST_CASE';

/** Represents an iteration object */
export type Iteration = TimeboxReportInterface & {
  __typename?: 'Iteration';
  /** Timestamp of iteration creation. */
  createdAt: Scalars['Time'];
  /** Description of the iteration. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Timestamp of the iteration due date. */
  dueDate?: Maybe<Scalars['Time']>;
  /** ID of the iteration. */
  id: Scalars['ID'];
  /** Internal ID of the iteration. */
  iid: Scalars['ID'];
  /** Cadence of the iteration. */
  iterationCadence: IterationCadence;
  /** Historically accurate report about the timebox. */
  report?: Maybe<TimeboxReport>;
  /** Web path of the iteration, scoped to the query parent. Only valid for Project parents. Returns null in other contexts. */
  scopedPath?: Maybe<Scalars['String']>;
  /** Web URL of the iteration, scoped to the query parent. Only valid for Project parents. Returns null in other contexts. */
  scopedUrl?: Maybe<Scalars['String']>;
  /** Timestamp of the iteration start date. */
  startDate?: Maybe<Scalars['Time']>;
  /** State of the iteration. */
  state: IterationState;
  /** Title of the iteration. */
  title: Scalars['String'];
  /** Timestamp of last iteration update. */
  updatedAt: Scalars['Time'];
  /** Web path of the iteration. */
  webPath: Scalars['String'];
  /** Web URL of the iteration. */
  webUrl: Scalars['String'];
};

/** Represents an iteration cadence */
export type IterationCadence = {
  __typename?: 'IterationCadence';
  /** Whether the iteration cadence is active. */
  active?: Maybe<Scalars['Boolean']>;
  /** Whether the iteration cadence should automatically generate future iterations. */
  automatic?: Maybe<Scalars['Boolean']>;
  /** Description of the iteration cadence. Maximum length is 5000 characters. */
  description?: Maybe<Scalars['String']>;
  /** Duration in weeks of the iterations within this cadence. */
  durationInWeeks?: Maybe<Scalars['Int']>;
  /** Global ID of the iteration cadence. */
  id: Scalars['IterationsCadenceID'];
  /** Future iterations to be created when iteration cadence is set to automatic. */
  iterationsInAdvance?: Maybe<Scalars['Int']>;
  /** Whether the iteration cadence should roll over issues to the next iteration or not. */
  rollOver: Scalars['Boolean'];
  /** Timestamp of the iteration cadence start date. */
  startDate?: Maybe<Scalars['Time']>;
  /** Title of the iteration cadence. */
  title: Scalars['String'];
};

/** The connection type for IterationCadence. */
export type IterationCadenceConnection = {
  __typename?: 'IterationCadenceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<IterationCadenceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<IterationCadence>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of IterationCadenceCreate */
export type IterationCadenceCreateInput = {
  /** Whether the iteration cadence is active. */
  active: Scalars['Boolean'];
  /** Whether the iteration cadence should automatically generate future iterations. */
  automatic: Scalars['Boolean'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the iteration cadence. Maximum length is 5000 characters. */
  description?: InputMaybe<Scalars['String']>;
  /** Duration in weeks of the iterations within this cadence. */
  durationInWeeks?: InputMaybe<Scalars['Int']>;
  /** Group where the iteration cadence is created. */
  groupPath: Scalars['ID'];
  /** Future iterations to be created when iteration cadence is set to automatic. */
  iterationsInAdvance?: InputMaybe<Scalars['Int']>;
  /** Whether the iteration cadence should roll over issues to the next iteration or not. */
  rollOver?: InputMaybe<Scalars['Boolean']>;
  /** Timestamp of the iteration cadence start date. */
  startDate?: InputMaybe<Scalars['Time']>;
  /** Title of the iteration cadence. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of IterationCadenceCreate */
export type IterationCadenceCreatePayload = {
  __typename?: 'IterationCadenceCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Created iteration cadence. */
  iterationCadence?: Maybe<IterationCadence>;
};

/** Autogenerated input type of IterationCadenceDestroy */
export type IterationCadenceDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the iteration cadence. */
  id: Scalars['IterationsCadenceID'];
};

/** Autogenerated return type of IterationCadenceDestroy */
export type IterationCadenceDestroyPayload = {
  __typename?: 'IterationCadenceDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Group the iteration cadence belongs to. */
  group: Group;
};

/** An edge in a connection. */
export type IterationCadenceEdge = {
  __typename?: 'IterationCadenceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<IterationCadence>;
};

/** Autogenerated input type of IterationCadenceUpdate */
export type IterationCadenceUpdateInput = {
  /** Whether the iteration cadence is active. */
  active?: InputMaybe<Scalars['Boolean']>;
  /** Whether the iteration cadence should automatically generate future iterations. */
  automatic?: InputMaybe<Scalars['Boolean']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the iteration cadence. Maximum length is 5000 characters. */
  description?: InputMaybe<Scalars['String']>;
  /** Duration in weeks of the iterations within this cadence. */
  durationInWeeks?: InputMaybe<Scalars['Int']>;
  /** Global ID of the iteration cadence. */
  id: Scalars['IterationsCadenceID'];
  /** Future iterations to be created when iteration cadence is set to automatic. */
  iterationsInAdvance?: InputMaybe<Scalars['Int']>;
  /** Whether the iteration cadence should roll over issues to the next iteration or not. */
  rollOver?: InputMaybe<Scalars['Boolean']>;
  /** Timestamp of the iteration cadence start date. */
  startDate?: InputMaybe<Scalars['Time']>;
  /** Title of the iteration cadence. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of IterationCadenceUpdate */
export type IterationCadenceUpdatePayload = {
  __typename?: 'IterationCadenceUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Updated iteration cadence. */
  iterationCadence?: Maybe<IterationCadence>;
};

/** The connection type for Iteration. */
export type IterationConnection = {
  __typename?: 'IterationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<IterationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Iteration>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of IterationDelete */
export type IterationDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the iteration. */
  id: Scalars['IterationID'];
};

/** Autogenerated return type of IterationDelete */
export type IterationDeletePayload = {
  __typename?: 'IterationDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Group the iteration belongs to. */
  group: Group;
};

/** An edge in a connection. */
export type IterationEdge = {
  __typename?: 'IterationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Iteration>;
};

/** State of a GitLab iteration */
export type IterationState =
  /** Any iteration. */
  | 'all'
  /** Closed iteration. */
  | 'closed'
  /** Current iteration. */
  | 'current'
  /** Open iteration. */
  | 'opened'
  /** Started iteration. Deprecated in 14.1: Use current instead. */
  | 'started'
  /** Upcoming iteration. */
  | 'upcoming';

/** Iteration ID wildcard values */
export type IterationWildcardId =
  /** An iteration is assigned. */
  | 'ANY'
  /** Current iteration. */
  | 'CURRENT'
  /** No iteration is assigned. */
  | 'NONE';

export type JiraImport = {
  __typename?: 'JiraImport';
  /** Timestamp of when the Jira import was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** Count of issues that failed to import. */
  failedToImportCount: Scalars['Int'];
  /** Count of issues that were successfully imported. */
  importedIssuesCount: Scalars['Int'];
  /** Project key for the imported Jira project. */
  jiraProjectKey: Scalars['String'];
  /** Timestamp of when the Jira import was scheduled. */
  scheduledAt?: Maybe<Scalars['Time']>;
  /** User that started the Jira import. */
  scheduledBy?: Maybe<UserCore>;
  /** Total count of issues that were attempted to import. */
  totalIssueCount: Scalars['Int'];
};

/** The connection type for JiraImport. */
export type JiraImportConnection = {
  __typename?: 'JiraImportConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<JiraImportEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<JiraImport>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type JiraImportEdge = {
  __typename?: 'JiraImportEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<JiraImport>;
};

/** Autogenerated input type of JiraImportStart */
export type JiraImportStartInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project key of the importer Jira project. */
  jiraProjectKey: Scalars['String'];
  /** Project name of the importer Jira project. */
  jiraProjectName?: InputMaybe<Scalars['String']>;
  /** Project to import the Jira project into. */
  projectPath: Scalars['ID'];
  /** Mapping of Jira to GitLab users. */
  usersMapping?: InputMaybe<Array<JiraUsersMappingInputType>>;
};

/** Autogenerated return type of JiraImportStart */
export type JiraImportStartPayload = {
  __typename?: 'JiraImportStartPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Jira import data after mutation. */
  jiraImport?: Maybe<JiraImport>;
};

/** Autogenerated input type of JiraImportUsers */
export type JiraImportUsersInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project to import the Jira users into. */
  projectPath: Scalars['ID'];
  /** Index of the record the import should started at, default 0 (50 records returned). */
  startAt?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of JiraImportUsers */
export type JiraImportUsersPayload = {
  __typename?: 'JiraImportUsersPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Users returned from Jira, matched by email and name if possible. */
  jiraUsers?: Maybe<Array<JiraUser>>;
};

export type JiraProject = {
  __typename?: 'JiraProject';
  /** Key of the Jira project. */
  key: Scalars['String'];
  /** Name of the Jira project. */
  name?: Maybe<Scalars['String']>;
  /** ID of the Jira project. */
  projectId: Scalars['Int'];
};

/** The connection type for JiraProject. */
export type JiraProjectConnection = {
  __typename?: 'JiraProjectConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<JiraProjectEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<JiraProject>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type JiraProjectEdge = {
  __typename?: 'JiraProjectEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<JiraProject>;
};

export type JiraService = Service & {
  __typename?: 'JiraService';
  /** Indicates if the service is active. */
  active?: Maybe<Scalars['Boolean']>;
  /** List of all Jira projects fetched through Jira REST API. */
  projects?: Maybe<JiraProjectConnection>;
  /** Class name of the service. */
  type?: Maybe<Scalars['String']>;
};


export type JiraServiceProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
};

export type JiraUser = {
  __typename?: 'JiraUser';
  /** ID of the matched GitLab user. */
  gitlabId?: Maybe<Scalars['Int']>;
  /** Name of the matched GitLab user. */
  gitlabName?: Maybe<Scalars['String']>;
  /** Username of the matched GitLab user. */
  gitlabUsername?: Maybe<Scalars['String']>;
  /** Account ID of the Jira user. */
  jiraAccountId: Scalars['String'];
  /** Display name of the Jira user. */
  jiraDisplayName: Scalars['String'];
  /** Email of the Jira user, returned only for users with public emails. */
  jiraEmail?: Maybe<Scalars['String']>;
};

export type JiraUsersMappingInputType = {
  /** ID of the GitLab user. */
  gitlabId?: InputMaybe<Scalars['Int']>;
  /** Jira account ID of the user. */
  jiraAccountId: Scalars['String'];
};

export type JobArtifactFileType =
  /** ACCESSIBILITY job artifact file type. */
  | 'ACCESSIBILITY'
  /** API FUZZING job artifact file type. */
  | 'API_FUZZING'
  /** ARCHIVE job artifact file type. */
  | 'ARCHIVE'
  /** BROWSER PERFORMANCE job artifact file type. */
  | 'BROWSER_PERFORMANCE'
  /** CLUSTER APPLICATIONS job artifact file type. */
  | 'CLUSTER_APPLICATIONS'
  /** CLUSTER IMAGE SCANNING job artifact file type. */
  | 'CLUSTER_IMAGE_SCANNING'
  /** COBERTURA job artifact file type. */
  | 'COBERTURA'
  /** CODE QUALITY job artifact file type. */
  | 'CODEQUALITY'
  /** CONTAINER SCANNING job artifact file type. */
  | 'CONTAINER_SCANNING'
  /** COVERAGE FUZZING job artifact file type. */
  | 'COVERAGE_FUZZING'
  /** DAST job artifact file type. */
  | 'DAST'
  /** DEPENDENCY SCANNING job artifact file type. */
  | 'DEPENDENCY_SCANNING'
  /** DOTENV job artifact file type. */
  | 'DOTENV'
  /** JUNIT job artifact file type. */
  | 'JUNIT'
  /** LICENSE SCANNING job artifact file type. */
  | 'LICENSE_SCANNING'
  /** LOAD PERFORMANCE job artifact file type. */
  | 'LOAD_PERFORMANCE'
  /** LSIF job artifact file type. */
  | 'LSIF'
  /** METADATA job artifact file type. */
  | 'METADATA'
  /** METRICS job artifact file type. */
  | 'METRICS'
  /** METRICS REFEREE job artifact file type. */
  | 'METRICS_REFEREE'
  /** NETWORK REFEREE job artifact file type. */
  | 'NETWORK_REFEREE'
  /** PERFORMANCE job artifact file type. */
  | 'PERFORMANCE'
  /** REQUIREMENTS job artifact file type. */
  | 'REQUIREMENTS'
  /** SAST job artifact file type. */
  | 'SAST'
  /** SECRET DETECTION job artifact file type. */
  | 'SECRET_DETECTION'
  /** TERRAFORM job artifact file type. */
  | 'TERRAFORM'
  /** TRACE job artifact file type. */
  | 'TRACE';

/** Autogenerated input type of JobCancel */
export type JobCancelInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the job to mutate. */
  id: Scalars['CiBuildID'];
};

/** Autogenerated return type of JobCancel */
export type JobCancelPayload = {
  __typename?: 'JobCancelPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Job after the mutation. */
  job?: Maybe<CiJob>;
};

export type JobPermissions = {
  __typename?: 'JobPermissions';
  /** Indicates the user can perform `read_build` on this resource */
  readBuild: Scalars['Boolean'];
  /** Indicates the user can perform `read_job_artifacts` on this resource */
  readJobArtifacts: Scalars['Boolean'];
  /** Indicates the user can perform `update_build` on this resource */
  updateBuild: Scalars['Boolean'];
};

/** Autogenerated input type of JobPlay */
export type JobPlayInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the job to mutate. */
  id: Scalars['CiBuildID'];
};

/** Autogenerated return type of JobPlay */
export type JobPlayPayload = {
  __typename?: 'JobPlayPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Job after the mutation. */
  job?: Maybe<CiJob>;
};

/** Autogenerated input type of JobRetry */
export type JobRetryInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the job to mutate. */
  id: Scalars['CiBuildID'];
};

/** Autogenerated return type of JobRetry */
export type JobRetryPayload = {
  __typename?: 'JobRetryPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Job after the mutation. */
  job?: Maybe<CiJob>;
};

/** Autogenerated input type of JobUnschedule */
export type JobUnscheduleInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the job to mutate. */
  id: Scalars['CiBuildID'];
};

/** Autogenerated return type of JobUnschedule */
export type JobUnschedulePayload = {
  __typename?: 'JobUnschedulePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Job after the mutation. */
  job?: Maybe<CiJob>;
};

export type Kas = {
  __typename?: 'Kas';
  /** Indicates whether the Kubernetes Agent Server is enabled. */
  enabled: Scalars['Boolean'];
  /** URL used by the Agents to communicate with KAS. */
  externalUrl?: Maybe<Scalars['String']>;
  /** KAS version. */
  version?: Maybe<Scalars['String']>;
};

export type Label = {
  __typename?: 'Label';
  /** Background color of the label. */
  color: Scalars['String'];
  /** When this label was created. */
  createdAt: Scalars['Time'];
  /** Description of the label (Markdown rendered as HTML for caching). */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Label ID. */
  id: Scalars['ID'];
  /** Text color of the label. */
  textColor: Scalars['String'];
  /** Content of the label. */
  title: Scalars['String'];
  /** When this label was last updated. */
  updatedAt: Scalars['Time'];
};

/** The connection type for Label. */
export type LabelConnection = {
  __typename?: 'LabelConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<LabelEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Label>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of LabelCreate */
export type LabelCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /**
   * The color of the label given in 6-digit hex notation with leading '#' sign
   * (for example, `#FFAABB`) or one of the CSS color names.
   */
  color?: InputMaybe<Scalars['String']>;
  /** Description of the label. */
  description?: InputMaybe<Scalars['String']>;
  /** Full path of the group with which the resource is associated. */
  groupPath?: InputMaybe<Scalars['ID']>;
  /** Full path of the project with which the resource is associated. */
  projectPath?: InputMaybe<Scalars['ID']>;
  /** Title of the label. */
  title: Scalars['String'];
};

/** Autogenerated return type of LabelCreate */
export type LabelCreatePayload = {
  __typename?: 'LabelCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Label after mutation. */
  label?: Maybe<Label>;
};

/** An edge in a connection. */
export type LabelEdge = {
  __typename?: 'LabelEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Label>;
};

/** Represents the Geo sync and verification state of an LFS object */
export type LfsObjectRegistry = {
  __typename?: 'LfsObjectRegistry';
  /** Timestamp when the LfsObjectRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the LfsObjectRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the LfsObjectRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the LfsObjectRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** ID of the LFS object. */
  lfsObjectId: Scalars['ID'];
  /** Timestamp after which the LfsObjectRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the LfsObjectRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the LfsObjectRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for LfsObjectRegistry. */
export type LfsObjectRegistryConnection = {
  __typename?: 'LfsObjectRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<LfsObjectRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<LfsObjectRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type LfsObjectRegistryEdge = {
  __typename?: 'LfsObjectRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<LfsObjectRegistry>;
};

/** Represents an entry from the Cloud License history */
export type LicenseHistoryEntry = {
  __typename?: 'LicenseHistoryEntry';
  /** Date when the license was activated. */
  activatedAt?: Maybe<Scalars['Date']>;
  /** Date, including grace period, when licensed features will be blocked. */
  blockChangesAt?: Maybe<Scalars['Date']>;
  /** Company of the licensee. */
  company?: Maybe<Scalars['String']>;
  /** Email of the licensee. */
  email?: Maybe<Scalars['String']>;
  /** Date when the license expires. */
  expiresAt?: Maybe<Scalars['Date']>;
  /** ID of the license. */
  id: Scalars['ID'];
  /** Name of the licensee. */
  name?: Maybe<Scalars['String']>;
  /** Name of the subscription plan. */
  plan: Scalars['String'];
  /** Date when the license started. */
  startsAt?: Maybe<Scalars['Date']>;
  /** Type of the license. */
  type: Scalars['String'];
  /** Number of paid users in the license. */
  usersInLicenseCount?: Maybe<Scalars['Int']>;
};

/** The connection type for LicenseHistoryEntry. */
export type LicenseHistoryEntryConnection = {
  __typename?: 'LicenseHistoryEntryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<LicenseHistoryEntryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<LicenseHistoryEntry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type LicenseHistoryEntryEdge = {
  __typename?: 'LicenseHistoryEntryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<LicenseHistoryEntry>;
};

/** List limit metric setting */
export type ListLimitMetric =
  /** Limit list by number and total weight of issues. */
  | 'all_metrics'
  /** Limit list by number of issues. */
  | 'issue_count'
  /** Limit list by total weight of issues. */
  | 'issue_weights';

/** Autogenerated input type of MarkAsSpamSnippet */
export type MarkAsSpamSnippetInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the snippet to update. */
  id: Scalars['SnippetID'];
};

/** Autogenerated return type of MarkAsSpamSnippet */
export type MarkAsSpamSnippetPayload = {
  __typename?: 'MarkAsSpamSnippetPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Snippet after mutation. */
  snippet?: Maybe<Snippet>;
};

/** Maven metadata */
export type MavenMetadata = {
  __typename?: 'MavenMetadata';
  /** App group of the Maven package. */
  appGroup: Scalars['String'];
  /** App name of the Maven package. */
  appName: Scalars['String'];
  /** App version of the Maven package. */
  appVersion?: Maybe<Scalars['String']>;
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** ID of the metadatum. */
  id: Scalars['PackagesMavenMetadatumID'];
  /** Path of the Maven package. */
  path: Scalars['String'];
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
};

/** Possible identifier types for a measurement */
export type MeasurementIdentifier =
  /** Group count. */
  | 'GROUPS'
  /** Issue count. */
  | 'ISSUES'
  /** Merge request count. */
  | 'MERGE_REQUESTS'
  /** Pipeline count. */
  | 'PIPELINES'
  /** Pipeline count with canceled status. */
  | 'PIPELINES_CANCELED'
  /** Pipeline count with failed status. */
  | 'PIPELINES_FAILED'
  /** Pipeline count with skipped status. */
  | 'PIPELINES_SKIPPED'
  /** Pipeline count with success status. */
  | 'PIPELINES_SUCCEEDED'
  /** Project count. */
  | 'PROJECTS'
  /** User count. */
  | 'USERS';

export type MemberInterface = {
  /** GitLab::Access level. */
  accessLevel?: Maybe<AccessLevel>;
  /** Date and time the membership was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** User that authorized membership. */
  createdBy?: Maybe<UserCore>;
  /** Date and time the membership expires. */
  expiresAt?: Maybe<Scalars['Time']>;
  /** ID of the member. */
  id: Scalars['ID'];
  /** Date and time the membership was last updated. */
  updatedAt?: Maybe<Scalars['Time']>;
  /** User that is associated with the member object. */
  user?: Maybe<UserCore>;
};

/** The connection type for MemberInterface. */
export type MemberInterfaceConnection = {
  __typename?: 'MemberInterfaceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MemberInterfaceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<MemberInterface>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MemberInterfaceEdge = {
  __typename?: 'MemberInterfaceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<MemberInterface>;
};

export type MergeRequest = CurrentUserTodos & NoteableInterface & {
  __typename?: 'MergeRequest';
  /** Indicates if members of the target project can push to the fork. */
  allowCollaboration?: Maybe<Scalars['Boolean']>;
  /** Information relating to rules that must be satisfied to merge this merge request. */
  approvalState: MergeRequestApprovalState;
  /** Number of approvals left. */
  approvalsLeft?: Maybe<Scalars['Int']>;
  /** Number of approvals required. */
  approvalsRequired?: Maybe<Scalars['Int']>;
  /** Indicates if the merge request has all the required approvals. Returns true if no required approvals are configured. */
  approved: Scalars['Boolean'];
  /** Users who approved the merge request. */
  approvedBy?: Maybe<UserCoreConnection>;
  /** Assignees of the merge request. */
  assignees?: Maybe<MergeRequestAssigneeConnection>;
  /** User who created this merge request. */
  author?: Maybe<UserCore>;
  /** Indicates if auto merge is enabled for the merge request. */
  autoMergeEnabled: Scalars['Boolean'];
  /** Selected auto merge strategy. */
  autoMergeStrategy?: Maybe<Scalars['String']>;
  /** Array of available auto merge strategies. */
  availableAutoMergeStrategies?: Maybe<Array<Scalars['String']>>;
  /** Number of commits in the merge request. */
  commitCount?: Maybe<Scalars['Int']>;
  /** Merge request commits excluding merge commits. */
  commitsWithoutMergeCommits?: Maybe<CommitConnection>;
  /** Indicates if the merge request has conflicts. */
  conflicts: Scalars['Boolean'];
  /** Timestamp of when the merge request was created. */
  createdAt: Scalars['Time'];
  /** To-do items for the current user. */
  currentUserTodos: TodoConnection;
  /** Default merge commit message of the merge request. */
  defaultMergeCommitMessage?: Maybe<Scalars['String']>;
  /** Default merge commit message of the merge request with description. */
  defaultMergeCommitMessageWithDescription?: Maybe<Scalars['String']>;
  /** Default squash commit message of the merge request. */
  defaultSquashCommitMessage?: Maybe<Scalars['String']>;
  /** Description of the merge request (Markdown rendered as HTML for caching). */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Diff head SHA of the merge request. */
  diffHeadSha?: Maybe<Scalars['String']>;
  /** References of the base SHA, the head SHA, and the start SHA for this merge request. */
  diffRefs?: Maybe<DiffRefs>;
  /** Details about which files were changed in this merge request. */
  diffStats?: Maybe<Array<DiffStats>>;
  /** Summary of which files were changed in this merge request. */
  diffStatsSummary?: Maybe<DiffStatsSummary>;
  /** Indicates if comments on the merge request are locked to members only. */
  discussionLocked: Scalars['Boolean'];
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** Indicates if the source branch is behind the target branch. */
  divergedFromTargetBranch: Scalars['Boolean'];
  /** Number of downvotes for the merge request. */
  downvotes: Scalars['Int'];
  /** Indicates if the merge request is a draft. */
  draft: Scalars['Boolean'];
  /** Indicates if the project settings will lead to source branch deletion after merge. */
  forceRemoveSourceBranch?: Maybe<Scalars['Boolean']>;
  /** Indicates if the merge request has CI. */
  hasCi: Scalars['Boolean'];
  /** Indicates if the source branch has any security reports. */
  hasSecurityReports: Scalars['Boolean'];
  /** Pipeline running on the branch HEAD of the merge request. */
  headPipeline?: Maybe<Pipeline>;
  /** Human-readable time estimate of the merge request. */
  humanTimeEstimate?: Maybe<Scalars['String']>;
  /** Human-readable total time reported as spent on the merge request. */
  humanTotalTimeSpent?: Maybe<Scalars['String']>;
  /** ID of the merge request. */
  id: Scalars['ID'];
  /** Internal ID of the merge request. */
  iid: Scalars['String'];
  /** Commit SHA of the merge request if merge is in progress. */
  inProgressMergeCommitSha?: Maybe<Scalars['String']>;
  /** Labels of the merge request. */
  labels?: Maybe<LabelConnection>;
  /** SHA of the merge request commit (set once merged). */
  mergeCommitSha?: Maybe<Scalars['String']>;
  /** Error message due to a merge error. */
  mergeError?: Maybe<Scalars['String']>;
  /** Indicates if a merge is currently occurring. */
  mergeOngoing: Scalars['Boolean'];
  /**
   * Status of the merge request. Deprecated in 14.0: This was renamed.
   * @deprecated This was renamed. Please use `MergeRequest.mergeStatusEnum`. Deprecated in 14.0.
   */
  mergeStatus?: Maybe<Scalars['String']>;
  /** Merge status of the merge request. */
  mergeStatusEnum?: Maybe<MergeStatus>;
  /** Number of merge requests in the merge train. */
  mergeTrainsCount?: Maybe<Scalars['Int']>;
  /** User who merged this merge request. */
  mergeUser?: Maybe<UserCore>;
  /** Indicates if the merge has been set to be merged when its pipeline succeeds (MWPS). */
  mergeWhenPipelineSucceeds?: Maybe<Scalars['Boolean']>;
  /** Indicates if the merge request is mergeable. */
  mergeable: Scalars['Boolean'];
  /** Indicates if all discussions in the merge request have been resolved, allowing the merge request to be merged. */
  mergeableDiscussionsState?: Maybe<Scalars['Boolean']>;
  /** Timestamp of when the merge request was merged, null if not merged. */
  mergedAt?: Maybe<Scalars['Time']>;
  /** Milestone of the merge request. */
  milestone?: Maybe<Milestone>;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** Participants in the merge request. This includes the author, assignees, reviewers, and users mentioned in notes. */
  participants?: Maybe<UserCoreConnection>;
  /**
   * Pipelines for the merge request. Note: for performance reasons, no more than
   * the most recent 500 pipelines will be returned.
   */
  pipelines?: Maybe<PipelineConnection>;
  /** Alias for target_project. */
  project: Project;
  /** ID of the merge request project. */
  projectId: Scalars['Int'];
  /** Rebase commit SHA of the merge request. */
  rebaseCommitSha?: Maybe<Scalars['String']>;
  /** Indicates if there is a rebase currently in progress for the merge request. */
  rebaseInProgress: Scalars['Boolean'];
  /** Internal reference of the merge request. Returned in shortened format by default. */
  reference: Scalars['String'];
  /** Users from whom a review has been requested. */
  reviewers?: Maybe<MergeRequestReviewerConnection>;
  /** Indicates if the merge request is created by @GitLab-Security-Bot. */
  securityAutoFix?: Maybe<Scalars['Boolean']>;
  /** Indicates if the target branch security reports are out of date. */
  securityReportsUpToDateOnTargetBranch: Scalars['Boolean'];
  /** Indicates if the merge request will be rebased. */
  shouldBeRebased: Scalars['Boolean'];
  /** Indicates if the source branch of the merge request will be deleted after merge. */
  shouldRemoveSourceBranch?: Maybe<Scalars['Boolean']>;
  /** Source branch of the merge request. */
  sourceBranch: Scalars['String'];
  /** Indicates if the source branch of the merge request exists. */
  sourceBranchExists: Scalars['Boolean'];
  /** Indicates if the source branch is protected. */
  sourceBranchProtected: Scalars['Boolean'];
  /** Source project of the merge request. */
  sourceProject?: Maybe<Project>;
  /** ID of the merge request source project. */
  sourceProjectId?: Maybe<Scalars['Int']>;
  /** Indicates if squash on merge is enabled. */
  squash: Scalars['Boolean'];
  /** Indicates if squash on merge is enabled. */
  squashOnMerge: Scalars['Boolean'];
  /** State of the merge request. */
  state: MergeRequestState;
  /** Indicates if the currently logged in user is subscribed to this merge request. */
  subscribed: Scalars['Boolean'];
  /** Target branch of the merge request. */
  targetBranch: Scalars['String'];
  /** Indicates if the target branch of the merge request exists. */
  targetBranchExists: Scalars['Boolean'];
  /** Target project of the merge request. */
  targetProject: Project;
  /** ID of the merge request target project. */
  targetProjectId: Scalars['Int'];
  /** Completion status of tasks */
  taskCompletionStatus: TaskCompletionStatus;
  /** Time estimate of the merge request. */
  timeEstimate: Scalars['Int'];
  /** Timelogs on the merge request. */
  timelogs: TimelogConnection;
  /** Title of the merge request. */
  title: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  /** Total time reported as spent on the merge request. */
  totalTimeSpent: Scalars['Int'];
  /** Timestamp of when the merge request was last updated. */
  updatedAt: Scalars['Time'];
  /** Number of upvotes for the merge request. */
  upvotes: Scalars['Int'];
  /** Number of user discussions in the merge request. */
  userDiscussionsCount?: Maybe<Scalars['Int']>;
  /** User notes count of the merge request. */
  userNotesCount?: Maybe<Scalars['Int']>;
  /** Permissions for the current user on the resource */
  userPermissions: MergeRequestPermissions;
  /** Web URL of the merge request. */
  webUrl?: Maybe<Scalars['String']>;
  /**
   * Indicates if the merge request is a draft. Deprecated in 13.12: Use `draft`.
   * @deprecated Use `draft`. Deprecated in 13.12.
   */
  workInProgress: Scalars['Boolean'];
};


export type MergeRequestApprovedByArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestAssigneesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestCommitsWithoutMergeCommitsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestCurrentUserTodosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<TodoStateEnum>;
};


export type MergeRequestDiffStatsArgs = {
  path?: InputMaybe<Scalars['String']>;
};


export type MergeRequestDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestParticipantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestPipelinesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  ref?: InputMaybe<Scalars['String']>;
  sha?: InputMaybe<Scalars['String']>;
  source?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<PipelineStatusEnum>;
};


export type MergeRequestReferenceArgs = {
  full?: InputMaybe<Scalars['Boolean']>;
};


export type MergeRequestReviewersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type MergeRequestTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated input type of MergeRequestAccept */
export type MergeRequestAcceptInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Custom merge commit message. */
  commitMessage?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
  /** HEAD SHA at the time when this merge was requested. */
  sha: Scalars['String'];
  /** Should the source branch be removed. */
  shouldRemoveSourceBranch?: InputMaybe<Scalars['Boolean']>;
  /** Squash commits on the source branch before merge. */
  squash?: InputMaybe<Scalars['Boolean']>;
  /** Custom squash commit message (if squash is true). */
  squashCommitMessage?: InputMaybe<Scalars['String']>;
  /** How to merge this merge request. */
  strategy?: InputMaybe<MergeStrategyEnum>;
};

/** Autogenerated return type of MergeRequestAccept */
export type MergeRequestAcceptPayload = {
  __typename?: 'MergeRequestAcceptPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Information relating to rules that must be satisfied to merge this merge request. */
export type MergeRequestApprovalState = {
  __typename?: 'MergeRequestApprovalState';
  /** Indicates if the merge request approval rules are overwritten for the merge request. */
  approvalRulesOverwritten?: Maybe<Scalars['Boolean']>;
  /** List of approval rules associated with the merge request. */
  rules?: Maybe<Array<ApprovalRule>>;
};

/** A user assigned to a merge request. */
export type MergeRequestAssignee = User & {
  __typename?: 'MergeRequestAssignee';
  /** Merge requests assigned to the user. */
  assignedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Merge requests authored by the user. */
  authoredMergeRequests?: Maybe<MergeRequestConnection>;
  /** URL of the user's avatar. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Indicates if the user is a bot. */
  bot: Scalars['Boolean'];
  /** User callouts that belong to the user. */
  callouts?: Maybe<UserCalloutConnection>;
  /**
   * User email. Deprecated in 13.7: This was renamed.
   * @deprecated This was renamed. Please use `User.publicEmail`. Deprecated in 13.7.
   */
  email?: Maybe<Scalars['String']>;
  /** Group count for the user. */
  groupCount?: Maybe<Scalars['Int']>;
  /** Group memberships of the user. */
  groupMemberships?: Maybe<GroupMemberConnection>;
  /**
   * Groups where the user has access. Will always return `null` if
   * `paginatable_namespace_drop_down_for_project_creation` feature flag is disabled.
   */
  groups?: Maybe<GroupConnection>;
  /** ID of the user. */
  id: Scalars['ID'];
  /** Location of the user. */
  location?: Maybe<Scalars['String']>;
  /** Details of this user's interactions with the merge request. */
  mergeRequestInteraction?: Maybe<UserMergeRequestInteraction>;
  /** Human-readable name of the user. */
  name: Scalars['String'];
  /** Personal namespace of the user. */
  namespace?: Maybe<Namespace>;
  /** Project memberships of the user. */
  projectMemberships?: Maybe<ProjectMemberConnection>;
  /** User's public email. */
  publicEmail?: Maybe<Scalars['String']>;
  /** Merge requests assigned to the user for review. */
  reviewRequestedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Snippets authored by the user. */
  snippets?: Maybe<SnippetConnection>;
  /** Projects starred by the user. */
  starredProjects?: Maybe<ProjectConnection>;
  /** State of the user. */
  state: UserState;
  /** User status. */
  status?: Maybe<UserStatus>;
  /** Time logged by the user. */
  timelogs?: Maybe<TimelogConnection>;
  /** To-do items of the user. */
  todos?: Maybe<TodoConnection>;
  /** Permissions for the current user on the resource. */
  userPermissions: UserPermissions;
  /** Username of the user. Unique within this instance of GitLab. */
  username: Scalars['String'];
  /** Web path of the user. */
  webPath: Scalars['String'];
  /** Web URL of the user. */
  webUrl: Scalars['String'];
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeAssignedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeAuthoredMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeCalloutsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeGroupMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  permissionScope?: InputMaybe<GroupPermission>;
  search?: InputMaybe<Scalars['String']>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeProjectMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeReviewRequestedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeSnippetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['SnippetID']>>;
  last?: InputMaybe<Scalars['Int']>;
  type?: InputMaybe<TypeEnum>;
  visibility?: InputMaybe<VisibilityScopesEnum>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeStarredProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['Time']>;
  endTime?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['GroupID']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  startDate?: InputMaybe<Scalars['Time']>;
  startTime?: InputMaybe<Scalars['Time']>;
  username?: InputMaybe<Scalars['String']>;
};


/** A user assigned to a merge request. */
export type MergeRequestAssigneeTodosArgs = {
  action?: InputMaybe<Array<TodoActionEnum>>;
  after?: InputMaybe<Scalars['String']>;
  authorId?: InputMaybe<Array<Scalars['ID']>>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  state?: InputMaybe<Array<TodoStateEnum>>;
  type?: InputMaybe<Array<TodoTargetEnum>>;
};

/** The connection type for MergeRequestAssignee. */
export type MergeRequestAssigneeConnection = {
  __typename?: 'MergeRequestAssigneeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MergeRequestAssigneeEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<MergeRequestAssignee>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MergeRequestAssigneeEdge = {
  __typename?: 'MergeRequestAssigneeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<MergeRequestAssignee>;
};

/** The connection type for MergeRequest. */
export type MergeRequestConnection = {
  __typename?: 'MergeRequestConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MergeRequestEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<MergeRequest>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Total sum of time to merge, in seconds, for the collection of merge requests. */
  totalTimeToMerge?: Maybe<Scalars['Float']>;
};

/** Autogenerated input type of MergeRequestCreate */
export type MergeRequestCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the merge request (Markdown rendered as HTML for caching). */
  description?: InputMaybe<Scalars['String']>;
  /** Labels of the merge request. */
  labels?: InputMaybe<Array<Scalars['String']>>;
  /** Project full path the merge request is associated with. */
  projectPath: Scalars['ID'];
  /** Source branch of the merge request. */
  sourceBranch: Scalars['String'];
  /** Target branch of the merge request. */
  targetBranch: Scalars['String'];
  /** Title of the merge request. */
  title: Scalars['String'];
};

/** Autogenerated return type of MergeRequestCreate */
export type MergeRequestCreatePayload = {
  __typename?: 'MergeRequestCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Represents the Geo sync and verification state of a Merge Request diff */
export type MergeRequestDiffRegistry = {
  __typename?: 'MergeRequestDiffRegistry';
  /** Timestamp when the MergeRequestDiffRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the MergeRequestDiffRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the MergeRequestDiffRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the MergeRequestDiffRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** ID of the Merge Request diff. */
  mergeRequestDiffId: Scalars['ID'];
  /** Timestamp after which the MergeRequestDiffRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the MergeRequestDiffRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the MergeRequestDiffRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for MergeRequestDiffRegistry. */
export type MergeRequestDiffRegistryConnection = {
  __typename?: 'MergeRequestDiffRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MergeRequestDiffRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<MergeRequestDiffRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MergeRequestDiffRegistryEdge = {
  __typename?: 'MergeRequestDiffRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<MergeRequestDiffRegistry>;
};

/** An edge in a connection. */
export type MergeRequestEdge = {
  __typename?: 'MergeRequestEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<MergeRequest>;
};

/** New state to apply to a merge request. */
export type MergeRequestNewState =
  /** Close the merge request if it is open. */
  | 'CLOSED'
  /** Open the merge request if it is closed. */
  | 'OPEN';

/** Check permissions for the current user on a merge request */
export type MergeRequestPermissions = {
  __typename?: 'MergeRequestPermissions';
  /** Indicates the user can perform `admin_merge_request` on this resource */
  adminMergeRequest: Scalars['Boolean'];
  /** Indicates the user can perform `can_merge` on this resource */
  canMerge: Scalars['Boolean'];
  /** Indicates the user can perform `cherry_pick_on_current_merge_request` on this resource */
  cherryPickOnCurrentMergeRequest: Scalars['Boolean'];
  /** Indicates the user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Indicates the user can perform `push_to_source_branch` on this resource */
  pushToSourceBranch: Scalars['Boolean'];
  /** Indicates the user can perform `read_merge_request` on this resource */
  readMergeRequest: Scalars['Boolean'];
  /** Indicates the user can perform `remove_source_branch` on this resource */
  removeSourceBranch: Scalars['Boolean'];
  /** Indicates the user can perform `revert_on_current_merge_request` on this resource */
  revertOnCurrentMergeRequest: Scalars['Boolean'];
  /** Indicates the user can perform `update_merge_request` on this resource */
  updateMergeRequest: Scalars['Boolean'];
};

/** State of a review of a GitLab merge request. */
export type MergeRequestReviewState =
  /** The merge request is attention_required. */
  | 'ATTENTION_REQUIRED'
  /** The merge request is reviewed. */
  | 'REVIEWED'
  /** The merge request is unreviewed. */
  | 'UNREVIEWED';

/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewer = User & {
  __typename?: 'MergeRequestReviewer';
  /** Merge requests assigned to the user. */
  assignedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Merge requests authored by the user. */
  authoredMergeRequests?: Maybe<MergeRequestConnection>;
  /** URL of the user's avatar. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Indicates if the user is a bot. */
  bot: Scalars['Boolean'];
  /** User callouts that belong to the user. */
  callouts?: Maybe<UserCalloutConnection>;
  /**
   * User email. Deprecated in 13.7: This was renamed.
   * @deprecated This was renamed. Please use `User.publicEmail`. Deprecated in 13.7.
   */
  email?: Maybe<Scalars['String']>;
  /** Group count for the user. */
  groupCount?: Maybe<Scalars['Int']>;
  /** Group memberships of the user. */
  groupMemberships?: Maybe<GroupMemberConnection>;
  /**
   * Groups where the user has access. Will always return `null` if
   * `paginatable_namespace_drop_down_for_project_creation` feature flag is disabled.
   */
  groups?: Maybe<GroupConnection>;
  /** ID of the user. */
  id: Scalars['ID'];
  /** Location of the user. */
  location?: Maybe<Scalars['String']>;
  /** Details of this user's interactions with the merge request. */
  mergeRequestInteraction?: Maybe<UserMergeRequestInteraction>;
  /** Human-readable name of the user. */
  name: Scalars['String'];
  /** Personal namespace of the user. */
  namespace?: Maybe<Namespace>;
  /** Project memberships of the user. */
  projectMemberships?: Maybe<ProjectMemberConnection>;
  /** User's public email. */
  publicEmail?: Maybe<Scalars['String']>;
  /** Merge requests assigned to the user for review. */
  reviewRequestedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Snippets authored by the user. */
  snippets?: Maybe<SnippetConnection>;
  /** Projects starred by the user. */
  starredProjects?: Maybe<ProjectConnection>;
  /** State of the user. */
  state: UserState;
  /** User status. */
  status?: Maybe<UserStatus>;
  /** Time logged by the user. */
  timelogs?: Maybe<TimelogConnection>;
  /** To-do items of the user. */
  todos?: Maybe<TodoConnection>;
  /** Permissions for the current user on the resource. */
  userPermissions: UserPermissions;
  /** Username of the user. Unique within this instance of GitLab. */
  username: Scalars['String'];
  /** Web path of the user. */
  webPath: Scalars['String'];
  /** Web URL of the user. */
  webUrl: Scalars['String'];
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerAssignedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerAuthoredMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerCalloutsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerGroupMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  permissionScope?: InputMaybe<GroupPermission>;
  search?: InputMaybe<Scalars['String']>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerProjectMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerReviewRequestedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerSnippetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['SnippetID']>>;
  last?: InputMaybe<Scalars['Int']>;
  type?: InputMaybe<TypeEnum>;
  visibility?: InputMaybe<VisibilityScopesEnum>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerStarredProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['Time']>;
  endTime?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['GroupID']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  startDate?: InputMaybe<Scalars['Time']>;
  startTime?: InputMaybe<Scalars['Time']>;
  username?: InputMaybe<Scalars['String']>;
};


/** A user assigned to a merge request as a reviewer. */
export type MergeRequestReviewerTodosArgs = {
  action?: InputMaybe<Array<TodoActionEnum>>;
  after?: InputMaybe<Scalars['String']>;
  authorId?: InputMaybe<Array<Scalars['ID']>>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  state?: InputMaybe<Array<TodoStateEnum>>;
  type?: InputMaybe<Array<TodoTargetEnum>>;
};

/** The connection type for MergeRequestReviewer. */
export type MergeRequestReviewerConnection = {
  __typename?: 'MergeRequestReviewerConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MergeRequestReviewerEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<MergeRequestReviewer>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MergeRequestReviewerEdge = {
  __typename?: 'MergeRequestReviewerEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<MergeRequestReviewer>;
};

/** Autogenerated input type of MergeRequestReviewerRereview */
export type MergeRequestReviewerRereviewInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
  /** User ID for the user that has been requested for a new review. */
  userId: Scalars['UserID'];
};

/** Autogenerated return type of MergeRequestReviewerRereview */
export type MergeRequestReviewerRereviewPayload = {
  __typename?: 'MergeRequestReviewerRereviewPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Autogenerated input type of MergeRequestSetAssignees */
export type MergeRequestSetAssigneesInput = {
  /** Usernames to assign to the resource. Replaces existing assignees by default. */
  assigneeUsernames: Array<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Operation to perform. Defaults to REPLACE. */
  operationMode?: InputMaybe<MutationOperationMode>;
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of MergeRequestSetAssignees */
export type MergeRequestSetAssigneesPayload = {
  __typename?: 'MergeRequestSetAssigneesPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Autogenerated input type of MergeRequestSetDraft */
export type MergeRequestSetDraftInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Whether or not to set the merge request as a draft. */
  draft: Scalars['Boolean'];
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of MergeRequestSetDraft */
export type MergeRequestSetDraftPayload = {
  __typename?: 'MergeRequestSetDraftPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Autogenerated input type of MergeRequestSetLabels */
export type MergeRequestSetLabelsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Label IDs to set. Replaces existing labels by default. */
  labelIds: Array<Scalars['LabelID']>;
  /** Changes the operation mode. Defaults to REPLACE. */
  operationMode?: InputMaybe<MutationOperationMode>;
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of MergeRequestSetLabels */
export type MergeRequestSetLabelsPayload = {
  __typename?: 'MergeRequestSetLabelsPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Autogenerated input type of MergeRequestSetLocked */
export type MergeRequestSetLockedInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Whether or not to lock the merge request. */
  locked: Scalars['Boolean'];
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of MergeRequestSetLocked */
export type MergeRequestSetLockedPayload = {
  __typename?: 'MergeRequestSetLockedPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Autogenerated input type of MergeRequestSetMilestone */
export type MergeRequestSetMilestoneInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Milestone to assign to the merge request. */
  milestoneId?: InputMaybe<Scalars['MilestoneID']>;
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of MergeRequestSetMilestone */
export type MergeRequestSetMilestonePayload = {
  __typename?: 'MergeRequestSetMilestonePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Autogenerated input type of MergeRequestSetSubscription */
export type MergeRequestSetSubscriptionInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
  /** Desired state of the subscription. */
  subscribedState: Scalars['Boolean'];
};

/** Autogenerated return type of MergeRequestSetSubscription */
export type MergeRequestSetSubscriptionPayload = {
  __typename?: 'MergeRequestSetSubscriptionPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Autogenerated input type of MergeRequestSetWip */
export type MergeRequestSetWipInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
  /** Whether or not to set the merge request as a draft. */
  wip: Scalars['Boolean'];
};

/** Autogenerated return type of MergeRequestSetWip */
export type MergeRequestSetWipPayload = {
  __typename?: 'MergeRequestSetWipPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

/** Values for sorting merge requests */
export type MergeRequestSort =
  /** Closed time by ascending order. */
  | 'CLOSED_AT_ASC'
  /** Closed time by descending order. */
  | 'CLOSED_AT_DESC'
  /** Created at ascending order. */
  | 'CREATED_ASC'
  /** Created at descending order. */
  | 'CREATED_DESC'
  /** Label priority by ascending order. */
  | 'LABEL_PRIORITY_ASC'
  /** Label priority by descending order. */
  | 'LABEL_PRIORITY_DESC'
  /** Merge time by ascending order. */
  | 'MERGED_AT_ASC'
  /** Merge time by descending order. */
  | 'MERGED_AT_DESC'
  /** Milestone due date by ascending order. */
  | 'MILESTONE_DUE_ASC'
  /** Milestone due date by descending order. */
  | 'MILESTONE_DUE_DESC'
  /** Priority by ascending order. */
  | 'PRIORITY_ASC'
  /** Priority by descending order. */
  | 'PRIORITY_DESC'
  /** Updated at ascending order. */
  | 'UPDATED_ASC'
  /** Updated at descending order. */
  | 'UPDATED_DESC'
  /** Created at ascending order. */
  | 'created_asc'
  /** Created at descending order. */
  | 'created_desc'
  /** Updated at ascending order. */
  | 'updated_asc'
  /** Updated at descending order. */
  | 'updated_desc';

/** State of a GitLab merge request */
export type MergeRequestState =
  /** All available. */
  | 'all'
  /** In closed state. */
  | 'closed'
  /** Discussion has been locked. */
  | 'locked'
  /** Merge request has been merged. */
  | 'merged'
  /** In open state. */
  | 'opened';

/** Autogenerated input type of MergeRequestUpdate */
export type MergeRequestUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the merge request (Markdown rendered as HTML for caching). */
  description?: InputMaybe<Scalars['String']>;
  /** IID of the merge request to mutate. */
  iid: Scalars['String'];
  /** Project the merge request to mutate is in. */
  projectPath: Scalars['ID'];
  /** Action to perform to change the state. */
  state?: InputMaybe<MergeRequestNewState>;
  /** Target branch of the merge request. */
  targetBranch?: InputMaybe<Scalars['String']>;
  /** Title of the merge request. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of MergeRequestUpdate */
export type MergeRequestUpdatePayload = {
  __typename?: 'MergeRequestUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Merge request after mutation. */
  mergeRequest?: Maybe<MergeRequest>;
};

export type MergeRequestsResolverNegatedParams = {
  /** Array of label names. All resolved merge requests will not have these labels. */
  labels?: InputMaybe<Array<Scalars['String']>>;
  /** Title of the milestone. */
  milestoneTitle?: InputMaybe<Scalars['String']>;
};

/** Representation of whether a GitLab merge request can be merged. */
export type MergeStatus =
  /** There are conflicts between the source and target branches. */
  | 'CANNOT_BE_MERGED'
  /** Currently unchecked. The previous state was `CANNOT_BE_MERGED`. */
  | 'CANNOT_BE_MERGED_RECHECK'
  /** There are no conflicts between the source and target branches. */
  | 'CAN_BE_MERGED'
  /** Currently checking for mergeability. */
  | 'CHECKING'
  /** Merge status has not been checked. */
  | 'UNCHECKED';

export type MergeStrategyEnum =
  /** Use the add_to_merge_train_when_pipeline_succeeds merge strategy. */
  | 'ADD_TO_MERGE_TRAIN_WHEN_PIPELINE_SUCCEEDS'
  /** Use the merge_train merge strategy. */
  | 'MERGE_TRAIN'
  /** Use the merge_when_pipeline_succeeds merge strategy. */
  | 'MERGE_WHEN_PIPELINE_SUCCEEDS';

export type Metadata = {
  __typename?: 'Metadata';
  /** Metadata about KAS. */
  kas: Kas;
  /** Revision. */
  revision: Scalars['String'];
  /** Version. */
  version: Scalars['String'];
};

/** Represents a metric image upload */
export type MetricImage = {
  __typename?: 'MetricImage';
  /** File name of the metric image. */
  fileName?: Maybe<Scalars['String']>;
  /** File path of the metric image. */
  filePath?: Maybe<Scalars['String']>;
  /** ID of the metric upload. */
  id: Scalars['ID'];
  /** Internal ID of the metric upload. */
  iid: Scalars['ID'];
  /** URL of the metric source. */
  url: Scalars['String'];
};

export type MetricsDashboard = {
  __typename?: 'MetricsDashboard';
  /** Annotations added to the dashboard. */
  annotations?: Maybe<MetricsDashboardAnnotationConnection>;
  /** Path to a file with the dashboard definition. */
  path?: Maybe<Scalars['String']>;
  /** Dashboard schema validation warnings. */
  schemaValidationWarnings?: Maybe<Array<Scalars['String']>>;
};


export type MetricsDashboardAnnotationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  from: Scalars['Time'];
  last?: InputMaybe<Scalars['Int']>;
  to?: InputMaybe<Scalars['Time']>;
};

export type MetricsDashboardAnnotation = {
  __typename?: 'MetricsDashboardAnnotation';
  /** Description of the annotation. */
  description?: Maybe<Scalars['String']>;
  /** Timestamp marking end of annotated time span. */
  endingAt?: Maybe<Scalars['Time']>;
  /** ID of the annotation. */
  id: Scalars['ID'];
  /** ID of a dashboard panel to which the annotation should be scoped. */
  panelId?: Maybe<Scalars['String']>;
  /** Timestamp marking start of annotated time span. */
  startingAt?: Maybe<Scalars['Time']>;
};

/** The connection type for MetricsDashboardAnnotation. */
export type MetricsDashboardAnnotationConnection = {
  __typename?: 'MetricsDashboardAnnotationConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MetricsDashboardAnnotationEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<MetricsDashboardAnnotation>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MetricsDashboardAnnotationEdge = {
  __typename?: 'MetricsDashboardAnnotationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<MetricsDashboardAnnotation>;
};

/** Represents a milestone */
export type Milestone = TimeboxReportInterface & {
  __typename?: 'Milestone';
  /** Timestamp of milestone creation. */
  createdAt: Scalars['Time'];
  /** Description of the milestone. */
  description?: Maybe<Scalars['String']>;
  /** Timestamp of the milestone due date. */
  dueDate?: Maybe<Scalars['Time']>;
  /**
   * Expired state of the milestone (a milestone is expired when the due date is
   * past the current date). Defaults to `false` when due date has not been set.
   */
  expired: Scalars['Boolean'];
  /** Indicates if milestone is at group level. */
  groupMilestone: Scalars['Boolean'];
  /** ID of the milestone. */
  id: Scalars['ID'];
  /** Internal ID of the milestone. */
  iid: Scalars['ID'];
  /** Indicates if milestone is at project level. */
  projectMilestone: Scalars['Boolean'];
  /** Historically accurate report about the timebox. */
  report?: Maybe<TimeboxReport>;
  /** Timestamp of the milestone start date. */
  startDate?: Maybe<Scalars['Time']>;
  /** State of the milestone. */
  state: MilestoneStateEnum;
  /** Milestone statistics. */
  stats?: Maybe<MilestoneStats>;
  /** Indicates if milestone is at subgroup level. */
  subgroupMilestone: Scalars['Boolean'];
  /** Title of the milestone. */
  title: Scalars['String'];
  /** Timestamp of last milestone update. */
  updatedAt: Scalars['Time'];
  /** Web path of the milestone. */
  webPath: Scalars['String'];
};

/** The connection type for Milestone. */
export type MilestoneConnection = {
  __typename?: 'MilestoneConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<MilestoneEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Milestone>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type MilestoneEdge = {
  __typename?: 'MilestoneEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Milestone>;
};

/** Values for sorting milestones */
export type MilestoneSort =
  /** Created at ascending order. */
  | 'CREATED_ASC'
  /** Created at descending order. */
  | 'CREATED_DESC'
  /** Milestone due date by ascending order. */
  | 'DUE_DATE_ASC'
  /** Milestone due date by descending order. */
  | 'DUE_DATE_DESC'
  /**
   * Group milestones in this order: non-expired milestones with due dates,
   * non-expired milestones without due dates and expired milestones then sort by
   * due date in ascending order.
   */
  | 'EXPIRED_LAST_DUE_DATE_ASC'
  /**
   * Group milestones in this order: non-expired milestones with due dates,
   * non-expired milestones without due dates and expired milestones then sort by
   * due date in descending order.
   */
  | 'EXPIRED_LAST_DUE_DATE_DESC'
  /** Updated at ascending order. */
  | 'UPDATED_ASC'
  /** Updated at descending order. */
  | 'UPDATED_DESC'
  /** Created at ascending order. */
  | 'created_asc'
  /** Created at descending order. */
  | 'created_desc'
  /** Updated at ascending order. */
  | 'updated_asc'
  /** Updated at descending order. */
  | 'updated_desc';

/** Current state of milestone */
export type MilestoneStateEnum =
  /** Milestone is currently active. */
  | 'active'
  /** Milestone is closed. */
  | 'closed';

/** Contains statistics about a milestone */
export type MilestoneStats = {
  __typename?: 'MilestoneStats';
  /** Number of closed issues associated with the milestone. */
  closedIssuesCount?: Maybe<Scalars['Int']>;
  /** Total number of issues associated with the milestone. */
  totalIssuesCount?: Maybe<Scalars['Int']>;
};

/** Milestone ID wildcard values */
export type MilestoneWildcardId =
  /** Milestone is assigned. */
  | 'ANY'
  /** No milestone is assigned. */
  | 'NONE'
  /** Milestone assigned is open and started (start date <= today). */
  | 'STARTED'
  /** Milestone assigned is due in the future (due date > today). */
  | 'UPCOMING';

/** The position to which the adjacent object should be moved */
export type MoveType =
  /** Adjacent object is moved after the object that is being moved. */
  | 'after'
  /** Adjacent object is moved before the object that is being moved. */
  | 'before';

export type Mutation = {
  __typename?: 'Mutation';
  addProjectToSecurityDashboard?: Maybe<AddProjectToSecurityDashboardPayload>;
  adminSidekiqQueuesDeleteJobs?: Maybe<AdminSidekiqQueuesDeleteJobsPayload>;
  alertSetAssignees?: Maybe<AlertSetAssigneesPayload>;
  alertTodoCreate?: Maybe<AlertTodoCreatePayload>;
  apiFuzzingCiConfigurationCreate?: Maybe<ApiFuzzingCiConfigurationCreatePayload>;
  awardEmojiAdd?: Maybe<AwardEmojiAddPayload>;
  awardEmojiRemove?: Maybe<AwardEmojiRemovePayload>;
  awardEmojiToggle?: Maybe<AwardEmojiTogglePayload>;
  boardEpicCreate?: Maybe<BoardEpicCreatePayload>;
  boardListCreate?: Maybe<BoardListCreatePayload>;
  boardListUpdateLimitMetrics?: Maybe<BoardListUpdateLimitMetricsPayload>;
  /** **BETA** This endpoint is subject to change without notice. */
  bulkEnableDevopsAdoptionNamespaces?: Maybe<BulkEnableDevopsAdoptionNamespacesPayload>;
  ciCdSettingsUpdate?: Maybe<CiCdSettingsUpdatePayload>;
  ciJobTokenScopeAddProject?: Maybe<CiJobTokenScopeAddProjectPayload>;
  ciJobTokenScopeRemoveProject?: Maybe<CiJobTokenScopeRemoveProjectPayload>;
  clusterAgentDelete?: Maybe<ClusterAgentDeletePayload>;
  clusterAgentTokenCreate?: Maybe<ClusterAgentTokenCreatePayload>;
  clusterAgentTokenDelete?: Maybe<ClusterAgentTokenDeletePayload>;
  commitCreate?: Maybe<CommitCreatePayload>;
  /**
   * Configure Dependency Scanning for a project by enabling Dependency Scanning in a new or modified
   * `.gitlab-ci.yml` file in a new branch. The new branch and a URL to
   * create a Merge Request are a part of the response.
   */
  configureDependencyScanning?: Maybe<ConfigureDependencyScanningPayload>;
  /**
   * Configure SAST for a project by enabling SAST in a new or modified
   * `.gitlab-ci.yml` file in a new branch. The new branch and a URL to
   * create a Merge Request are a part of the response.
   */
  configureSast?: Maybe<ConfigureSastPayload>;
  /**
   * Configure Secret Detection for a project by enabling Secret Detection
   * in a new or modified `.gitlab-ci.yml` file in a new branch. The new
   * branch and a URL to create a Merge Request are a part of the
   * response.
   */
  configureSecretDetection?: Maybe<ConfigureSecretDetectionPayload>;
  createAlertIssue?: Maybe<CreateAlertIssuePayload>;
  createAnnotation?: Maybe<CreateAnnotationPayload>;
  createBoard?: Maybe<CreateBoardPayload>;
  createBranch?: Maybe<CreateBranchPayload>;
  createClusterAgent?: Maybe<CreateClusterAgentPayload>;
  createComplianceFramework?: Maybe<CreateComplianceFrameworkPayload>;
  /**
   *  Available only when feature flag `custom_emoji` is enabled. This flag is
   * disabled by default, because the feature is experimental and is subject to
   * change without notice.
   */
  createCustomEmoji?: Maybe<CreateCustomEmojiPayload>;
  createDiffNote?: Maybe<CreateDiffNotePayload>;
  createEpic?: Maybe<CreateEpicPayload>;
  createImageDiffNote?: Maybe<CreateImageDiffNotePayload>;
  createIssue?: Maybe<CreateIssuePayload>;
  /** @deprecated Use iterationCreate. Deprecated in 14.0. */
  createIteration?: Maybe<CreateIterationPayload>;
  createNote?: Maybe<CreateNotePayload>;
  createRequirement?: Maybe<CreateRequirementPayload>;
  createSnippet?: Maybe<CreateSnippetPayload>;
  createTestCase?: Maybe<CreateTestCasePayload>;
  customerRelationsContactCreate?: Maybe<CustomerRelationsContactCreatePayload>;
  customerRelationsContactUpdate?: Maybe<CustomerRelationsContactUpdatePayload>;
  customerRelationsOrganizationCreate?: Maybe<CustomerRelationsOrganizationCreatePayload>;
  customerRelationsOrganizationUpdate?: Maybe<CustomerRelationsOrganizationUpdatePayload>;
  dastOnDemandScanCreate?: Maybe<DastOnDemandScanCreatePayload>;
  dastProfileCreate?: Maybe<DastProfileCreatePayload>;
  dastProfileDelete?: Maybe<DastProfileDeletePayload>;
  dastProfileRun?: Maybe<DastProfileRunPayload>;
  dastProfileUpdate?: Maybe<DastProfileUpdatePayload>;
  dastScannerProfileCreate?: Maybe<DastScannerProfileCreatePayload>;
  dastScannerProfileDelete?: Maybe<DastScannerProfileDeletePayload>;
  dastScannerProfileUpdate?: Maybe<DastScannerProfileUpdatePayload>;
  dastSiteProfileCreate?: Maybe<DastSiteProfileCreatePayload>;
  dastSiteProfileDelete?: Maybe<DastSiteProfileDeletePayload>;
  dastSiteProfileUpdate?: Maybe<DastSiteProfileUpdatePayload>;
  dastSiteTokenCreate?: Maybe<DastSiteTokenCreatePayload>;
  dastSiteValidationCreate?: Maybe<DastSiteValidationCreatePayload>;
  dastSiteValidationRevoke?: Maybe<DastSiteValidationRevokePayload>;
  deleteAnnotation?: Maybe<DeleteAnnotationPayload>;
  designManagementDelete?: Maybe<DesignManagementDeletePayload>;
  designManagementMove?: Maybe<DesignManagementMovePayload>;
  designManagementUpload?: Maybe<DesignManagementUploadPayload>;
  destroyBoard?: Maybe<DestroyBoardPayload>;
  destroyBoardList?: Maybe<DestroyBoardListPayload>;
  destroyComplianceFramework?: Maybe<DestroyComplianceFrameworkPayload>;
  destroyContainerRepository?: Maybe<DestroyContainerRepositoryPayload>;
  destroyContainerRepositoryTags?: Maybe<DestroyContainerRepositoryTagsPayload>;
  /**
   *  Available only when feature flag `custom_emoji` is enabled. This flag is
   * disabled by default, because the feature is experimental and is subject to
   * change without notice.
   */
  destroyCustomEmoji?: Maybe<DestroyCustomEmojiPayload>;
  destroyEpicBoard?: Maybe<DestroyEpicBoardPayload>;
  destroyNote?: Maybe<DestroyNotePayload>;
  destroyPackage?: Maybe<DestroyPackagePayload>;
  destroyPackageFile?: Maybe<DestroyPackageFilePayload>;
  destroySnippet?: Maybe<DestroySnippetPayload>;
  /** **BETA** This endpoint is subject to change without notice. */
  disableDevopsAdoptionNamespace?: Maybe<DisableDevopsAdoptionNamespacePayload>;
  /** Toggles the resolved state of a discussion */
  discussionToggleResolve?: Maybe<DiscussionToggleResolvePayload>;
  /**
   * A mutation that does not perform any changes.
   *
   * This is expected to be used for testing of endpoints, to verify
   * that a user has mutation access.
   */
  echoCreate?: Maybe<EchoCreatePayload>;
  /** **BETA** This endpoint is subject to change without notice. */
  enableDevopsAdoptionNamespace?: Maybe<EnableDevopsAdoptionNamespacePayload>;
  environmentsCanaryIngressUpdate?: Maybe<EnvironmentsCanaryIngressUpdatePayload>;
  epicAddIssue?: Maybe<EpicAddIssuePayload>;
  epicBoardCreate?: Maybe<EpicBoardCreatePayload>;
  epicBoardListCreate?: Maybe<EpicBoardListCreatePayload>;
  /** Destroys an epic board list. */
  epicBoardListDestroy?: Maybe<EpicBoardListDestroyPayload>;
  epicBoardUpdate?: Maybe<EpicBoardUpdatePayload>;
  epicMoveList?: Maybe<EpicMoveListPayload>;
  epicSetSubscription?: Maybe<EpicSetSubscriptionPayload>;
  epicTreeReorder?: Maybe<EpicTreeReorderPayload>;
  escalationPolicyCreate?: Maybe<EscalationPolicyCreatePayload>;
  escalationPolicyDestroy?: Maybe<EscalationPolicyDestroyPayload>;
  escalationPolicyUpdate?: Maybe<EscalationPolicyUpdatePayload>;
  exportRequirements?: Maybe<ExportRequirementsPayload>;
  externalAuditEventDestinationCreate?: Maybe<ExternalAuditEventDestinationCreatePayload>;
  externalAuditEventDestinationDestroy?: Maybe<ExternalAuditEventDestinationDestroyPayload>;
  externalAuditEventDestinationUpdate?: Maybe<ExternalAuditEventDestinationUpdatePayload>;
  gitlabSubscriptionActivate?: Maybe<GitlabSubscriptionActivatePayload>;
  groupUpdate?: Maybe<GroupUpdatePayload>;
  httpIntegrationCreate?: Maybe<HttpIntegrationCreatePayload>;
  httpIntegrationDestroy?: Maybe<HttpIntegrationDestroyPayload>;
  httpIntegrationResetToken?: Maybe<HttpIntegrationResetTokenPayload>;
  httpIntegrationUpdate?: Maybe<HttpIntegrationUpdatePayload>;
  issueMove?: Maybe<IssueMovePayload>;
  issueMoveList?: Maybe<IssueMoveListPayload>;
  issueSetAssignees?: Maybe<IssueSetAssigneesPayload>;
  issueSetConfidential?: Maybe<IssueSetConfidentialPayload>;
  issueSetDueDate?: Maybe<IssueSetDueDatePayload>;
  issueSetEpic?: Maybe<IssueSetEpicPayload>;
  issueSetIteration?: Maybe<IssueSetIterationPayload>;
  issueSetLocked?: Maybe<IssueSetLockedPayload>;
  issueSetSeverity?: Maybe<IssueSetSeverityPayload>;
  issueSetSubscription?: Maybe<IssueSetSubscriptionPayload>;
  issueSetWeight?: Maybe<IssueSetWeightPayload>;
  iterationCadenceCreate?: Maybe<IterationCadenceCreatePayload>;
  iterationCadenceDestroy?: Maybe<IterationCadenceDestroyPayload>;
  iterationCadenceUpdate?: Maybe<IterationCadenceUpdatePayload>;
  iterationCreate?: Maybe<IterationCreatePayload>;
  iterationDelete?: Maybe<IterationDeletePayload>;
  jiraImportStart?: Maybe<JiraImportStartPayload>;
  jiraImportUsers?: Maybe<JiraImportUsersPayload>;
  jobCancel?: Maybe<JobCancelPayload>;
  jobPlay?: Maybe<JobPlayPayload>;
  jobRetry?: Maybe<JobRetryPayload>;
  jobUnschedule?: Maybe<JobUnschedulePayload>;
  labelCreate?: Maybe<LabelCreatePayload>;
  markAsSpamSnippet?: Maybe<MarkAsSpamSnippetPayload>;
  /**
   * Accepts a merge request.
   * When accepted, the source branch will be merged into the target branch, either
   * immediately if possible, or using one of the automatic merge strategies.
   */
  mergeRequestAccept?: Maybe<MergeRequestAcceptPayload>;
  mergeRequestCreate?: Maybe<MergeRequestCreatePayload>;
  mergeRequestReviewerRereview?: Maybe<MergeRequestReviewerRereviewPayload>;
  mergeRequestSetAssignees?: Maybe<MergeRequestSetAssigneesPayload>;
  mergeRequestSetDraft?: Maybe<MergeRequestSetDraftPayload>;
  mergeRequestSetLabels?: Maybe<MergeRequestSetLabelsPayload>;
  mergeRequestSetLocked?: Maybe<MergeRequestSetLockedPayload>;
  mergeRequestSetMilestone?: Maybe<MergeRequestSetMilestonePayload>;
  mergeRequestSetSubscription?: Maybe<MergeRequestSetSubscriptionPayload>;
  /** @deprecated Use mergeRequestSetDraft. Deprecated in 13.12. */
  mergeRequestSetWip?: Maybe<MergeRequestSetWipPayload>;
  /** Update attributes of a merge request */
  mergeRequestUpdate?: Maybe<MergeRequestUpdatePayload>;
  namespaceIncreaseStorageTemporarily?: Maybe<NamespaceIncreaseStorageTemporarilyPayload>;
  oncallRotationCreate?: Maybe<OncallRotationCreatePayload>;
  oncallRotationDestroy?: Maybe<OncallRotationDestroyPayload>;
  oncallRotationUpdate?: Maybe<OncallRotationUpdatePayload>;
  oncallScheduleCreate?: Maybe<OncallScheduleCreatePayload>;
  oncallScheduleDestroy?: Maybe<OncallScheduleDestroyPayload>;
  oncallScheduleUpdate?: Maybe<OncallScheduleUpdatePayload>;
  pipelineCancel?: Maybe<PipelineCancelPayload>;
  pipelineDestroy?: Maybe<PipelineDestroyPayload>;
  pipelineRetry?: Maybe<PipelineRetryPayload>;
  /** Assign (or unset) a compliance framework to a project. */
  projectSetComplianceFramework?: Maybe<ProjectSetComplianceFrameworkPayload>;
  projectSetLocked?: Maybe<ProjectSetLockedPayload>;
  prometheusIntegrationCreate?: Maybe<PrometheusIntegrationCreatePayload>;
  prometheusIntegrationResetToken?: Maybe<PrometheusIntegrationResetTokenPayload>;
  prometheusIntegrationUpdate?: Maybe<PrometheusIntegrationUpdatePayload>;
  promoteToEpic?: Maybe<PromoteToEpicPayload>;
  releaseAssetLinkCreate?: Maybe<ReleaseAssetLinkCreatePayload>;
  releaseAssetLinkDelete?: Maybe<ReleaseAssetLinkDeletePayload>;
  releaseAssetLinkUpdate?: Maybe<ReleaseAssetLinkUpdatePayload>;
  releaseCreate?: Maybe<ReleaseCreatePayload>;
  releaseDelete?: Maybe<ReleaseDeletePayload>;
  releaseUpdate?: Maybe<ReleaseUpdatePayload>;
  removeProjectFromSecurityDashboard?: Maybe<RemoveProjectFromSecurityDashboardPayload>;
  /** Repositions a DiffNote on an image (a `Note` where the `position.positionType` is `"image"`) */
  repositionImageDiffNote?: Maybe<RepositionImageDiffNotePayload>;
  runnerDelete?: Maybe<RunnerDeletePayload>;
  runnerUpdate?: Maybe<RunnerUpdatePayload>;
  runnersRegistrationTokenReset?: Maybe<RunnersRegistrationTokenResetPayload>;
  /** Commits the `policy_yaml` content to the assigned security policy project for the given project(`project_path`) */
  scanExecutionPolicyCommit?: Maybe<ScanExecutionPolicyCommitPayload>;
  /**
   * Assigns the specified project(`security_policy_project_id`) as security policy
   * project for the given project(`project_path`). If the project already has a
   * security policy project, this reassigns the project's security policy project
   * with the given `security_policy_project_id`
   */
  securityPolicyProjectAssign?: Maybe<SecurityPolicyProjectAssignPayload>;
  /** Creates and assigns a security policy project for the given project(`project_path`) */
  securityPolicyProjectCreate?: Maybe<SecurityPolicyProjectCreatePayload>;
  /** Unassigns the security policy project for the given project(`project_path`). */
  securityPolicyProjectUnassign?: Maybe<SecurityPolicyProjectUnassignPayload>;
  terraformStateDelete?: Maybe<TerraformStateDeletePayload>;
  terraformStateLock?: Maybe<TerraformStateLockPayload>;
  terraformStateUnlock?: Maybe<TerraformStateUnlockPayload>;
  todoCreate?: Maybe<TodoCreatePayload>;
  todoMarkDone?: Maybe<TodoMarkDonePayload>;
  todoRestore?: Maybe<TodoRestorePayload>;
  todoRestoreMany?: Maybe<TodoRestoreManyPayload>;
  todosMarkAllDone?: Maybe<TodosMarkAllDonePayload>;
  updateAlertStatus?: Maybe<UpdateAlertStatusPayload>;
  updateBoard?: Maybe<UpdateBoardPayload>;
  updateBoardEpicUserPreferences?: Maybe<UpdateBoardEpicUserPreferencesPayload>;
  updateBoardList?: Maybe<UpdateBoardListPayload>;
  updateComplianceFramework?: Maybe<UpdateComplianceFrameworkPayload>;
  updateContainerExpirationPolicy?: Maybe<UpdateContainerExpirationPolicyPayload>;
  updateDependencyProxyImageTtlGroupPolicy?: Maybe<UpdateDependencyProxyImageTtlGroupPolicyPayload>;
  updateDependencyProxySettings?: Maybe<UpdateDependencyProxySettingsPayload>;
  updateEpic?: Maybe<UpdateEpicPayload>;
  updateEpicBoardList?: Maybe<UpdateEpicBoardListPayload>;
  /**
   * Updates a DiffNote on an image (a `Note` where the `position.positionType` is `"image"`).
   * If the body of the Note contains only quick actions,
   * the Note will be destroyed during the update, and no Note will be
   * returned.
   */
  updateImageDiffNote?: Maybe<UpdateImageDiffNotePayload>;
  updateIssue?: Maybe<UpdateIssuePayload>;
  updateIteration?: Maybe<UpdateIterationPayload>;
  updateNamespacePackageSettings?: Maybe<UpdateNamespacePackageSettingsPayload>;
  /**
   * Updates a Note.
   * If the body of the Note contains only quick actions,
   * the Note will be destroyed during the update, and no Note will be
   * returned.
   */
  updateNote?: Maybe<UpdateNotePayload>;
  updateRequirement?: Maybe<UpdateRequirementPayload>;
  updateSnippet?: Maybe<UpdateSnippetPayload>;
  userCalloutCreate?: Maybe<UserCalloutCreatePayload>;
  vulnerabilityConfirm?: Maybe<VulnerabilityConfirmPayload>;
  vulnerabilityCreate?: Maybe<VulnerabilityCreatePayload>;
  vulnerabilityDismiss?: Maybe<VulnerabilityDismissPayload>;
  vulnerabilityExternalIssueLinkCreate?: Maybe<VulnerabilityExternalIssueLinkCreatePayload>;
  vulnerabilityExternalIssueLinkDestroy?: Maybe<VulnerabilityExternalIssueLinkDestroyPayload>;
  vulnerabilityResolve?: Maybe<VulnerabilityResolvePayload>;
  vulnerabilityRevertToDetected?: Maybe<VulnerabilityRevertToDetectedPayload>;
};


export type MutationAddProjectToSecurityDashboardArgs = {
  input: AddProjectToSecurityDashboardInput;
};


export type MutationAdminSidekiqQueuesDeleteJobsArgs = {
  input: AdminSidekiqQueuesDeleteJobsInput;
};


export type MutationAlertSetAssigneesArgs = {
  input: AlertSetAssigneesInput;
};


export type MutationAlertTodoCreateArgs = {
  input: AlertTodoCreateInput;
};


export type MutationApiFuzzingCiConfigurationCreateArgs = {
  input: ApiFuzzingCiConfigurationCreateInput;
};


export type MutationAwardEmojiAddArgs = {
  input: AwardEmojiAddInput;
};


export type MutationAwardEmojiRemoveArgs = {
  input: AwardEmojiRemoveInput;
};


export type MutationAwardEmojiToggleArgs = {
  input: AwardEmojiToggleInput;
};


export type MutationBoardEpicCreateArgs = {
  input: BoardEpicCreateInput;
};


export type MutationBoardListCreateArgs = {
  input: BoardListCreateInput;
};


export type MutationBoardListUpdateLimitMetricsArgs = {
  input: BoardListUpdateLimitMetricsInput;
};


export type MutationBulkEnableDevopsAdoptionNamespacesArgs = {
  input: BulkEnableDevopsAdoptionNamespacesInput;
};


export type MutationCiCdSettingsUpdateArgs = {
  input: CiCdSettingsUpdateInput;
};


export type MutationCiJobTokenScopeAddProjectArgs = {
  input: CiJobTokenScopeAddProjectInput;
};


export type MutationCiJobTokenScopeRemoveProjectArgs = {
  input: CiJobTokenScopeRemoveProjectInput;
};


export type MutationClusterAgentDeleteArgs = {
  input: ClusterAgentDeleteInput;
};


export type MutationClusterAgentTokenCreateArgs = {
  input: ClusterAgentTokenCreateInput;
};


export type MutationClusterAgentTokenDeleteArgs = {
  input: ClusterAgentTokenDeleteInput;
};


export type MutationCommitCreateArgs = {
  input: CommitCreateInput;
};


export type MutationConfigureDependencyScanningArgs = {
  input: ConfigureDependencyScanningInput;
};


export type MutationConfigureSastArgs = {
  input: ConfigureSastInput;
};


export type MutationConfigureSecretDetectionArgs = {
  input: ConfigureSecretDetectionInput;
};


export type MutationCreateAlertIssueArgs = {
  input: CreateAlertIssueInput;
};


export type MutationCreateAnnotationArgs = {
  input: CreateAnnotationInput;
};


export type MutationCreateBoardArgs = {
  input: CreateBoardInput;
};


export type MutationCreateBranchArgs = {
  input: CreateBranchInput;
};


export type MutationCreateClusterAgentArgs = {
  input: CreateClusterAgentInput;
};


export type MutationCreateComplianceFrameworkArgs = {
  input: CreateComplianceFrameworkInput;
};


export type MutationCreateCustomEmojiArgs = {
  input: CreateCustomEmojiInput;
};


export type MutationCreateDiffNoteArgs = {
  input: CreateDiffNoteInput;
};


export type MutationCreateEpicArgs = {
  input: CreateEpicInput;
};


export type MutationCreateImageDiffNoteArgs = {
  input: CreateImageDiffNoteInput;
};


export type MutationCreateIssueArgs = {
  input: CreateIssueInput;
};


export type MutationCreateIterationArgs = {
  input: CreateIterationInput;
};


export type MutationCreateNoteArgs = {
  input: CreateNoteInput;
};


export type MutationCreateRequirementArgs = {
  input: CreateRequirementInput;
};


export type MutationCreateSnippetArgs = {
  input: CreateSnippetInput;
};


export type MutationCreateTestCaseArgs = {
  input: CreateTestCaseInput;
};


export type MutationCustomerRelationsContactCreateArgs = {
  input: CustomerRelationsContactCreateInput;
};


export type MutationCustomerRelationsContactUpdateArgs = {
  input: CustomerRelationsContactUpdateInput;
};


export type MutationCustomerRelationsOrganizationCreateArgs = {
  input: CustomerRelationsOrganizationCreateInput;
};


export type MutationCustomerRelationsOrganizationUpdateArgs = {
  input: CustomerRelationsOrganizationUpdateInput;
};


export type MutationDastOnDemandScanCreateArgs = {
  input: DastOnDemandScanCreateInput;
};


export type MutationDastProfileCreateArgs = {
  input: DastProfileCreateInput;
};


export type MutationDastProfileDeleteArgs = {
  input: DastProfileDeleteInput;
};


export type MutationDastProfileRunArgs = {
  input: DastProfileRunInput;
};


export type MutationDastProfileUpdateArgs = {
  input: DastProfileUpdateInput;
};


export type MutationDastScannerProfileCreateArgs = {
  input: DastScannerProfileCreateInput;
};


export type MutationDastScannerProfileDeleteArgs = {
  input: DastScannerProfileDeleteInput;
};


export type MutationDastScannerProfileUpdateArgs = {
  input: DastScannerProfileUpdateInput;
};


export type MutationDastSiteProfileCreateArgs = {
  input: DastSiteProfileCreateInput;
};


export type MutationDastSiteProfileDeleteArgs = {
  input: DastSiteProfileDeleteInput;
};


export type MutationDastSiteProfileUpdateArgs = {
  input: DastSiteProfileUpdateInput;
};


export type MutationDastSiteTokenCreateArgs = {
  input: DastSiteTokenCreateInput;
};


export type MutationDastSiteValidationCreateArgs = {
  input: DastSiteValidationCreateInput;
};


export type MutationDastSiteValidationRevokeArgs = {
  input: DastSiteValidationRevokeInput;
};


export type MutationDeleteAnnotationArgs = {
  input: DeleteAnnotationInput;
};


export type MutationDesignManagementDeleteArgs = {
  input: DesignManagementDeleteInput;
};


export type MutationDesignManagementMoveArgs = {
  input: DesignManagementMoveInput;
};


export type MutationDesignManagementUploadArgs = {
  input: DesignManagementUploadInput;
};


export type MutationDestroyBoardArgs = {
  input: DestroyBoardInput;
};


export type MutationDestroyBoardListArgs = {
  input: DestroyBoardListInput;
};


export type MutationDestroyComplianceFrameworkArgs = {
  input: DestroyComplianceFrameworkInput;
};


export type MutationDestroyContainerRepositoryArgs = {
  input: DestroyContainerRepositoryInput;
};


export type MutationDestroyContainerRepositoryTagsArgs = {
  input: DestroyContainerRepositoryTagsInput;
};


export type MutationDestroyCustomEmojiArgs = {
  input: DestroyCustomEmojiInput;
};


export type MutationDestroyEpicBoardArgs = {
  input: DestroyEpicBoardInput;
};


export type MutationDestroyNoteArgs = {
  input: DestroyNoteInput;
};


export type MutationDestroyPackageArgs = {
  input: DestroyPackageInput;
};


export type MutationDestroyPackageFileArgs = {
  input: DestroyPackageFileInput;
};


export type MutationDestroySnippetArgs = {
  input: DestroySnippetInput;
};


export type MutationDisableDevopsAdoptionNamespaceArgs = {
  input: DisableDevopsAdoptionNamespaceInput;
};


export type MutationDiscussionToggleResolveArgs = {
  input: DiscussionToggleResolveInput;
};


export type MutationEchoCreateArgs = {
  input: EchoCreateInput;
};


export type MutationEnableDevopsAdoptionNamespaceArgs = {
  input: EnableDevopsAdoptionNamespaceInput;
};


export type MutationEnvironmentsCanaryIngressUpdateArgs = {
  input: EnvironmentsCanaryIngressUpdateInput;
};


export type MutationEpicAddIssueArgs = {
  input: EpicAddIssueInput;
};


export type MutationEpicBoardCreateArgs = {
  input: EpicBoardCreateInput;
};


export type MutationEpicBoardListCreateArgs = {
  input: EpicBoardListCreateInput;
};


export type MutationEpicBoardListDestroyArgs = {
  input: EpicBoardListDestroyInput;
};


export type MutationEpicBoardUpdateArgs = {
  input: EpicBoardUpdateInput;
};


export type MutationEpicMoveListArgs = {
  input: EpicMoveListInput;
};


export type MutationEpicSetSubscriptionArgs = {
  input: EpicSetSubscriptionInput;
};


export type MutationEpicTreeReorderArgs = {
  input: EpicTreeReorderInput;
};


export type MutationEscalationPolicyCreateArgs = {
  input: EscalationPolicyCreateInput;
};


export type MutationEscalationPolicyDestroyArgs = {
  input: EscalationPolicyDestroyInput;
};


export type MutationEscalationPolicyUpdateArgs = {
  input: EscalationPolicyUpdateInput;
};


export type MutationExportRequirementsArgs = {
  input: ExportRequirementsInput;
};


export type MutationExternalAuditEventDestinationCreateArgs = {
  input: ExternalAuditEventDestinationCreateInput;
};


export type MutationExternalAuditEventDestinationDestroyArgs = {
  input: ExternalAuditEventDestinationDestroyInput;
};


export type MutationExternalAuditEventDestinationUpdateArgs = {
  input: ExternalAuditEventDestinationUpdateInput;
};


export type MutationGitlabSubscriptionActivateArgs = {
  input: GitlabSubscriptionActivateInput;
};


export type MutationGroupUpdateArgs = {
  input: GroupUpdateInput;
};


export type MutationHttpIntegrationCreateArgs = {
  input: HttpIntegrationCreateInput;
};


export type MutationHttpIntegrationDestroyArgs = {
  input: HttpIntegrationDestroyInput;
};


export type MutationHttpIntegrationResetTokenArgs = {
  input: HttpIntegrationResetTokenInput;
};


export type MutationHttpIntegrationUpdateArgs = {
  input: HttpIntegrationUpdateInput;
};


export type MutationIssueMoveArgs = {
  input: IssueMoveInput;
};


export type MutationIssueMoveListArgs = {
  input: IssueMoveListInput;
};


export type MutationIssueSetAssigneesArgs = {
  input: IssueSetAssigneesInput;
};


export type MutationIssueSetConfidentialArgs = {
  input: IssueSetConfidentialInput;
};


export type MutationIssueSetDueDateArgs = {
  input: IssueSetDueDateInput;
};


export type MutationIssueSetEpicArgs = {
  input: IssueSetEpicInput;
};


export type MutationIssueSetIterationArgs = {
  input: IssueSetIterationInput;
};


export type MutationIssueSetLockedArgs = {
  input: IssueSetLockedInput;
};


export type MutationIssueSetSeverityArgs = {
  input: IssueSetSeverityInput;
};


export type MutationIssueSetSubscriptionArgs = {
  input: IssueSetSubscriptionInput;
};


export type MutationIssueSetWeightArgs = {
  input: IssueSetWeightInput;
};


export type MutationIterationCadenceCreateArgs = {
  input: IterationCadenceCreateInput;
};


export type MutationIterationCadenceDestroyArgs = {
  input: IterationCadenceDestroyInput;
};


export type MutationIterationCadenceUpdateArgs = {
  input: IterationCadenceUpdateInput;
};


export type MutationIterationCreateArgs = {
  input: IterationCreateInput;
};


export type MutationIterationDeleteArgs = {
  input: IterationDeleteInput;
};


export type MutationJiraImportStartArgs = {
  input: JiraImportStartInput;
};


export type MutationJiraImportUsersArgs = {
  input: JiraImportUsersInput;
};


export type MutationJobCancelArgs = {
  input: JobCancelInput;
};


export type MutationJobPlayArgs = {
  input: JobPlayInput;
};


export type MutationJobRetryArgs = {
  input: JobRetryInput;
};


export type MutationJobUnscheduleArgs = {
  input: JobUnscheduleInput;
};


export type MutationLabelCreateArgs = {
  input: LabelCreateInput;
};


export type MutationMarkAsSpamSnippetArgs = {
  input: MarkAsSpamSnippetInput;
};


export type MutationMergeRequestAcceptArgs = {
  input: MergeRequestAcceptInput;
};


export type MutationMergeRequestCreateArgs = {
  input: MergeRequestCreateInput;
};


export type MutationMergeRequestReviewerRereviewArgs = {
  input: MergeRequestReviewerRereviewInput;
};


export type MutationMergeRequestSetAssigneesArgs = {
  input: MergeRequestSetAssigneesInput;
};


export type MutationMergeRequestSetDraftArgs = {
  input: MergeRequestSetDraftInput;
};


export type MutationMergeRequestSetLabelsArgs = {
  input: MergeRequestSetLabelsInput;
};


export type MutationMergeRequestSetLockedArgs = {
  input: MergeRequestSetLockedInput;
};


export type MutationMergeRequestSetMilestoneArgs = {
  input: MergeRequestSetMilestoneInput;
};


export type MutationMergeRequestSetSubscriptionArgs = {
  input: MergeRequestSetSubscriptionInput;
};


export type MutationMergeRequestSetWipArgs = {
  input: MergeRequestSetWipInput;
};


export type MutationMergeRequestUpdateArgs = {
  input: MergeRequestUpdateInput;
};


export type MutationNamespaceIncreaseStorageTemporarilyArgs = {
  input: NamespaceIncreaseStorageTemporarilyInput;
};


export type MutationOncallRotationCreateArgs = {
  input: OncallRotationCreateInput;
};


export type MutationOncallRotationDestroyArgs = {
  input: OncallRotationDestroyInput;
};


export type MutationOncallRotationUpdateArgs = {
  input: OncallRotationUpdateInput;
};


export type MutationOncallScheduleCreateArgs = {
  input: OncallScheduleCreateInput;
};


export type MutationOncallScheduleDestroyArgs = {
  input: OncallScheduleDestroyInput;
};


export type MutationOncallScheduleUpdateArgs = {
  input: OncallScheduleUpdateInput;
};


export type MutationPipelineCancelArgs = {
  input: PipelineCancelInput;
};


export type MutationPipelineDestroyArgs = {
  input: PipelineDestroyInput;
};


export type MutationPipelineRetryArgs = {
  input: PipelineRetryInput;
};


export type MutationProjectSetComplianceFrameworkArgs = {
  input: ProjectSetComplianceFrameworkInput;
};


export type MutationProjectSetLockedArgs = {
  input: ProjectSetLockedInput;
};


export type MutationPrometheusIntegrationCreateArgs = {
  input: PrometheusIntegrationCreateInput;
};


export type MutationPrometheusIntegrationResetTokenArgs = {
  input: PrometheusIntegrationResetTokenInput;
};


export type MutationPrometheusIntegrationUpdateArgs = {
  input: PrometheusIntegrationUpdateInput;
};


export type MutationPromoteToEpicArgs = {
  input: PromoteToEpicInput;
};


export type MutationReleaseAssetLinkCreateArgs = {
  input: ReleaseAssetLinkCreateInput;
};


export type MutationReleaseAssetLinkDeleteArgs = {
  input: ReleaseAssetLinkDeleteInput;
};


export type MutationReleaseAssetLinkUpdateArgs = {
  input: ReleaseAssetLinkUpdateInput;
};


export type MutationReleaseCreateArgs = {
  input: ReleaseCreateInput;
};


export type MutationReleaseDeleteArgs = {
  input: ReleaseDeleteInput;
};


export type MutationReleaseUpdateArgs = {
  input: ReleaseUpdateInput;
};


export type MutationRemoveProjectFromSecurityDashboardArgs = {
  input: RemoveProjectFromSecurityDashboardInput;
};


export type MutationRepositionImageDiffNoteArgs = {
  input: RepositionImageDiffNoteInput;
};


export type MutationRunnerDeleteArgs = {
  input: RunnerDeleteInput;
};


export type MutationRunnerUpdateArgs = {
  input: RunnerUpdateInput;
};


export type MutationRunnersRegistrationTokenResetArgs = {
  input: RunnersRegistrationTokenResetInput;
};


export type MutationScanExecutionPolicyCommitArgs = {
  input: ScanExecutionPolicyCommitInput;
};


export type MutationSecurityPolicyProjectAssignArgs = {
  input: SecurityPolicyProjectAssignInput;
};


export type MutationSecurityPolicyProjectCreateArgs = {
  input: SecurityPolicyProjectCreateInput;
};


export type MutationSecurityPolicyProjectUnassignArgs = {
  input: SecurityPolicyProjectUnassignInput;
};


export type MutationTerraformStateDeleteArgs = {
  input: TerraformStateDeleteInput;
};


export type MutationTerraformStateLockArgs = {
  input: TerraformStateLockInput;
};


export type MutationTerraformStateUnlockArgs = {
  input: TerraformStateUnlockInput;
};


export type MutationTodoCreateArgs = {
  input: TodoCreateInput;
};


export type MutationTodoMarkDoneArgs = {
  input: TodoMarkDoneInput;
};


export type MutationTodoRestoreArgs = {
  input: TodoRestoreInput;
};


export type MutationTodoRestoreManyArgs = {
  input: TodoRestoreManyInput;
};


export type MutationTodosMarkAllDoneArgs = {
  input: TodosMarkAllDoneInput;
};


export type MutationUpdateAlertStatusArgs = {
  input: UpdateAlertStatusInput;
};


export type MutationUpdateBoardArgs = {
  input: UpdateBoardInput;
};


export type MutationUpdateBoardEpicUserPreferencesArgs = {
  input: UpdateBoardEpicUserPreferencesInput;
};


export type MutationUpdateBoardListArgs = {
  input: UpdateBoardListInput;
};


export type MutationUpdateComplianceFrameworkArgs = {
  input: UpdateComplianceFrameworkInput;
};


export type MutationUpdateContainerExpirationPolicyArgs = {
  input: UpdateContainerExpirationPolicyInput;
};


export type MutationUpdateDependencyProxyImageTtlGroupPolicyArgs = {
  input: UpdateDependencyProxyImageTtlGroupPolicyInput;
};


export type MutationUpdateDependencyProxySettingsArgs = {
  input: UpdateDependencyProxySettingsInput;
};


export type MutationUpdateEpicArgs = {
  input: UpdateEpicInput;
};


export type MutationUpdateEpicBoardListArgs = {
  input: UpdateEpicBoardListInput;
};


export type MutationUpdateImageDiffNoteArgs = {
  input: UpdateImageDiffNoteInput;
};


export type MutationUpdateIssueArgs = {
  input: UpdateIssueInput;
};


export type MutationUpdateIterationArgs = {
  input: UpdateIterationInput;
};


export type MutationUpdateNamespacePackageSettingsArgs = {
  input: UpdateNamespacePackageSettingsInput;
};


export type MutationUpdateNoteArgs = {
  input: UpdateNoteInput;
};


export type MutationUpdateRequirementArgs = {
  input: UpdateRequirementInput;
};


export type MutationUpdateSnippetArgs = {
  input: UpdateSnippetInput;
};


export type MutationUserCalloutCreateArgs = {
  input: UserCalloutCreateInput;
};


export type MutationVulnerabilityConfirmArgs = {
  input: VulnerabilityConfirmInput;
};


export type MutationVulnerabilityCreateArgs = {
  input: VulnerabilityCreateInput;
};


export type MutationVulnerabilityDismissArgs = {
  input: VulnerabilityDismissInput;
};


export type MutationVulnerabilityExternalIssueLinkCreateArgs = {
  input: VulnerabilityExternalIssueLinkCreateInput;
};


export type MutationVulnerabilityExternalIssueLinkDestroyArgs = {
  input: VulnerabilityExternalIssueLinkDestroyInput;
};


export type MutationVulnerabilityResolveArgs = {
  input: VulnerabilityResolveInput;
};


export type MutationVulnerabilityRevertToDetectedArgs = {
  input: VulnerabilityRevertToDetectedInput;
};

/** Different toggles for changing mutator behavior */
export type MutationOperationMode =
  /** Performs an append operation. */
  | 'APPEND'
  /** Performs a removal operation. */
  | 'REMOVE'
  /** Performs a replace operation. */
  | 'REPLACE';

export type Namespace = {
  __typename?: 'Namespace';
  /** Size limit for repositories in the namespace in bytes. */
  actualRepositorySizeLimit?: Maybe<Scalars['Float']>;
  /** Additional storage purchased for the root namespace in bytes. */
  additionalPurchasedStorageSize?: Maybe<Scalars['Float']>;
  /** Compliance frameworks available to projects in this namespace. */
  complianceFrameworks?: Maybe<ComplianceFrameworkConnection>;
  /** Includes at least one project where the repository size exceeds the limit. */
  containsLockedProjects: Scalars['Boolean'];
  /** Description of the namespace. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Full name of the namespace. */
  fullName: Scalars['String'];
  /** Full path of the namespace. */
  fullPath: Scalars['ID'];
  /** ID of the namespace. */
  id: Scalars['ID'];
  /** Status of the temporary storage increase. */
  isTemporaryStorageIncreaseEnabled: Scalars['Boolean'];
  /** Indicates if Large File Storage (LFS) is enabled for namespace. */
  lfsEnabled?: Maybe<Scalars['Boolean']>;
  /** Name of the namespace. */
  name: Scalars['String'];
  /** Package settings for the namespace. */
  packageSettings?: Maybe<PackageSettings>;
  /** Path of the namespace. */
  path: Scalars['String'];
  /** Projects within this namespace. */
  projects: ProjectConnection;
  /** Number of projects in the root namespace where the repository size exceeds the limit. */
  repositorySizeExcessProjectCount: Scalars['Int'];
  /** Indicates if users can request access to namespace. */
  requestAccessEnabled?: Maybe<Scalars['Boolean']>;
  /** Aggregated storage statistics of the namespace. Only available for root namespaces. */
  rootStorageStatistics?: Maybe<RootStorageStatistics>;
  /** Shared runners availability for the namespace and its descendants. */
  sharedRunnersSetting?: Maybe<SharedRunnersSetting>;
  /** Total storage limit of the root namespace in bytes. */
  storageSizeLimit?: Maybe<Scalars['Float']>;
  /** Date until the temporary storage increase is active. */
  temporaryStorageIncreaseEndsOn?: Maybe<Scalars['Time']>;
  /** Total repository size of all projects in the root namespace in bytes. */
  totalRepositorySize?: Maybe<Scalars['Float']>;
  /** Total excess repository size of all projects in the root namespace in bytes. */
  totalRepositorySizeExcess?: Maybe<Scalars['Float']>;
  /** Visibility of the namespace. */
  visibility?: Maybe<Scalars['String']>;
};


export type NamespaceComplianceFrameworksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['ComplianceManagementFrameworkID']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type NamespaceProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasCodeCoverage?: InputMaybe<Scalars['Boolean']>;
  hasVulnerabilities?: InputMaybe<Scalars['Boolean']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  includeSubgroups?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<NamespaceProjectSort>;
};

/** The connection type for Namespace. */
export type NamespaceConnection = {
  __typename?: 'NamespaceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<NamespaceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Namespace>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type NamespaceEdge = {
  __typename?: 'NamespaceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Namespace>;
};

/** Autogenerated input type of NamespaceIncreaseStorageTemporarily */
export type NamespaceIncreaseStorageTemporarilyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the namespace to mutate. */
  id: Scalars['NamespaceID'];
};

/** Autogenerated return type of NamespaceIncreaseStorageTemporarily */
export type NamespaceIncreaseStorageTemporarilyPayload = {
  __typename?: 'NamespaceIncreaseStorageTemporarilyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Namespace after mutation. */
  namespace?: Maybe<Namespace>;
};

/** Values for sorting projects */
export type NamespaceProjectSort =
  /** Most similar to the search query. */
  | 'SIMILARITY'
  /** Sort by storage size. */
  | 'STORAGE';

export type NegatedBoardIssueInput = {
  /** Filter by assignee username. */
  assigneeUsername?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter by author username. */
  authorUsername?: InputMaybe<Scalars['String']>;
  /** Filter by epic ID. Incompatible with epicWildcardId. */
  epicId?: InputMaybe<Scalars['EpicID']>;
  /** List of IIDs of issues. For example `["1", "2"]`. */
  iids?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by a list of iteration IDs. Incompatible with iterationWildcardId. */
  iterationId?: InputMaybe<Array<Scalars['IterationID']>>;
  /** Filter by iteration title. */
  iterationTitle?: InputMaybe<Scalars['String']>;
  /** Filter by iteration ID wildcard. */
  iterationWildcardId?: InputMaybe<NegatedIterationWildcardId>;
  /** Filter by label name. */
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter by milestone title. */
  milestoneTitle?: InputMaybe<Scalars['String']>;
  /** Filter by milestone ID wildcard. */
  milestoneWildcardId?: InputMaybe<MilestoneWildcardId>;
  /** Filter by reaction emoji applied by the current user. Wildcard values "NONE" and "ANY" are supported. */
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  /** Filter by release tag. */
  releaseTag?: InputMaybe<Scalars['String']>;
  /** Filter by the given issue types. */
  types?: InputMaybe<Array<IssueType>>;
  /** Filter by weight. */
  weight?: InputMaybe<Scalars['String']>;
};

export type NegatedEpicBoardIssueInput = {
  /** Filter by author username. */
  authorUsername?: InputMaybe<Scalars['String']>;
  /** Filter by label name. */
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter by reaction emoji applied by the current user. Wildcard values "NONE" and "ANY" are supported. */
  myReactionEmoji?: InputMaybe<Scalars['String']>;
};

export type NegatedEpicFilterInput = {
  /** Filter by author username. */
  authorUsername?: InputMaybe<Scalars['String']>;
  /** Filter by label name. */
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  /** Filter by reaction emoji applied by the current user. */
  myReactionEmoji?: InputMaybe<Scalars['String']>;
};

export type NegatedIssueFilterInput = {
  /** ID of a user not assigned to the issues. */
  assigneeId?: InputMaybe<Scalars['String']>;
  /** Usernames of users not assigned to the issue. */
  assigneeUsernames?: InputMaybe<Array<Scalars['String']>>;
  /** Username of a user who didn't author the issue. */
  authorUsername?: InputMaybe<Scalars['String']>;
  /** ID of an epic not associated with the issues. */
  epicId?: InputMaybe<Scalars['String']>;
  /** List of IIDs of issues to exclude. For example, `[1, 2]`. */
  iids?: InputMaybe<Array<Scalars['String']>>;
  /** List of iteration Global IDs not applied to the issue. */
  iterationId?: InputMaybe<Array<Scalars['ID']>>;
  /** Filter by negated iteration ID wildcard. */
  iterationWildcardId?: InputMaybe<IterationWildcardId>;
  /** Labels not applied to this issue. */
  labelName?: InputMaybe<Array<Scalars['String']>>;
  /** Milestone not applied to this issue. */
  milestoneTitle?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by negated milestone wildcard values. */
  milestoneWildcardId?: InputMaybe<NegatedMilestoneWildcardId>;
  /** Filter by reaction emoji applied by the current user. */
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  /** Release tag not associated with the issue's milestone. Ignored when parent is a group. */
  releaseTag?: InputMaybe<Array<Scalars['String']>>;
  /** Filters out issues by the given issue types. */
  types?: InputMaybe<Array<IssueType>>;
  /** Weight not applied to the issue. */
  weight?: InputMaybe<Scalars['String']>;
};

/** Negated Iteration ID wildcard values */
export type NegatedIterationWildcardId =
  /** Current iteration. */
  | 'CURRENT';

/** Negated Milestone ID wildcard values */
export type NegatedMilestoneWildcardId =
  /** Milestone assigned is open and yet to be started (start date > today). */
  | 'STARTED'
  /** Milestone assigned is open but due in the past (due date <= today). */
  | 'UPCOMING';

/** Represents the network policy */
export type NetworkPolicy = {
  __typename?: 'NetworkPolicy';
  /** Indicates whether this policy is enabled. */
  enabled: Scalars['Boolean'];
  /** Environments where this policy is applied. */
  environments?: Maybe<EnvironmentConnection>;
  /** Indicates whether this policy is created from AutoDevops. */
  fromAutoDevops: Scalars['Boolean'];
  /** Kind of the policy. */
  kind: NetworkPolicyKind;
  /** Name of the policy. */
  name: Scalars['String'];
  /** Namespace of the policy. */
  namespace: Scalars['String'];
  /** Timestamp of when the policy YAML was last updated. */
  updatedAt: Scalars['Time'];
  /** YAML definition of the policy. */
  yaml: Scalars['String'];
};


/** Represents the network policy */
export type NetworkPolicyEnvironmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for NetworkPolicy. */
export type NetworkPolicyConnection = {
  __typename?: 'NetworkPolicyConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<NetworkPolicyEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<NetworkPolicy>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type NetworkPolicyEdge = {
  __typename?: 'NetworkPolicyEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<NetworkPolicy>;
};

/** Kind of the network policy */
export type NetworkPolicyKind =
  /** Policy kind of Cilium Network Policy. */
  | 'CiliumNetworkPolicy'
  /** Policy kind of Network Policy. */
  | 'NetworkPolicy';

export type Note = ResolvableInterface & {
  __typename?: 'Note';
  /** User who wrote this note. */
  author: UserCore;
  /** Content of the note. */
  body: Scalars['String'];
  /** The GitLab Flavored Markdown rendering of `note` */
  bodyHtml?: Maybe<Scalars['String']>;
  /** Indicates if this note is confidential. */
  confidential?: Maybe<Scalars['Boolean']>;
  /** Timestamp of the note creation. */
  createdAt: Scalars['Time'];
  /** Discussion this note is a part of. */
  discussion?: Maybe<Discussion>;
  /** ID of the note. */
  id: Scalars['NoteID'];
  /** Position of this note on a diff. */
  position?: Maybe<DiffPosition>;
  /** Project associated with the note. */
  project?: Maybe<Project>;
  /** Indicates if the object can be resolved. */
  resolvable: Scalars['Boolean'];
  /** Indicates if the object is resolved. */
  resolved: Scalars['Boolean'];
  /** Timestamp of when the object was resolved. */
  resolvedAt?: Maybe<Scalars['Time']>;
  /** User who resolved the object. */
  resolvedBy?: Maybe<UserCore>;
  /** Indicates whether this note was created by the system or by a user. */
  system: Scalars['Boolean'];
  /** Name of the icon corresponding to a system note. */
  systemNoteIconName?: Maybe<Scalars['String']>;
  /** Timestamp of the note's last activity. */
  updatedAt: Scalars['Time'];
  /** URL to view this Note in the Web UI. */
  url?: Maybe<Scalars['String']>;
  /** Permissions for the current user on the resource */
  userPermissions: NotePermissions;
};

/** The connection type for Note. */
export type NoteConnection = {
  __typename?: 'NoteConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<NoteEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Note>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type NoteEdge = {
  __typename?: 'NoteEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Note>;
};

export type NotePermissions = {
  __typename?: 'NotePermissions';
  /** Indicates the user can perform `admin_note` on this resource */
  adminNote: Scalars['Boolean'];
  /** Indicates the user can perform `award_emoji` on this resource */
  awardEmoji: Scalars['Boolean'];
  /** Indicates the user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Indicates the user can perform `read_note` on this resource */
  readNote: Scalars['Boolean'];
  /** Indicates the user can perform `reposition_note` on this resource */
  repositionNote: Scalars['Boolean'];
  /** Indicates the user can perform `resolve_note` on this resource */
  resolveNote: Scalars['Boolean'];
};

export type NoteableInterface = {
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** All notes on this noteable. */
  notes: NoteConnection;
};


export type NoteableInterfaceDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type NoteableInterfaceNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Represents an object that supports notes. */
export type NoteableType = Design | Issue | MergeRequest;

/** Nuget dependency link metadata */
export type NugetDependencyLinkMetadata = {
  __typename?: 'NugetDependencyLinkMetadata';
  /** ID of the metadatum. */
  id: Scalars['PackagesNugetDependencyLinkMetadatumID'];
  /** Target framework of the dependency link package. */
  targetFramework: Scalars['String'];
};

/** Nuget metadata */
export type NugetMetadata = {
  __typename?: 'NugetMetadata';
  /** Icon URL of the Nuget package. */
  iconUrl?: Maybe<Scalars['String']>;
  /** ID of the metadatum. */
  id: Scalars['PackagesNugetMetadatumID'];
  /** License URL of the Nuget package. */
  licenseUrl?: Maybe<Scalars['String']>;
  /** Project URL of the Nuget package. */
  projectUrl?: Maybe<Scalars['String']>;
};

/** The rotation participant and color palette */
export type OncallParticipantType = {
  __typename?: 'OncallParticipantType';
  /** Color palette to assign to the on-call user. For example "blue". */
  colorPalette?: Maybe<Scalars['String']>;
  /** Color weight to assign to for the on-call user, for example "500". Max 4 chars. For easy identification of the user. */
  colorWeight?: Maybe<Scalars['String']>;
  /** ID of the on-call participant. */
  id: Scalars['IncidentManagementOncallParticipantID'];
  /** User who is participating. */
  user: UserCore;
};

/** The connection type for OncallParticipantType. */
export type OncallParticipantTypeConnection = {
  __typename?: 'OncallParticipantTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<OncallParticipantTypeEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<OncallParticipantType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type OncallParticipantTypeEdge = {
  __typename?: 'OncallParticipantTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<OncallParticipantType>;
};

/** Active period time range for on-call rotation */
export type OncallRotationActivePeriodInputType = {
  /** End of the rotation active period in 24 hour format. For example, "18:30". */
  endTime: Scalars['String'];
  /** Start of the rotation active period in 24 hour format. For example, "18:30". */
  startTime: Scalars['String'];
};

/** Active period time range for on-call rotation */
export type OncallRotationActivePeriodType = {
  __typename?: 'OncallRotationActivePeriodType';
  /** End of the rotation active period. */
  endTime?: Maybe<Scalars['String']>;
  /** Start of the rotation active period. */
  startTime?: Maybe<Scalars['String']>;
};

/** Autogenerated input type of OncallRotationCreate */
export type OncallRotationCreateInput = {
  /** Active period of time that the on-call rotation should take place. */
  activePeriod?: InputMaybe<OncallRotationActivePeriodInputType>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** End date and time of the on-call rotation, in the timezone of the on-call schedule. */
  endsAt?: InputMaybe<OncallRotationDateInputType>;
  /** Name of the on-call rotation. */
  name: Scalars['String'];
  /** Usernames of users participating in the on-call rotation. A maximum limit of 100 participants applies. */
  participants: Array<OncallUserInputType>;
  /** Project to create the on-call schedule in. */
  projectPath: Scalars['ID'];
  /** Rotation length of the on-call rotation. */
  rotationLength: OncallRotationLengthInputType;
  /** IID of the on-call schedule to create the on-call rotation in. */
  scheduleIid: Scalars['String'];
  /** Start date and time of the on-call rotation, in the timezone of the on-call schedule. */
  startsAt: OncallRotationDateInputType;
};

/** Autogenerated return type of OncallRotationCreate */
export type OncallRotationCreatePayload = {
  __typename?: 'OncallRotationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** On-call rotation. */
  oncallRotation?: Maybe<IncidentManagementOncallRotation>;
};

/** Date input type for on-call rotation */
export type OncallRotationDateInputType = {
  /** Date component of the date in YYYY-MM-DD format. */
  date: Scalars['String'];
  /** Time component of the date in 24hr HH:MM format. */
  time: Scalars['String'];
};

/** Autogenerated input type of OncallRotationDestroy */
export type OncallRotationDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the on-call rotation to remove. */
  id: Scalars['IncidentManagementOncallRotationID'];
  /** Project to remove the on-call schedule from. */
  projectPath: Scalars['ID'];
  /** IID of the on-call schedule to the on-call rotation belongs to. */
  scheduleIid: Scalars['String'];
};

/** Autogenerated return type of OncallRotationDestroy */
export type OncallRotationDestroyPayload = {
  __typename?: 'OncallRotationDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** On-call rotation. */
  oncallRotation?: Maybe<IncidentManagementOncallRotation>;
};

/** The rotation length of the on-call rotation */
export type OncallRotationLengthInputType = {
  /** Rotation length of the on-call rotation. */
  length: Scalars['Int'];
  /** Unit of the rotation length of the on-call rotation. */
  unit: OncallRotationUnitEnum;
};

/** Rotation length unit of an on-call rotation */
export type OncallRotationUnitEnum =
  /** Days */
  | 'DAYS'
  /** Hours */
  | 'HOURS'
  /** Weeks */
  | 'WEEKS';

/** Autogenerated input type of OncallRotationUpdate */
export type OncallRotationUpdateInput = {
  /** Active period of time that the on-call rotation should take place. */
  activePeriod?: InputMaybe<OncallRotationActivePeriodInputType>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** End date and time of the on-call rotation, in the timezone of the on-call schedule. */
  endsAt?: InputMaybe<OncallRotationDateInputType>;
  /** ID of the on-call schedule to create the on-call rotation in. */
  id: Scalars['IncidentManagementOncallRotationID'];
  /** Name of the on-call rotation. */
  name?: InputMaybe<Scalars['String']>;
  /** Usernames of users participating in the on-call rotation. A maximum limit of 100 participants applies. */
  participants?: InputMaybe<Array<OncallUserInputType>>;
  /** Rotation length of the on-call rotation. */
  rotationLength?: InputMaybe<OncallRotationLengthInputType>;
  /** Start date and time of the on-call rotation, in the timezone of the on-call schedule. */
  startsAt?: InputMaybe<OncallRotationDateInputType>;
};

/** Autogenerated return type of OncallRotationUpdate */
export type OncallRotationUpdatePayload = {
  __typename?: 'OncallRotationUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** On-call rotation. */
  oncallRotation?: Maybe<IncidentManagementOncallRotation>;
};

/** Autogenerated input type of OncallScheduleCreate */
export type OncallScheduleCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the on-call schedule. */
  description?: InputMaybe<Scalars['String']>;
  /** Name of the on-call schedule. */
  name: Scalars['String'];
  /** Project to create the on-call schedule in. */
  projectPath: Scalars['ID'];
  /** Timezone of the on-call schedule. */
  timezone: Scalars['String'];
};

/** Autogenerated return type of OncallScheduleCreate */
export type OncallScheduleCreatePayload = {
  __typename?: 'OncallScheduleCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** On-call schedule. */
  oncallSchedule?: Maybe<IncidentManagementOncallSchedule>;
};

/** Autogenerated input type of OncallScheduleDestroy */
export type OncallScheduleDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** On-call schedule internal ID to remove. */
  iid: Scalars['String'];
  /** Project to remove the on-call schedule from. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of OncallScheduleDestroy */
export type OncallScheduleDestroyPayload = {
  __typename?: 'OncallScheduleDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** On-call schedule. */
  oncallSchedule?: Maybe<IncidentManagementOncallSchedule>;
};

/** Autogenerated input type of OncallScheduleUpdate */
export type OncallScheduleUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the on-call schedule. */
  description?: InputMaybe<Scalars['String']>;
  /** On-call schedule internal ID to update. */
  iid: Scalars['String'];
  /** Name of the on-call schedule. */
  name?: InputMaybe<Scalars['String']>;
  /** Project to update the on-call schedule in. */
  projectPath: Scalars['ID'];
  /** Timezone of the on-call schedule. */
  timezone?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of OncallScheduleUpdate */
export type OncallScheduleUpdatePayload = {
  __typename?: 'OncallScheduleUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** On-call schedule. */
  oncallSchedule?: Maybe<IncidentManagementOncallSchedule>;
};

/** The rotation user and color palette */
export type OncallUserInputType = {
  /** Value of DataVisualizationColorEnum. The color from the palette to assign to the on-call user. */
  colorPalette?: InputMaybe<DataVisualizationColorEnum>;
  /**
   * Color weight to assign to for the on-call user. To view on-call schedules in
   * GitLab, do not provide a value below 500. A value between 500 and 950 ensures
   * sufficient contrast.
   */
  colorWeight?: InputMaybe<DataVisualizationWeightEnum>;
  /** Username of the user to participate in the on-call rotation. For example, `"user_one"`. */
  username: Scalars['String'];
};

/** Represents a package in the Package Registry. Note that this type is in beta and susceptible to changes */
export type Package = {
  __typename?: 'Package';
  /** Whether the user can destroy the package. */
  canDestroy: Scalars['Boolean'];
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** ID of the package. */
  id: Scalars['PackagesPackageID'];
  /** Package metadata. */
  metadata?: Maybe<PackageMetadata>;
  /** Name of the package. */
  name: Scalars['String'];
  /** Package type. */
  packageType: PackageTypeEnum;
  /** Pipelines that built the package. */
  pipelines?: Maybe<PipelineConnection>;
  /** Project where the package is stored. */
  project: Project;
  /** Package status. */
  status: PackageStatus;
  /** Package tags. */
  tags?: Maybe<PackageTagConnection>;
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
  /** Version string. */
  version?: Maybe<Scalars['String']>;
  /**
   * Other versions of the package. Deprecated in 13.11: This field is now only returned in the PackageDetailsType.
   * @deprecated This field is now only returned in the PackageDetailsType. Deprecated in 13.11.
   */
  versions?: Maybe<PackageConnection>;
};


/** Represents a package in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackagePipelinesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a package in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageTagsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a package in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageVersionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Represents a composer JSON file */
export type PackageComposerJsonType = {
  __typename?: 'PackageComposerJsonType';
  /** License set in the Composer JSON file. */
  license?: Maybe<Scalars['String']>;
  /** Name set in the Composer JSON file. */
  name?: Maybe<Scalars['String']>;
  /** Type set in the Composer JSON file. */
  type?: Maybe<Scalars['String']>;
  /** Version set in the Composer JSON file. */
  version?: Maybe<Scalars['String']>;
};

/** The connection type for Package. */
export type PackageConnection = {
  __typename?: 'PackageConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PackageEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Package>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Represents a package dependency. */
export type PackageDependency = {
  __typename?: 'PackageDependency';
  /** ID of the dependency. */
  id: Scalars['PackagesDependencyID'];
  /** Name of the dependency. */
  name: Scalars['String'];
  /** Version pattern of the dependency. */
  versionPattern: Scalars['String'];
};

/** Represents a package dependency link */
export type PackageDependencyLink = {
  __typename?: 'PackageDependencyLink';
  /** Dependency. */
  dependency?: Maybe<PackageDependency>;
  /** Dependency type. */
  dependencyType: PackageDependencyType;
  /** ID of the dependency link. */
  id: Scalars['PackagesDependencyLinkID'];
  /** Dependency link metadata. */
  metadata?: Maybe<DependencyLinkMetadata>;
};

/** The connection type for PackageDependencyLink. */
export type PackageDependencyLinkConnection = {
  __typename?: 'PackageDependencyLinkConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PackageDependencyLinkEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PackageDependencyLink>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PackageDependencyLinkEdge = {
  __typename?: 'PackageDependencyLinkEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PackageDependencyLink>;
};

export type PackageDependencyType =
  /** bundleDependencies dependency type */
  | 'BUNDLE_DEPENDENCIES'
  /** dependencies dependency type */
  | 'DEPENDENCIES'
  /** devDependencies dependency type */
  | 'DEV_DEPENDENCIES'
  /** peerDependencies dependency type */
  | 'PEER_DEPENDENCIES';

/** Represents a package details in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageDetailsType = {
  __typename?: 'PackageDetailsType';
  /** Whether the user can destroy the package. */
  canDestroy: Scalars['Boolean'];
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** Dependency link. */
  dependencyLinks?: Maybe<PackageDependencyLinkConnection>;
  /** ID of the package. */
  id: Scalars['PackagesPackageID'];
  /** Package metadata. */
  metadata?: Maybe<PackageMetadata>;
  /** Name of the package. */
  name: Scalars['String'];
  /** Package files. */
  packageFiles?: Maybe<PackageFileConnection>;
  /** Package type. */
  packageType: PackageTypeEnum;
  /** Pipelines that built the package. */
  pipelines?: Maybe<PipelineConnection>;
  /** Project where the package is stored. */
  project: Project;
  /** Package status. */
  status: PackageStatus;
  /** Package tags. */
  tags?: Maybe<PackageTagConnection>;
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
  /** Version string. */
  version?: Maybe<Scalars['String']>;
  /** Other versions of the package. */
  versions?: Maybe<PackageConnection>;
};


/** Represents a package details in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageDetailsTypeDependencyLinksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a package details in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageDetailsTypePackageFilesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a package details in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageDetailsTypePipelinesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a package details in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageDetailsTypeTagsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a package details in the Package Registry. Note that this type is in beta and susceptible to changes */
export type PackageDetailsTypeVersionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** An edge in a connection. */
export type PackageEdge = {
  __typename?: 'PackageEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Package>;
};

/** Represents a package file */
export type PackageFile = {
  __typename?: 'PackageFile';
  /** Created date. */
  createdAt: Scalars['Time'];
  /** Download path of the package file. */
  downloadPath: Scalars['String'];
  /** Md5 of the package file. */
  fileMd5?: Maybe<Scalars['String']>;
  /** File metadata. */
  fileMetadata?: Maybe<PackageFileMetadata>;
  /** Name of the package file. */
  fileName: Scalars['String'];
  /** Sha1 of the package file. */
  fileSha1?: Maybe<Scalars['String']>;
  /** Sha256 of the package file. */
  fileSha256?: Maybe<Scalars['String']>;
  /** ID of the file. */
  id: Scalars['PackagesPackageFileID'];
  /** Size of the package file. */
  size: Scalars['String'];
  /** Updated date. */
  updatedAt: Scalars['Time'];
};

/** The connection type for PackageFile. */
export type PackageFileConnection = {
  __typename?: 'PackageFileConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PackageFileEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PackageFile>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PackageFileEdge = {
  __typename?: 'PackageFileEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PackageFile>;
};

/** Represents metadata associated with a Package file */
export type PackageFileMetadata = {
  /** Date of creation. */
  createdAt: Scalars['Time'];
  /** Date of most recent update. */
  updatedAt: Scalars['Time'];
};

/** Represents the Geo sync and verification state of a package file */
export type PackageFileRegistry = {
  __typename?: 'PackageFileRegistry';
  /** Timestamp when the PackageFileRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the PackageFileRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the PackageFileRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the PackageFileRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** ID of the PackageFile. */
  packageFileId: Scalars['ID'];
  /** Timestamp after which the PackageFileRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the PackageFileRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the PackageFileRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for PackageFileRegistry. */
export type PackageFileRegistryConnection = {
  __typename?: 'PackageFileRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PackageFileRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PackageFileRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PackageFileRegistryEdge = {
  __typename?: 'PackageFileRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PackageFileRegistry>;
};

/** Values for sorting group packages */
export type PackageGroupSort =
  /** Ordered by created_at in ascending order. */
  | 'CREATED_ASC'
  /** Ordered by created_at in descending order. */
  | 'CREATED_DESC'
  /** Ordered by name in ascending order. */
  | 'NAME_ASC'
  /** Ordered by name in descending order. */
  | 'NAME_DESC'
  /** Ordered by project path in ascending order. */
  | 'PROJECT_PATH_ASC'
  /** Ordered by project path in descending order. */
  | 'PROJECT_PATH_DESC'
  /** Ordered by type in ascending order. */
  | 'TYPE_ASC'
  /** Ordered by type in descending order. */
  | 'TYPE_DESC'
  /** Ordered by version in ascending order. */
  | 'VERSION_ASC'
  /** Ordered by version in descending order. */
  | 'VERSION_DESC';

/** Represents metadata associated with a Package */
export type PackageMetadata = ComposerMetadata | ConanMetadata | MavenMetadata | NugetMetadata | PypiMetadata;

/** Namespace-level Package Registry settings */
export type PackageSettings = {
  __typename?: 'PackageSettings';
  /**
   * When generic_duplicates_allowed is false, you can publish duplicate packages
   * with names that match this regex. Otherwise, this setting has no effect.
   */
  genericDuplicateExceptionRegex?: Maybe<Scalars['UntrustedRegexp']>;
  /** Indicates whether duplicate generic packages are allowed for this namespace. */
  genericDuplicatesAllowed: Scalars['Boolean'];
  /**
   * When maven_duplicates_allowed is false, you can publish duplicate packages
   * with names that match this regex. Otherwise, this setting has no effect.
   */
  mavenDuplicateExceptionRegex?: Maybe<Scalars['UntrustedRegexp']>;
  /** Indicates whether duplicate Maven packages are allowed for this namespace. */
  mavenDuplicatesAllowed: Scalars['Boolean'];
};

/** Values for sorting package */
export type PackageSort =
  /** Ordered by created_at in ascending order. */
  | 'CREATED_ASC'
  /** Ordered by created_at in descending order. */
  | 'CREATED_DESC'
  /** Ordered by name in ascending order. */
  | 'NAME_ASC'
  /** Ordered by name in descending order. */
  | 'NAME_DESC'
  /** Ordered by type in ascending order. */
  | 'TYPE_ASC'
  /** Ordered by type in descending order. */
  | 'TYPE_DESC'
  /** Ordered by version in ascending order. */
  | 'VERSION_ASC'
  /** Ordered by version in descending order. */
  | 'VERSION_DESC';

export type PackageStatus =
  /** Packages with a default status */
  | 'DEFAULT'
  /** Packages with a error status */
  | 'ERROR'
  /** Packages with a hidden status */
  | 'HIDDEN'
  /** Packages with a processing status */
  | 'PROCESSING';

/** Represents a package tag */
export type PackageTag = {
  __typename?: 'PackageTag';
  /** Created date. */
  createdAt: Scalars['Time'];
  /** ID of the tag. */
  id: Scalars['ID'];
  /** Name of the tag. */
  name: Scalars['String'];
  /** Updated date. */
  updatedAt: Scalars['Time'];
};

/** The connection type for PackageTag. */
export type PackageTagConnection = {
  __typename?: 'PackageTagConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PackageTagEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PackageTag>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PackageTagEdge = {
  __typename?: 'PackageTagEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PackageTag>;
};

export type PackageTypeEnum =
  /** Packages from the Composer package manager */
  | 'COMPOSER'
  /** Packages from the Conan package manager */
  | 'CONAN'
  /** Packages from the Debian package manager */
  | 'DEBIAN'
  /** Packages from the Generic package manager */
  | 'GENERIC'
  /** Packages from the Golang package manager */
  | 'GOLANG'
  /** Packages from the Helm package manager */
  | 'HELM'
  /** Packages from the Maven package manager */
  | 'MAVEN'
  /** Packages from the npm package manager */
  | 'NPM'
  /** Packages from the Nuget package manager */
  | 'NUGET'
  /** Packages from the PyPI package manager */
  | 'PYPI'
  /** Packages from the Rubygems package manager */
  | 'RUBYGEMS'
  /** Packages from the Terraform Module package manager */
  | 'TERRAFORM_MODULE';

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

/** Represents the Geo replication and verification state of a pages_deployment */
export type PagesDeploymentRegistry = {
  __typename?: 'PagesDeploymentRegistry';
  /** Timestamp when the PagesDeploymentRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the PagesDeploymentRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the PagesDeploymentRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the PagesDeploymentRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** ID of the Pages Deployment. */
  pagesDeploymentId: Scalars['ID'];
  /** Timestamp after which the PagesDeploymentRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the PagesDeploymentRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the PagesDeploymentRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for PagesDeploymentRegistry. */
export type PagesDeploymentRegistryConnection = {
  __typename?: 'PagesDeploymentRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PagesDeploymentRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PagesDeploymentRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PagesDeploymentRegistryEdge = {
  __typename?: 'PagesDeploymentRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PagesDeploymentRegistry>;
};

/** Represents a file or directory in the project repository that has been locked. */
export type PathLock = {
  __typename?: 'PathLock';
  /** ID of the path lock. */
  id: Scalars['PathLockID'];
  /** Locked path. */
  path?: Maybe<Scalars['String']>;
  /** User that has locked this path. */
  user?: Maybe<UserCore>;
};

/** The connection type for PathLock. */
export type PathLockConnection = {
  __typename?: 'PathLockConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PathLockEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PathLock>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PathLockEdge = {
  __typename?: 'PathLockEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PathLock>;
};

export type Pipeline = {
  __typename?: 'Pipeline';
  /** Indicates if the pipeline is active. */
  active: Scalars['Boolean'];
  /** Base SHA of the source branch. */
  beforeSha?: Maybe<Scalars['String']>;
  /** Specifies if a pipeline can be canceled. */
  cancelable: Scalars['Boolean'];
  /** Code Quality degradations reported on the pipeline. */
  codeQualityReports?: Maybe<CodeQualityDegradationConnection>;
  /** Path to the commit that triggered the pipeline. */
  commitPath?: Maybe<Scalars['String']>;
  /** Timestamp of the pipeline's commit. */
  committedAt?: Maybe<Scalars['Time']>;
  /** Indicates if a pipeline is complete. */
  complete: Scalars['Boolean'];
  /**
   * Configuration source of the pipeline (UNKNOWN_SOURCE, REPOSITORY_SOURCE,
   * AUTO_DEVOPS_SOURCE, WEBIDE_SOURCE, REMOTE_SOURCE, EXTERNAL_PROJECT_SOURCE,
   * BRIDGE_SOURCE, PARAMETER_SOURCE, COMPLIANCE_SOURCE)
   */
  configSource?: Maybe<PipelineConfigSourceEnum>;
  /** Coverage percentage. */
  coverage?: Maybe<Scalars['Float']>;
  /** Timestamp of the pipeline's creation. */
  createdAt: Scalars['Time'];
  /** DAST profile associated with the pipeline. Returns `null`if `dast_view_scans` feature flag is disabled. */
  dastProfile?: Maybe<DastProfile>;
  /** Detailed status of the pipeline. */
  detailedStatus: DetailedStatus;
  /** Pipelines this pipeline will trigger. */
  downstream?: Maybe<PipelineConnection>;
  /** Duration of the pipeline in seconds. */
  duration?: Maybe<Scalars['Int']>;
  /** Timestamp of the pipeline's completion. */
  finishedAt?: Maybe<Scalars['Time']>;
  /** ID of the pipeline. */
  id: Scalars['ID'];
  /** Internal ID of the pipeline. */
  iid: Scalars['String'];
  /** Specific job in this pipeline, either by name or ID. */
  job?: Maybe<CiJob>;
  /** Jobs belonging to the pipeline. */
  jobs?: Maybe<CiJobConnection>;
  /** Relative path to the pipeline's page. */
  path?: Maybe<Scalars['String']>;
  /** Project the pipeline belongs to. */
  project?: Maybe<Project>;
  /** How long the pipeline was queued before starting. */
  queuedDuration?: Maybe<Scalars['Duration']>;
  /** Reference to the branch from which the pipeline was triggered. */
  ref?: Maybe<Scalars['String']>;
  /** Specifies if a pipeline can be retried. */
  retryable: Scalars['Boolean'];
  /** Vulnerability findings reported on the pipeline. */
  securityReportFindings?: Maybe<PipelineSecurityReportFindingConnection>;
  /** Vulnerability and scanned resource counts for each security scanner of the pipeline. */
  securityReportSummary?: Maybe<SecurityReportSummary>;
  /** SHA of the pipeline's commit. */
  sha: Scalars['String'];
  /** Job where pipeline was triggered from. */
  sourceJob?: Maybe<CiJob>;
  /** Stages of the pipeline. */
  stages?: Maybe<CiStageConnection>;
  /** Timestamp when the pipeline was started. */
  startedAt?: Maybe<Scalars['Time']>;
  /**
   * Status of the pipeline (CREATED, WAITING_FOR_RESOURCE, PREPARING, PENDING,
   * RUNNING, FAILED, SUCCESS, CANCELED, SKIPPED, MANUAL, SCHEDULED)
   */
  status: PipelineStatusEnum;
  /** Summary of the test report generated by the pipeline. */
  testReportSummary: TestReportSummary;
  /** A specific test suite in a pipeline test report. */
  testSuite?: Maybe<TestSuite>;
  /** Timestamp of the pipeline's last activity. */
  updatedAt: Scalars['Time'];
  /** Pipeline that triggered the pipeline. */
  upstream?: Maybe<Pipeline>;
  /** Pipeline user. */
  user?: Maybe<UserCore>;
  /** Permissions for the current user on the resource */
  userPermissions: PipelinePermissions;
  /** Indicates if the pipeline has jobs with `needs` dependencies. */
  usesNeeds?: Maybe<Scalars['Boolean']>;
  /** Indicates if a pipeline has warnings. */
  warnings: Scalars['Boolean'];
};


export type PipelineCodeQualityReportsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type PipelineDownstreamArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type PipelineJobArgs = {
  id?: InputMaybe<Scalars['JobID']>;
  name?: InputMaybe<Scalars['String']>;
};


export type PipelineJobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  securityReportTypes?: InputMaybe<Array<SecurityReportTypeEnum>>;
  statuses?: InputMaybe<Array<CiJobStatus>>;
};


export type PipelineSecurityReportFindingsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  reportType?: InputMaybe<Array<Scalars['String']>>;
  scanner?: InputMaybe<Array<Scalars['String']>>;
  severity?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<Array<VulnerabilityState>>;
};


export type PipelineStagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type PipelineTestSuiteArgs = {
  buildIds: Array<Scalars['ID']>;
};

export type PipelineAnalytics = {
  __typename?: 'PipelineAnalytics';
  /** Labels for the monthly pipeline count. */
  monthPipelinesLabels?: Maybe<Array<Scalars['String']>>;
  /** Total monthly successful pipeline count. */
  monthPipelinesSuccessful?: Maybe<Array<Scalars['Int']>>;
  /** Total monthly pipeline count. */
  monthPipelinesTotals?: Maybe<Array<Scalars['Int']>>;
  /** Pipeline times labels. */
  pipelineTimesLabels?: Maybe<Array<Scalars['String']>>;
  /** Pipeline times. */
  pipelineTimesValues?: Maybe<Array<Scalars['Int']>>;
  /** Labels for the weekly pipeline count. */
  weekPipelinesLabels?: Maybe<Array<Scalars['String']>>;
  /** Total weekly successful pipeline count. */
  weekPipelinesSuccessful?: Maybe<Array<Scalars['Int']>>;
  /** Total weekly pipeline count. */
  weekPipelinesTotals?: Maybe<Array<Scalars['Int']>>;
  /** Labels for the yearly pipeline count. */
  yearPipelinesLabels?: Maybe<Array<Scalars['String']>>;
  /** Total yearly successful pipeline count. */
  yearPipelinesSuccessful?: Maybe<Array<Scalars['Int']>>;
  /** Total yearly pipeline count. */
  yearPipelinesTotals?: Maybe<Array<Scalars['Int']>>;
};

/** Represents the Geo sync and verification state of a pipeline artifact */
export type PipelineArtifactRegistry = {
  __typename?: 'PipelineArtifactRegistry';
  /** Timestamp when the PipelineArtifactRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the PipelineArtifactRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the PipelineArtifactRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the PipelineArtifactRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** ID of the pipeline artifact. */
  pipelineArtifactId: Scalars['ID'];
  /** Timestamp after which the PipelineArtifactRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the PipelineArtifactRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the PipelineArtifactRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for PipelineArtifactRegistry. */
export type PipelineArtifactRegistryConnection = {
  __typename?: 'PipelineArtifactRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PipelineArtifactRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PipelineArtifactRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PipelineArtifactRegistryEdge = {
  __typename?: 'PipelineArtifactRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PipelineArtifactRegistry>;
};

/** Autogenerated input type of PipelineCancel */
export type PipelineCancelInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the pipeline to mutate. */
  id: Scalars['CiPipelineID'];
};

/** Autogenerated return type of PipelineCancel */
export type PipelineCancelPayload = {
  __typename?: 'PipelineCancelPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type PipelineConfigSourceEnum =
  /** Auto DevOps source. */
  | 'AUTO_DEVOPS_SOURCE'
  /** Bridge source. */
  | 'BRIDGE_SOURCE'
  /** Compliance source. */
  | 'COMPLIANCE_SOURCE'
  /** External project source. */
  | 'EXTERNAL_PROJECT_SOURCE'
  /** Parameter source. */
  | 'PARAMETER_SOURCE'
  /** Remote source. */
  | 'REMOTE_SOURCE'
  /** Repository source. */
  | 'REPOSITORY_SOURCE'
  /** Unknown source. */
  | 'UNKNOWN_SOURCE'
  /** Webide source. */
  | 'WEBIDE_SOURCE';

/** The connection type for Pipeline. */
export type PipelineConnection = {
  __typename?: 'PipelineConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PipelineEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Pipeline>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of PipelineDestroy */
export type PipelineDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the pipeline to mutate. */
  id: Scalars['CiPipelineID'];
};

/** Autogenerated return type of PipelineDestroy */
export type PipelineDestroyPayload = {
  __typename?: 'PipelineDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type PipelineEdge = {
  __typename?: 'PipelineEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Pipeline>;
};

export type PipelinePermissions = {
  __typename?: 'PipelinePermissions';
  /** Indicates the user can perform `admin_pipeline` on this resource */
  adminPipeline: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_pipeline` on this resource */
  destroyPipeline: Scalars['Boolean'];
  /** Indicates the user can perform `update_pipeline` on this resource */
  updatePipeline: Scalars['Boolean'];
};

/** Autogenerated input type of PipelineRetry */
export type PipelineRetryInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the pipeline to mutate. */
  id: Scalars['CiPipelineID'];
};

/** Autogenerated return type of PipelineRetry */
export type PipelineRetryPayload = {
  __typename?: 'PipelineRetryPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Pipeline after mutation. */
  pipeline?: Maybe<Pipeline>;
};

/** Represents vulnerability finding of a security report on the pipeline. */
export type PipelineSecurityReportFinding = {
  __typename?: 'PipelineSecurityReportFinding';
  /** Type of the security report that found the vulnerability. */
  confidence?: Maybe<Scalars['String']>;
  /** Description of the vulnerability finding. */
  description?: Maybe<Scalars['String']>;
  /** Indicates whether the vulnerability is a false positive. */
  falsePositive?: Maybe<Scalars['Boolean']>;
  /** Identifiers of the vulnerabilit finding. */
  identifiers: Array<VulnerabilityIdentifier>;
  /** Location metadata for the vulnerability. Its fields depend on the type of security scan that found the vulnerability. */
  location?: Maybe<VulnerabilityLocation>;
  /** Name of the vulnerability finding. */
  name?: Maybe<Scalars['String']>;
  /** Project on which the vulnerability finding was found. */
  project?: Maybe<Project>;
  /** Name of the vulnerability finding. */
  projectFingerprint?: Maybe<Scalars['String']>;
  /** Type of the security report that found the vulnerability finding. */
  reportType?: Maybe<VulnerabilityReportType>;
  /** Scanner metadata for the vulnerability. */
  scanner?: Maybe<VulnerabilityScanner>;
  /** Severity of the vulnerability finding. */
  severity?: Maybe<VulnerabilitySeverity>;
  /** URL to the vulnerability's details page. */
  solution?: Maybe<Scalars['String']>;
  /** Finding status. */
  state?: Maybe<VulnerabilityState>;
  /** Name of the vulnerability finding. */
  uuid?: Maybe<Scalars['String']>;
};

/** The connection type for PipelineSecurityReportFinding. */
export type PipelineSecurityReportFindingConnection = {
  __typename?: 'PipelineSecurityReportFindingConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<PipelineSecurityReportFindingEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<PipelineSecurityReportFinding>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PipelineSecurityReportFindingEdge = {
  __typename?: 'PipelineSecurityReportFindingEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PipelineSecurityReportFinding>;
};

export type PipelineStatusEnum =
  /** Pipeline was canceled before completion. */
  | 'CANCELED'
  /** Pipeline has been created. */
  | 'CREATED'
  /** At least one stage of the pipeline failed. */
  | 'FAILED'
  /** Pipeline needs to be manually started. */
  | 'MANUAL'
  /** Pipeline has not started running yet. */
  | 'PENDING'
  /** Pipeline is preparing to run. */
  | 'PREPARING'
  /** Pipeline is running. */
  | 'RUNNING'
  /** Pipeline is scheduled to run. */
  | 'SCHEDULED'
  /** Pipeline was skipped. */
  | 'SKIPPED'
  /** Pipeline completed successfully. */
  | 'SUCCESS'
  /** A resource (for example, a runner) that the pipeline requires to run is unavailable. */
  | 'WAITING_FOR_RESOURCE';

export type Project = {
  __typename?: 'Project';
  /** Size limit for the repository in bytes. */
  actualRepositorySizeLimit?: Maybe<Scalars['Float']>;
  /** Agent configurations defined by the project */
  agentConfigurations?: Maybe<AgentConfigurationConnection>;
  /** A single Alert Management alert of the project. */
  alertManagementAlert?: Maybe<AlertManagementAlert>;
  /** Counts of alerts by status for the project. */
  alertManagementAlertStatusCounts?: Maybe<AlertManagementAlertStatusCountsType>;
  /** Alert Management alerts of the project. */
  alertManagementAlerts?: Maybe<AlertManagementAlertConnection>;
  /** HTTP Integrations which can receive alerts for the project. */
  alertManagementHttpIntegrations?: Maybe<AlertManagementHttpIntegrationConnection>;
  /** Integrations which can receive alerts for the project. */
  alertManagementIntegrations?: Maybe<AlertManagementIntegrationConnection>;
  /** Extract alert fields from payload for custom mapping. */
  alertManagementPayloadFields?: Maybe<Array<AlertManagementPayloadAlertField>>;
  /**
   * If `only_allow_merge_if_pipeline_succeeds` is true, indicates if merge
   * requests of the project can also be merged with skipped jobs.
   */
  allowMergeOnSkippedPipeline?: Maybe<Scalars['Boolean']>;
  /** API fuzzing configuration for the project.  */
  apiFuzzingCiConfiguration?: Maybe<ApiFuzzingCiConfiguration>;
  /** Indicates the archived status of the project. */
  archived?: Maybe<Scalars['Boolean']>;
  /** Indicates if issues referenced by merge requests and commits within the default branch are closed automatically. */
  autocloseReferencedIssues?: Maybe<Scalars['Boolean']>;
  /** URL to avatar image file of the project. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** A single board of the project. */
  board?: Maybe<Board>;
  /** Boards of the project. */
  boards?: Maybe<BoardConnection>;
  /** CI/CD settings for the project. */
  ciCdSettings?: Maybe<ProjectCiCdSetting>;
  /** The CI Job Tokens scope of access. */
  ciJobTokenScope?: Maybe<CiJobTokenScopeType>;
  /** Find a single CI/CD template by name. */
  ciTemplate?: Maybe<CiTemplate>;
  /** Find a single cluster agent by name. */
  clusterAgent?: Maybe<ClusterAgent>;
  /** Cluster agents associated with the project. */
  clusterAgents?: Maybe<ClusterAgentConnection>;
  /** Code coverage summary associated with the project. */
  codeCoverageSummary?: Maybe<CodeCoverageSummary>;
  /** Compliance frameworks associated with the project. */
  complianceFrameworks?: Maybe<ComplianceFrameworkConnection>;
  /** Container expiration policy of the project. */
  containerExpirationPolicy?: Maybe<ContainerExpirationPolicy>;
  /** Indicates if Container Registry is enabled for the current user */
  containerRegistryEnabled?: Maybe<Scalars['Boolean']>;
  /** Container repositories of the project. */
  containerRepositories?: Maybe<ContainerRepositoryConnection>;
  /** Number of container repositories in the project. */
  containerRepositoriesCount: Scalars['Int'];
  /** Timestamp of the project creation. */
  createdAt?: Maybe<Scalars['Time']>;
  /** DAST Profile associated with the project. */
  dastProfile?: Maybe<DastProfile>;
  /** DAST Profiles associated with the project. */
  dastProfiles?: Maybe<DastProfileConnection>;
  /** DAST scanner profiles associated with the project. */
  dastScannerProfiles?: Maybe<DastScannerProfileConnection>;
  /** DAST Site Profile associated with the project. */
  dastSiteProfile?: Maybe<DastSiteProfile>;
  /** DAST Site Profiles associated with the project. */
  dastSiteProfiles?: Maybe<DastSiteProfileConnection>;
  /** DAST Site Validations associated with the project. */
  dastSiteValidations?: Maybe<DastSiteValidationConnection>;
  /** Short description of the project. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Project's DORA metrics. */
  dora?: Maybe<Dora>;
  /** A single environment of the project. */
  environment?: Maybe<Environment>;
  /** Environments of the project. */
  environments?: Maybe<EnvironmentConnection>;
  /** Number of times the project has been forked. */
  forksCount: Scalars['Int'];
  /** Full path of the project. */
  fullPath: Scalars['ID'];
  /** Grafana integration details for the project. */
  grafanaIntegration?: Maybe<GrafanaIntegration>;
  /** Group of the project. */
  group?: Maybe<Group>;
  /** URL to connect to the project via HTTPS. */
  httpUrlToRepo?: Maybe<Scalars['String']>;
  /** ID of the project. */
  id: Scalars['ID'];
  /** Status of import background job of the project. */
  importStatus?: Maybe<Scalars['String']>;
  /** Incident Management escalation policies of the project. */
  incidentManagementEscalationPolicies?: Maybe<EscalationPolicyTypeConnection>;
  /** Incident Management escalation policy of the project. */
  incidentManagementEscalationPolicy?: Maybe<EscalationPolicyType>;
  /** Incident Management On-call schedules of the project. */
  incidentManagementOncallSchedules?: Maybe<IncidentManagementOncallScheduleConnection>;
  /** A single issue of the project. */
  issue?: Maybe<Issue>;
  /** Counts of issues by status for the project. */
  issueStatusCounts?: Maybe<IssueStatusCountsType>;
  /** Issues of the project. */
  issues?: Maybe<IssueConnection>;
  /** Indicates if Issues are enabled for the current user */
  issuesEnabled?: Maybe<Scalars['Boolean']>;
  /** Find iteration cadences. */
  iterationCadences?: Maybe<IterationCadenceConnection>;
  /** Find iterations. */
  iterations?: Maybe<IterationConnection>;
  /** Status of Jira import background job of the project. */
  jiraImportStatus?: Maybe<Scalars['String']>;
  /** Jira imports into the project. */
  jiraImports?: Maybe<JiraImportConnection>;
  /** Jobs of a project. This field can only be resolved for one project in any single request. */
  jobs?: Maybe<CiJobConnection>;
  /** Indicates if CI/CD pipeline jobs are enabled for the current user. */
  jobsEnabled?: Maybe<Scalars['Boolean']>;
  /** Label available on this project. */
  label?: Maybe<Label>;
  /** Labels available on this project. */
  labels?: Maybe<LabelConnection>;
  /** Timestamp of the project last activity. */
  lastActivityAt?: Maybe<Scalars['Time']>;
  /** Indicates if the project has Large File Storage (LFS) enabled. */
  lfsEnabled?: Maybe<Scalars['Boolean']>;
  /** A single merge request of the project. */
  mergeRequest?: Maybe<MergeRequest>;
  /** Merge requests of the project. */
  mergeRequests?: Maybe<MergeRequestConnection>;
  /** Indicates if Merge Requests are enabled for the current user */
  mergeRequestsEnabled?: Maybe<Scalars['Boolean']>;
  /**
   * Indicates if no merge commits should be created and all merges should instead
   * be fast-forwarded, which means that merging is only allowed if the branch
   * could be fast-forwarded.
   */
  mergeRequestsFfOnlyEnabled?: Maybe<Scalars['Boolean']>;
  /** Milestones of the project. */
  milestones?: Maybe<MilestoneConnection>;
  /** Name of the project (without namespace). */
  name: Scalars['String'];
  /** Full name of the project with its namespace. */
  nameWithNamespace: Scalars['String'];
  /** Namespace of the project. */
  namespace?: Maybe<Namespace>;
  /** Network Policies of the project */
  networkPolicies?: Maybe<NetworkPolicyConnection>;
  /** Indicates if merge requests of the project can only be merged when all the discussions are resolved. */
  onlyAllowMergeIfAllDiscussionsAreResolved?: Maybe<Scalars['Boolean']>;
  /** Indicates if merge requests of the project can only be merged with successful jobs. */
  onlyAllowMergeIfPipelineSucceeds?: Maybe<Scalars['Boolean']>;
  /** Number of open issues for the project. */
  openIssuesCount?: Maybe<Scalars['Int']>;
  /** Packages of the project. */
  packages?: Maybe<PackageConnection>;
  /** Path of the project. */
  path: Scalars['String'];
  /** The project's path locks. */
  pathLocks?: Maybe<PathLockConnection>;
  /** Build pipeline of the project. */
  pipeline?: Maybe<Pipeline>;
  /** Pipeline analytics. */
  pipelineAnalytics?: Maybe<PipelineAnalytics>;
  /** Build pipelines of the project. */
  pipelines?: Maybe<PipelineConnection>;
  /**
   * Indicates if a link to create or view a merge request should display after a
   * push to Git repositories of the project from the command line.
   */
  printingMergeRequestLinkEnabled?: Maybe<Scalars['Boolean']>;
  /** Members of the project. */
  projectMembers?: Maybe<MemberInterfaceConnection>;
  /** Indicates if there is public access to pipelines and job details of the project, including output logs and artifacts. */
  publicJobs?: Maybe<Scalars['Boolean']>;
  /** Project's push rules settings. */
  pushRules?: Maybe<PushRules>;
  /** A single release of the project. */
  release?: Maybe<Release>;
  /** Releases of the project. */
  releases?: Maybe<ReleaseConnection>;
  /** Indicates if `Delete source branch` option should be enabled by default for all new merge requests of the project. */
  removeSourceBranchAfterMerge?: Maybe<Scalars['Boolean']>;
  /** Git repository of the project. */
  repository?: Maybe<Repository>;
  /** Size of repository that exceeds the limit in bytes. */
  repositorySizeExcess?: Maybe<Scalars['Float']>;
  /** Indicates if users can request member access to the project. */
  requestAccessEnabled?: Maybe<Scalars['Boolean']>;
  /** Find a single requirement. */
  requirement?: Maybe<Requirement>;
  /** Number of requirements for the project by their state. */
  requirementStatesCount?: Maybe<RequirementStatesCount>;
  /** Find requirements. */
  requirements?: Maybe<RequirementConnection>;
  /** SAST CI configuration for the project. */
  sastCiConfiguration?: Maybe<SastCiConfiguration>;
  /** Scan Execution Policies of the project */
  scanExecutionPolicies?: Maybe<ScanExecutionPolicyConnection>;
  /** Path to project's security dashboard. */
  securityDashboardPath?: Maybe<Scalars['String']>;
  /** Information about security analyzers used in the project. */
  securityScanners?: Maybe<SecurityScanners>;
  /** Detailed version of a Sentry error on the project. */
  sentryDetailedError?: Maybe<SentryDetailedError>;
  /** Paginated collection of Sentry errors on the project. */
  sentryErrors?: Maybe<SentryErrorCollection>;
  /** E-mail address of the service desk. */
  serviceDeskAddress?: Maybe<Scalars['String']>;
  /** Indicates if the project has service desk enabled. */
  serviceDeskEnabled?: Maybe<Scalars['Boolean']>;
  /** Project services. */
  services?: Maybe<ServiceConnection>;
  /** Indicates if shared runners are enabled for the project. */
  sharedRunnersEnabled?: Maybe<Scalars['Boolean']>;
  /** Snippets of the project. */
  snippets?: Maybe<SnippetConnection>;
  /** Indicates if Snippets are enabled for the current user */
  snippetsEnabled?: Maybe<Scalars['Boolean']>;
  /** Indicates if `squashReadOnly` is enabled. */
  squashReadOnly: Scalars['Boolean'];
  /** URL to connect to the project via SSH. */
  sshUrlToRepo?: Maybe<Scalars['String']>;
  /** Number of times the project has been starred. */
  starCount: Scalars['Int'];
  /** Statistics of the project. */
  statistics?: Maybe<ProjectStatistics>;
  /** Commit message used to apply merge request suggestions. */
  suggestionCommitMessage?: Maybe<Scalars['String']>;
  /**
   * List of project topics (not Git tags). Deprecated in 13.12: Use `topics`.
   * @deprecated Use `topics`. Deprecated in 13.12.
   */
  tagList?: Maybe<Scalars['String']>;
  /** Find a single Terraform state by name. */
  terraformState?: Maybe<TerraformState>;
  /** Terraform states associated with the project. */
  terraformStates?: Maybe<TerraformStateConnection>;
  /** Time logged on issues and merge requests in the project. */
  timelogs?: Maybe<TimelogConnection>;
  /** List of project topics. */
  topics?: Maybe<Array<Scalars['String']>>;
  /** Permissions for the current user on the resource */
  userPermissions: ProjectPermissions;
  /** Visibility of the project. */
  visibility?: Maybe<Scalars['String']>;
  /** Vulnerabilities reported on the project. */
  vulnerabilities?: Maybe<VulnerabilityConnection>;
  /** The historical number of vulnerabilities per day for the project. */
  vulnerabilitiesCountByDay?: Maybe<VulnerabilitiesCountByDayConnection>;
  /** Vulnerability scanners reported on the project vulnerabilities. */
  vulnerabilityScanners?: Maybe<VulnerabilityScannerConnection>;
  /** Counts for each vulnerability severity in the project. */
  vulnerabilitySeveritiesCount?: Maybe<VulnerabilitySeveritiesCount>;
  /** Web URL of the project. */
  webUrl?: Maybe<Scalars['String']>;
  /** Indicates if Wikis are enabled for the current user */
  wikiEnabled?: Maybe<Scalars['Boolean']>;
};


export type ProjectAgentConfigurationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectAlertManagementAlertArgs = {
  assigneeUsername?: InputMaybe<Scalars['String']>;
  domain?: AlertManagementDomainFilter;
  iid?: InputMaybe<Scalars['String']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<AlertManagementAlertSort>;
  statuses?: InputMaybe<Array<AlertManagementStatus>>;
};


export type ProjectAlertManagementAlertStatusCountsArgs = {
  assigneeUsername?: InputMaybe<Scalars['String']>;
  search?: InputMaybe<Scalars['String']>;
};


export type ProjectAlertManagementAlertsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  domain?: AlertManagementDomainFilter;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['String']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<AlertManagementAlertSort>;
  statuses?: InputMaybe<Array<AlertManagementStatus>>;
};


export type ProjectAlertManagementHttpIntegrationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['AlertManagementHttpIntegrationID']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectAlertManagementIntegrationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['GlobalID']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectAlertManagementPayloadFieldsArgs = {
  payloadExample: Scalars['String'];
};


export type ProjectBoardArgs = {
  id: Scalars['BoardID'];
};


export type ProjectBoardsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['BoardID']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectCiTemplateArgs = {
  name: Scalars['String'];
};


export type ProjectClusterAgentArgs = {
  name: Scalars['String'];
};


export type ProjectClusterAgentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectComplianceFrameworksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectContainerRepositoriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<ContainerRepositorySort>;
};


export type ProjectDastProfileArgs = {
  id: Scalars['DastProfileID'];
};


export type ProjectDastProfilesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectDastScannerProfilesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectDastSiteProfileArgs = {
  id: Scalars['DastSiteProfileID'];
};


export type ProjectDastSiteProfilesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectDastSiteValidationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  normalizedTargetUrls?: InputMaybe<Array<Scalars['String']>>;
  status?: InputMaybe<DastSiteValidationStatusEnum>;
};


export type ProjectEnvironmentArgs = {
  name?: InputMaybe<Scalars['String']>;
  search?: InputMaybe<Scalars['String']>;
  states?: InputMaybe<Array<Scalars['String']>>;
};


export type ProjectEnvironmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
  search?: InputMaybe<Scalars['String']>;
  states?: InputMaybe<Array<Scalars['String']>>;
};


export type ProjectIncidentManagementEscalationPoliciesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectIncidentManagementEscalationPolicyArgs = {
  id: Scalars['IncidentManagementEscalationPolicyID'];
};


export type ProjectIncidentManagementOncallSchedulesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectIssueArgs = {
  assigneeId?: InputMaybe<Scalars['String']>;
  assigneeUsernames?: InputMaybe<Array<Scalars['String']>>;
  authorUsername?: InputMaybe<Scalars['String']>;
  closedAfter?: InputMaybe<Scalars['Time']>;
  closedBefore?: InputMaybe<Scalars['Time']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  epicId?: InputMaybe<Scalars['String']>;
  iid?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  includeSubepics?: InputMaybe<Scalars['Boolean']>;
  iterationId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  iterationWildcardId?: InputMaybe<IterationWildcardId>;
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneTitle?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneWildcardId?: InputMaybe<MilestoneWildcardId>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedIssueFilterInput>;
  releaseTag?: InputMaybe<Array<Scalars['String']>>;
  releaseTagWildcardId?: InputMaybe<ReleaseTagWildcardId>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<IssueSort>;
  state?: InputMaybe<IssuableState>;
  types?: InputMaybe<Array<IssueType>>;
  updatedAfter?: InputMaybe<Scalars['Time']>;
  updatedBefore?: InputMaybe<Scalars['Time']>;
  weight?: InputMaybe<Scalars['String']>;
};


export type ProjectIssueStatusCountsArgs = {
  assigneeId?: InputMaybe<Scalars['String']>;
  assigneeUsernames?: InputMaybe<Array<Scalars['String']>>;
  authorUsername?: InputMaybe<Scalars['String']>;
  closedAfter?: InputMaybe<Scalars['Time']>;
  closedBefore?: InputMaybe<Scalars['Time']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  iid?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneTitle?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneWildcardId?: InputMaybe<MilestoneWildcardId>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedIssueFilterInput>;
  releaseTag?: InputMaybe<Array<Scalars['String']>>;
  releaseTagWildcardId?: InputMaybe<ReleaseTagWildcardId>;
  search?: InputMaybe<Scalars['String']>;
  types?: InputMaybe<Array<IssueType>>;
  updatedAfter?: InputMaybe<Scalars['Time']>;
  updatedBefore?: InputMaybe<Scalars['Time']>;
};


export type ProjectIssuesArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeId?: InputMaybe<Scalars['String']>;
  assigneeUsernames?: InputMaybe<Array<Scalars['String']>>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  closedAfter?: InputMaybe<Scalars['Time']>;
  closedBefore?: InputMaybe<Scalars['Time']>;
  confidential?: InputMaybe<Scalars['Boolean']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  epicId?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['String']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  includeSubepics?: InputMaybe<Scalars['Boolean']>;
  iterationId?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  iterationWildcardId?: InputMaybe<IterationWildcardId>;
  labelName?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  last?: InputMaybe<Scalars['Int']>;
  milestoneTitle?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneWildcardId?: InputMaybe<MilestoneWildcardId>;
  myReactionEmoji?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NegatedIssueFilterInput>;
  releaseTag?: InputMaybe<Array<Scalars['String']>>;
  releaseTagWildcardId?: InputMaybe<ReleaseTagWildcardId>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<IssueSort>;
  state?: InputMaybe<IssuableState>;
  types?: InputMaybe<Array<IssueType>>;
  updatedAfter?: InputMaybe<Scalars['Time']>;
  updatedBefore?: InputMaybe<Scalars['Time']>;
  weight?: InputMaybe<Scalars['String']>;
};


export type ProjectIterationCadencesArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  after?: InputMaybe<Scalars['String']>;
  automatic?: InputMaybe<Scalars['Boolean']>;
  before?: InputMaybe<Scalars['String']>;
  durationInWeeks?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['IterationsCadenceID']>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
};


export type ProjectIterationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  id?: InputMaybe<Scalars['ID']>;
  iid?: InputMaybe<Scalars['ID']>;
  includeAncestors?: InputMaybe<Scalars['Boolean']>;
  iterationCadenceIds?: InputMaybe<Array<Scalars['IterationsCadenceID']>>;
  last?: InputMaybe<Scalars['Int']>;
  state?: InputMaybe<IterationState>;
  timeframe?: InputMaybe<Timeframe>;
  title?: InputMaybe<Scalars['String']>;
};


export type ProjectJiraImportsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectJobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  statuses?: InputMaybe<Array<CiJobStatus>>;
};


export type ProjectLabelArgs = {
  title: Scalars['String'];
};


export type ProjectLabelsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  includeAncestorGroups?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  searchTerm?: InputMaybe<Scalars['String']>;
};


export type ProjectMergeRequestArgs = {
  iid: Scalars['String'];
};


export type ProjectMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


export type ProjectMilestonesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  containingDate?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  includeAncestors?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  searchTitle?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MilestoneSort>;
  state?: InputMaybe<MilestoneStateEnum>;
  timeframe?: InputMaybe<Timeframe>;
  title?: InputMaybe<Scalars['String']>;
};


export type ProjectNetworkPoliciesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  environmentId?: InputMaybe<Scalars['EnvironmentID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectPackagesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  includeVersionless?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  packageName?: InputMaybe<Scalars['String']>;
  packageType?: InputMaybe<PackageTypeEnum>;
  sort?: InputMaybe<PackageSort>;
  status?: InputMaybe<PackageStatus>;
};


export type ProjectPathLocksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectPipelineArgs = {
  iid?: InputMaybe<Scalars['ID']>;
  sha?: InputMaybe<Scalars['String']>;
};


export type ProjectPipelinesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  ref?: InputMaybe<Scalars['String']>;
  sha?: InputMaybe<Scalars['String']>;
  source?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<PipelineStatusEnum>;
};


export type ProjectProjectMembersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<Array<ProjectMemberRelation>>;
  search?: InputMaybe<Scalars['String']>;
};


export type ProjectReleaseArgs = {
  tagName: Scalars['String'];
};


export type ProjectReleasesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<ReleaseSort>;
};


export type ProjectRequirementArgs = {
  authorUsername?: InputMaybe<Array<Scalars['String']>>;
  iid?: InputMaybe<Scalars['ID']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  lastTestReportState?: InputMaybe<RequirementStatusFilter>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Sort>;
  state?: InputMaybe<RequirementState>;
};


export type ProjectRequirementsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Array<Scalars['String']>>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  iid?: InputMaybe<Scalars['ID']>;
  iids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  lastTestReportState?: InputMaybe<RequirementStatusFilter>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Sort>;
  state?: InputMaybe<RequirementState>;
};


export type ProjectScanExecutionPoliciesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectSentryDetailedErrorArgs = {
  id: Scalars['GitlabErrorTrackingDetailedErrorID'];
};


export type ProjectServicesArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  type?: InputMaybe<ServiceType>;
};


export type ProjectSnippetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['SnippetID']>>;
  last?: InputMaybe<Scalars['Int']>;
  visibility?: InputMaybe<VisibilityScopesEnum>;
};


export type ProjectTerraformStateArgs = {
  name: Scalars['String'];
};


export type ProjectTerraformStatesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['Time']>;
  endTime?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['GroupID']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  startDate?: InputMaybe<Scalars['Time']>;
  startTime?: InputMaybe<Scalars['Time']>;
  username?: InputMaybe<Scalars['String']>;
};


export type ProjectVulnerabilitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasIssues?: InputMaybe<Scalars['Boolean']>;
  hasResolution?: InputMaybe<Scalars['Boolean']>;
  image?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  reportType?: InputMaybe<Array<VulnerabilityReportType>>;
  scanner?: InputMaybe<Array<Scalars['String']>>;
  scannerId?: InputMaybe<Array<Scalars['VulnerabilitiesScannerID']>>;
  severity?: InputMaybe<Array<VulnerabilitySeverity>>;
  sort?: InputMaybe<VulnerabilitySort>;
  state?: InputMaybe<Array<VulnerabilityState>>;
};


export type ProjectVulnerabilitiesCountByDayArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate: Scalars['ISO8601Date'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  startDate: Scalars['ISO8601Date'];
};


export type ProjectVulnerabilityScannersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type ProjectVulnerabilitySeveritiesCountArgs = {
  hasIssues?: InputMaybe<Scalars['Boolean']>;
  hasResolution?: InputMaybe<Scalars['Boolean']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  reportType?: InputMaybe<Array<VulnerabilityReportType>>;
  scanner?: InputMaybe<Array<Scalars['String']>>;
  scannerId?: InputMaybe<Array<Scalars['VulnerabilitiesScannerID']>>;
  severity?: InputMaybe<Array<VulnerabilitySeverity>>;
  state?: InputMaybe<Array<VulnerabilityState>>;
};

export type ProjectCiCdSetting = {
  __typename?: 'ProjectCiCdSetting';
  /** Indicates CI job tokens generated in this project have restricted access to resources. */
  jobTokenScopeEnabled?: Maybe<Scalars['Boolean']>;
  /** Whether to keep the latest builds artifacts. */
  keepLatestArtifact?: Maybe<Scalars['Boolean']>;
  /** Whether merge pipelines are enabled. */
  mergePipelinesEnabled?: Maybe<Scalars['Boolean']>;
  /** Whether merge trains are enabled. */
  mergeTrainsEnabled?: Maybe<Scalars['Boolean']>;
  /** Project the CI/CD settings belong to. */
  project?: Maybe<Project>;
};

/** The connection type for Project. */
export type ProjectConnection = {
  __typename?: 'ProjectConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ProjectEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Project>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ProjectEdge = {
  __typename?: 'ProjectEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Project>;
};

/** Represents a Project Membership */
export type ProjectMember = MemberInterface & {
  __typename?: 'ProjectMember';
  /** GitLab::Access level. */
  accessLevel?: Maybe<AccessLevel>;
  /** Date and time the membership was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** User that authorized membership. */
  createdBy?: Maybe<UserCore>;
  /** Date and time the membership expires. */
  expiresAt?: Maybe<Scalars['Time']>;
  /** ID of the member. */
  id: Scalars['ID'];
  /** Project that User is a member of. */
  project?: Maybe<Project>;
  /** Date and time the membership was last updated. */
  updatedAt?: Maybe<Scalars['Time']>;
  /** User that is associated with the member object. */
  user?: Maybe<UserCore>;
  /** Permissions for the current user on the resource */
  userPermissions: ProjectPermissions;
};

/** The connection type for ProjectMember. */
export type ProjectMemberConnection = {
  __typename?: 'ProjectMemberConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ProjectMemberEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ProjectMember>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ProjectMemberEdge = {
  __typename?: 'ProjectMemberEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ProjectMember>;
};

/** Project member relation */
export type ProjectMemberRelation =
  /** Descendants members */
  | 'DESCENDANTS'
  /** Direct members */
  | 'DIRECT'
  /** Inherited members */
  | 'INHERITED'
  /** Invited Groups members */
  | 'INVITED_GROUPS';

export type ProjectPermissions = {
  __typename?: 'ProjectPermissions';
  /** Indicates the user can perform `admin_operations` on this resource */
  adminOperations: Scalars['Boolean'];
  /** Indicates the user can perform `admin_path_locks` on this resource */
  adminPathLocks: Scalars['Boolean'];
  /** Indicates the user can perform `admin_project` on this resource */
  adminProject: Scalars['Boolean'];
  /** Indicates the user can perform `admin_remote_mirror` on this resource */
  adminRemoteMirror: Scalars['Boolean'];
  /** Indicates the user can perform `admin_wiki` on this resource */
  adminWiki: Scalars['Boolean'];
  /** Indicates the user can perform `archive_project` on this resource */
  archiveProject: Scalars['Boolean'];
  /** Indicates the user can perform `change_namespace` on this resource */
  changeNamespace: Scalars['Boolean'];
  /** Indicates the user can perform `change_visibility_level` on this resource */
  changeVisibilityLevel: Scalars['Boolean'];
  /** Indicates the user can perform `create_deployment` on this resource */
  createDeployment: Scalars['Boolean'];
  /** Indicates the user can perform `create_design` on this resource */
  createDesign: Scalars['Boolean'];
  /** Indicates the user can perform `create_issue` on this resource */
  createIssue: Scalars['Boolean'];
  /** Indicates the user can perform `create_label` on this resource */
  createLabel: Scalars['Boolean'];
  /** Indicates the user can perform `create_merge_request_from` on this resource */
  createMergeRequestFrom: Scalars['Boolean'];
  /** Indicates the user can perform `create_merge_request_in` on this resource */
  createMergeRequestIn: Scalars['Boolean'];
  /** Indicates the user can perform `create_pages` on this resource */
  createPages: Scalars['Boolean'];
  /** Indicates the user can perform `create_pipeline` on this resource */
  createPipeline: Scalars['Boolean'];
  /** Indicates the user can perform `create_pipeline_schedule` on this resource */
  createPipelineSchedule: Scalars['Boolean'];
  /** Indicates the user can perform `create_snippet` on this resource */
  createSnippet: Scalars['Boolean'];
  /** Indicates the user can perform `create_wiki` on this resource */
  createWiki: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_design` on this resource */
  destroyDesign: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_pages` on this resource */
  destroyPages: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_wiki` on this resource */
  destroyWiki: Scalars['Boolean'];
  /** Indicates the user can perform `download_code` on this resource */
  downloadCode: Scalars['Boolean'];
  /** Indicates the user can perform `download_wiki_code` on this resource */
  downloadWikiCode: Scalars['Boolean'];
  /** Indicates the user can perform `fork_project` on this resource */
  forkProject: Scalars['Boolean'];
  /** Indicates the user can perform `push_code` on this resource */
  pushCode: Scalars['Boolean'];
  /** Indicates the user can perform `push_to_delete_protected_branch` on this resource */
  pushToDeleteProtectedBranch: Scalars['Boolean'];
  /** Indicates the user can perform `read_commit_status` on this resource */
  readCommitStatus: Scalars['Boolean'];
  /** Indicates the user can perform `read_cycle_analytics` on this resource */
  readCycleAnalytics: Scalars['Boolean'];
  /** Indicates the user can perform `read_design` on this resource */
  readDesign: Scalars['Boolean'];
  /** Indicates the user can perform `read_merge_request` on this resource */
  readMergeRequest: Scalars['Boolean'];
  /** Indicates the user can perform `read_pages_content` on this resource */
  readPagesContent: Scalars['Boolean'];
  /** Indicates the user can perform `read_project` on this resource */
  readProject: Scalars['Boolean'];
  /** Indicates the user can perform `read_project_member` on this resource */
  readProjectMember: Scalars['Boolean'];
  /** Indicates the user can perform `read_wiki` on this resource */
  readWiki: Scalars['Boolean'];
  /** Indicates the user can perform `remove_fork_project` on this resource */
  removeForkProject: Scalars['Boolean'];
  /** Indicates the user can perform `remove_pages` on this resource */
  removePages: Scalars['Boolean'];
  /** Indicates the user can perform `remove_project` on this resource */
  removeProject: Scalars['Boolean'];
  /** Indicates the user can perform `rename_project` on this resource */
  renameProject: Scalars['Boolean'];
  /** Indicates the user can perform `request_access` on this resource */
  requestAccess: Scalars['Boolean'];
  /** Indicates the user can perform `update_pages` on this resource */
  updatePages: Scalars['Boolean'];
  /** Indicates the user can perform `update_wiki` on this resource */
  updateWiki: Scalars['Boolean'];
  /** Indicates the user can perform `upload_file` on this resource */
  uploadFile: Scalars['Boolean'];
};

/** Autogenerated input type of ProjectSetComplianceFramework */
export type ProjectSetComplianceFrameworkInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the compliance framework to assign to the project. */
  complianceFrameworkId?: InputMaybe<Scalars['ComplianceManagementFrameworkID']>;
  /** ID of the project to change the compliance framework of. */
  projectId: Scalars['ProjectID'];
};

/** Autogenerated return type of ProjectSetComplianceFramework */
export type ProjectSetComplianceFrameworkPayload = {
  __typename?: 'ProjectSetComplianceFrameworkPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Project after mutation. */
  project?: Maybe<Project>;
};

/** Autogenerated input type of ProjectSetLocked */
export type ProjectSetLockedInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path to the file. */
  filePath: Scalars['String'];
  /** Whether or not to lock the file path. */
  lock: Scalars['Boolean'];
  /** Full path of the project to mutate. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of ProjectSetLocked */
export type ProjectSetLockedPayload = {
  __typename?: 'ProjectSetLockedPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Project after mutation. */
  project?: Maybe<Project>;
};

export type ProjectStatistics = {
  __typename?: 'ProjectStatistics';
  /** Build artifacts size of the project in bytes. */
  buildArtifactsSize: Scalars['Float'];
  /** Commit count of the project. */
  commitCount: Scalars['Float'];
  /** Large File Storage (LFS) object size of the project in bytes. */
  lfsObjectsSize: Scalars['Float'];
  /** Packages size of the project in bytes. */
  packagesSize: Scalars['Float'];
  /** CI Pipeline artifacts size in bytes. */
  pipelineArtifactsSize?: Maybe<Scalars['Float']>;
  /** Repository size of the project in bytes. */
  repositorySize: Scalars['Float'];
  /** Snippets size of the project in bytes. */
  snippetsSize?: Maybe<Scalars['Float']>;
  /** Storage size of the project in bytes. */
  storageSize: Scalars['Float'];
  /** Uploads size of the project in bytes. */
  uploadsSize?: Maybe<Scalars['Float']>;
  /** Wiki size of the project in bytes. */
  wikiSize?: Maybe<Scalars['Float']>;
};

/** The alert condition for Prometheus */
export type PrometheusAlert = {
  __typename?: 'PrometheusAlert';
  /** Human-readable text of the alert condition. */
  humanizedText: Scalars['String'];
  /** ID of the alert condition. */
  id: Scalars['ID'];
};

/** Autogenerated input type of PrometheusIntegrationCreate */
export type PrometheusIntegrationCreateInput = {
  /** Whether the integration is receiving alerts. */
  active: Scalars['Boolean'];
  /** Endpoint at which Prometheus can be queried. */
  apiUrl: Scalars['String'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Project to create the integration in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of PrometheusIntegrationCreate */
export type PrometheusIntegrationCreatePayload = {
  __typename?: 'PrometheusIntegrationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Newly created integration. */
  integration?: Maybe<AlertManagementPrometheusIntegration>;
};

/** Autogenerated input type of PrometheusIntegrationResetToken */
export type PrometheusIntegrationResetTokenInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the integration to mutate. */
  id: Scalars['IntegrationsPrometheusID'];
};

/** Autogenerated return type of PrometheusIntegrationResetToken */
export type PrometheusIntegrationResetTokenPayload = {
  __typename?: 'PrometheusIntegrationResetTokenPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Newly created integration. */
  integration?: Maybe<AlertManagementPrometheusIntegration>;
};

/** Autogenerated input type of PrometheusIntegrationUpdate */
export type PrometheusIntegrationUpdateInput = {
  /** Whether the integration is receiving alerts. */
  active?: InputMaybe<Scalars['Boolean']>;
  /** Endpoint at which Prometheus can be queried. */
  apiUrl?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the integration to mutate. */
  id: Scalars['IntegrationsPrometheusID'];
};

/** Autogenerated return type of PrometheusIntegrationUpdate */
export type PrometheusIntegrationUpdatePayload = {
  __typename?: 'PrometheusIntegrationUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Newly created integration. */
  integration?: Maybe<AlertManagementPrometheusIntegration>;
};

/** Autogenerated input type of PromoteToEpic */
export type PromoteToEpicInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Group the promoted epic will belong to. */
  groupPath?: InputMaybe<Scalars['ID']>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of PromoteToEpic */
export type PromoteToEpicPayload = {
  __typename?: 'PromoteToEpicPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Epic after issue promotion. */
  epic?: Maybe<Epic>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Represents rules that commit pushes must follow. */
export type PushRules = {
  __typename?: 'PushRules';
  /** Indicates whether commits not signed through GPG will be rejected. */
  rejectUnsignedCommits: Scalars['Boolean'];
};

/** Pypi metadata */
export type PypiMetadata = {
  __typename?: 'PypiMetadata';
  /** ID of the metadatum. */
  id: Scalars['PackagesPypiMetadatumID'];
  /** Required Python version of the Pypi package. */
  requiredPython?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  /** Find an issue board list. */
  boardList?: Maybe<BoardList>;
  /** CI related settings that apply to the entire instance. */
  ciApplicationSettings?: Maybe<CiApplicationSettings>;
  /**
   * Linted and processed contents of a CI config.
   * Should not be requested more than once per request.
   */
  ciConfig?: Maybe<CiConfig>;
  /** Monthly CI minutes usage data for the current user. */
  ciMinutesUsage?: Maybe<CiMinutesNamespaceMonthlyUsageConnection>;
  /** Find a container repository. */
  containerRepository?: Maybe<ContainerRepositoryDetails>;
  /** Fields related to the current license. */
  currentLicense?: Maybe<CurrentLicense>;
  /** Get information about current user. */
  currentUser?: Maybe<UserCore>;
  /** Fields related to design management. */
  designManagement: DesignManagement;
  /** Get configured DevOps adoption namespaces. **BETA** This endpoint is subject to change without notice. */
  devopsAdoptionEnabledNamespaces?: Maybe<DevopsAdoptionEnabledNamespaceConnection>;
  /** Testing endpoint to validate the API with */
  echo: Scalars['String'];
  /** Find a Geo node. */
  geoNode?: Maybe<GeoNode>;
  /** Find a group. */
  group?: Maybe<Group>;
  /** Fields related to Instance Security Dashboard. */
  instanceSecurityDashboard?: Maybe<InstanceSecurityDashboard>;
  /**
   * Get statistics on the instance. Deprecated in 13.10: This was renamed.
   * @deprecated This was renamed. Please use `Query.usageTrendsMeasurements`. Deprecated in 13.10.
   */
  instanceStatisticsMeasurements?: Maybe<UsageTrendsMeasurementConnection>;
  /** Find an issue. */
  issue?: Maybe<Issue>;
  /** Find an iteration. */
  iteration?: Maybe<Iteration>;
  /** Fields related to entries in the license history. */
  licenseHistoryEntries?: Maybe<LicenseHistoryEntryConnection>;
  /** Find a merge request. */
  mergeRequest?: Maybe<MergeRequest>;
  /** Metadata about GitLab. */
  metadata?: Maybe<Metadata>;
  /** Find a milestone. */
  milestone?: Maybe<Milestone>;
  /** Find a namespace. */
  namespace?: Maybe<Namespace>;
  /** Find a package. */
  package?: Maybe<PackageDetailsType>;
  /** Find a project. */
  project?: Maybe<Project>;
  /** Find projects visible to the current user. */
  projects?: Maybe<ProjectConnection>;
  /** Information about the complexity of the GraphQL query. */
  queryComplexity?: Maybe<QueryComplexity>;
  /** Find a runner. */
  runner?: Maybe<CiRunner>;
  /** Supported runner platforms. */
  runnerPlatforms?: Maybe<RunnerPlatformConnection>;
  /** Runner setup instructions. */
  runnerSetup?: Maybe<RunnerSetup>;
  /** Find runners visible to the current user. */
  runners?: Maybe<CiRunnerConnection>;
  /** Find Snippets visible to the current user. */
  snippets?: Maybe<SnippetConnection>;
  /** Find timelogs visible to the current user. */
  timelogs?: Maybe<TimelogConnection>;
  /** Get statistics on the instance. */
  usageTrendsMeasurements?: Maybe<UsageTrendsMeasurementConnection>;
  /** Find a user. */
  user?: Maybe<UserCore>;
  /** Find users. */
  users?: Maybe<UserCoreConnection>;
  /** Vulnerabilities reported on projects on the current user's instance security dashboard. */
  vulnerabilities?: Maybe<VulnerabilityConnection>;
  /** The historical number of vulnerabilities per day for the projects on the current user's instance security dashboard. */
  vulnerabilitiesCountByDay?: Maybe<VulnerabilitiesCountByDayConnection>;
  /** Find a vulnerability. */
  vulnerability?: Maybe<Vulnerability>;
};


export type QueryBoardListArgs = {
  id: Scalars['ListID'];
  issueFilters?: InputMaybe<BoardIssueInput>;
};


export type QueryCiConfigArgs = {
  content: Scalars['String'];
  dryRun?: InputMaybe<Scalars['Boolean']>;
  projectPath: Scalars['ID'];
  sha?: InputMaybe<Scalars['String']>;
};


export type QueryCiMinutesUsageArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryContainerRepositoryArgs = {
  id: Scalars['ContainerRepositoryID'];
};


export type QueryDevopsAdoptionEnabledNamespacesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  displayNamespaceId?: InputMaybe<Scalars['NamespaceID']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryEchoArgs = {
  text: Scalars['String'];
};


export type QueryGeoNodeArgs = {
  name?: InputMaybe<Scalars['String']>;
};


export type QueryGroupArgs = {
  fullPath: Scalars['ID'];
};


export type QueryInstanceStatisticsMeasurementsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  identifier: MeasurementIdentifier;
  last?: InputMaybe<Scalars['Int']>;
  recordedAfter?: InputMaybe<Scalars['Time']>;
  recordedBefore?: InputMaybe<Scalars['Time']>;
};


export type QueryIssueArgs = {
  id: Scalars['IssueID'];
};


export type QueryIterationArgs = {
  id: Scalars['IterationID'];
};


export type QueryLicenseHistoryEntriesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryMergeRequestArgs = {
  id: Scalars['MergeRequestID'];
};


export type QueryMilestoneArgs = {
  id: Scalars['MilestoneID'];
};


export type QueryNamespaceArgs = {
  fullPath: Scalars['ID'];
};


export type QueryPackageArgs = {
  id: Scalars['PackagesPackageID'];
};


export type QueryProjectArgs = {
  fullPath: Scalars['ID'];
};


export type QueryProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  membership?: InputMaybe<Scalars['Boolean']>;
  search?: InputMaybe<Scalars['String']>;
  searchNamespaces?: InputMaybe<Scalars['Boolean']>;
  sort?: InputMaybe<Scalars['String']>;
  topics?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryRunnerArgs = {
  id: Scalars['CiRunnerID'];
};


export type QueryRunnerPlatformsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryRunnerSetupArgs = {
  architecture: Scalars['String'];
  platform: Scalars['String'];
};


export type QueryRunnersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<CiRunnerSort>;
  status?: InputMaybe<CiRunnerStatus>;
  tagList?: InputMaybe<Array<Scalars['String']>>;
  type?: InputMaybe<CiRunnerType>;
};


export type QuerySnippetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorId?: InputMaybe<Scalars['UserID']>;
  before?: InputMaybe<Scalars['String']>;
  explore?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['SnippetID']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  type?: InputMaybe<TypeEnum>;
  visibility?: InputMaybe<VisibilityScopesEnum>;
};


export type QueryTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['Time']>;
  endTime?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['GroupID']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  startDate?: InputMaybe<Scalars['Time']>;
  startTime?: InputMaybe<Scalars['Time']>;
  username?: InputMaybe<Scalars['String']>;
};


export type QueryUsageTrendsMeasurementsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  identifier: MeasurementIdentifier;
  last?: InputMaybe<Scalars['Int']>;
  recordedAfter?: InputMaybe<Scalars['Time']>;
  recordedBefore?: InputMaybe<Scalars['Time']>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['UserID']>;
  username?: InputMaybe<Scalars['String']>;
};


export type QueryUsersArgs = {
  admins?: InputMaybe<Scalars['Boolean']>;
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Sort>;
  usernames?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryVulnerabilitiesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  hasIssues?: InputMaybe<Scalars['Boolean']>;
  hasResolution?: InputMaybe<Scalars['Boolean']>;
  image?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  reportType?: InputMaybe<Array<VulnerabilityReportType>>;
  scanner?: InputMaybe<Array<Scalars['String']>>;
  scannerId?: InputMaybe<Array<Scalars['VulnerabilitiesScannerID']>>;
  severity?: InputMaybe<Array<VulnerabilitySeverity>>;
  sort?: InputMaybe<VulnerabilitySort>;
  state?: InputMaybe<Array<VulnerabilityState>>;
};


export type QueryVulnerabilitiesCountByDayArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate: Scalars['ISO8601Date'];
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  startDate: Scalars['ISO8601Date'];
};


export type QueryVulnerabilityArgs = {
  id: Scalars['VulnerabilityID'];
};

export type QueryComplexity = {
  __typename?: 'QueryComplexity';
  /** GraphQL query complexity limit. */
  limit?: Maybe<Scalars['Int']>;
  /** GraphQL query complexity score. */
  score?: Maybe<Scalars['Int']>;
};

/** Recent failure history of a test case. */
export type RecentFailures = {
  __typename?: 'RecentFailures';
  /** Name of the base branch of the project. */
  baseBranch?: Maybe<Scalars['String']>;
  /** Number of times the test case has failed in the past 14 days. */
  count?: Maybe<Scalars['Int']>;
};

/** State of a Geo registry */
export type RegistryState =
  /** Registry that failed to sync. */
  | 'FAILED'
  /** Registry waiting to be synced. */
  | 'PENDING'
  /** Registry currently syncing. */
  | 'STARTED'
  /** Registry that is synced. */
  | 'SYNCED';

/** Represents a release */
export type Release = {
  __typename?: 'Release';
  /** Assets of the release. */
  assets?: Maybe<ReleaseAssets>;
  /** User that created the release. */
  author?: Maybe<UserCore>;
  /** Commit associated with the release. */
  commit?: Maybe<Commit>;
  /** Timestamp of when the release was created. */
  createdAt?: Maybe<Scalars['Time']>;
  /** Description (also known as "release notes") of the release. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** Evidence for the release. */
  evidences?: Maybe<ReleaseEvidenceConnection>;
  /** Links of the release. */
  links?: Maybe<ReleaseLinks>;
  /** Milestones associated to the release. */
  milestones?: Maybe<MilestoneConnection>;
  /** Name of the release. */
  name?: Maybe<Scalars['String']>;
  /** Timestamp of when the release was released. */
  releasedAt?: Maybe<Scalars['Time']>;
  /** Name of the tag associated with the release. */
  tagName?: Maybe<Scalars['String']>;
  /** Relative web path to the tag associated with the release. */
  tagPath?: Maybe<Scalars['String']>;
  /** Indicates the release is an upcoming release. */
  upcomingRelease?: Maybe<Scalars['Boolean']>;
};


/** Represents a release */
export type ReleaseEvidencesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a release */
export type ReleaseMilestonesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Represents an asset link associated with a release */
export type ReleaseAssetLink = {
  __typename?: 'ReleaseAssetLink';
  /** Relative path for the direct asset link. */
  directAssetPath?: Maybe<Scalars['String']>;
  /** Direct asset URL of the link. */
  directAssetUrl?: Maybe<Scalars['String']>;
  /** Indicates the link points to an external resource. */
  external?: Maybe<Scalars['Boolean']>;
  /** ID of the link. */
  id: Scalars['ID'];
  /** Type of the link: `other`, `runbook`, `image`, `package`; defaults to `other`. */
  linkType?: Maybe<ReleaseAssetLinkType>;
  /** Name of the link. */
  name?: Maybe<Scalars['String']>;
  /** URL of the link. */
  url?: Maybe<Scalars['String']>;
};

/** The connection type for ReleaseAssetLink. */
export type ReleaseAssetLinkConnection = {
  __typename?: 'ReleaseAssetLinkConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ReleaseAssetLinkEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ReleaseAssetLink>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of ReleaseAssetLinkCreate */
export type ReleaseAssetLinkCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Relative path for a direct asset link. */
  directAssetPath?: InputMaybe<Scalars['String']>;
  /** Type of the asset link. */
  linkType?: InputMaybe<ReleaseAssetLinkType>;
  /** Name of the asset link. */
  name: Scalars['String'];
  /** Full path of the project the asset link is associated with. */
  projectPath: Scalars['ID'];
  /** Name of the associated release's tag. */
  tagName: Scalars['String'];
  /** URL of the asset link. */
  url: Scalars['String'];
};

/** Autogenerated return type of ReleaseAssetLinkCreate */
export type ReleaseAssetLinkCreatePayload = {
  __typename?: 'ReleaseAssetLinkCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Asset link after mutation. */
  link?: Maybe<ReleaseAssetLink>;
};

/** Autogenerated input type of ReleaseAssetLinkDelete */
export type ReleaseAssetLinkDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the release asset link to delete. */
  id: Scalars['ReleasesLinkID'];
};

/** Autogenerated return type of ReleaseAssetLinkDelete */
export type ReleaseAssetLinkDeletePayload = {
  __typename?: 'ReleaseAssetLinkDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Deleted release asset link. */
  link?: Maybe<ReleaseAssetLink>;
};

/** An edge in a connection. */
export type ReleaseAssetLinkEdge = {
  __typename?: 'ReleaseAssetLinkEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ReleaseAssetLink>;
};

/** Fields that are available when modifying a release asset link */
export type ReleaseAssetLinkInput = {
  /** Relative path for a direct asset link. */
  directAssetPath?: InputMaybe<Scalars['String']>;
  /** Type of the asset link. */
  linkType?: InputMaybe<ReleaseAssetLinkType>;
  /** Name of the asset link. */
  name: Scalars['String'];
  /** URL of the asset link. */
  url: Scalars['String'];
};

/** Type of the link: `other`, `runbook`, `image`, `package` */
export type ReleaseAssetLinkType =
  /** Image link type */
  | 'IMAGE'
  /** Other link type */
  | 'OTHER'
  /** Package link type */
  | 'PACKAGE'
  /** Runbook link type */
  | 'RUNBOOK';

/** Autogenerated input type of ReleaseAssetLinkUpdate */
export type ReleaseAssetLinkUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Relative path for a direct asset link. */
  directAssetPath?: InputMaybe<Scalars['String']>;
  /** ID of the release asset link to update. */
  id: Scalars['ReleasesLinkID'];
  /** Type of the asset link. */
  linkType?: InputMaybe<ReleaseAssetLinkType>;
  /** Name of the asset link. */
  name?: InputMaybe<Scalars['String']>;
  /** URL of the asset link. */
  url?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of ReleaseAssetLinkUpdate */
export type ReleaseAssetLinkUpdatePayload = {
  __typename?: 'ReleaseAssetLinkUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Asset link after mutation. */
  link?: Maybe<ReleaseAssetLink>;
};

/** A container for all assets associated with a release */
export type ReleaseAssets = {
  __typename?: 'ReleaseAssets';
  /** Number of assets of the release. */
  count?: Maybe<Scalars['Int']>;
  /** Asset links of the release. */
  links?: Maybe<ReleaseAssetLinkConnection>;
  /** Sources of the release. */
  sources?: Maybe<ReleaseSourceConnection>;
};


/** A container for all assets associated with a release */
export type ReleaseAssetsLinksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A container for all assets associated with a release */
export type ReleaseAssetsSourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Fields that are available when modifying release assets */
export type ReleaseAssetsInput = {
  /** List of asset links to associate to the release. */
  links?: InputMaybe<Array<ReleaseAssetLinkInput>>;
};

/** The connection type for Release. */
export type ReleaseConnection = {
  __typename?: 'ReleaseConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ReleaseEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Release>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of ReleaseCreate */
export type ReleaseCreateInput = {
  /** Assets associated to the release. */
  assets?: InputMaybe<ReleaseAssetsInput>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description (also known as "release notes") of the release. */
  description?: InputMaybe<Scalars['String']>;
  /** Title of each milestone the release is associated with. GitLab Premium customers can specify group milestones. */
  milestones?: InputMaybe<Array<Scalars['String']>>;
  /** Name of the release. */
  name?: InputMaybe<Scalars['String']>;
  /** Full path of the project the release is associated with. */
  projectPath: Scalars['ID'];
  /** Commit SHA or branch name to use if creating a new tag. */
  ref?: InputMaybe<Scalars['String']>;
  /** Date and time for the release. Defaults to the current date and time. */
  releasedAt?: InputMaybe<Scalars['Time']>;
  /** Name of the tag to associate with the release. */
  tagName: Scalars['String'];
};

/** Autogenerated return type of ReleaseCreate */
export type ReleaseCreatePayload = {
  __typename?: 'ReleaseCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Release after mutation. */
  release?: Maybe<Release>;
};

/** Autogenerated input type of ReleaseDelete */
export type ReleaseDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the project the release is associated with. */
  projectPath: Scalars['ID'];
  /** Name of the tag associated with the release to delete. */
  tagName: Scalars['String'];
};

/** Autogenerated return type of ReleaseDelete */
export type ReleaseDeletePayload = {
  __typename?: 'ReleaseDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Deleted release. */
  release?: Maybe<Release>;
};

/** An edge in a connection. */
export type ReleaseEdge = {
  __typename?: 'ReleaseEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Release>;
};

/** Evidence for a release */
export type ReleaseEvidence = {
  __typename?: 'ReleaseEvidence';
  /** Timestamp when the evidence was collected. */
  collectedAt?: Maybe<Scalars['Time']>;
  /** URL from where the evidence can be downloaded. */
  filepath?: Maybe<Scalars['String']>;
  /** ID of the evidence. */
  id: Scalars['ID'];
  /** SHA1 ID of the evidence hash. */
  sha?: Maybe<Scalars['String']>;
};

/** The connection type for ReleaseEvidence. */
export type ReleaseEvidenceConnection = {
  __typename?: 'ReleaseEvidenceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ReleaseEvidenceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ReleaseEvidence>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ReleaseEvidenceEdge = {
  __typename?: 'ReleaseEvidenceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ReleaseEvidence>;
};

export type ReleaseLinks = {
  __typename?: 'ReleaseLinks';
  /** HTTP URL of the issues page, filtered by this release and `state=closed`. */
  closedIssuesUrl?: Maybe<Scalars['String']>;
  /** HTTP URL of the merge request page , filtered by this release and `state=closed`. */
  closedMergeRequestsUrl?: Maybe<Scalars['String']>;
  /** HTTP URL of the release's edit page. */
  editUrl?: Maybe<Scalars['String']>;
  /** HTTP URL of the merge request page , filtered by this release and `state=merged`. */
  mergedMergeRequestsUrl?: Maybe<Scalars['String']>;
  /** HTTP URL of the issues page, filtered by this release and `state=open`. */
  openedIssuesUrl?: Maybe<Scalars['String']>;
  /** HTTP URL of the merge request page, filtered by this release and `state=open`. */
  openedMergeRequestsUrl?: Maybe<Scalars['String']>;
  /** HTTP URL of the release. */
  selfUrl?: Maybe<Scalars['String']>;
};

/** Values for sorting releases */
export type ReleaseSort =
  /** Created at ascending order. */
  | 'CREATED_ASC'
  /** Created at descending order. */
  | 'CREATED_DESC'
  /** Released at by ascending order. */
  | 'RELEASED_AT_ASC'
  /** Released at by descending order. */
  | 'RELEASED_AT_DESC';

/** Represents the source code attached to a release in a particular format */
export type ReleaseSource = {
  __typename?: 'ReleaseSource';
  /** Format of the source. */
  format?: Maybe<Scalars['String']>;
  /** Download URL of the source. */
  url?: Maybe<Scalars['String']>;
};

/** The connection type for ReleaseSource. */
export type ReleaseSourceConnection = {
  __typename?: 'ReleaseSourceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ReleaseSourceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ReleaseSource>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ReleaseSourceEdge = {
  __typename?: 'ReleaseSourceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ReleaseSource>;
};

/** Release tag ID wildcard values */
export type ReleaseTagWildcardId =
  /** Release tag is assigned. */
  | 'ANY'
  /** No release tag is assigned. */
  | 'NONE';

/** Autogenerated input type of ReleaseUpdate */
export type ReleaseUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description (release notes) of the release. */
  description?: InputMaybe<Scalars['String']>;
  /** Title of each milestone the release is associated with. GitLab Premium customers can specify group milestones. */
  milestones?: InputMaybe<Array<Scalars['String']>>;
  /** Name of the release. */
  name?: InputMaybe<Scalars['String']>;
  /** Full path of the project the release is associated with. */
  projectPath: Scalars['ID'];
  /** Release date. */
  releasedAt?: InputMaybe<Scalars['Time']>;
  /** Name of the tag associated with the release. */
  tagName: Scalars['String'];
};

/** Autogenerated return type of ReleaseUpdate */
export type ReleaseUpdatePayload = {
  __typename?: 'ReleaseUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Release after mutation. */
  release?: Maybe<Release>;
};

/** Autogenerated input type of RemoveProjectFromSecurityDashboard */
export type RemoveProjectFromSecurityDashboardInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the project to remove from the Instance Security Dashboard. */
  id: Scalars['ProjectID'];
};

/** Autogenerated return type of RemoveProjectFromSecurityDashboard */
export type RemoveProjectFromSecurityDashboardPayload = {
  __typename?: 'RemoveProjectFromSecurityDashboardPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of RepositionImageDiffNote */
export type RepositionImageDiffNoteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the DiffNote to update. */
  id: Scalars['DiffNoteID'];
  /** Position of this note on a diff. */
  position: UpdateDiffImagePositionInput;
};

/** Autogenerated return type of RepositionImageDiffNote */
export type RepositionImageDiffNotePayload = {
  __typename?: 'RepositionImageDiffNotePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Note after mutation. */
  note?: Maybe<Note>;
};

export type Repository = {
  __typename?: 'Repository';
  /** Blobs contained within the repository */
  blobs?: Maybe<RepositoryBlobConnection>;
  /** Names of branches available in this repository that match the search pattern. */
  branchNames?: Maybe<Array<Scalars['String']>>;
  /** Shows a disk path of the repository. */
  diskPath?: Maybe<Scalars['String']>;
  /** Indicates repository has no visible content. */
  empty: Scalars['Boolean'];
  /** Indicates a corresponding Git repository exists on disk. */
  exists: Scalars['Boolean'];
  /**
   * Paginated tree of the repository. Available only when feature flag
   * `paginated_tree_graphql_query` is enabled. This flag is enabled by default.
   */
  paginatedTree?: Maybe<TreeConnection>;
  /** Default branch of the repository. */
  rootRef?: Maybe<Scalars['String']>;
  /** Tree of the repository. */
  tree?: Maybe<Tree>;
};


export type RepositoryBlobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  paths: Array<Scalars['String']>;
  ref?: InputMaybe<Scalars['String']>;
};


export type RepositoryBranchNamesArgs = {
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  searchPattern: Scalars['String'];
};


export type RepositoryPaginatedTreeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  path?: InputMaybe<Scalars['String']>;
  recursive?: InputMaybe<Scalars['Boolean']>;
  ref?: InputMaybe<Scalars['String']>;
};


export type RepositoryTreeArgs = {
  path?: InputMaybe<Scalars['String']>;
  recursive?: InputMaybe<Scalars['Boolean']>;
  ref?: InputMaybe<Scalars['String']>;
};

export type RepositoryBlob = {
  __typename?: 'RepositoryBlob';
  /** Whether the current user can modify the blob. */
  canModifyBlob?: Maybe<Scalars['Boolean']>;
  /** Web path to edit the blob in the old-style editor. */
  editBlobPath?: Maybe<Scalars['String']>;
  /** Web path to download the raw blob via external storage, if enabled. */
  externalStorageUrl?: Maybe<Scalars['String']>;
  /** Expected format of the blob based on the extension. */
  fileType?: Maybe<Scalars['String']>;
  /** Web path to edit this blob using a forked project. */
  forkAndEditPath?: Maybe<Scalars['String']>;
  /** ID of the blob. */
  id: Scalars['ID'];
  /** Web path to edit this blob in the Web IDE. */
  ideEditPath?: Maybe<Scalars['String']>;
  /** Web path to edit this blob in the Web IDE using a forked project. */
  ideForkAndEditPath?: Maybe<Scalars['String']>;
  /** LFS OID of the blob. */
  lfsOid?: Maybe<Scalars['String']>;
  /** Blob mode. */
  mode?: Maybe<Scalars['String']>;
  /** Blob name. */
  name?: Maybe<Scalars['String']>;
  /** OID of the blob. */
  oid: Scalars['String'];
  /** Path of the blob. */
  path: Scalars['String'];
  /** Blob plain highlighted data. */
  plainData?: Maybe<Scalars['String']>;
  /** Raw content of the blob. */
  rawBlob?: Maybe<Scalars['String']>;
  /** Web path to download the raw blob. */
  rawPath?: Maybe<Scalars['String']>;
  /** Size (in bytes) of the blob, or the blob target if stored externally. */
  rawSize?: Maybe<Scalars['Int']>;
  /** Raw content of the blob, if the blob is text data. */
  rawTextBlob?: Maybe<Scalars['String']>;
  /** Web path to replace the blob content. */
  replacePath?: Maybe<Scalars['String']>;
  /** Blob content rich viewer. */
  richViewer?: Maybe<BlobViewer>;
  /** Blob content simple viewer. */
  simpleViewer: BlobViewer;
  /** Size (in bytes) of the blob. */
  size?: Maybe<Scalars['Int']>;
  /** Whether the blob's content is stored externally (for instance, in LFS). */
  storedExternally?: Maybe<Scalars['Boolean']>;
  /** Web path of the blob. */
  webPath?: Maybe<Scalars['String']>;
};

/** The connection type for RepositoryBlob. */
export type RepositoryBlobConnection = {
  __typename?: 'RepositoryBlobConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<RepositoryBlobEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<RepositoryBlob>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type RepositoryBlobEdge = {
  __typename?: 'RepositoryBlobEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<RepositoryBlob>;
};

/** Represents a requirement */
export type Requirement = {
  __typename?: 'Requirement';
  /** Author of the requirement. */
  author: UserCore;
  /** Timestamp of when the requirement was created. */
  createdAt: Scalars['Time'];
  /** Description of the requirement. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** ID of the requirement. */
  id: Scalars['ID'];
  /** Internal ID of the requirement. */
  iid: Scalars['ID'];
  /** Indicates if latest test report was created by user. */
  lastTestReportManuallyCreated?: Maybe<Scalars['Boolean']>;
  /** Latest requirement test report state. */
  lastTestReportState?: Maybe<TestReportState>;
  /** Project to which the requirement belongs. */
  project: Project;
  /** State of the requirement. */
  state: RequirementState;
  /** Test reports of the requirement. */
  testReports?: Maybe<TestReportConnection>;
  /** Title of the requirement. */
  title?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `title` */
  titleHtml?: Maybe<Scalars['String']>;
  /** Timestamp of when the requirement was last updated. */
  updatedAt: Scalars['Time'];
  /** Permissions for the current user on the resource */
  userPermissions: RequirementPermissions;
};


/** Represents a requirement */
export type RequirementTestReportsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Sort>;
};

/** The connection type for Requirement. */
export type RequirementConnection = {
  __typename?: 'RequirementConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<RequirementEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Requirement>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type RequirementEdge = {
  __typename?: 'RequirementEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Requirement>;
};

/** Check permissions for the current user on a requirement */
export type RequirementPermissions = {
  __typename?: 'RequirementPermissions';
  /** Indicates the user can perform `admin_requirement` on this resource */
  adminRequirement: Scalars['Boolean'];
  /** Indicates the user can perform `create_requirement` on this resource */
  createRequirement: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_requirement` on this resource */
  destroyRequirement: Scalars['Boolean'];
  /** Indicates the user can perform `read_requirement` on this resource */
  readRequirement: Scalars['Boolean'];
  /** Indicates the user can perform `update_requirement` on this resource */
  updateRequirement: Scalars['Boolean'];
};

/** State of a requirement */
export type RequirementState =
  /** Archived requirement. */
  | 'ARCHIVED'
  /** Open requirement. */
  | 'OPENED';

/** Counts of requirements by their state */
export type RequirementStatesCount = {
  __typename?: 'RequirementStatesCount';
  /** Number of archived requirements. */
  archived?: Maybe<Scalars['Int']>;
  /** Number of opened requirements. */
  opened?: Maybe<Scalars['Int']>;
};

/** Status of a requirement based on last test report */
export type RequirementStatusFilter =
  /** Failed test report. */
  | 'FAILED'
  /** Requirements without any test report. */
  | 'MISSING'
  /** Passed test report. */
  | 'PASSED';

export type ResolvableInterface = {
  /** Indicates if the object can be resolved. */
  resolvable: Scalars['Boolean'];
  /** Indicates if the object is resolved. */
  resolved: Scalars['Boolean'];
  /** Timestamp of when the object was resolved. */
  resolvedAt?: Maybe<Scalars['Time']>;
  /** User who resolved the object. */
  resolvedBy?: Maybe<UserCore>;
};

export type RootStorageStatistics = {
  __typename?: 'RootStorageStatistics';
  /** CI artifacts size in bytes. */
  buildArtifactsSize: Scalars['Float'];
  /** LFS objects size in bytes. */
  lfsObjectsSize: Scalars['Float'];
  /** Packages size in bytes. */
  packagesSize: Scalars['Float'];
  /** CI pipeline artifacts size in bytes. */
  pipelineArtifactsSize: Scalars['Float'];
  /** Git repository size in bytes. */
  repositorySize: Scalars['Float'];
  /** Snippets size in bytes. */
  snippetsSize: Scalars['Float'];
  /** Total storage in bytes. */
  storageSize: Scalars['Float'];
  /** Uploads size in bytes. */
  uploadsSize: Scalars['Float'];
  /** Wiki size in bytes. */
  wikiSize: Scalars['Float'];
};

export type RunnerArchitecture = {
  __typename?: 'RunnerArchitecture';
  /** Download location for the runner for the platform architecture. */
  downloadLocation: Scalars['String'];
  /** Name of the runner platform architecture. */
  name: Scalars['String'];
};

/** The connection type for RunnerArchitecture. */
export type RunnerArchitectureConnection = {
  __typename?: 'RunnerArchitectureConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<RunnerArchitectureEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<RunnerArchitecture>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type RunnerArchitectureEdge = {
  __typename?: 'RunnerArchitectureEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<RunnerArchitecture>;
};

/** Autogenerated input type of RunnerDelete */
export type RunnerDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the runner to delete. */
  id: Scalars['CiRunnerID'];
};

/** Autogenerated return type of RunnerDelete */
export type RunnerDeletePayload = {
  __typename?: 'RunnerDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Values for filtering runners in namespaces. */
export type RunnerMembershipFilter =
  /**
   * Include runners that have either a direct relationship or a relationship with
   * descendants. These can be project runners or group runners (in the case where
   * group is queried).
   */
  | 'DESCENDANTS'
  /** Include runners that have a direct relationship. */
  | 'DIRECT';

export type RunnerPermissions = {
  __typename?: 'RunnerPermissions';
  /** Indicates the user can perform `delete_runner` on this resource */
  deleteRunner: Scalars['Boolean'];
  /** Indicates the user can perform `read_runner` on this resource */
  readRunner: Scalars['Boolean'];
  /** Indicates the user can perform `update_runner` on this resource */
  updateRunner: Scalars['Boolean'];
};

export type RunnerPlatform = {
  __typename?: 'RunnerPlatform';
  /** Runner architectures supported for the platform. */
  architectures?: Maybe<RunnerArchitectureConnection>;
  /** Human readable name of the runner platform. */
  humanReadableName: Scalars['String'];
  /** Name slug of the runner platform. */
  name: Scalars['String'];
};


export type RunnerPlatformArchitecturesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for RunnerPlatform. */
export type RunnerPlatformConnection = {
  __typename?: 'RunnerPlatformConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<RunnerPlatformEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<RunnerPlatform>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type RunnerPlatformEdge = {
  __typename?: 'RunnerPlatformEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<RunnerPlatform>;
};

export type RunnerSetup = {
  __typename?: 'RunnerSetup';
  /** Instructions for installing the runner on the specified architecture. */
  installInstructions: Scalars['String'];
  /**
   * Instructions for registering the runner. The actual registration tokens are
   * not included in the commands. Instead, a placeholder `$REGISTRATION_TOKEN` is shown.
   */
  registerInstructions?: Maybe<Scalars['String']>;
};

/** Autogenerated input type of RunnerUpdate */
export type RunnerUpdateInput = {
  /** Access level of the runner. */
  accessLevel?: InputMaybe<CiRunnerAccessLevel>;
  /** Indicates the runner is allowed to receive jobs. */
  active?: InputMaybe<Scalars['Boolean']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the runner. */
  description?: InputMaybe<Scalars['String']>;
  /** ID of the runner to update. */
  id: Scalars['CiRunnerID'];
  /** Indicates the runner is locked. */
  locked?: InputMaybe<Scalars['Boolean']>;
  /** Maximum timeout (in seconds) for jobs processed by the runner. */
  maximumTimeout?: InputMaybe<Scalars['Int']>;
  /** Private projects' "minutes cost factor" associated with the runner (GitLab.com only). */
  privateProjectsMinutesCostFactor?: InputMaybe<Scalars['Float']>;
  /** Public projects' "minutes cost factor" associated with the runner (GitLab.com only). */
  publicProjectsMinutesCostFactor?: InputMaybe<Scalars['Float']>;
  /** Indicates the runner is able to run untagged jobs. */
  runUntagged?: InputMaybe<Scalars['Boolean']>;
  /** Tags associated with the runner. */
  tagList?: InputMaybe<Array<Scalars['String']>>;
};

/** Autogenerated return type of RunnerUpdate */
export type RunnerUpdatePayload = {
  __typename?: 'RunnerUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Runner after mutation. */
  runner?: Maybe<CiRunner>;
};

/** Autogenerated input type of RunnersRegistrationTokenReset */
export type RunnersRegistrationTokenResetInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the project or group to reset the token for. Omit if resetting instance runner token. */
  id?: InputMaybe<Scalars['ID']>;
  /** Scope of the object to reset the token for. */
  type: CiRunnerType;
};

/** Autogenerated return type of RunnersRegistrationTokenReset */
export type RunnersRegistrationTokenResetPayload = {
  __typename?: 'RunnersRegistrationTokenResetPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Runner token after mutation. */
  token?: Maybe<Scalars['String']>;
};

/** Represents a CI configuration of SAST */
export type SastCiConfiguration = {
  __typename?: 'SastCiConfiguration';
  /** List of analyzers entities attached to SAST configuration. */
  analyzers?: Maybe<SastCiConfigurationAnalyzersEntityConnection>;
  /** List of global entities related to SAST configuration. */
  global?: Maybe<SastCiConfigurationEntityConnection>;
  /** List of pipeline entities related to SAST configuration. */
  pipeline?: Maybe<SastCiConfigurationEntityConnection>;
};


/** Represents a CI configuration of SAST */
export type SastCiConfigurationAnalyzersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a CI configuration of SAST */
export type SastCiConfigurationGlobalArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a CI configuration of SAST */
export type SastCiConfigurationPipelineArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Represents an analyzer entity in SAST CI configuration */
export type SastCiConfigurationAnalyzersEntity = {
  __typename?: 'SastCiConfigurationAnalyzersEntity';
  /** Analyzer description that is displayed on the form. */
  description?: Maybe<Scalars['String']>;
  /** Indicates whether an analyzer is enabled. */
  enabled?: Maybe<Scalars['Boolean']>;
  /** Analyzer label used in the config UI. */
  label?: Maybe<Scalars['String']>;
  /** Name of the analyzer. */
  name?: Maybe<Scalars['String']>;
  /** List of supported variables. */
  variables?: Maybe<SastCiConfigurationEntityConnection>;
};


/** Represents an analyzer entity in SAST CI configuration */
export type SastCiConfigurationAnalyzersEntityVariablesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for SastCiConfigurationAnalyzersEntity. */
export type SastCiConfigurationAnalyzersEntityConnection = {
  __typename?: 'SastCiConfigurationAnalyzersEntityConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SastCiConfigurationAnalyzersEntityEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<SastCiConfigurationAnalyzersEntity>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SastCiConfigurationAnalyzersEntityEdge = {
  __typename?: 'SastCiConfigurationAnalyzersEntityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<SastCiConfigurationAnalyzersEntity>;
};

/** Represents the analyzers entity in SAST CI configuration */
export type SastCiConfigurationAnalyzersEntityInput = {
  /** State of the analyzer. */
  enabled: Scalars['Boolean'];
  /** Name of analyzer. */
  name: Scalars['String'];
  /** List of variables for the analyzer. */
  variables?: InputMaybe<Array<SastCiConfigurationEntityInput>>;
};

/** Represents an entity in SAST CI configuration */
export type SastCiConfigurationEntity = {
  __typename?: 'SastCiConfigurationEntity';
  /** Default value that is used if value is empty. */
  defaultValue?: Maybe<Scalars['String']>;
  /** Entity description that is displayed on the form. */
  description?: Maybe<Scalars['String']>;
  /** CI keyword of entity. */
  field?: Maybe<Scalars['String']>;
  /** Label for entity used in the form. */
  label?: Maybe<Scalars['String']>;
  /** Different possible values of the field. */
  options?: Maybe<SastCiConfigurationOptionsEntityConnection>;
  /** Size of the UI component. */
  size?: Maybe<SastUiComponentSize>;
  /** Type of the field value. */
  type?: Maybe<Scalars['String']>;
  /** Current value of the entity. */
  value?: Maybe<Scalars['String']>;
};


/** Represents an entity in SAST CI configuration */
export type SastCiConfigurationEntityOptionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for SastCiConfigurationEntity. */
export type SastCiConfigurationEntityConnection = {
  __typename?: 'SastCiConfigurationEntityConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SastCiConfigurationEntityEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<SastCiConfigurationEntity>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SastCiConfigurationEntityEdge = {
  __typename?: 'SastCiConfigurationEntityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<SastCiConfigurationEntity>;
};

/** Represents an entity in SAST CI configuration */
export type SastCiConfigurationEntityInput = {
  /** Default value that is used if value is empty. */
  defaultValue: Scalars['String'];
  /** CI keyword of entity. */
  field: Scalars['String'];
  /** Current value of the entity. */
  value: Scalars['String'];
};

/** Represents a CI configuration of SAST */
export type SastCiConfigurationInput = {
  /** List of analyzers and related variables for the SAST configuration. */
  analyzers?: InputMaybe<Array<SastCiConfigurationAnalyzersEntityInput>>;
  /** List of global entities related to SAST configuration. */
  global?: InputMaybe<Array<SastCiConfigurationEntityInput>>;
  /** List of pipeline entities related to SAST configuration. */
  pipeline?: InputMaybe<Array<SastCiConfigurationEntityInput>>;
};

/** Represents an entity for options in SAST CI configuration */
export type SastCiConfigurationOptionsEntity = {
  __typename?: 'SastCiConfigurationOptionsEntity';
  /** Label of option entity. */
  label?: Maybe<Scalars['String']>;
  /** Value of option entity. */
  value?: Maybe<Scalars['String']>;
};

/** The connection type for SastCiConfigurationOptionsEntity. */
export type SastCiConfigurationOptionsEntityConnection = {
  __typename?: 'SastCiConfigurationOptionsEntityConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SastCiConfigurationOptionsEntityEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<SastCiConfigurationOptionsEntity>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SastCiConfigurationOptionsEntityEdge = {
  __typename?: 'SastCiConfigurationOptionsEntityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<SastCiConfigurationOptionsEntity>;
};

/** Size of UI component in SAST configuration page */
export type SastUiComponentSize =
  /** Size of UI component in SAST configuration page is large. */
  | 'LARGE'
  /** Size of UI component in SAST configuration page is medium. */
  | 'MEDIUM'
  /** Size of UI component in SAST configuration page is small. */
  | 'SMALL';

/** Represents the security scan information */
export type Scan = {
  __typename?: 'Scan';
  /** List of errors. */
  errors: Array<Scalars['String']>;
  /** Name of the scan. */
  name: Scalars['String'];
};

/** The connection type for Scan. */
export type ScanConnection = {
  __typename?: 'ScanConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ScanEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Scan>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ScanEdge = {
  __typename?: 'ScanEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Scan>;
};

/** Represents the scan execution policy */
export type ScanExecutionPolicy = {
  __typename?: 'ScanExecutionPolicy';
  /** Description of the policy. */
  description: Scalars['String'];
  /** Indicates whether this policy is enabled. */
  enabled: Scalars['Boolean'];
  /** Name of the policy. */
  name: Scalars['String'];
  /** Timestamp of when the policy YAML was last updated. */
  updatedAt: Scalars['Time'];
  /** YAML definition of the policy. */
  yaml: Scalars['String'];
};

/** Autogenerated input type of ScanExecutionPolicyCommit */
export type ScanExecutionPolicyCommitInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Name of the policy. If the name is null, the `name` field from `policy_yaml` is used. */
  name?: InputMaybe<Scalars['String']>;
  /** Changes the operation mode. */
  operationMode: MutationOperationMode;
  /** YAML snippet of the policy. */
  policyYaml: Scalars['String'];
  /** Full path of the project. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of ScanExecutionPolicyCommit */
export type ScanExecutionPolicyCommitPayload = {
  __typename?: 'ScanExecutionPolicyCommitPayload';
  /** Name of the branch to which the policy changes are committed. */
  branch?: Maybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** The connection type for ScanExecutionPolicy. */
export type ScanExecutionPolicyConnection = {
  __typename?: 'ScanExecutionPolicyConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ScanExecutionPolicyEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ScanExecutionPolicy>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ScanExecutionPolicyEdge = {
  __typename?: 'ScanExecutionPolicyEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ScanExecutionPolicy>;
};

/** Represents a resource scanned by a security scan */
export type ScannedResource = {
  __typename?: 'ScannedResource';
  /** HTTP request method used to access the URL. */
  requestMethod?: Maybe<Scalars['String']>;
  /** URL scanned by the scanner. */
  url?: Maybe<Scalars['String']>;
};

/** The connection type for ScannedResource. */
export type ScannedResourceConnection = {
  __typename?: 'ScannedResourceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ScannedResourceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<ScannedResource>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ScannedResourceEdge = {
  __typename?: 'ScannedResourceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ScannedResource>;
};

/** Autogenerated input type of SecurityPolicyProjectAssign */
export type SecurityPolicyProjectAssignInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the project. */
  projectPath: Scalars['ID'];
  /** ID of the security policy project. */
  securityPolicyProjectId: Scalars['ProjectID'];
};

/** Autogenerated return type of SecurityPolicyProjectAssign */
export type SecurityPolicyProjectAssignPayload = {
  __typename?: 'SecurityPolicyProjectAssignPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of SecurityPolicyProjectCreate */
export type SecurityPolicyProjectCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the project. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of SecurityPolicyProjectCreate */
export type SecurityPolicyProjectCreatePayload = {
  __typename?: 'SecurityPolicyProjectCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Security Policy Project that was created. */
  project?: Maybe<Project>;
};

/** Autogenerated input type of SecurityPolicyProjectUnassign */
export type SecurityPolicyProjectUnassignInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Full path of the project. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of SecurityPolicyProjectUnassign */
export type SecurityPolicyProjectUnassignPayload = {
  __typename?: 'SecurityPolicyProjectUnassignPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Represents summary of a security report */
export type SecurityReportSummary = {
  __typename?: 'SecurityReportSummary';
  /** Aggregated counts for the `api_fuzzing` scan */
  apiFuzzing?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `cluster_image_scanning` scan */
  clusterImageScanning?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `container_scanning` scan */
  containerScanning?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `coverage_fuzzing` scan */
  coverageFuzzing?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `dast` scan */
  dast?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `dependency_scanning` scan */
  dependencyScanning?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `generic` scan */
  generic?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `sast` scan */
  sast?: Maybe<SecurityReportSummarySection>;
  /** Aggregated counts for the `secret_detection` scan */
  secretDetection?: Maybe<SecurityReportSummarySection>;
};

/** Represents a section of a summary of a security report */
export type SecurityReportSummarySection = {
  __typename?: 'SecurityReportSummarySection';
  /** List of the first 20 scanned resources. */
  scannedResources?: Maybe<ScannedResourceConnection>;
  /** Total number of scanned resources. */
  scannedResourcesCount?: Maybe<Scalars['Int']>;
  /** Path to download all the scanned resources in CSV format. */
  scannedResourcesCsvPath?: Maybe<Scalars['String']>;
  /** List of security scans ran for the type. */
  scans: ScanConnection;
  /** Total number of vulnerabilities. */
  vulnerabilitiesCount?: Maybe<Scalars['Int']>;
};


/** Represents a section of a summary of a security report */
export type SecurityReportSummarySectionScannedResourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a section of a summary of a security report */
export type SecurityReportSummarySectionScansArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type SecurityReportTypeEnum =
  /** API FUZZING scan report */
  | 'API_FUZZING'
  /** CLUSTER IMAGE SCANNING scan report */
  | 'CLUSTER_IMAGE_SCANNING'
  /** CONTAINER SCANNING scan report */
  | 'CONTAINER_SCANNING'
  /** COVERAGE FUZZING scan report */
  | 'COVERAGE_FUZZING'
  /** DAST scan report */
  | 'DAST'
  /** DEPENDENCY SCANNING scan report */
  | 'DEPENDENCY_SCANNING'
  /** SAST scan report */
  | 'SAST'
  /** SECRET DETECTION scan report */
  | 'SECRET_DETECTION';

/** The type of the security scanner */
export type SecurityScannerType =
  /** API Fuzzing scanner */
  | 'API_FUZZING'
  /** Cluster Image Scanning scanner */
  | 'CLUSTER_IMAGE_SCANNING'
  /** Container Scanning scanner */
  | 'CONTAINER_SCANNING'
  /** Coverage Fuzzing scanner */
  | 'COVERAGE_FUZZING'
  /** DAST scanner */
  | 'DAST'
  /** Dependency Scanning scanner */
  | 'DEPENDENCY_SCANNING'
  /** SAST scanner */
  | 'SAST'
  /** Secret Detection scanner */
  | 'SECRET_DETECTION';

/** Represents a list of security scanners */
export type SecurityScanners = {
  __typename?: 'SecurityScanners';
  /** List of analyzers which are available for the project. */
  available?: Maybe<Array<SecurityScannerType>>;
  /** List of analyzers which are enabled for the project. */
  enabled?: Maybe<Array<SecurityScannerType>>;
  /** List of analyzers which ran successfully in the latest pipeline. */
  pipelineRun?: Maybe<Array<SecurityScannerType>>;
};

/** A Sentry error */
export type SentryDetailedError = {
  __typename?: 'SentryDetailedError';
  /** Count of occurrences. */
  count: Scalars['Int'];
  /** Culprit of the error. */
  culprit: Scalars['String'];
  /** External Base URL of the Sentry Instance. */
  externalBaseUrl: Scalars['String'];
  /** External URL of the error. */
  externalUrl: Scalars['String'];
  /** Commit the error was first seen. */
  firstReleaseLastCommit?: Maybe<Scalars['String']>;
  /** Release short version the error was first seen. */
  firstReleaseShortVersion?: Maybe<Scalars['String']>;
  /** Release version the error was first seen. */
  firstReleaseVersion?: Maybe<Scalars['String']>;
  /** Timestamp when the error was first seen. */
  firstSeen: Scalars['Time'];
  /** Last 24hr stats of the error. */
  frequency: Array<SentryErrorFrequency>;
  /** GitLab commit SHA attributed to the Error based on the release version. */
  gitlabCommit?: Maybe<Scalars['String']>;
  /** Path to the GitLab page for the GitLab commit attributed to the error. */
  gitlabCommitPath?: Maybe<Scalars['String']>;
  /** URL of GitLab Issue. */
  gitlabIssuePath?: Maybe<Scalars['String']>;
  /** ID (global ID) of the error. */
  id: Scalars['ID'];
  /** Error tracking backend. */
  integrated?: Maybe<Scalars['Boolean']>;
  /** Commit the error was last seen. */
  lastReleaseLastCommit?: Maybe<Scalars['String']>;
  /** Release short version the error was last seen. */
  lastReleaseShortVersion?: Maybe<Scalars['String']>;
  /** Release version the error was last seen. */
  lastReleaseVersion?: Maybe<Scalars['String']>;
  /** Timestamp when the error was last seen. */
  lastSeen: Scalars['Time'];
  /** Sentry metadata message of the error. */
  message?: Maybe<Scalars['String']>;
  /** ID (Sentry ID) of the error. */
  sentryId: Scalars['String'];
  /** ID of the project (Sentry project). */
  sentryProjectId: Scalars['ID'];
  /** Name of the project affected by the error. */
  sentryProjectName: Scalars['String'];
  /** Slug of the project affected by the error. */
  sentryProjectSlug: Scalars['String'];
  /** Short ID (Sentry ID) of the error. */
  shortId: Scalars['String'];
  /** Status of the error. */
  status: SentryErrorStatus;
  /** Tags associated with the Sentry Error. */
  tags: SentryErrorTags;
  /** Title of the error. */
  title: Scalars['String'];
  /** Type of the error. */
  type: Scalars['String'];
  /** Count of users affected by the error. */
  userCount: Scalars['Int'];
};

/** A Sentry error. A simplified version of SentryDetailedError */
export type SentryError = {
  __typename?: 'SentryError';
  /** Count of occurrences. */
  count: Scalars['Int'];
  /** Culprit of the error. */
  culprit: Scalars['String'];
  /** External URL of the error. */
  externalUrl: Scalars['String'];
  /** Timestamp when the error was first seen. */
  firstSeen: Scalars['Time'];
  /** Last 24hr stats of the error. */
  frequency: Array<SentryErrorFrequency>;
  /** ID (global ID) of the error. */
  id: Scalars['ID'];
  /** Timestamp when the error was last seen. */
  lastSeen: Scalars['Time'];
  /** Sentry metadata message of the error. */
  message?: Maybe<Scalars['String']>;
  /** ID (Sentry ID) of the error. */
  sentryId: Scalars['String'];
  /** ID of the project (Sentry project). */
  sentryProjectId: Scalars['ID'];
  /** Name of the project affected by the error. */
  sentryProjectName: Scalars['String'];
  /** Slug of the project affected by the error. */
  sentryProjectSlug: Scalars['String'];
  /** Short ID (Sentry ID) of the error. */
  shortId: Scalars['String'];
  /** Status of the error. */
  status: SentryErrorStatus;
  /** Title of the error. */
  title: Scalars['String'];
  /** Type of the error. */
  type: Scalars['String'];
  /** Count of users affected by the error. */
  userCount: Scalars['Int'];
};

/** An object containing a collection of Sentry errors, and a detailed error */
export type SentryErrorCollection = {
  __typename?: 'SentryErrorCollection';
  /** Detailed version of a Sentry error on the project. */
  detailedError?: Maybe<SentryDetailedError>;
  /** Stack Trace of Sentry Error. */
  errorStackTrace?: Maybe<SentryErrorStackTrace>;
  /** Collection of Sentry Errors. */
  errors?: Maybe<SentryErrorConnection>;
  /** External URL for Sentry. */
  externalUrl?: Maybe<Scalars['String']>;
};


/** An object containing a collection of Sentry errors, and a detailed error */
export type SentryErrorCollectionDetailedErrorArgs = {
  id: Scalars['GitlabErrorTrackingDetailedErrorID'];
};


/** An object containing a collection of Sentry errors, and a detailed error */
export type SentryErrorCollectionErrorStackTraceArgs = {
  id: Scalars['GitlabErrorTrackingDetailedErrorID'];
};


/** An object containing a collection of Sentry errors, and a detailed error */
export type SentryErrorCollectionErrorsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  searchTerm?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};

/** The connection type for SentryError. */
export type SentryErrorConnection = {
  __typename?: 'SentryErrorConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SentryErrorEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<SentryError>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SentryErrorEdge = {
  __typename?: 'SentryErrorEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<SentryError>;
};

export type SentryErrorFrequency = {
  __typename?: 'SentryErrorFrequency';
  /** Count of errors received since the previously recorded time. */
  count: Scalars['Int'];
  /** Time the error frequency stats were recorded. */
  time: Scalars['Time'];
};

/** An object containing a stack trace entry for a Sentry error */
export type SentryErrorStackTrace = {
  __typename?: 'SentryErrorStackTrace';
  /** Time the stack trace was received by Sentry. */
  dateReceived: Scalars['String'];
  /** ID of the Sentry error. */
  issueId: Scalars['String'];
  /** Stack trace entries for the Sentry error. */
  stackTraceEntries: Array<SentryErrorStackTraceEntry>;
};

/** An object context for a Sentry error stack trace */
export type SentryErrorStackTraceContext = {
  __typename?: 'SentryErrorStackTraceContext';
  /** Code number of the context. */
  code: Scalars['String'];
  /** Line number of the context. */
  line: Scalars['Int'];
};

/** An object containing a stack trace entry for a Sentry error */
export type SentryErrorStackTraceEntry = {
  __typename?: 'SentryErrorStackTraceEntry';
  /** Function in which the Sentry error occurred. */
  col?: Maybe<Scalars['String']>;
  /** File in which the Sentry error occurred. */
  fileName?: Maybe<Scalars['String']>;
  /** Function in which the Sentry error occurred. */
  function?: Maybe<Scalars['String']>;
  /** Function in which the Sentry error occurred. */
  line?: Maybe<Scalars['String']>;
  /** Context of the Sentry error. */
  traceContext?: Maybe<Array<SentryErrorStackTraceContext>>;
};

/** State of a Sentry error */
export type SentryErrorStatus =
  /** Error has been ignored. */
  | 'IGNORED'
  /** Error has been resolved. */
  | 'RESOLVED'
  /** Error has been ignored until next release. */
  | 'RESOLVED_IN_NEXT_RELEASE'
  /** Error is unresolved. */
  | 'UNRESOLVED';

/** State of a Sentry error */
export type SentryErrorTags = {
  __typename?: 'SentryErrorTags';
  /** Severity level of the Sentry Error. */
  level?: Maybe<Scalars['String']>;
  /** Logger of the Sentry Error. */
  logger?: Maybe<Scalars['String']>;
};

export type Service = {
  /** Indicates if the service is active. */
  active?: Maybe<Scalars['Boolean']>;
  /** Class name of the service. */
  type?: Maybe<Scalars['String']>;
};

/** The connection type for Service. */
export type ServiceConnection = {
  __typename?: 'ServiceConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<ServiceEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Service>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type ServiceEdge = {
  __typename?: 'ServiceEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Service>;
};

export type ServiceType =
  /** AsanaService type */
  | 'ASANA_SERVICE'
  /** AssemblaService type */
  | 'ASSEMBLA_SERVICE'
  /** BambooService type */
  | 'BAMBOO_SERVICE'
  /** BugzillaService type */
  | 'BUGZILLA_SERVICE'
  /** BuildkiteService type */
  | 'BUILDKITE_SERVICE'
  /** CampfireService type */
  | 'CAMPFIRE_SERVICE'
  /** ConfluenceService type */
  | 'CONFLUENCE_SERVICE'
  /** CustomIssueTrackerService type */
  | 'CUSTOM_ISSUE_TRACKER_SERVICE'
  /** DatadogService type */
  | 'DATADOG_SERVICE'
  /** DiscordService type */
  | 'DISCORD_SERVICE'
  /** DroneCiService type */
  | 'DRONE_CI_SERVICE'
  /** EmailsOnPushService type */
  | 'EMAILS_ON_PUSH_SERVICE'
  /** EwmService type */
  | 'EWM_SERVICE'
  /** ExternalWikiService type */
  | 'EXTERNAL_WIKI_SERVICE'
  /** FlowdockService type */
  | 'FLOWDOCK_SERVICE'
  /** GithubService type */
  | 'GITHUB_SERVICE'
  /** GitlabSlackApplicationService type */
  | 'GITLAB_SLACK_APPLICATION_SERVICE'
  /** HangoutsChatService type */
  | 'HANGOUTS_CHAT_SERVICE'
  /** IrkerService type */
  | 'IRKER_SERVICE'
  /** JenkinsService type */
  | 'JENKINS_SERVICE'
  /** JiraService type */
  | 'JIRA_SERVICE'
  /** MattermostService type */
  | 'MATTERMOST_SERVICE'
  /** MattermostSlashCommandsService type */
  | 'MATTERMOST_SLASH_COMMANDS_SERVICE'
  /** MicrosoftTeamsService type */
  | 'MICROSOFT_TEAMS_SERVICE'
  /** PackagistService type */
  | 'PACKAGIST_SERVICE'
  /** PipelinesEmailService type */
  | 'PIPELINES_EMAIL_SERVICE'
  /** PivotaltrackerService type */
  | 'PIVOTALTRACKER_SERVICE'
  /** PrometheusService type */
  | 'PROMETHEUS_SERVICE'
  /** PushoverService type */
  | 'PUSHOVER_SERVICE'
  /** RedmineService type */
  | 'REDMINE_SERVICE'
  /** SlackService type */
  | 'SLACK_SERVICE'
  /** SlackSlashCommandsService type */
  | 'SLACK_SLASH_COMMANDS_SERVICE'
  /** TeamcityService type */
  | 'TEAMCITY_SERVICE'
  /** UnifyCircuitService type */
  | 'UNIFY_CIRCUIT_SERVICE'
  /** WebexTeamsService type */
  | 'WEBEX_TEAMS_SERVICE'
  /** YoutrackService type */
  | 'YOUTRACK_SERVICE'
  /** ZentaoService type */
  | 'ZENTAO_SERVICE';

export type SharedRunnersSetting =
  /** Sharing of runners is disabled and unoverridable. */
  | 'DISABLED_AND_UNOVERRIDABLE'
  /** Sharing of runners is disabled with override. */
  | 'DISABLED_WITH_OVERRIDE'
  /** Sharing of runners is enabled. */
  | 'ENABLED';

/** Represents a snippet entry */
export type Snippet = NoteableInterface & {
  __typename?: 'Snippet';
  /** Owner of the snippet. */
  author?: Maybe<UserCore>;
  /** Snippet blobs. */
  blobs?: Maybe<SnippetBlobConnection>;
  /** Timestamp this snippet was created. */
  createdAt: Scalars['Time'];
  /** Description of the snippet. */
  description?: Maybe<Scalars['String']>;
  /** The GitLab Flavored Markdown rendering of `description` */
  descriptionHtml?: Maybe<Scalars['String']>;
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** File Name of the snippet. */
  fileName?: Maybe<Scalars['String']>;
  /** HTTP URL to the snippet repository. */
  httpUrlToRepo?: Maybe<Scalars['String']>;
  /** ID of the snippet. */
  id: Scalars['SnippetID'];
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** Project the snippet is associated with. */
  project?: Maybe<Project>;
  /** Raw URL of the snippet. */
  rawUrl: Scalars['String'];
  /** SSH URL to the snippet repository. */
  sshUrlToRepo?: Maybe<Scalars['String']>;
  /** Title of the snippet. */
  title: Scalars['String'];
  /** Timestamp this snippet was updated. */
  updatedAt: Scalars['Time'];
  /** Permissions for the current user on the resource */
  userPermissions: SnippetPermissions;
  /** Visibility Level of the snippet. */
  visibilityLevel: VisibilityLevelsEnum;
  /** Web URL of the snippet. */
  webUrl: Scalars['String'];
};


/** Represents a snippet entry */
export type SnippetBlobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  paths?: InputMaybe<Array<Scalars['String']>>;
};


/** Represents a snippet entry */
export type SnippetDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a snippet entry */
export type SnippetNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Represents the snippet blob */
export type SnippetBlob = {
  __typename?: 'SnippetBlob';
  /** Shows whether the blob is binary. */
  binary: Scalars['Boolean'];
  /** Blob external storage. */
  externalStorage?: Maybe<Scalars['String']>;
  /** Blob mode. */
  mode?: Maybe<Scalars['String']>;
  /** Blob name. */
  name?: Maybe<Scalars['String']>;
  /** Blob path. */
  path?: Maybe<Scalars['String']>;
  /** Blob plain highlighted data. */
  plainData?: Maybe<Scalars['String']>;
  /** Blob raw content endpoint path. */
  rawPath: Scalars['String'];
  /** Raw content of the blob, if the blob is text data. */
  rawPlainData?: Maybe<Scalars['String']>;
  /** Shows whether the blob is rendered as text. */
  renderedAsText: Scalars['Boolean'];
  /** Blob highlighted data. */
  richData?: Maybe<Scalars['String']>;
  /** Blob content rich viewer. */
  richViewer?: Maybe<SnippetBlobViewer>;
  /** Blob content simple viewer. */
  simpleViewer: SnippetBlobViewer;
  /** Blob size. */
  size: Scalars['Int'];
};

/** Type of a snippet blob input action */
export type SnippetBlobActionEnum =
  /** Create a snippet blob. */
  | 'create'
  /** Delete a snippet blob. */
  | 'delete'
  /** Move a snippet blob. */
  | 'move'
  /** Update a snippet blob. */
  | 'update';

/** Represents an action to perform over a snippet file */
export type SnippetBlobActionInputType = {
  /** Type of input action. */
  action: SnippetBlobActionEnum;
  /** Snippet file content. */
  content?: InputMaybe<Scalars['String']>;
  /** Path of the snippet file. */
  filePath: Scalars['String'];
  /** Previous path of the snippet file. */
  previousPath?: InputMaybe<Scalars['String']>;
};

/** The connection type for SnippetBlob. */
export type SnippetBlobConnection = {
  __typename?: 'SnippetBlobConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SnippetBlobEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<SnippetBlob>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SnippetBlobEdge = {
  __typename?: 'SnippetBlobEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<SnippetBlob>;
};

/** Represents how the blob content should be displayed */
export type SnippetBlobViewer = {
  __typename?: 'SnippetBlobViewer';
  /** Shows whether the blob should be displayed collapsed. */
  collapsed: Scalars['Boolean'];
  /** Content file type. */
  fileType: Scalars['String'];
  /** Shows whether the blob content is loaded asynchronously. */
  loadAsync: Scalars['Boolean'];
  /** Loading partial name. */
  loadingPartialName: Scalars['String'];
  /** Error rendering the blob content. */
  renderError?: Maybe<Scalars['String']>;
  /** Shows whether the blob is too large to be displayed. */
  tooLarge: Scalars['Boolean'];
  /** Type of blob viewer. */
  type: BlobViewersType;
};

/** The connection type for Snippet. */
export type SnippetConnection = {
  __typename?: 'SnippetConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SnippetEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Snippet>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SnippetEdge = {
  __typename?: 'SnippetEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Snippet>;
};

export type SnippetPermissions = {
  __typename?: 'SnippetPermissions';
  /** Indicates the user can perform `admin_snippet` on this resource */
  adminSnippet: Scalars['Boolean'];
  /** Indicates the user can perform `award_emoji` on this resource */
  awardEmoji: Scalars['Boolean'];
  /** Indicates the user can perform `create_note` on this resource */
  createNote: Scalars['Boolean'];
  /** Indicates the user can perform `read_snippet` on this resource */
  readSnippet: Scalars['Boolean'];
  /** Indicates the user can perform `report_snippet` on this resource */
  reportSnippet: Scalars['Boolean'];
  /** Indicates the user can perform `update_snippet` on this resource */
  updateSnippet: Scalars['Boolean'];
};

/** Represents the Geo sync and verification state of a snippet repository */
export type SnippetRepositoryRegistry = {
  __typename?: 'SnippetRepositoryRegistry';
  /** Timestamp when the SnippetRepositoryRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the SnippetRepositoryRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the SnippetRepositoryRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the SnippetRepositoryRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** Timestamp after which the SnippetRepositoryRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the SnippetRepositoryRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** ID of the Snippet Repository. */
  snippetRepositoryId: Scalars['ID'];
  /** Sync state of the SnippetRepositoryRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for SnippetRepositoryRegistry. */
export type SnippetRepositoryRegistryConnection = {
  __typename?: 'SnippetRepositoryRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SnippetRepositoryRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<SnippetRepositoryRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SnippetRepositoryRegistryEdge = {
  __typename?: 'SnippetRepositoryRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<SnippetRepositoryRegistry>;
};

/** Common sort values */
export type Sort =
  /** Created at ascending order. */
  | 'CREATED_ASC'
  /** Created at descending order. */
  | 'CREATED_DESC'
  /** Updated at ascending order. */
  | 'UPDATED_ASC'
  /** Updated at descending order. */
  | 'UPDATED_DESC'
  /** Created at ascending order. */
  | 'created_asc'
  /** Created at descending order. */
  | 'created_desc'
  /** Updated at ascending order. */
  | 'updated_asc'
  /** Updated at descending order. */
  | 'updated_desc';

export type StatusAction = {
  __typename?: 'StatusAction';
  /** Title for the button, for example: Retry this job. */
  buttonTitle?: Maybe<Scalars['String']>;
  /** Icon used in the action button. */
  icon?: Maybe<Scalars['String']>;
  /** ID for a status action. */
  id: Scalars['String'];
  /** Method for the action, for example: :post. */
  method?: Maybe<Scalars['String']>;
  /** Path for the action. */
  path?: Maybe<Scalars['String']>;
  /** Title for the action, for example: Retry. */
  title?: Maybe<Scalars['String']>;
};

export type Submodule = Entry & {
  __typename?: 'Submodule';
  /** Flat path of the entry. */
  flatPath: Scalars['String'];
  /** ID of the entry. */
  id: Scalars['ID'];
  /** Name of the entry. */
  name: Scalars['String'];
  /** Path of the entry. */
  path: Scalars['String'];
  /** Last commit SHA for the entry. */
  sha: Scalars['String'];
  /** Tree URL for the sub-module. */
  treeUrl?: Maybe<Scalars['String']>;
  /** Type of tree entry. */
  type: EntryType;
  /** Web URL for the sub-module. */
  webUrl?: Maybe<Scalars['String']>;
};

/** The connection type for Submodule. */
export type SubmoduleConnection = {
  __typename?: 'SubmoduleConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<SubmoduleEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Submodule>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SubmoduleEdge = {
  __typename?: 'SubmoduleEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Submodule>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Triggered when the assignees of an issuable are updated. */
  issuableAssigneesUpdated?: Maybe<Issuable>;
};


export type SubscriptionIssuableAssigneesUpdatedArgs = {
  issuableId: Scalars['IssuableID'];
};

/** Completion status of tasks */
export type TaskCompletionStatus = {
  __typename?: 'TaskCompletionStatus';
  /** Number of completed tasks. */
  completedCount: Scalars['Int'];
  /** Number of total tasks. */
  count: Scalars['Int'];
};

export type TerraformState = {
  __typename?: 'TerraformState';
  /** Timestamp the Terraform state was created. */
  createdAt: Scalars['Time'];
  /** ID of the Terraform state. */
  id: Scalars['ID'];
  /** Latest version of the Terraform state. */
  latestVersion?: Maybe<TerraformStateVersion>;
  /** Timestamp the Terraform state was locked. */
  lockedAt?: Maybe<Scalars['Time']>;
  /** User currently holding a lock on the Terraform state. */
  lockedByUser?: Maybe<UserCore>;
  /** Name of the Terraform state. */
  name: Scalars['String'];
  /** Timestamp the Terraform state was updated. */
  updatedAt: Scalars['Time'];
};

/** The connection type for TerraformState. */
export type TerraformStateConnection = {
  __typename?: 'TerraformStateConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TerraformStateEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<TerraformState>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of TerraformStateDelete */
export type TerraformStateDeleteInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the Terraform state. */
  id: Scalars['TerraformStateID'];
};

/** Autogenerated return type of TerraformStateDelete */
export type TerraformStateDeletePayload = {
  __typename?: 'TerraformStateDeletePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type TerraformStateEdge = {
  __typename?: 'TerraformStateEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<TerraformState>;
};

/** Autogenerated input type of TerraformStateLock */
export type TerraformStateLockInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the Terraform state. */
  id: Scalars['TerraformStateID'];
};

/** Autogenerated return type of TerraformStateLock */
export type TerraformStateLockPayload = {
  __typename?: 'TerraformStateLockPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of TerraformStateUnlock */
export type TerraformStateUnlockInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the Terraform state. */
  id: Scalars['TerraformStateID'];
};

/** Autogenerated return type of TerraformStateUnlock */
export type TerraformStateUnlockPayload = {
  __typename?: 'TerraformStateUnlockPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type TerraformStateVersion = {
  __typename?: 'TerraformStateVersion';
  /** Timestamp the version was created. */
  createdAt: Scalars['Time'];
  /** User that created this version. */
  createdByUser?: Maybe<UserCore>;
  /** URL for downloading the version's JSON file. */
  downloadPath?: Maybe<Scalars['String']>;
  /** ID of the Terraform state version. */
  id: Scalars['ID'];
  /** Job that created this version. */
  job?: Maybe<CiJob>;
  /** Serial number of the version. */
  serial?: Maybe<Scalars['Int']>;
  /** Timestamp the version was updated. */
  updatedAt: Scalars['Time'];
};

/** Represents the Geo sync and verification state of a terraform state version */
export type TerraformStateVersionRegistry = {
  __typename?: 'TerraformStateVersionRegistry';
  /** Timestamp when the TerraformStateVersionRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the TerraformStateVersionRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the TerraformStateVersionRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the TerraformStateVersionRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** Timestamp after which the TerraformStateVersionRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the TerraformStateVersionRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the TerraformStateVersionRegistry */
  state?: Maybe<RegistryState>;
  /** ID of the terraform state version. */
  terraformStateVersionId: Scalars['ID'];
};

/** The connection type for TerraformStateVersionRegistry. */
export type TerraformStateVersionRegistryConnection = {
  __typename?: 'TerraformStateVersionRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TerraformStateVersionRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<TerraformStateVersionRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TerraformStateVersionRegistryEdge = {
  __typename?: 'TerraformStateVersionRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<TerraformStateVersionRegistry>;
};

/** Test case in pipeline test report. */
export type TestCase = {
  __typename?: 'TestCase';
  /** URL of the test case attachment file. */
  attachmentUrl?: Maybe<Scalars['String']>;
  /** Classname of the test case. */
  classname?: Maybe<Scalars['String']>;
  /** Test case execution time in seconds. */
  executionTime?: Maybe<Scalars['Float']>;
  /** Path to the file of the test case. */
  file?: Maybe<Scalars['String']>;
  /** Name of the test case. */
  name?: Maybe<Scalars['String']>;
  /** Recent failure history of the test case on the base branch. */
  recentFailures?: Maybe<RecentFailures>;
  /** Stack trace of the test case. */
  stackTrace?: Maybe<Scalars['String']>;
  /** Status of the test case (error, failed, success, skipped). */
  status?: Maybe<TestCaseStatus>;
  /** System output of the test case. */
  systemOutput?: Maybe<Scalars['String']>;
};

/** The connection type for TestCase. */
export type TestCaseConnection = {
  __typename?: 'TestCaseConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TestCaseEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<TestCase>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TestCaseEdge = {
  __typename?: 'TestCaseEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<TestCase>;
};

export type TestCaseStatus =
  /** Test case that has a status of error. */
  | 'error'
  /** Test case that has a status of failed. */
  | 'failed'
  /** Test case that has a status of skipped. */
  | 'skipped'
  /** Test case that has a status of success. */
  | 'success';

/** Represents a requirement test report */
export type TestReport = {
  __typename?: 'TestReport';
  /** Author of the test report. */
  author?: Maybe<UserCore>;
  /** Timestamp of when the test report was created. */
  createdAt: Scalars['Time'];
  /** ID of the test report. */
  id: Scalars['ID'];
  /** State of the test report. */
  state: TestReportState;
};

/** The connection type for TestReport. */
export type TestReportConnection = {
  __typename?: 'TestReportConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TestReportEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<TestReport>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TestReportEdge = {
  __typename?: 'TestReportEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<TestReport>;
};

/** State of a test report */
export type TestReportState =
  /** Failed test report. */
  | 'FAILED'
  /** Passed test report. */
  | 'PASSED';

/** Test report for a pipeline */
export type TestReportSummary = {
  __typename?: 'TestReportSummary';
  /** Test suites belonging to a pipeline test report. */
  testSuites: TestSuiteSummaryConnection;
  /** Total report statistics for a pipeline test report. */
  total: TestReportTotal;
};


/** Test report for a pipeline */
export type TestReportSummaryTestSuitesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Total test report statistics. */
export type TestReportTotal = {
  __typename?: 'TestReportTotal';
  /** Total number of the test cases. */
  count?: Maybe<Scalars['Int']>;
  /** Total number of test cases that had an error. */
  error?: Maybe<Scalars['Int']>;
  /** Total number of test cases that failed. */
  failed?: Maybe<Scalars['Int']>;
  /** Total number of test cases that were skipped. */
  skipped?: Maybe<Scalars['Int']>;
  /** Total number of test cases that succeeded. */
  success?: Maybe<Scalars['Int']>;
  /** Test suite error message. */
  suiteError?: Maybe<Scalars['String']>;
  /** Total duration of the tests. */
  time?: Maybe<Scalars['Float']>;
};

/** Test suite in a pipeline test report. */
export type TestSuite = {
  __typename?: 'TestSuite';
  /** Total number of test cases that had an error. */
  errorCount?: Maybe<Scalars['Int']>;
  /** Total number of test cases that failed in the test suite. */
  failedCount?: Maybe<Scalars['Int']>;
  /** Name of the test suite. */
  name?: Maybe<Scalars['String']>;
  /** Total number of test cases that were skipped in the test suite. */
  skippedCount?: Maybe<Scalars['Int']>;
  /** Total number of test cases that succeeded in the test suite. */
  successCount?: Maybe<Scalars['Int']>;
  /** Test suite error message. */
  suiteError?: Maybe<Scalars['String']>;
  /** Test cases in the test suite. */
  testCases?: Maybe<TestCaseConnection>;
  /** Total number of the test cases in the test suite. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Total duration of the tests in the test suite. */
  totalTime?: Maybe<Scalars['Float']>;
};


/** Test suite in a pipeline test report. */
export type TestSuiteTestCasesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Test suite summary in a pipeline test report. */
export type TestSuiteSummary = {
  __typename?: 'TestSuiteSummary';
  /** IDs of the builds used to run the test suite. */
  buildIds?: Maybe<Array<Scalars['ID']>>;
  /** Total number of test cases that had an error. */
  errorCount?: Maybe<Scalars['Int']>;
  /** Total number of test cases that failed in the test suite. */
  failedCount?: Maybe<Scalars['Int']>;
  /** Name of the test suite. */
  name?: Maybe<Scalars['String']>;
  /** Total number of test cases that were skipped in the test suite. */
  skippedCount?: Maybe<Scalars['Int']>;
  /** Total number of test cases that succeeded in the test suite. */
  successCount?: Maybe<Scalars['Int']>;
  /** Test suite error message. */
  suiteError?: Maybe<Scalars['String']>;
  /** Total number of the test cases in the test suite. */
  totalCount?: Maybe<Scalars['Int']>;
  /** Total duration of the tests in the test suite. */
  totalTime?: Maybe<Scalars['Float']>;
};

/** The connection type for TestSuiteSummary. */
export type TestSuiteSummaryConnection = {
  __typename?: 'TestSuiteSummaryConnection';
  /** Total count of collection. */
  count: Scalars['Int'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TestSuiteSummaryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<TestSuiteSummary>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TestSuiteSummaryEdge = {
  __typename?: 'TestSuiteSummaryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<TestSuiteSummary>;
};

/** Represents the time report stats for timeboxes */
export type TimeReportStats = {
  __typename?: 'TimeReportStats';
  /** Completed issues metrics. */
  complete?: Maybe<TimeboxMetrics>;
  /** Incomplete issues metrics. */
  incomplete?: Maybe<TimeboxMetrics>;
  /** Total issues metrics. */
  total?: Maybe<TimeboxMetrics>;
};

/** Represents measured stats metrics for timeboxes */
export type TimeboxMetrics = {
  __typename?: 'TimeboxMetrics';
  /** Count metric. */
  count: Scalars['Int'];
  /** Weight metric. */
  weight: Scalars['Int'];
};

/** Represents a historically accurate report about the timebox */
export type TimeboxReport = {
  __typename?: 'TimeboxReport';
  /** Daily scope and completed totals for burnup charts. */
  burnupTimeSeries?: Maybe<Array<BurnupChartDailyTotals>>;
  /** Represents the time report stats for the timebox. */
  stats?: Maybe<TimeReportStats>;
};

export type TimeboxReportInterface = {
  /** Historically accurate report about the timebox. */
  report?: Maybe<TimeboxReport>;
};

/** A time-frame defined as a closed inclusive range of two dates */
export type Timeframe = {
  /** End of the range. */
  end: Scalars['Date'];
  /** Start of the range. */
  start: Scalars['Date'];
};

export type Timelog = {
  __typename?: 'Timelog';
  /** Issue that logged time was added to. */
  issue?: Maybe<Issue>;
  /** Merge request that logged time was added to. */
  mergeRequest?: Maybe<MergeRequest>;
  /** Note where the quick action was executed to add the logged time. */
  note?: Maybe<Note>;
  /** Timestamp of when the time tracked was spent at. */
  spentAt?: Maybe<Scalars['Time']>;
  /** Summary of how the time was spent. */
  summary?: Maybe<Scalars['String']>;
  /** Time spent displayed in seconds. */
  timeSpent: Scalars['Int'];
  /** User that logged the time. */
  user: UserCore;
};

/** The connection type for Timelog. */
export type TimelogConnection = {
  __typename?: 'TimelogConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TimelogEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Timelog>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TimelogEdge = {
  __typename?: 'TimelogEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Timelog>;
};

/** Representing a to-do entry */
export type Todo = {
  __typename?: 'Todo';
  /** Action of the to-do item. */
  action: TodoActionEnum;
  /** Author of this to-do item. */
  author: UserCore;
  /** Body of the to-do item. */
  body: Scalars['String'];
  /** Timestamp this to-do item was created. */
  createdAt: Scalars['Time'];
  /** Group this to-do item is associated with. */
  group?: Maybe<Group>;
  /** ID of the to-do item. */
  id: Scalars['ID'];
  /** Project this to-do item is associated with. */
  project?: Maybe<Project>;
  /** State of the to-do item. */
  state: TodoStateEnum;
  /** Target type of the to-do item. */
  targetType: TodoTargetEnum;
};

export type TodoActionEnum =
  /** User was set as an approver. */
  | 'approval_required'
  /** User was assigned. */
  | 'assigned'
  /** Build triggered by the user failed. */
  | 'build_failed'
  /** User was directly addressed. */
  | 'directly_addressed'
  /** User added a TODO. */
  | 'marked'
  /** User was mentioned. */
  | 'mentioned'
  /** Merge request authored by the user was removed from the merge train. */
  | 'merge_train_removed'
  /** Review was requested from the user. */
  | 'review_requested'
  /** Merge request authored by the user could not be merged. */
  | 'unmergeable';

/** The connection type for Todo. */
export type TodoConnection = {
  __typename?: 'TodoConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TodoEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Todo>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of TodoCreate */
export type TodoCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the to-do item's parent. Issues, merge requests, designs, and epics are supported. */
  targetId: Scalars['TodoableID'];
};

/** Autogenerated return type of TodoCreate */
export type TodoCreatePayload = {
  __typename?: 'TodoCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** To-do item created. */
  todo?: Maybe<Todo>;
};

/** An edge in a connection. */
export type TodoEdge = {
  __typename?: 'TodoEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Todo>;
};

/** Autogenerated input type of TodoMarkDone */
export type TodoMarkDoneInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the to-do item to mark as done. */
  id: Scalars['TodoID'];
};

/** Autogenerated return type of TodoMarkDone */
export type TodoMarkDonePayload = {
  __typename?: 'TodoMarkDonePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Requested to-do item. */
  todo: Todo;
};

/** Autogenerated input type of TodoRestore */
export type TodoRestoreInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the to-do item to restore. */
  id: Scalars['TodoID'];
};

/** Autogenerated input type of TodoRestoreMany */
export type TodoRestoreManyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global IDs of the to-do items to restore (a maximum of 50 is supported at once). */
  ids: Array<Scalars['TodoID']>;
};

/** Autogenerated return type of TodoRestoreMany */
export type TodoRestoreManyPayload = {
  __typename?: 'TodoRestoreManyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Updated to-do items. */
  todos: Array<Todo>;
};

/** Autogenerated return type of TodoRestore */
export type TodoRestorePayload = {
  __typename?: 'TodoRestorePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Requested to-do item. */
  todo: Todo;
};

export type TodoStateEnum =
  /** State of the todo is done. */
  | 'done'
  /** State of the todo is pending. */
  | 'pending';

export type TodoTargetEnum =
  /** Alert. */
  | 'ALERT'
  /** Commit. */
  | 'COMMIT'
  /** Design. */
  | 'DESIGN'
  /** An Epic. */
  | 'EPIC'
  /** Issue. */
  | 'ISSUE'
  /** Merge request. */
  | 'MERGEREQUEST';

/** Autogenerated input type of TodosMarkAllDone */
export type TodosMarkAllDoneInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of TodosMarkAllDone */
export type TodosMarkAllDonePayload = {
  __typename?: 'TodosMarkAllDonePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Updated to-do items. */
  todos: Array<Todo>;
};

export type Tree = {
  __typename?: 'Tree';
  /** Blobs of the tree. */
  blobs: BlobConnection;
  /** Last commit for the tree. */
  lastCommit?: Maybe<Commit>;
  /** Sub-modules of the tree. */
  submodules: SubmoduleConnection;
  /** Trees of the tree. */
  trees: TreeEntryConnection;
};


export type TreeBlobsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type TreeSubmodulesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type TreeTreesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** The connection type for Tree. */
export type TreeConnection = {
  __typename?: 'TreeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TreeEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Tree>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TreeEdge = {
  __typename?: 'TreeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Tree>;
};

/** Represents a directory */
export type TreeEntry = Entry & {
  __typename?: 'TreeEntry';
  /** Flat path of the entry. */
  flatPath: Scalars['String'];
  /** ID of the entry. */
  id: Scalars['ID'];
  /** Name of the entry. */
  name: Scalars['String'];
  /** Path of the entry. */
  path: Scalars['String'];
  /** Last commit SHA for the entry. */
  sha: Scalars['String'];
  /** Type of tree entry. */
  type: EntryType;
  /** Web path for the tree entry (directory). */
  webPath?: Maybe<Scalars['String']>;
  /** Web URL for the tree entry (directory). */
  webUrl?: Maybe<Scalars['String']>;
};

/** The connection type for TreeEntry. */
export type TreeEntryConnection = {
  __typename?: 'TreeEntryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TreeEntryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<TreeEntry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TreeEntryEdge = {
  __typename?: 'TreeEntryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<TreeEntry>;
};

export type TypeEnum =
  /** Snippet created independent of any project. */
  | 'personal'
  /** Snippet related to a specific project. */
  | 'project';

/** Autogenerated input type of UpdateAlertStatus */
export type UpdateAlertStatusInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** IID of the alert to mutate. */
  iid: Scalars['String'];
  /** Project the alert to mutate is in. */
  projectPath: Scalars['ID'];
  /** Status to set the alert. */
  status: AlertManagementStatus;
};

/** Autogenerated return type of UpdateAlertStatus */
export type UpdateAlertStatusPayload = {
  __typename?: 'UpdateAlertStatusPayload';
  /** Alert after mutation. */
  alert?: Maybe<AlertManagementAlert>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue created after mutation. */
  issue?: Maybe<Issue>;
  /** To-do item after mutation. */
  todo?: Maybe<Todo>;
};

/** Autogenerated input type of UpdateBoardEpicUserPreferences */
export type UpdateBoardEpicUserPreferencesInput = {
  /** Board global ID. */
  boardId: Scalars['BoardID'];
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Whether the epic should be collapsed in the board. */
  collapsed: Scalars['Boolean'];
  /** ID of an epic to set preferences for. */
  epicId: Scalars['EpicID'];
};

/** Autogenerated return type of UpdateBoardEpicUserPreferences */
export type UpdateBoardEpicUserPreferencesPayload = {
  __typename?: 'UpdateBoardEpicUserPreferencesPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** User preferences for the epic in the board after mutation. */
  epicUserPreferences?: Maybe<BoardEpicUserPreferences>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of UpdateBoard */
export type UpdateBoardInput = {
  /** ID of user to be assigned to the board. */
  assigneeId?: InputMaybe<Scalars['UserID']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Whether or not backlog list is hidden. */
  hideBacklogList?: InputMaybe<Scalars['Boolean']>;
  /** Whether or not closed list is hidden. */
  hideClosedList?: InputMaybe<Scalars['Boolean']>;
  /** Board global ID. */
  id: Scalars['BoardID'];
  /** ID of iteration cadence to be assigned to the board. */
  iterationCadenceId?: InputMaybe<Scalars['IterationsCadenceID']>;
  /** ID of iteration to be assigned to the board. */
  iterationId?: InputMaybe<Scalars['IterationID']>;
  /** IDs of labels to be added to the board. */
  labelIds?: InputMaybe<Array<Scalars['LabelID']>>;
  /** Labels of the issue. */
  labels?: InputMaybe<Array<Scalars['String']>>;
  /** ID of milestone to be assigned to the board. */
  milestoneId?: InputMaybe<Scalars['MilestoneID']>;
  /** Board name. */
  name?: InputMaybe<Scalars['String']>;
  /** Weight value to be assigned to the board. */
  weight?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated input type of UpdateBoardList */
export type UpdateBoardListInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates if the list is collapsed for this user. */
  collapsed?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the list. */
  listId: Scalars['ListID'];
  /** Position of list within the board. */
  position?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of UpdateBoardList */
export type UpdateBoardListPayload = {
  __typename?: 'UpdateBoardListPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Mutated list. */
  list?: Maybe<BoardList>;
};

/** Autogenerated return type of UpdateBoard */
export type UpdateBoardPayload = {
  __typename?: 'UpdateBoardPayload';
  /** Board after mutation. */
  board?: Maybe<Board>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of UpdateComplianceFramework */
export type UpdateComplianceFrameworkInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the compliance framework to update. */
  id: Scalars['ComplianceManagementFrameworkID'];
  /** Parameters to update the compliance framework with. */
  params: ComplianceFrameworkInput;
};

/** Autogenerated return type of UpdateComplianceFramework */
export type UpdateComplianceFrameworkPayload = {
  __typename?: 'UpdateComplianceFrameworkPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Compliance framework after mutation. */
  complianceFramework?: Maybe<ComplianceFramework>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of UpdateContainerExpirationPolicy */
export type UpdateContainerExpirationPolicyInput = {
  /** This container expiration policy schedule. */
  cadence?: InputMaybe<ContainerExpirationPolicyCadenceEnum>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates whether this container expiration policy is enabled. */
  enabled?: InputMaybe<Scalars['Boolean']>;
  /** Number of tags to retain. */
  keepN?: InputMaybe<ContainerExpirationPolicyKeepEnum>;
  /** Tags with names matching this regex pattern will expire. */
  nameRegex?: InputMaybe<Scalars['UntrustedRegexp']>;
  /** Tags with names matching this regex pattern will be preserved. */
  nameRegexKeep?: InputMaybe<Scalars['UntrustedRegexp']>;
  /** Tags older that this will expire. */
  olderThan?: InputMaybe<ContainerExpirationPolicyOlderThanEnum>;
  /** Project path where the container expiration policy is located. */
  projectPath: Scalars['ID'];
};

/** Autogenerated return type of UpdateContainerExpirationPolicy */
export type UpdateContainerExpirationPolicyPayload = {
  __typename?: 'UpdateContainerExpirationPolicyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Container expiration policy after mutation. */
  containerExpirationPolicy?: Maybe<ContainerExpirationPolicy>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of UpdateDependencyProxyImageTtlGroupPolicy */
export type UpdateDependencyProxyImageTtlGroupPolicyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates whether the policy is enabled or disabled. */
  enabled?: InputMaybe<Scalars['Boolean']>;
  /** Group path for the group dependency proxy image TTL policy. */
  groupPath: Scalars['ID'];
  /** Number of days to retain a cached image file. */
  ttl?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of UpdateDependencyProxyImageTtlGroupPolicy */
export type UpdateDependencyProxyImageTtlGroupPolicyPayload = {
  __typename?: 'UpdateDependencyProxyImageTtlGroupPolicyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Group image TTL policy after mutation. */
  dependencyProxyImageTtlPolicy?: Maybe<DependencyProxyImageTtlGroupPolicy>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of UpdateDependencyProxySettings */
export type UpdateDependencyProxySettingsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates whether the policy is enabled or disabled. */
  enabled?: InputMaybe<Scalars['Boolean']>;
  /** Group path for the group dependency proxy. */
  groupPath: Scalars['ID'];
};

/** Autogenerated return type of UpdateDependencyProxySettings */
export type UpdateDependencyProxySettingsPayload = {
  __typename?: 'UpdateDependencyProxySettingsPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Group dependency proxy settings after mutation. */
  dependencyProxySetting?: Maybe<DependencyProxySetting>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

export type UpdateDiffImagePositionInput = {
  /** Total height of the image. */
  height?: InputMaybe<Scalars['Int']>;
  /** Total width of the image. */
  width?: InputMaybe<Scalars['Int']>;
  /** X position of the note. */
  x?: InputMaybe<Scalars['Int']>;
  /** Y position of the note. */
  y?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated input type of UpdateEpicBoardList */
export type UpdateEpicBoardListInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates if the list is collapsed for this user. */
  collapsed?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the epic list. */
  listId: Scalars['BoardsEpicListID'];
  /** Position of list within the board. */
  position?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of UpdateEpicBoardList */
export type UpdateEpicBoardListPayload = {
  __typename?: 'UpdateEpicBoardListPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Mutated epic list. */
  list?: Maybe<EpicList>;
};

/** Autogenerated input type of UpdateEpic */
export type UpdateEpicInput = {
  /** IDs of labels to be added to the epic. */
  addLabelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates if the epic is confidential. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Description of the epic. */
  description?: InputMaybe<Scalars['String']>;
  /** End date of the epic. */
  dueDateFixed?: InputMaybe<Scalars['String']>;
  /** Indicates end date should be sourced from due_date_fixed field not the issue milestones. */
  dueDateIsFixed?: InputMaybe<Scalars['Boolean']>;
  /** Group the epic to mutate is in. */
  groupPath: Scalars['ID'];
  /** IID of the epic to mutate. */
  iid: Scalars['ID'];
  /** IDs of labels to be removed from the epic. */
  removeLabelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** Start date of the epic. */
  startDateFixed?: InputMaybe<Scalars['String']>;
  /** Indicates start date should be sourced from start_date_fixed field not the issue milestones. */
  startDateIsFixed?: InputMaybe<Scalars['Boolean']>;
  /** State event for the epic. */
  stateEvent?: InputMaybe<EpicStateEvent>;
  /** Title of the epic. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of UpdateEpic */
export type UpdateEpicPayload = {
  __typename?: 'UpdateEpicPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Epic after mutation. */
  epic?: Maybe<Epic>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** Autogenerated input type of UpdateImageDiffNote */
export type UpdateImageDiffNoteInput = {
  /** Content of the note. */
  body?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the note to update. */
  id: Scalars['NoteID'];
  /** Position of this note on a diff. */
  position?: InputMaybe<UpdateDiffImagePositionInput>;
};

/** Autogenerated return type of UpdateImageDiffNote */
export type UpdateImageDiffNotePayload = {
  __typename?: 'UpdateImageDiffNotePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Note after mutation. */
  note?: Maybe<Note>;
};

/** Autogenerated input type of UpdateIssue */
export type UpdateIssueInput = {
  /** IDs of labels to be added to the issue. */
  addLabelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Indicates the issue is confidential. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Description of the issue. */
  description?: InputMaybe<Scalars['String']>;
  /** Due date of the issue. */
  dueDate?: InputMaybe<Scalars['ISO8601Date']>;
  /** ID of the parent epic. NULL when removing the association. */
  epicId?: InputMaybe<Scalars['EpicID']>;
  /** Desired health status. */
  healthStatus?: InputMaybe<HealthStatus>;
  /** IID of the issue to mutate. */
  iid: Scalars['String'];
  /** IDs of labels to be set. Replaces existing issue labels. */
  labelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** Indicates discussion is locked on the issue. */
  locked?: InputMaybe<Scalars['Boolean']>;
  /** ID of the milestone to assign to the issue. On update milestone will be removed if set to null. */
  milestoneId?: InputMaybe<Scalars['ID']>;
  /** Project the issue to mutate is in. */
  projectPath: Scalars['ID'];
  /** IDs of labels to be removed from the issue. */
  removeLabelIds?: InputMaybe<Array<Scalars['ID']>>;
  /** Close or reopen an issue. */
  stateEvent?: InputMaybe<IssueStateEvent>;
  /** Title of the issue. */
  title?: InputMaybe<Scalars['String']>;
  /** Type of the issue. */
  type?: InputMaybe<IssueType>;
  /** Weight of the issue. */
  weight?: InputMaybe<Scalars['Int']>;
};

/** Autogenerated return type of UpdateIssue */
export type UpdateIssuePayload = {
  __typename?: 'UpdateIssuePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Issue after mutation. */
  issue?: Maybe<Issue>;
};

/** Autogenerated input type of UpdateIteration */
export type UpdateIterationInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the iteration. */
  description?: InputMaybe<Scalars['String']>;
  /** End date of the iteration. */
  dueDate?: InputMaybe<Scalars['String']>;
  /** Group of the iteration. */
  groupPath: Scalars['ID'];
  /** Global ID of the iteration. */
  id: Scalars['ID'];
  /** Start date of the iteration. */
  startDate?: InputMaybe<Scalars['String']>;
  /** Title of the iteration. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of UpdateIteration */
export type UpdateIterationPayload = {
  __typename?: 'UpdateIterationPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Updated iteration. */
  iteration?: Maybe<Iteration>;
};

/** Autogenerated input type of UpdateNamespacePackageSettings */
export type UpdateNamespacePackageSettingsInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /**
   * When generic_duplicates_allowed is false, you can publish duplicate packages
   * with names that match this regex. Otherwise, this setting has no effect.
   */
  genericDuplicateExceptionRegex?: InputMaybe<Scalars['UntrustedRegexp']>;
  /** Indicates whether duplicate generic packages are allowed for this namespace. */
  genericDuplicatesAllowed?: InputMaybe<Scalars['Boolean']>;
  /**
   * When maven_duplicates_allowed is false, you can publish duplicate packages
   * with names that match this regex. Otherwise, this setting has no effect.
   */
  mavenDuplicateExceptionRegex?: InputMaybe<Scalars['UntrustedRegexp']>;
  /** Indicates whether duplicate Maven packages are allowed for this namespace. */
  mavenDuplicatesAllowed?: InputMaybe<Scalars['Boolean']>;
  /** Namespace path where the namespace package setting is located. */
  namespacePath: Scalars['ID'];
};

/** Autogenerated return type of UpdateNamespacePackageSettings */
export type UpdateNamespacePackageSettingsPayload = {
  __typename?: 'UpdateNamespacePackageSettingsPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Namespace package setting after mutation. */
  packageSettings?: Maybe<PackageSettings>;
};

/** Autogenerated input type of UpdateNote */
export type UpdateNoteInput = {
  /** Content of the note. */
  body?: InputMaybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Confidentiality flag of a note. Default is false. */
  confidential?: InputMaybe<Scalars['Boolean']>;
  /** Global ID of the note to update. */
  id: Scalars['NoteID'];
};

/** Autogenerated return type of UpdateNote */
export type UpdateNotePayload = {
  __typename?: 'UpdateNotePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Note after mutation. */
  note?: Maybe<Note>;
};

/** Autogenerated input type of UpdateRequirement */
export type UpdateRequirementInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the requirement. */
  description?: InputMaybe<Scalars['String']>;
  /** IID of the requirement to update. */
  iid: Scalars['String'];
  /** Creates a test report for the requirement with the given state. */
  lastTestReportState?: InputMaybe<TestReportState>;
  /** Full project path the requirement is associated with. */
  projectPath: Scalars['ID'];
  /** State of the requirement. */
  state?: InputMaybe<RequirementState>;
  /** Title of the requirement. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of UpdateRequirement */
export type UpdateRequirementPayload = {
  __typename?: 'UpdateRequirementPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Requirement after mutation. */
  requirement?: Maybe<Requirement>;
};

/** Autogenerated input type of UpdateSnippet */
export type UpdateSnippetInput = {
  /** Actions to perform over the snippet repository and blobs. */
  blobActions?: InputMaybe<Array<SnippetBlobActionInputType>>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the snippet. */
  description?: InputMaybe<Scalars['String']>;
  /** Global ID of the snippet to update. */
  id: Scalars['SnippetID'];
  /** Title of the snippet. */
  title?: InputMaybe<Scalars['String']>;
  /** Visibility level of the snippet. */
  visibilityLevel?: InputMaybe<VisibilityLevelsEnum>;
};

/** Autogenerated return type of UpdateSnippet */
export type UpdateSnippetPayload = {
  __typename?: 'UpdateSnippetPayload';
  /**
   * CAPTCHA site key which must be used to render a challenge for the user to
   * solve to obtain a valid captchaResponse value. Included only when an operation
   * was not completed because "NeedsCaptchaResponse" is true. Deprecated in 13.11:
   * Use spam protection with HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  captchaSiteKey?: Maybe<Scalars['String']>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /**
   * Indicates whether the operation was detected as possible spam and not
   * completed. If CAPTCHA is enabled, the request must be resubmitted with a valid
   * CAPTCHA response and spam_log_id included for the operation to be completed.
   * Included only when an operation was not completed because
   * "NeedsCaptchaResponse" is true. Deprecated in 13.11: Use spam protection with
   * HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  needsCaptchaResponse?: Maybe<Scalars['Boolean']>;
  /** Snippet after mutation. */
  snippet?: Maybe<Snippet>;
  /**
   * Indicates whether the operation was detected as definite spam. There is no
   * option to resubmit the request with a CAPTCHA response. Deprecated in 13.11:
   * Use spam protection with HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  spam?: Maybe<Scalars['Boolean']>;
  /**
   * Spam log ID which must be passed along with a valid CAPTCHA response for an
   * operation to be completed. Included only when an operation was not completed
   * because "NeedsCaptchaResponse" is true. Deprecated in 13.11: Use spam
   * protection with HTTP headers instead.
   * @deprecated Use spam protection with HTTP headers instead. Deprecated in 13.11.
   */
  spamLogId?: Maybe<Scalars['Int']>;
};

/** Represents the Geo replication and verification state of an upload. */
export type UploadRegistry = {
  __typename?: 'UploadRegistry';
  /** Timestamp when the UploadRegistry was created */
  createdAt?: Maybe<Scalars['Time']>;
  /** ID of the Upload. */
  fileId: Scalars['ID'];
  /** ID of the UploadRegistry */
  id: Scalars['ID'];
  /** Error message during sync of the UploadRegistry */
  lastSyncFailure?: Maybe<Scalars['String']>;
  /** Timestamp of the most recent successful sync of the UploadRegistry */
  lastSyncedAt?: Maybe<Scalars['Time']>;
  /** Timestamp after which the UploadRegistry should be resynced */
  retryAt?: Maybe<Scalars['Time']>;
  /** Number of consecutive failed sync attempts of the UploadRegistry */
  retryCount?: Maybe<Scalars['Int']>;
  /** Sync state of the UploadRegistry */
  state?: Maybe<RegistryState>;
};

/** The connection type for UploadRegistry. */
export type UploadRegistryConnection = {
  __typename?: 'UploadRegistryConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<UploadRegistryEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<UploadRegistry>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type UploadRegistryEdge = {
  __typename?: 'UploadRegistryEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<UploadRegistry>;
};

/** Represents a recorded measurement (object count) for the Admins */
export type UsageTrendsMeasurement = {
  __typename?: 'UsageTrendsMeasurement';
  /** Object count. */
  count: Scalars['Int'];
  /** Type of objects being measured. */
  identifier: MeasurementIdentifier;
  /** Time the measurement was recorded. */
  recordedAt?: Maybe<Scalars['Time']>;
};

/** The connection type for UsageTrendsMeasurement. */
export type UsageTrendsMeasurementConnection = {
  __typename?: 'UsageTrendsMeasurementConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<UsageTrendsMeasurementEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<UsageTrendsMeasurement>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type UsageTrendsMeasurementEdge = {
  __typename?: 'UsageTrendsMeasurementEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<UsageTrendsMeasurement>;
};

/** Representation of a GitLab user. */
export type User = {
  /** Merge requests assigned to the user. */
  assignedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Merge requests authored by the user. */
  authoredMergeRequests?: Maybe<MergeRequestConnection>;
  /** URL of the user's avatar. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Indicates if the user is a bot. */
  bot: Scalars['Boolean'];
  /** User callouts that belong to the user. */
  callouts?: Maybe<UserCalloutConnection>;
  /**
   * User email. Deprecated in 13.7: This was renamed.
   * @deprecated This was renamed. Please use `User.publicEmail`. Deprecated in 13.7.
   */
  email?: Maybe<Scalars['String']>;
  /** Group count for the user. */
  groupCount?: Maybe<Scalars['Int']>;
  /** Group memberships of the user. */
  groupMemberships?: Maybe<GroupMemberConnection>;
  /**
   * Groups where the user has access. Will always return `null` if
   * `paginatable_namespace_drop_down_for_project_creation` feature flag is disabled.
   */
  groups?: Maybe<GroupConnection>;
  /** ID of the user. */
  id: Scalars['ID'];
  /** Location of the user. */
  location?: Maybe<Scalars['String']>;
  /** Human-readable name of the user. */
  name: Scalars['String'];
  /** Personal namespace of the user. */
  namespace?: Maybe<Namespace>;
  /** Project memberships of the user. */
  projectMemberships?: Maybe<ProjectMemberConnection>;
  /** User's public email. */
  publicEmail?: Maybe<Scalars['String']>;
  /** Merge requests assigned to the user for review. */
  reviewRequestedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Snippets authored by the user. */
  snippets?: Maybe<SnippetConnection>;
  /** Projects starred by the user. */
  starredProjects?: Maybe<ProjectConnection>;
  /** State of the user. */
  state: UserState;
  /** User status. */
  status?: Maybe<UserStatus>;
  /** Time logged by the user. */
  timelogs?: Maybe<TimelogConnection>;
  /** To-do items of the user. */
  todos?: Maybe<TodoConnection>;
  /** Permissions for the current user on the resource. */
  userPermissions: UserPermissions;
  /** Username of the user. Unique within this instance of GitLab. */
  username: Scalars['String'];
  /** Web path of the user. */
  webPath: Scalars['String'];
  /** Web URL of the user. */
  webUrl: Scalars['String'];
};


/** Representation of a GitLab user. */
export type UserAssignedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** Representation of a GitLab user. */
export type UserAuthoredMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** Representation of a GitLab user. */
export type UserCalloutsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Representation of a GitLab user. */
export type UserGroupMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Representation of a GitLab user. */
export type UserGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  permissionScope?: InputMaybe<GroupPermission>;
  search?: InputMaybe<Scalars['String']>;
};


/** Representation of a GitLab user. */
export type UserProjectMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Representation of a GitLab user. */
export type UserReviewRequestedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** Representation of a GitLab user. */
export type UserSnippetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['SnippetID']>>;
  last?: InputMaybe<Scalars['Int']>;
  type?: InputMaybe<TypeEnum>;
  visibility?: InputMaybe<VisibilityScopesEnum>;
};


/** Representation of a GitLab user. */
export type UserStarredProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};


/** Representation of a GitLab user. */
export type UserTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['Time']>;
  endTime?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['GroupID']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  startDate?: InputMaybe<Scalars['Time']>;
  startTime?: InputMaybe<Scalars['Time']>;
  username?: InputMaybe<Scalars['String']>;
};


/** Representation of a GitLab user. */
export type UserTodosArgs = {
  action?: InputMaybe<Array<TodoActionEnum>>;
  after?: InputMaybe<Scalars['String']>;
  authorId?: InputMaybe<Array<Scalars['ID']>>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  state?: InputMaybe<Array<TodoStateEnum>>;
  type?: InputMaybe<Array<TodoTargetEnum>>;
};

export type UserCallout = {
  __typename?: 'UserCallout';
  /** Date when the callout was dismissed. */
  dismissedAt?: Maybe<Scalars['Time']>;
  /** Name of the feature that the callout is for. */
  featureName?: Maybe<UserCalloutFeatureNameEnum>;
};

/** The connection type for UserCallout. */
export type UserCalloutConnection = {
  __typename?: 'UserCalloutConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<UserCalloutEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<UserCallout>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of UserCalloutCreate */
export type UserCalloutCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Feature name you want to dismiss the callout for. */
  featureName: Scalars['String'];
};

/** Autogenerated return type of UserCalloutCreate */
export type UserCalloutCreatePayload = {
  __typename?: 'UserCalloutCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** User callout dismissed. */
  userCallout: UserCallout;
};

/** An edge in a connection. */
export type UserCalloutEdge = {
  __typename?: 'UserCalloutEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<UserCallout>;
};

/** Name of the feature that the callout is for. */
export type UserCalloutFeatureNameEnum =
  /** Callout feature name for active_user_count_threshold. */
  | 'ACTIVE_USER_COUNT_THRESHOLD'
  /** Callout feature name for buy_pipeline_minutes_notification_dot. */
  | 'BUY_PIPELINE_MINUTES_NOTIFICATION_DOT'
  /** Callout feature name for canary_deployment. */
  | 'CANARY_DEPLOYMENT'
  /** Callout feature name for cloud_licensing_subscription_activation_banner. */
  | 'CLOUD_LICENSING_SUBSCRIPTION_ACTIVATION_BANNER'
  /** Callout feature name for cluster_security_warning. */
  | 'CLUSTER_SECURITY_WARNING'
  /** Callout feature name for customize_homepage. */
  | 'CUSTOMIZE_HOMEPAGE'
  /** Callout feature name for eoa_bronze_plan_banner. */
  | 'EOA_BRONZE_PLAN_BANNER'
  /** Callout feature name for feature_flags_new_version. */
  | 'FEATURE_FLAGS_NEW_VERSION'
  /** Callout feature name for gcp_signup_offer. */
  | 'GCP_SIGNUP_OFFER'
  /** Callout feature name for geo_enable_hashed_storage. */
  | 'GEO_ENABLE_HASHED_STORAGE'
  /** Callout feature name for geo_migrate_hashed_storage. */
  | 'GEO_MIGRATE_HASHED_STORAGE'
  /** Callout feature name for gke_cluster_integration. */
  | 'GKE_CLUSTER_INTEGRATION'
  /** Callout feature name for gold_trial_billings. */
  | 'GOLD_TRIAL_BILLINGS'
  /** Callout feature name for new_user_signups_cap_reached. */
  | 'NEW_USER_SIGNUPS_CAP_REACHED'
  /** Callout feature name for personal_access_token_expiry. */
  | 'PERSONAL_ACCESS_TOKEN_EXPIRY'
  /** Callout feature name for pipeline_needs_banner. */
  | 'PIPELINE_NEEDS_BANNER'
  /** Callout feature name for pipeline_needs_hover_tip. */
  | 'PIPELINE_NEEDS_HOVER_TIP'
  /** Callout feature name for profile_personal_access_token_expiry. */
  | 'PROFILE_PERSONAL_ACCESS_TOKEN_EXPIRY'
  /** Callout feature name for registration_enabled_callout. */
  | 'REGISTRATION_ENABLED_CALLOUT'
  /** Callout feature name for security_configuration_devops_alert. */
  | 'SECURITY_CONFIGURATION_DEVOPS_ALERT'
  /** Callout feature name for security_configuration_upgrade_banner. */
  | 'SECURITY_CONFIGURATION_UPGRADE_BANNER'
  /** Callout feature name for security_newsletter_callout. */
  | 'SECURITY_NEWSLETTER_CALLOUT'
  /** Callout feature name for suggest_pipeline. */
  | 'SUGGEST_PIPELINE'
  /** Callout feature name for suggest_popover_dismissed. */
  | 'SUGGEST_POPOVER_DISMISSED'
  /** Callout feature name for tabs_position_highlight. */
  | 'TABS_POSITION_HIGHLIGHT'
  /** Callout feature name for terraform_notification_dismissed. */
  | 'TERRAFORM_NOTIFICATION_DISMISSED'
  /** Callout feature name for threat_monitoring_info. */
  | 'THREAT_MONITORING_INFO'
  /** Callout feature name for trial_status_reminder_d3. */
  | 'TRIAL_STATUS_REMINDER_D3'
  /** Callout feature name for trial_status_reminder_d14. */
  | 'TRIAL_STATUS_REMINDER_D14'
  /** Callout feature name for two_factor_auth_recovery_settings_check. */
  | 'TWO_FACTOR_AUTH_RECOVERY_SETTINGS_CHECK'
  /** Callout feature name for ultimate_trial. */
  | 'ULTIMATE_TRIAL'
  /** Callout feature name for unfinished_tag_cleanup_callout. */
  | 'UNFINISHED_TAG_CLEANUP_CALLOUT'
  /** Callout feature name for web_ide_alert_dismissed. */
  | 'WEB_IDE_ALERT_DISMISSED'
  /** Callout feature name for web_ide_ci_environments_guidance. */
  | 'WEB_IDE_CI_ENVIRONMENTS_GUIDANCE';

/** Core represention of a GitLab user. */
export type UserCore = User & {
  __typename?: 'UserCore';
  /** Merge requests assigned to the user. */
  assignedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Merge requests authored by the user. */
  authoredMergeRequests?: Maybe<MergeRequestConnection>;
  /** URL of the user's avatar. */
  avatarUrl?: Maybe<Scalars['String']>;
  /** Indicates if the user is a bot. */
  bot: Scalars['Boolean'];
  /** User callouts that belong to the user. */
  callouts?: Maybe<UserCalloutConnection>;
  /**
   * User email. Deprecated in 13.7: This was renamed.
   * @deprecated This was renamed. Please use `User.publicEmail`. Deprecated in 13.7.
   */
  email?: Maybe<Scalars['String']>;
  /** Group count for the user. */
  groupCount?: Maybe<Scalars['Int']>;
  /** Group memberships of the user. */
  groupMemberships?: Maybe<GroupMemberConnection>;
  /**
   * Groups where the user has access. Will always return `null` if
   * `paginatable_namespace_drop_down_for_project_creation` feature flag is disabled.
   */
  groups?: Maybe<GroupConnection>;
  /** ID of the user. */
  id: Scalars['ID'];
  /** Location of the user. */
  location?: Maybe<Scalars['String']>;
  /** Human-readable name of the user. */
  name: Scalars['String'];
  /** Personal namespace of the user. */
  namespace?: Maybe<Namespace>;
  /** Project memberships of the user. */
  projectMemberships?: Maybe<ProjectMemberConnection>;
  /** User's public email. */
  publicEmail?: Maybe<Scalars['String']>;
  /** Merge requests assigned to the user for review. */
  reviewRequestedMergeRequests?: Maybe<MergeRequestConnection>;
  /** Snippets authored by the user. */
  snippets?: Maybe<SnippetConnection>;
  /** Projects starred by the user. */
  starredProjects?: Maybe<ProjectConnection>;
  /** State of the user. */
  state: UserState;
  /** User status. */
  status?: Maybe<UserStatus>;
  /** Time logged by the user. */
  timelogs?: Maybe<TimelogConnection>;
  /** To-do items of the user. */
  todos?: Maybe<TodoConnection>;
  /** Permissions for the current user on the resource. */
  userPermissions: UserPermissions;
  /** Username of the user. Unique within this instance of GitLab. */
  username: Scalars['String'];
  /** Web path of the user. */
  webPath: Scalars['String'];
  /** Web URL of the user. */
  webUrl: Scalars['String'];
};


/** Core represention of a GitLab user. */
export type UserCoreAssignedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** Core represention of a GitLab user. */
export type UserCoreAuthoredMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  reviewerUsername?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** Core represention of a GitLab user. */
export type UserCoreCalloutsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Core represention of a GitLab user. */
export type UserCoreGroupMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Core represention of a GitLab user. */
export type UserCoreGroupsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  permissionScope?: InputMaybe<GroupPermission>;
  search?: InputMaybe<Scalars['String']>;
};


/** Core represention of a GitLab user. */
export type UserCoreProjectMembershipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Core represention of a GitLab user. */
export type UserCoreReviewRequestedMergeRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  assigneeUsername?: InputMaybe<Scalars['String']>;
  authorUsername?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  createdAfter?: InputMaybe<Scalars['Time']>;
  createdBefore?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  iids?: InputMaybe<Array<Scalars['String']>>;
  labels?: InputMaybe<Array<Scalars['String']>>;
  last?: InputMaybe<Scalars['Int']>;
  mergedAfter?: InputMaybe<Scalars['Time']>;
  mergedBefore?: InputMaybe<Scalars['Time']>;
  milestoneTitle?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<MergeRequestsResolverNegatedParams>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  projectPath?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<MergeRequestSort>;
  sourceBranches?: InputMaybe<Array<Scalars['String']>>;
  state?: InputMaybe<MergeRequestState>;
  targetBranches?: InputMaybe<Array<Scalars['String']>>;
};


/** Core represention of a GitLab user. */
export type UserCoreSnippetsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  ids?: InputMaybe<Array<Scalars['SnippetID']>>;
  last?: InputMaybe<Scalars['Int']>;
  type?: InputMaybe<TypeEnum>;
  visibility?: InputMaybe<VisibilityScopesEnum>;
};


/** Core represention of a GitLab user. */
export type UserCoreStarredProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};


/** Core represention of a GitLab user. */
export type UserCoreTimelogsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  endDate?: InputMaybe<Scalars['Time']>;
  endTime?: InputMaybe<Scalars['Time']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['GroupID']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['ProjectID']>;
  startDate?: InputMaybe<Scalars['Time']>;
  startTime?: InputMaybe<Scalars['Time']>;
  username?: InputMaybe<Scalars['String']>;
};


/** Core represention of a GitLab user. */
export type UserCoreTodosArgs = {
  action?: InputMaybe<Array<TodoActionEnum>>;
  after?: InputMaybe<Scalars['String']>;
  authorId?: InputMaybe<Array<Scalars['ID']>>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Array<Scalars['ID']>>;
  last?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Array<Scalars['ID']>>;
  state?: InputMaybe<Array<TodoStateEnum>>;
  type?: InputMaybe<Array<TodoTargetEnum>>;
};

/** The connection type for UserCore. */
export type UserCoreConnection = {
  __typename?: 'UserCoreConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<UserCoreEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<UserCore>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type UserCoreEdge = {
  __typename?: 'UserCoreEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<UserCore>;
};

/**
 * Information about a merge request given a specific user.
 *
 * This object has two parts to its state: a `User` and a `MergeRequest`. All
 * fields relate to interactions between the two entities.
 */
export type UserMergeRequestInteraction = {
  __typename?: 'UserMergeRequestInteraction';
  /** Approval rules that apply to this user for this merge request. */
  applicableApprovalRules?: Maybe<Array<ApprovalRule>>;
  /** Whether this user has approved this merge request. */
  approved: Scalars['Boolean'];
  /** Whether this user can merge this merge request. */
  canMerge: Scalars['Boolean'];
  /** Whether this user can update this merge request. */
  canUpdate: Scalars['Boolean'];
  /** State of the review by this user. */
  reviewState?: Maybe<MergeRequestReviewState>;
  /** Whether this user has provided a review for this merge request. */
  reviewed: Scalars['Boolean'];
};

export type UserPermissions = {
  __typename?: 'UserPermissions';
  /** Indicates the user can perform `create_snippet` on this resource */
  createSnippet: Scalars['Boolean'];
};

/** Possible states of a user */
export type UserState =
  /** User is active and is able to use the system. */
  | 'active'
  /** User has been blocked and is prevented from using the system. */
  | 'blocked'
  /** User is no longer active and is unable to use the system. */
  | 'deactivated';

export type UserStatus = {
  __typename?: 'UserStatus';
  /** User availability status. */
  availability: AvailabilityEnum;
  /** String representation of emoji. */
  emoji?: Maybe<Scalars['String']>;
  /** User status message. */
  message?: Maybe<Scalars['String']>;
  /** HTML of the user status message */
  messageHtml?: Maybe<Scalars['String']>;
};

export type VisibilityLevelsEnum =
  /** Internal visibility level. */
  | 'internal'
  /** Private visibility level. */
  | 'private'
  /** Public visibility level. */
  | 'public';

export type VisibilityScopesEnum =
  /** Snippet is visible for any logged in user except external users. */
  | 'internal'
  /** Snippet is visible only to the snippet creator. */
  | 'private'
  /** Snippet can be accessed without any authentication. */
  | 'public';

/** Represents the count of vulnerabilities by severity on a particular day. This data is retained for 365 days */
export type VulnerabilitiesCountByDay = {
  __typename?: 'VulnerabilitiesCountByDay';
  /** Total number of vulnerabilities on a particular day with critical severity */
  critical: Scalars['Int'];
  /** Date for the count. */
  date: Scalars['ISO8601Date'];
  /** Total number of vulnerabilities on a particular day with high severity */
  high: Scalars['Int'];
  /** Total number of vulnerabilities on a particular day with info severity */
  info: Scalars['Int'];
  /** Total number of vulnerabilities on a particular day with low severity */
  low: Scalars['Int'];
  /** Total number of vulnerabilities on a particular day with medium severity */
  medium: Scalars['Int'];
  /** Total number of vulnerabilities on a particular day. */
  total: Scalars['Int'];
  /** Total number of vulnerabilities on a particular day with unknown severity */
  unknown: Scalars['Int'];
};

/** The connection type for VulnerabilitiesCountByDay. */
export type VulnerabilitiesCountByDayConnection = {
  __typename?: 'VulnerabilitiesCountByDayConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VulnerabilitiesCountByDayEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<VulnerabilitiesCountByDay>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type VulnerabilitiesCountByDayEdge = {
  __typename?: 'VulnerabilitiesCountByDayEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<VulnerabilitiesCountByDay>;
};

/** Represents a vulnerability */
export type Vulnerability = NoteableInterface & {
  __typename?: 'Vulnerability';
  /** Timestamp of when the vulnerability state was changed to confirmed. */
  confirmedAt?: Maybe<Scalars['Time']>;
  /** User that confirmed the vulnerability. */
  confirmedBy?: Maybe<UserCore>;
  /** Description of the vulnerability. */
  description?: Maybe<Scalars['String']>;
  /** Details of the vulnerability. */
  details: Array<VulnerabilityDetail>;
  /** Timestamp of when the vulnerability was first detected. */
  detectedAt: Scalars['Time'];
  /** All discussions on this noteable. */
  discussions: DiscussionConnection;
  /** Timestamp of when the vulnerability state was changed to dismissed. */
  dismissedAt?: Maybe<Scalars['Time']>;
  /** User that dismissed the vulnerability. */
  dismissedBy?: Maybe<UserCore>;
  /** List of external issue links related to the vulnerability. */
  externalIssueLinks: VulnerabilityExternalIssueLinkConnection;
  /** Indicates whether the vulnerability is a false positive. */
  falsePositive?: Maybe<Scalars['Boolean']>;
  /** Indicates whether there is a solution available for this vulnerability. */
  hasSolutions?: Maybe<Scalars['Boolean']>;
  /** GraphQL ID of the vulnerability. */
  id: Scalars['ID'];
  /** Identifiers of the vulnerability. */
  identifiers: Array<VulnerabilityIdentifier>;
  /** List of issue links related to the vulnerability. */
  issueLinks: VulnerabilityIssueLinkConnection;
  /** List of links associated with the vulnerability. */
  links: Array<VulnerabilityLink>;
  /** Location metadata for the vulnerability. Its fields depend on the type of security scan that found the vulnerability. */
  location?: Maybe<VulnerabilityLocation>;
  /** Merge request that fixes the vulnerability. */
  mergeRequest?: Maybe<MergeRequest>;
  /** Short text description of the vulnerability. This may include the finding's specific information. */
  message?: Maybe<Scalars['String']>;
  /** All notes on this noteable. */
  notes: NoteConnection;
  /** Primary identifier of the vulnerability. */
  primaryIdentifier?: Maybe<VulnerabilityIdentifier>;
  /** Project on which the vulnerability was found. */
  project?: Maybe<Project>;
  /**
   * Type of the security report that found the vulnerability (SAST,
   * DEPENDENCY_SCANNING, CONTAINER_SCANNING, DAST, SECRET_DETECTION,
   * COVERAGE_FUZZING, API_FUZZING, CLUSTER_IMAGE_SCANNING, GENERIC). `Scan Type` in the UI.
   */
  reportType?: Maybe<VulnerabilityReportType>;
  /** Timestamp of when the vulnerability state was changed to resolved. */
  resolvedAt?: Maybe<Scalars['Time']>;
  /** User that resolved the vulnerability. */
  resolvedBy?: Maybe<UserCore>;
  /** Indicates whether the vulnerability is fixed on the default branch or not. */
  resolvedOnDefaultBranch: Scalars['Boolean'];
  /** Scanner metadata for the vulnerability. */
  scanner?: Maybe<VulnerabilityScanner>;
  /** Severity of the vulnerability (INFO, UNKNOWN, LOW, MEDIUM, HIGH, CRITICAL) */
  severity?: Maybe<VulnerabilitySeverity>;
  /** State of the vulnerability (DETECTED, CONFIRMED, RESOLVED, DISMISSED) */
  state?: Maybe<VulnerabilityState>;
  /** Title of the vulnerability. */
  title?: Maybe<Scalars['String']>;
  /** Number of user notes attached to the vulnerability. */
  userNotesCount: Scalars['Int'];
  /** Permissions for the current user on the resource */
  userPermissions: VulnerabilityPermissions;
  /** URL to the vulnerability's details page. */
  vulnerabilityPath?: Maybe<Scalars['String']>;
};


/** Represents a vulnerability */
export type VulnerabilityDiscussionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a vulnerability */
export type VulnerabilityExternalIssueLinksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Represents a vulnerability */
export type VulnerabilityIssueLinksArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  linkType?: InputMaybe<VulnerabilityIssueLinkType>;
};


/** Represents a vulnerability */
export type VulnerabilityNotesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Confidence that a given vulnerability is present in the codebase. */
export type VulnerabilityConfidence =
  /** Confirmed confidence */
  | 'CONFIRMED'
  /** Experimental confidence */
  | 'EXPERIMENTAL'
  /** High confidence */
  | 'HIGH'
  /** Ignore confidence */
  | 'IGNORE'
  /** Low confidence */
  | 'LOW'
  /** Medium confidence */
  | 'MEDIUM'
  /** Unknown confidence */
  | 'UNKNOWN';

/** Autogenerated input type of VulnerabilityConfirm */
export type VulnerabilityConfirmInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the vulnerability to be confirmed. */
  id: Scalars['VulnerabilityID'];
};

/** Autogenerated return type of VulnerabilityConfirm */
export type VulnerabilityConfirmPayload = {
  __typename?: 'VulnerabilityConfirmPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Vulnerability after state change. */
  vulnerability?: Maybe<Vulnerability>;
};

/** The connection type for Vulnerability. */
export type VulnerabilityConnection = {
  __typename?: 'VulnerabilityConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VulnerabilityEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Vulnerability>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of VulnerabilityCreate */
export type VulnerabilityCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Confidence of the vulnerability (defaults to `unknown`). */
  confidence?: InputMaybe<VulnerabilityConfidence>;
  /** Timestamp of when the vulnerability state changed to confirmed (defaults to creation time if status is `confirmed`). */
  confirmedAt?: InputMaybe<Scalars['Time']>;
  /** Long text section that describes the vulnerability in more detail. */
  description: Scalars['String'];
  /** Timestamp of when the vulnerability was first detected (defaults to creation time). */
  detectedAt?: InputMaybe<Scalars['Time']>;
  /** Timestamp of when the vulnerability state changed to dismissed (defaults to creation time if status is `dismissed`). */
  dismissedAt?: InputMaybe<Scalars['Time']>;
  /** Array of CVE or CWE identifiers for the vulnerability. */
  identifiers: Array<VulnerabilityIdentifierInput>;
  /** Short text section that describes the vulnerability. This may include the finding's specific information. */
  message?: InputMaybe<Scalars['String']>;
  /** Name of the vulnerability. */
  name: Scalars['String'];
  /** ID of the project to attach the vulnerability to. */
  project: Scalars['ProjectID'];
  /** Timestamp of when the vulnerability state changed to resolved (defaults to creation time if status is `resolved`). */
  resolvedAt?: InputMaybe<Scalars['Time']>;
  /** Information about the scanner used to discover the vulnerability. */
  scanner: VulnerabilityScannerInput;
  /** Severity of the vulnerability (defaults to `unknown`). */
  severity?: InputMaybe<VulnerabilitySeverity>;
  /** Instructions for how to fix the vulnerability. */
  solution?: InputMaybe<Scalars['String']>;
  /** State of the vulnerability (defaults to `detected`). */
  state?: InputMaybe<VulnerabilityState>;
};

/** Autogenerated return type of VulnerabilityCreate */
export type VulnerabilityCreatePayload = {
  __typename?: 'VulnerabilityCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Vulnerability created. */
  vulnerability?: Maybe<Vulnerability>;
};

/** Represents a vulnerability detail field. The fields with data will depend on the vulnerability detail type */
export type VulnerabilityDetail = VulnerabilityDetailBase | VulnerabilityDetailBoolean | VulnerabilityDetailCode | VulnerabilityDetailCommit | VulnerabilityDetailDiff | VulnerabilityDetailFileLocation | VulnerabilityDetailInt | VulnerabilityDetailList | VulnerabilityDetailMarkdown | VulnerabilityDetailModuleLocation | VulnerabilityDetailTable | VulnerabilityDetailText | VulnerabilityDetailUrl;

/** Represents the vulnerability details base */
export type VulnerabilityDetailBase = {
  __typename?: 'VulnerabilityDetailBase';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
};

/** Represents the vulnerability details boolean value */
export type VulnerabilityDetailBoolean = {
  __typename?: 'VulnerabilityDetailBoolean';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Value of the field. */
  value: Scalars['Boolean'];
};

/** Represents the vulnerability details code field */
export type VulnerabilityDetailCode = {
  __typename?: 'VulnerabilityDetailCode';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Language of the code. */
  lang?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Source code. */
  value: Scalars['String'];
};

/** Represents the vulnerability details commit field */
export type VulnerabilityDetailCommit = {
  __typename?: 'VulnerabilityDetailCommit';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Commit SHA value. */
  value: Scalars['String'];
};

/** Represents the vulnerability details diff field */
export type VulnerabilityDetailDiff = {
  __typename?: 'VulnerabilityDetailDiff';
  /** Value of the field after the change. */
  after: Scalars['String'];
  /** Value of the field before the change. */
  before: Scalars['String'];
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
};

/** Represents the vulnerability details location within a file in the project */
export type VulnerabilityDetailFileLocation = {
  __typename?: 'VulnerabilityDetailFileLocation';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** File name. */
  fileName: Scalars['String'];
  /** End line number of the file location. */
  lineEnd: Scalars['Int'];
  /** Start line number of the file location. */
  lineStart: Scalars['Int'];
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
};

/** Represents the vulnerability details integer value */
export type VulnerabilityDetailInt = {
  __typename?: 'VulnerabilityDetailInt';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Value of the field. */
  value: Scalars['Int'];
};

/** Represents the vulnerability details list value */
export type VulnerabilityDetailList = {
  __typename?: 'VulnerabilityDetailList';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** List of details. */
  items: Array<VulnerabilityDetail>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
};

/** Represents the vulnerability details Markdown field */
export type VulnerabilityDetailMarkdown = {
  __typename?: 'VulnerabilityDetailMarkdown';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Value of the Markdown field. */
  value: Scalars['String'];
};

/** Represents the vulnerability details location within a file in the project */
export type VulnerabilityDetailModuleLocation = {
  __typename?: 'VulnerabilityDetailModuleLocation';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Module name. */
  moduleName: Scalars['String'];
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Offset of the module location. */
  offset: Scalars['Int'];
};

/** Represents the vulnerability details table value */
export type VulnerabilityDetailTable = {
  __typename?: 'VulnerabilityDetailTable';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Table headers. */
  headers: Array<VulnerabilityDetail>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Table rows. */
  rows: Array<VulnerabilityDetail>;
};

/** Represents the vulnerability details text field */
export type VulnerabilityDetailText = {
  __typename?: 'VulnerabilityDetailText';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Value of the text field. */
  value: Scalars['String'];
};

/** Represents the vulnerability details URL field */
export type VulnerabilityDetailUrl = {
  __typename?: 'VulnerabilityDetailUrl';
  /** Description of the field. */
  description?: Maybe<Scalars['String']>;
  /** Name of the field. */
  fieldName?: Maybe<Scalars['String']>;
  /** Href of the URL. */
  href: Scalars['String'];
  /** Name of the field. */
  name?: Maybe<Scalars['String']>;
  /** Text of the URL. */
  text?: Maybe<Scalars['String']>;
};

/** Autogenerated input type of VulnerabilityDismiss */
export type VulnerabilityDismissInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Comment why vulnerability should be dismissed. */
  comment?: InputMaybe<Scalars['String']>;
  /** Reason why vulnerability should be dismissed. */
  dismissalReason?: InputMaybe<VulnerabilityDismissalReason>;
  /** ID of the vulnerability to be dismissed. */
  id: Scalars['VulnerabilityID'];
};

/** Autogenerated return type of VulnerabilityDismiss */
export type VulnerabilityDismissPayload = {
  __typename?: 'VulnerabilityDismissPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Vulnerability after dismissal. */
  vulnerability?: Maybe<Vulnerability>;
};

/** The dismissal reason of the Vulnerability */
export type VulnerabilityDismissalReason =
  /** The vulnerability is known, and has not been remediated or mitigated, but is considered to be an acceptable business risk. */
  | 'ACCEPTABLE_RISK'
  /**
   * An error in reporting in which a test result incorrectly indicates the
   * presence of a vulnerability in a system when the vulnerability is not present.
   */
  | 'FALSE_POSITIVE'
  /**
   * A management, operational, or technical control (that is, safeguard or
   * countermeasure) employed by an organization that provides equivalent or
   * comparable protection for an information system.
   */
  | 'MITIGATING_CONTROL'
  /**
   * The vulnerability is known, and has not been remediated or mitigated, but is
   * considered to be in a part of the application that will not be updated.
   */
  | 'NOT_APPLICABLE'
  /** The finding is not a vulnerability because it is part of a test or is test data. */
  | 'USED_IN_TESTS';

/** An edge in a connection. */
export type VulnerabilityEdge = {
  __typename?: 'VulnerabilityEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<Vulnerability>;
};

/** Represents an external issue link of a vulnerability */
export type VulnerabilityExternalIssueLink = {
  __typename?: 'VulnerabilityExternalIssueLink';
  /** The external issue attached to the issue link. */
  externalIssue?: Maybe<ExternalIssue>;
  /** GraphQL ID of the external issue link. */
  id: Scalars['VulnerabilitiesExternalIssueLinkID'];
  /** Type of the external issue link. */
  linkType: VulnerabilityExternalIssueLinkType;
};

/** The connection type for VulnerabilityExternalIssueLink. */
export type VulnerabilityExternalIssueLinkConnection = {
  __typename?: 'VulnerabilityExternalIssueLinkConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VulnerabilityExternalIssueLinkEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<VulnerabilityExternalIssueLink>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** Autogenerated input type of VulnerabilityExternalIssueLinkCreate */
export type VulnerabilityExternalIssueLinkCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** External tracker type of the external issue link. */
  externalTracker: VulnerabilityExternalIssueLinkExternalTracker;
  /** ID of the vulnerability. */
  id: Scalars['VulnerabilityID'];
  /** Type of the external issue link. */
  linkType: VulnerabilityExternalIssueLinkType;
};

/** Autogenerated return type of VulnerabilityExternalIssueLinkCreate */
export type VulnerabilityExternalIssueLinkCreatePayload = {
  __typename?: 'VulnerabilityExternalIssueLinkCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Created external issue link. */
  externalIssueLink?: Maybe<VulnerabilityExternalIssueLink>;
};

/** Autogenerated input type of VulnerabilityExternalIssueLinkDestroy */
export type VulnerabilityExternalIssueLinkDestroyInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Global ID of the vulnerability external issue link. */
  id: Scalars['VulnerabilitiesExternalIssueLinkID'];
};

/** Autogenerated return type of VulnerabilityExternalIssueLinkDestroy */
export type VulnerabilityExternalIssueLinkDestroyPayload = {
  __typename?: 'VulnerabilityExternalIssueLinkDestroyPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
};

/** An edge in a connection. */
export type VulnerabilityExternalIssueLinkEdge = {
  __typename?: 'VulnerabilityExternalIssueLinkEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<VulnerabilityExternalIssueLink>;
};

/** The external tracker of the external issue link related to a vulnerability */
export type VulnerabilityExternalIssueLinkExternalTracker =
  /** Jira external tracker */
  | 'JIRA';

/** The type of the external issue link related to a vulnerability */
export type VulnerabilityExternalIssueLinkType =
  /** Created link type */
  | 'CREATED';

/** The grade of the vulnerable project */
export type VulnerabilityGrade =
  /** A grade */
  | 'A'
  /** B grade */
  | 'B'
  /** C grade */
  | 'C'
  /** D grade */
  | 'D'
  /** F grade */
  | 'F';

/** Represents a vulnerability identifier */
export type VulnerabilityIdentifier = {
  __typename?: 'VulnerabilityIdentifier';
  /** External ID of the vulnerability identifier. */
  externalId?: Maybe<Scalars['String']>;
  /** External type of the vulnerability identifier. */
  externalType?: Maybe<Scalars['String']>;
  /** Name of the vulnerability identifier. */
  name?: Maybe<Scalars['String']>;
  /** URL of the vulnerability identifier. */
  url?: Maybe<Scalars['String']>;
};

export type VulnerabilityIdentifierInput = {
  /** External ID of the vulnerability identifier. */
  externalId?: InputMaybe<Scalars['String']>;
  /** External type of the vulnerability identifier. */
  externalType?: InputMaybe<Scalars['String']>;
  /** Name of the vulnerability identifier. */
  name: Scalars['String'];
  /** URL of the vulnerability identifier. */
  url: Scalars['String'];
};

/** Represents an issue link of a vulnerability */
export type VulnerabilityIssueLink = {
  __typename?: 'VulnerabilityIssueLink';
  /** GraphQL ID of the vulnerability. */
  id: Scalars['ID'];
  /** Issue attached to issue link. */
  issue: Issue;
  /** Type of the issue link. */
  linkType: VulnerabilityIssueLinkType;
};

/** The connection type for VulnerabilityIssueLink. */
export type VulnerabilityIssueLinkConnection = {
  __typename?: 'VulnerabilityIssueLinkConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VulnerabilityIssueLinkEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<VulnerabilityIssueLink>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type VulnerabilityIssueLinkEdge = {
  __typename?: 'VulnerabilityIssueLinkEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<VulnerabilityIssueLink>;
};

/** The type of the issue link related to a vulnerability */
export type VulnerabilityIssueLinkType =
  /** Issue is created for the vulnerability */
  | 'CREATED'
  /** Has a related issue */
  | 'RELATED';

/** Represents a link related to a vulnerability */
export type VulnerabilityLink = {
  __typename?: 'VulnerabilityLink';
  /** Name of the link. */
  name?: Maybe<Scalars['String']>;
  /** URL of the link. */
  url: Scalars['String'];
};

/** Represents a vulnerability location. The fields with data will depend on the vulnerability report type */
export type VulnerabilityLocation = VulnerabilityLocationContainerScanning | VulnerabilityLocationCoverageFuzzing | VulnerabilityLocationDast | VulnerabilityLocationDependencyScanning | VulnerabilityLocationGeneric | VulnerabilityLocationSast | VulnerabilityLocationSecretDetection;

/** Represents the location of a vulnerability found by a container security scan */
export type VulnerabilityLocationContainerScanning = {
  __typename?: 'VulnerabilityLocationContainerScanning';
  /** Dependency containing the vulnerability. */
  dependency?: Maybe<VulnerableDependency>;
  /** Name of the vulnerable container image. */
  image?: Maybe<Scalars['String']>;
  /** Operating system that runs on the vulnerable container image. */
  operatingSystem?: Maybe<Scalars['String']>;
};

/** Represents the location of a vulnerability found by a Coverage Fuzzing scan */
export type VulnerabilityLocationCoverageFuzzing = {
  __typename?: 'VulnerabilityLocationCoverageFuzzing';
  /** Blob path to the vulnerable file. */
  blobPath?: Maybe<Scalars['String']>;
  /** Number of the last relevant line in the vulnerable file. */
  endLine?: Maybe<Scalars['String']>;
  /** Path to the vulnerable file. */
  file?: Maybe<Scalars['String']>;
  /** Number of the first relevant line in the vulnerable file. */
  startLine?: Maybe<Scalars['String']>;
  /** Class containing the vulnerability. */
  vulnerableClass?: Maybe<Scalars['String']>;
  /** Method containing the vulnerability. */
  vulnerableMethod?: Maybe<Scalars['String']>;
};

/** Represents the location of a vulnerability found by a DAST scan */
export type VulnerabilityLocationDast = {
  __typename?: 'VulnerabilityLocationDast';
  /** Domain name of the vulnerable request. */
  hostname?: Maybe<Scalars['String']>;
  /** Query parameter for the URL on which the vulnerability occurred. */
  param?: Maybe<Scalars['String']>;
  /** URL path and query string of the vulnerable request. */
  path?: Maybe<Scalars['String']>;
  /** HTTP method of the vulnerable request. */
  requestMethod?: Maybe<Scalars['String']>;
};

/** Represents the location of a vulnerability found by a dependency security scan */
export type VulnerabilityLocationDependencyScanning = {
  __typename?: 'VulnerabilityLocationDependencyScanning';
  /** Blob path to the vulnerable file. */
  blobPath?: Maybe<Scalars['String']>;
  /** Dependency containing the vulnerability. */
  dependency?: Maybe<VulnerableDependency>;
  /** Path to the vulnerable file. */
  file?: Maybe<Scalars['String']>;
};

/** Represents the location of a vulnerability found by a generic scanner. */
export type VulnerabilityLocationGeneric = {
  __typename?: 'VulnerabilityLocationGeneric';
  /** Free-form description of where the vulnerability is located. */
  description?: Maybe<Scalars['String']>;
};

/** Represents the location of a vulnerability found by a SAST scan */
export type VulnerabilityLocationSast = {
  __typename?: 'VulnerabilityLocationSast';
  /** Blob path to the vulnerable file. */
  blobPath?: Maybe<Scalars['String']>;
  /** Number of the last relevant line in the vulnerable file. */
  endLine?: Maybe<Scalars['String']>;
  /** Path to the vulnerable file. */
  file?: Maybe<Scalars['String']>;
  /** Number of the first relevant line in the vulnerable file. */
  startLine?: Maybe<Scalars['String']>;
  /** Class containing the vulnerability. */
  vulnerableClass?: Maybe<Scalars['String']>;
  /** Method containing the vulnerability. */
  vulnerableMethod?: Maybe<Scalars['String']>;
};

/** Represents the location of a vulnerability found by a secret detection scan */
export type VulnerabilityLocationSecretDetection = {
  __typename?: 'VulnerabilityLocationSecretDetection';
  /** Blob path to the vulnerable file. */
  blobPath?: Maybe<Scalars['String']>;
  /** Number of the last relevant line in the vulnerable file. */
  endLine?: Maybe<Scalars['String']>;
  /** Path to the vulnerable file. */
  file?: Maybe<Scalars['String']>;
  /** Number of the first relevant line in the vulnerable file. */
  startLine?: Maybe<Scalars['String']>;
  /** Class containing the vulnerability. */
  vulnerableClass?: Maybe<Scalars['String']>;
  /** Method containing the vulnerability. */
  vulnerableMethod?: Maybe<Scalars['String']>;
};

/** Check permissions for the current user on a vulnerability */
export type VulnerabilityPermissions = {
  __typename?: 'VulnerabilityPermissions';
  /** Indicates the user can perform `admin_vulnerability` on this resource */
  adminVulnerability: Scalars['Boolean'];
  /** Indicates the user can perform `admin_vulnerability_external_issue_link` on this resource */
  adminVulnerabilityExternalIssueLink: Scalars['Boolean'];
  /** Indicates the user can perform `admin_vulnerability_issue_link` on this resource */
  adminVulnerabilityIssueLink: Scalars['Boolean'];
  /** Indicates the user can perform `create_vulnerability` on this resource */
  createVulnerability: Scalars['Boolean'];
  /** Indicates the user can perform `create_vulnerability_export` on this resource */
  createVulnerabilityExport: Scalars['Boolean'];
  /** Indicates the user can perform `create_vulnerability_feedback` on this resource */
  createVulnerabilityFeedback: Scalars['Boolean'];
  /** Indicates the user can perform `destroy_vulnerability_feedback` on this resource */
  destroyVulnerabilityFeedback: Scalars['Boolean'];
  /** Indicates the user can perform `read_vulnerability_feedback` on this resource */
  readVulnerabilityFeedback: Scalars['Boolean'];
  /** Indicates the user can perform `update_vulnerability_feedback` on this resource */
  updateVulnerabilityFeedback: Scalars['Boolean'];
};

/** The type of the security scan that found the vulnerability */
export type VulnerabilityReportType =
  /** API Fuzzing report */
  | 'API_FUZZING'
  /** Cluster Image Scanning report */
  | 'CLUSTER_IMAGE_SCANNING'
  /** Container Scanning report */
  | 'CONTAINER_SCANNING'
  /** Coverage Fuzzing report */
  | 'COVERAGE_FUZZING'
  /** DAST report */
  | 'DAST'
  /** Dependency Scanning report */
  | 'DEPENDENCY_SCANNING'
  /** Generic report */
  | 'GENERIC'
  /** SAST report */
  | 'SAST'
  /** Secret Detection report */
  | 'SECRET_DETECTION';

/** Autogenerated input type of VulnerabilityResolve */
export type VulnerabilityResolveInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the vulnerability to be resolved. */
  id: Scalars['VulnerabilityID'];
};

/** Autogenerated return type of VulnerabilityResolve */
export type VulnerabilityResolvePayload = {
  __typename?: 'VulnerabilityResolvePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Vulnerability after state change. */
  vulnerability?: Maybe<Vulnerability>;
};

/** Autogenerated input type of VulnerabilityRevertToDetected */
export type VulnerabilityRevertToDetectedInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** ID of the vulnerability to be reverted. */
  id: Scalars['VulnerabilityID'];
};

/** Autogenerated return type of VulnerabilityRevertToDetected */
export type VulnerabilityRevertToDetectedPayload = {
  __typename?: 'VulnerabilityRevertToDetectedPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Vulnerability after revert. */
  vulnerability?: Maybe<Vulnerability>;
};

/** Represents a vulnerability scanner */
export type VulnerabilityScanner = {
  __typename?: 'VulnerabilityScanner';
  /** External ID of the vulnerability scanner. */
  externalId?: Maybe<Scalars['String']>;
  /** ID of the scanner. */
  id?: Maybe<Scalars['ID']>;
  /** Name of the vulnerability scanner. */
  name?: Maybe<Scalars['String']>;
  /** Type of the vulnerability report. */
  reportType?: Maybe<VulnerabilityReportType>;
  /** Vendor of the vulnerability scanner. */
  vendor?: Maybe<Scalars['String']>;
};

/** The connection type for VulnerabilityScanner. */
export type VulnerabilityScannerConnection = {
  __typename?: 'VulnerabilityScannerConnection';
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<VulnerabilityScannerEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<VulnerabilityScanner>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type VulnerabilityScannerEdge = {
  __typename?: 'VulnerabilityScannerEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<VulnerabilityScanner>;
};

export type VulnerabilityScannerInput = {
  /** Unique ID that identifies the scanner. */
  id: Scalars['String'];
  /** Human readable value that identifies the analyzer, not required to be unique. */
  name: Scalars['String'];
  /** Link to more information about the analyzer. */
  url: Scalars['String'];
  /** Information about vendor/maintainer of the scanner. */
  vendor?: InputMaybe<VulnerabilityScannerVendorInput>;
  /** Version of the scanner. */
  version: Scalars['String'];
};

export type VulnerabilityScannerVendorInput = {
  /** Name of the vendor/maintainer. */
  name: Scalars['String'];
};

/** Represents vulnerability counts by severity */
export type VulnerabilitySeveritiesCount = {
  __typename?: 'VulnerabilitySeveritiesCount';
  /** Number of vulnerabilities of CRITICAL severity of the project */
  critical?: Maybe<Scalars['Int']>;
  /** Number of vulnerabilities of HIGH severity of the project */
  high?: Maybe<Scalars['Int']>;
  /** Number of vulnerabilities of INFO severity of the project */
  info?: Maybe<Scalars['Int']>;
  /** Number of vulnerabilities of LOW severity of the project */
  low?: Maybe<Scalars['Int']>;
  /** Number of vulnerabilities of MEDIUM severity of the project */
  medium?: Maybe<Scalars['Int']>;
  /** Number of vulnerabilities of UNKNOWN severity of the project */
  unknown?: Maybe<Scalars['Int']>;
};

/** The severity of the vulnerability */
export type VulnerabilitySeverity =
  /** Critical severity */
  | 'CRITICAL'
  /** High severity */
  | 'HIGH'
  /** Info severity */
  | 'INFO'
  /** Low severity */
  | 'LOW'
  /** Medium severity */
  | 'MEDIUM'
  /** Unknown severity */
  | 'UNKNOWN';

/** Vulnerability sort values */
export type VulnerabilitySort =
  /** Detection timestamp in ascending order. */
  | 'detected_asc'
  /** Detection timestamp in descending order. */
  | 'detected_desc'
  /** Report Type in ascending order. */
  | 'report_type_asc'
  /** Report Type in descending order. */
  | 'report_type_desc'
  /** Severity in ascending order. */
  | 'severity_asc'
  /** Severity in descending order. */
  | 'severity_desc'
  /** State in ascending order. */
  | 'state_asc'
  /** State in descending order. */
  | 'state_desc'
  /** Title in ascending order. */
  | 'title_asc'
  /** Title in descending order. */
  | 'title_desc';

/** The state of the vulnerability */
export type VulnerabilityState =
  /** Confirmed vulnerability */
  | 'CONFIRMED'
  /** Detected vulnerability */
  | 'DETECTED'
  /** Dismissed vulnerability */
  | 'DISMISSED'
  /** Resolved vulnerability */
  | 'RESOLVED';

/** Represents a vulnerable dependency. Used in vulnerability location data */
export type VulnerableDependency = {
  __typename?: 'VulnerableDependency';
  /** Package associated with the vulnerable dependency. */
  package?: Maybe<VulnerablePackage>;
  /** Version of the vulnerable dependency. */
  version?: Maybe<Scalars['String']>;
};

/** Represents a vulnerable package. Used in vulnerability dependency data */
export type VulnerablePackage = {
  __typename?: 'VulnerablePackage';
  /** Name of the vulnerable package. */
  name?: Maybe<Scalars['String']>;
};

/** Represents vulnerability letter grades with associated projects */
export type VulnerableProjectsByGrade = {
  __typename?: 'VulnerableProjectsByGrade';
  /** Number of projects within this grade. */
  count: Scalars['Int'];
  /** Grade based on the highest severity vulnerability present. */
  grade: VulnerabilityGrade;
  /** Projects within this grade. */
  projects: ProjectConnection;
};


/** Represents vulnerability letter grades with associated projects */
export type VulnerableProjectsByGradeProjectsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Weight ID wildcard values */
export type WeightWildcardId =
  /** Weight is assigned. */
  | 'ANY'
  /** No weight is assigned. */
  | 'NONE';

/** Autogenerated input type of iterationCreate */
export type IterationCreateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']>;
  /** Description of the iteration. */
  description?: InputMaybe<Scalars['String']>;
  /** End date of the iteration. */
  dueDate?: InputMaybe<Scalars['String']>;
  /** Full path of the group with which the resource is associated. */
  groupPath?: InputMaybe<Scalars['ID']>;
  /** Global ID of the iterations cadence to be assigned to newly created iteration. */
  iterationsCadenceId?: InputMaybe<Scalars['IterationsCadenceID']>;
  /** Full path of the project with which the resource is associated. */
  projectPath?: InputMaybe<Scalars['ID']>;
  /** Start date of the iteration. */
  startDate?: InputMaybe<Scalars['String']>;
  /** Title of the iteration. */
  title?: InputMaybe<Scalars['String']>;
};

/** Autogenerated return type of iterationCreate */
export type IterationCreatePayload = {
  __typename?: 'iterationCreatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']>;
  /** Errors encountered during execution of the mutation. */
  errors: Array<Scalars['String']>;
  /** Created iteration. */
  iteration?: Maybe<Iteration>;
};

export type CreateIssueMutationVariables = Exact<{
  input: CreateIssueInput;
}>;


export type CreateIssueMutation = { __typename?: 'Mutation', createIssue?: { __typename?: 'CreateIssuePayload', clientMutationId?: string | null | undefined, errors: Array<string>, issue?: { __typename?: 'Issue', id: string } | null | undefined } | null | undefined };

export type GetProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProfileQuery = { __typename?: 'Query', currentUser?: { __typename?: 'UserCore', avatarUrl?: string | null | undefined, name: string } | null | undefined };

export type GetProjectsQueryVariables = Exact<{
  teamId: Scalars['String'];
  first?: InputMaybe<Scalars['Int']>;
  after?: InputMaybe<Scalars['String']>;
}>;


export type GetProjectsQuery = { __typename?: 'Query', projects?: { __typename?: 'ProjectConnection', edges?: Array<{ __typename?: 'ProjectEdge', node?: { __typename: 'Project', id: string, fullPath: string } | null | undefined } | null | undefined> | null | undefined } | null | undefined };
