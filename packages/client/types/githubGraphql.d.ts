// AUTOMATICALLY GENERATED FILE - DO NOT EDIT

// tslint:disable

export interface IGraphQLResponseRoot {
  data?: IQuery | IMutation
  errors?: IGraphQLResponseError[]
}

export interface IGraphQLResponseError {
  /** Required for all errors */
  message: string
  locations?: IGraphQLResponseErrorLocation[]
  /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
  [propName: string]: any
}

export interface IGraphQLResponseErrorLocation {
  line: number
  column: number
}

/**
 * The query root of GitHub's GraphQL interface.
 */
export interface IQuery {
  __typename: 'Query'

  /**
   * Look up a code of conduct by its key
   */
  codeOfConduct: ICodeOfConduct | null

  /**
   * Look up a code of conduct by its key
   */
  codesOfConduct: (ICodeOfConduct | null)[] | null

  /**
   * Look up an open source license by its key
   */
  license: ILicense | null

  /**
   * Return a list of known open source licenses
   */
  licenses: (ILicense | null)[]

  /**
   * Get alphabetically sorted list of Marketplace categories
   */
  marketplaceCategories: IMarketplaceCategory[]

  /**
   * Look up a Marketplace category by its slug.
   */
  marketplaceCategory: IMarketplaceCategory | null

  /**
   * Look up a single Marketplace listing
   */
  marketplaceListing: IMarketplaceListing | null

  /**
   * Look up Marketplace listings
   */
  marketplaceListings: IMarketplaceListingConnection

  /**
   * Return information about the GitHub instance
   */
  meta: IGitHubMetadata

  /**
   * Fetches an object given its ID.
   */
  node: Node | null

  /**
   * Lookup nodes by a list of IDs.
   */
  nodes: (Node | null)[]

  /**
   * Lookup a organization by login.
   */
  organization: IOrganization | null

  /**
   * The client's rate limit information.
   */
  rateLimit: IRateLimit | null

  /**
   * Hack to workaround https://github.com/facebook/relay/issues/112 re-exposing the root query object
   */
  relay: IQuery

  /**
   * Lookup a given repository by the owner and repository name.
   */
  repository: IRepository | null

  /**
   * Lookup a repository owner (ie. either a User or an Organization) by login.
   */
  repositoryOwner: RepositoryOwner | null

  /**
   * Lookup resource by a URL.
   */
  resource: UniformResourceLocatable | null

  /**
   * Perform a search across resources.
   */
  search: ISearchResultItemConnection

  /**
   * GitHub Security Advisories
   */
  securityAdvisories: ISecurityAdvisoryConnection

  /**
   * Fetch a Security Advisory by its GHSA ID
   */
  securityAdvisory: ISecurityAdvisory | null

  /**
   * Software Vulnerabilities documented by GitHub Security Advisories
   */
  securityVulnerabilities: ISecurityVulnerabilityConnection

  /**
   * Look up a topic by name.
   */
  topic: ITopic | null

  /**
   * Lookup a user by login.
   */
  user: IGitHubUser | null

  /**
   * The currently authenticated user.
   */
  viewer: IGitHubUser
}

export interface ICodeOfConductOnQueryArguments {
  /**
   * The code of conduct's key
   */
  key: string
}

export interface ILicenseOnQueryArguments {
  /**
   * The license's downcased SPDX ID
   */
  key: string
}

export interface IMarketplaceCategoriesOnQueryArguments {
  /**
   * Return only the specified categories.
   */
  includeCategories?: string[] | null

  /**
   * Exclude categories with no listings.
   */
  excludeEmpty?: boolean | null

  /**
   * Returns top level categories only, excluding any subcategories.
   */
  excludeSubcategories?: boolean | null
}

export interface IMarketplaceCategoryOnQueryArguments {
  /**
   * The URL slug of the category.
   */
  slug: string

  /**
   * Also check topic aliases for the category slug
   */
  useTopicAliases?: boolean | null
}

export interface IMarketplaceListingOnQueryArguments {
  /**
   * Select the listing that matches this slug. It's the short name of the listing used in its URL.
   */
  slug: string
}

export interface IMarketplaceListingsOnQueryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Select only listings with the given category.
   */
  categorySlug?: string | null

  /**
   * Also check topic aliases for the category slug
   */
  useTopicAliases?: boolean | null

  /**
   * Select listings to which user has admin access. If omitted, listings visible to the
   * viewer are returned.
   *
   */
  viewerCanAdmin?: boolean | null

  /**
   * Select listings that can be administered by the specified user.
   */
  adminId?: string | null

  /**
   * Select listings for products owned by the specified organization.
   */
  organizationId?: string | null

  /**
   * Select listings visible to the viewer even if they are not approved. If omitted or
   * false, only approved listings will be returned.
   *
   */
  allStates?: boolean | null

  /**
   * Select the listings with these slugs, if they are visible to the viewer.
   */
  slugs?: (string | null)[] | null

  /**
   * Select only listings where the primary category matches the given category slug.
   * @default false
   */
  primaryCategoryOnly?: boolean | null

  /**
   * Select only listings that offer a free trial.
   * @default false
   */
  withFreeTrialsOnly?: boolean | null
}

export interface INodeOnQueryArguments {
  /**
   * ID of the object.
   */
  id: string
}

export interface INodesOnQueryArguments {
  /**
   * The list of node IDs.
   */
  ids: string[]
}

export interface IOrganizationOnQueryArguments {
  /**
   * The organization's login.
   */
  login: string
}

export interface IRateLimitOnQueryArguments {
  /**
   * If true, calculate the cost for the query without evaluating it
   * @default false
   */
  dryRun?: boolean | null
}

export interface IRepositoryOnQueryArguments {
  /**
   * The login field of a user or organization
   */
  owner: string

  /**
   * The name of the repository
   */
  name: string
}

export interface IRepositoryOwnerOnQueryArguments {
  /**
   * The username to lookup the owner by.
   */
  login: string
}

export interface IResourceOnQueryArguments {
  /**
   * The URL.
   */
  url: any
}

export interface ISearchOnQueryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * The search string to look for.
   */
  query: string

  /**
   * The types of search items to search within.
   */
  type: SearchType
}

export interface ISecurityAdvisoriesOnQueryArguments {
  /**
   * Ordering options for the returned topics.
   */
  orderBy?: ISecurityAdvisoryOrder | null

  /**
   * Filter advisories by identifier, e.g. GHSA or CVE.
   */
  identifier?: ISecurityAdvisoryIdentifierFilter | null

  /**
   * Filter advisories to those published since a time in the past.
   */
  publishedSince?: any | null

  /**
   * Filter advisories to those updated since a time in the past.
   */
  updatedSince?: any | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ISecurityAdvisoryOnQueryArguments {
  /**
   * GitHub Security Advisory ID.
   */
  ghsaId: string
}

export interface ISecurityVulnerabilitiesOnQueryArguments {
  /**
   * Ordering options for the returned topics.
   */
  orderBy?: ISecurityVulnerabilityOrder | null

  /**
   * An ecosystem to filter vulnerabilities by.
   */
  ecosystem?: SecurityAdvisoryEcosystem | null

  /**
   * A package name to filter vulnerabilities by.
   */
  package?: string | null

  /**
   * A list of severities to filter vulnerabilities by.
   */
  severities?: SecurityAdvisorySeverity[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ITopicOnQueryArguments {
  /**
   * The topic's name.
   */
  name: string
}

export interface IUserOnQueryArguments {
  /**
   * The user's login.
   */
  login: string
}

/**
 * The Code of Conduct for a repository
 */
export interface ICodeOfConduct {
  __typename: 'CodeOfConduct'

  /**
   * The body of the Code of Conduct
   */
  body: string | null
  id: string

  /**
   * The key for the Code of Conduct
   */
  key: string

  /**
   * The formal name of the Code of Conduct
   */
  name: string

  /**
   * The HTTP path for this Code of Conduct
   */
  resourcePath: any | null

  /**
   * The HTTP URL for this Code of Conduct
   */
  url: any | null
}

/**
 * An object with an ID.
 */
export type Node =
  | ICodeOfConduct
  | ILicense
  | IMarketplaceCategory
  | IMarketplaceListing
  | IApp
  | IOrganization
  | IProject
  | IProjectColumn
  | IProjectCard
  | IIssue
  | IGitHubUser
  | IRepository
  | IBranchProtectionRule
  | IRef
  | IPullRequest
  | IUserContentEdit
  | ILabel
  | IReaction
  | IIssueComment
  | IPullRequestCommit
  | ICommit
  | ICommitComment
  | IDeployment
  | IDeploymentStatus
  | IStatus
  | IStatusContext
  | ITree
  | IMilestone
  | IReviewRequest
  | ITeam
  | IUserStatus
  | IOrganizationInvitation
  | IPullRequestReviewThread
  | IPullRequestReviewComment
  | IPullRequestReview
  | ICommitCommentThread
  | IClosedEvent
  | IReopenedEvent
  | ISubscribedEvent
  | IUnsubscribedEvent
  | IMergedEvent
  | IReferencedEvent
  | ICrossReferencedEvent
  | IAssignedEvent
  | IUnassignedEvent
  | ILabeledEvent
  | IUnlabeledEvent
  | IMilestonedEvent
  | IDemilestonedEvent
  | IRenamedTitleEvent
  | ILockedEvent
  | IUnlockedEvent
  | IDeployedEvent
  | IDeploymentEnvironmentChangedEvent
  | IHeadRefDeletedEvent
  | IHeadRefRestoredEvent
  | IHeadRefForcePushedEvent
  | IBaseRefForcePushedEvent
  | IReviewRequestedEvent
  | IReviewRequestRemovedEvent
  | IReviewDismissedEvent
  | IUserBlockedEvent
  | IPullRequestCommitCommentThread
  | IBaseRefChangedEvent
  | IAddedToProjectEvent
  | ICommentDeletedEvent
  | IConvertedNoteToIssueEvent
  | IMentionedEvent
  | IMovedColumnsInProjectEvent
  | IPinnedEvent
  | IRemovedFromProjectEvent
  | ITransferredEvent
  | IUnpinnedEvent
  | IPushAllowance
  | IReviewDismissalAllowance
  | IDeployKey
  | ILanguage
  | IRelease
  | IReleaseAsset
  | IRepositoryTopic
  | ITopic
  | IGist
  | IGistComment
  | IPublicKey
  | IOrganizationIdentityProvider
  | IExternalIdentity
  | ISecurityAdvisory
  | IBlob
  | IBot
  | IRepositoryInvitation
  | ITag

/**
 * An object with an ID.
 */
export interface INode {
  __typename: 'Node'

  /**
   * ID of the object.
   */
  id: string
}

/**
 * A repository's open source license
 */
export interface ILicense {
  __typename: 'License'

  /**
   * The full text of the license
   */
  body: string

  /**
   * The conditions set by the license
   */
  conditions: (ILicenseRule | null)[]

  /**
   * A human-readable description of the license
   */
  description: string | null

  /**
   * Whether the license should be featured
   */
  featured: boolean

  /**
   * Whether the license should be displayed in license pickers
   */
  hidden: boolean
  id: string

  /**
   * Instructions on how to implement the license
   */
  implementation: string | null

  /**
   * The lowercased SPDX ID of the license
   */
  key: string

  /**
   * The limitations set by the license
   */
  limitations: (ILicenseRule | null)[]

  /**
   * The license full name specified by <https://spdx.org/licenses>
   */
  name: string

  /**
   * Customary short name if applicable (e.g, GPLv3)
   */
  nickname: string | null

  /**
   * The permissions set by the license
   */
  permissions: (ILicenseRule | null)[]

  /**
   * Whether the license is a pseudo-license placeholder (e.g., other, no-license)
   */
  pseudoLicense: boolean

  /**
   * Short identifier specified by <https://spdx.org/licenses>
   */
  spdxId: string | null

  /**
   * URL to the license on <https://choosealicense.com>
   */
  url: any | null
}

/**
 * Describes a License's conditions, permissions, and limitations
 */
export interface ILicenseRule {
  __typename: 'LicenseRule'

  /**
   * A description of the rule
   */
  description: string

  /**
   * The machine-readable rule key
   */
  key: string

  /**
   * The human-readable rule label
   */
  label: string
}

/**
 * A public description of a Marketplace category.
 */
export interface IMarketplaceCategory {
  __typename: 'MarketplaceCategory'

  /**
   * The category's description.
   */
  description: string | null

  /**
   * The technical description of how apps listed in this category work with GitHub.
   */
  howItWorks: string | null
  id: string

  /**
   * The category's name.
   */
  name: string

  /**
   * How many Marketplace listings have this as their primary category.
   */
  primaryListingCount: number

  /**
   * The HTTP path for this Marketplace category.
   */
  resourcePath: any

  /**
   * How many Marketplace listings have this as their secondary category.
   */
  secondaryListingCount: number

  /**
   * The short name of the category used in its URL.
   */
  slug: string

  /**
   * The HTTP URL for this Marketplace category.
   */
  url: any
}

/**
 * A listing in the GitHub integration marketplace.
 */
export interface IMarketplaceListing {
  __typename: 'MarketplaceListing'

  /**
   * The GitHub App this listing represents.
   */
  app: IApp | null

  /**
   * URL to the listing owner's company site.
   */
  companyUrl: any | null

  /**
   * The HTTP path for configuring access to the listing's integration or OAuth app
   */
  configurationResourcePath: any

  /**
   * The HTTP URL for configuring access to the listing's integration or OAuth app
   */
  configurationUrl: any

  /**
   * URL to the listing's documentation.
   */
  documentationUrl: any | null

  /**
   * The listing's detailed description.
   */
  extendedDescription: string | null

  /**
   * The listing's detailed description rendered to HTML.
   */
  extendedDescriptionHTML: any

  /**
   * The listing's introductory description.
   */
  fullDescription: string

  /**
   * The listing's introductory description rendered to HTML.
   */
  fullDescriptionHTML: any

  /**
   * Whether this listing has been submitted for review from GitHub for approval to be displayed in the Marketplace.
   */
  hasApprovalBeenRequested: boolean

  /**
   * Does this listing have any plans with a free trial?
   */
  hasPublishedFreeTrialPlans: boolean

  /**
   * Does this listing have a terms of service link?
   */
  hasTermsOfService: boolean

  /**
   * A technical description of how this app works with GitHub.
   */
  howItWorks: string | null

  /**
   * The listing's technical description rendered to HTML.
   */
  howItWorksHTML: any
  id: string

  /**
   * URL to install the product to the viewer's account or organization.
   */
  installationUrl: any | null

  /**
   * Whether this listing's app has been installed for the current viewer
   */
  installedForViewer: boolean

  /**
   * Whether this listing has been approved for display in the Marketplace.
   */
  isApproved: boolean

  /**
   * Whether this listing has been removed from the Marketplace.
   */
  isDelisted: boolean

  /**
   * Whether this listing is still an editable draft that has not been submitted for review and is not publicly visible in the Marketplace.
   */
  isDraft: boolean

  /**
   * Whether the product this listing represents is available as part of a paid plan.
   */
  isPaid: boolean

  /**
   * Whether this listing has been approved for display in the Marketplace.
   */
  isPublic: boolean

  /**
   * Whether this listing has been rejected by GitHub for display in the Marketplace.
   */
  isRejected: boolean

  /**
   * Whether this listing has been approved for unverified display in the Marketplace.
   */
  isUnverified: boolean

  /**
   * Whether this draft listing has been submitted for review for approval to be unverified in the Marketplace.
   */
  isUnverifiedPending: boolean

  /**
   * Whether this draft listing has been submitted for review from GitHub for approval to be verified in the Marketplace.
   */
  isVerificationPendingFromDraft: boolean

  /**
   * Whether this unverified listing has been submitted for review from GitHub for approval to be verified in the Marketplace.
   */
  isVerificationPendingFromUnverified: boolean

  /**
   * Whether this listing has been approved for verified display in the Marketplace.
   */
  isVerified: boolean

  /**
   * The hex color code, without the leading '#', for the logo background.
   */
  logoBackgroundColor: string

  /**
   * URL for the listing's logo image.
   */
  logoUrl: any | null

  /**
   * The listing's full name.
   */
  name: string

  /**
   * The listing's very short description without a trailing period or ampersands.
   */
  normalizedShortDescription: string

  /**
   * URL to the listing's detailed pricing.
   */
  pricingUrl: any | null

  /**
   * The category that best describes the listing.
   */
  primaryCategory: IMarketplaceCategory

  /**
   * URL to the listing's privacy policy, may return an empty string for listings that do not require a privacy policy URL.
   */
  privacyPolicyUrl: any

  /**
   * The HTTP path for the Marketplace listing.
   */
  resourcePath: any

  /**
   * The URLs for the listing's screenshots.
   */
  screenshotUrls: (string | null)[]

  /**
   * An alternate category that describes the listing.
   */
  secondaryCategory: IMarketplaceCategory | null

  /**
   * The listing's very short description.
   */
  shortDescription: string

  /**
   * The short name of the listing used in its URL.
   */
  slug: string

  /**
   * URL to the listing's status page.
   */
  statusUrl: any | null

  /**
   * An email address for support for this listing's app.
   */
  supportEmail: string | null

  /**
   * Either a URL or an email address for support for this listing's app, may return an empty string for listings that do not require a support URL.
   */
  supportUrl: any

  /**
   * URL to the listing's terms of service.
   */
  termsOfServiceUrl: any | null

  /**
   * The HTTP URL for the Marketplace listing.
   */
  url: any

  /**
   * Can the current viewer add plans for this Marketplace listing.
   */
  viewerCanAddPlans: boolean

  /**
   * Can the current viewer approve this Marketplace listing.
   */
  viewerCanApprove: boolean

  /**
   * Can the current viewer delist this Marketplace listing.
   */
  viewerCanDelist: boolean

  /**
   * Can the current viewer edit this Marketplace listing.
   */
  viewerCanEdit: boolean

  /**
   * Can the current viewer edit the primary and secondary category of this
   * Marketplace listing.
   *
   */
  viewerCanEditCategories: boolean

  /**
   * Can the current viewer edit the plans for this Marketplace listing.
   */
  viewerCanEditPlans: boolean

  /**
   * Can the current viewer return this Marketplace listing to draft state
   * so it becomes editable again.
   *
   */
  viewerCanRedraft: boolean

  /**
   * Can the current viewer reject this Marketplace listing by returning it to
   * an editable draft state or rejecting it entirely.
   *
   */
  viewerCanReject: boolean

  /**
   * Can the current viewer request this listing be reviewed for display in
   * the Marketplace as verified.
   *
   */
  viewerCanRequestApproval: boolean

  /**
   * Indicates whether the current user has an active subscription to this Marketplace listing.
   *
   */
  viewerHasPurchased: boolean

  /**
   * Indicates if the current user has purchased a subscription to this Marketplace listing
   * for all of the organizations the user owns.
   *
   */
  viewerHasPurchasedForAllOrganizations: boolean

  /**
   * Does the current viewer role allow them to administer this Marketplace listing.
   *
   */
  viewerIsListingAdmin: boolean
}

export interface ILogoUrlOnMarketplaceListingArguments {
  /**
   * The size in pixels of the resulting square image.
   * @default 400
   */
  size?: number | null
}

/**
 * A GitHub App.
 */
export interface IApp {
  __typename: 'App'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The description of the app.
   */
  description: string | null
  id: string

  /**
   * The hex color code, without the leading '#', for the logo background.
   */
  logoBackgroundColor: string

  /**
   * A URL pointing to the app's logo.
   */
  logoUrl: any

  /**
   * The name of the app.
   */
  name: string

  /**
   * A slug based on the name of the app for use in URLs.
   */
  slug: string

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The URL to the app's homepage.
   */
  url: any
}

export interface ILogoUrlOnAppArguments {
  /**
   * The size of the resulting image.
   */
  size?: number | null
}

/**
 * Look up Marketplace Listings
 */
export interface IMarketplaceListingConnection {
  __typename: 'MarketplaceListingConnection'

  /**
   * A list of edges.
   */
  edges: (IMarketplaceListingEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IMarketplaceListing | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IMarketplaceListingEdge {
  __typename: 'MarketplaceListingEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IMarketplaceListing | null
}

/**
 * Information about pagination in a connection.
 */
export interface IPageInfo {
  __typename: 'PageInfo'

  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null

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
}

/**
 * Represents information about the GitHub instance.
 */
export interface IGitHubMetadata {
  __typename: 'GitHubMetadata'

  /**
   * Returns a String that's a SHA of `github-services`
   */
  gitHubServicesSha: any

  /**
   * IP addresses that users connect to for git operations
   */
  gitIpAddresses: string[] | null

  /**
   * IP addresses that service hooks are sent from
   */
  hookIpAddresses: string[] | null

  /**
   * IP addresses that the importer connects from
   */
  importerIpAddresses: string[] | null

  /**
   * Whether or not users are verified
   */
  isPasswordAuthenticationVerifiable: boolean

  /**
   * IP addresses for GitHub Pages' A records
   */
  pagesIpAddresses: string[] | null
}

/**
 * An account on GitHub, with one or more owners, that has repositories, members and teams.
 */
export interface IOrganization {
  __typename: 'Organization'

  /**
   * Determine if this repository owner has any items that can be pinned to their profile.
   */
  anyPinnableItems: boolean

  /**
   * A URL pointing to the organization's public avatar.
   */
  avatarUrl: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The organization's public profile description.
   */
  description: string | null

  /**
   * The organization's public email.
   */
  email: string | null
  id: string

  /**
   * Whether the organization has verified its profile email and website.
   */
  isVerified: boolean

  /**
   * Showcases a selection of repositories and gists that the profile owner has either curated or that have been selected automatically based on popularity.
   */
  itemShowcase: IProfileItemShowcase

  /**
   * The organization's public profile location.
   */
  location: string | null

  /**
   * The organization's login name.
   */
  login: string

  /**
   * Get the status messages members of this entity have set that are either public or visible only to the organization.
   */
  memberStatuses: IUserStatusConnection

  /**
   * A list of users who are members of this organization.
   */
  membersWithRole: IOrganizationMemberConnection

  /**
   * The organization's public profile name.
   */
  name: string | null

  /**
   * The HTTP path creating a new team
   */
  newTeamResourcePath: any

  /**
   * The HTTP URL creating a new team
   */
  newTeamUrl: any

  /**
   * The billing email for the organization.
   */
  organizationBillingEmail: string | null

  /**
   * A list of users who have been invited to join this organization.
   */
  pendingMembers: IUserConnection

  /**
   * A list of repositories and gists this profile owner can pin to their profile.
   */
  pinnableItems: IPinnableItemConnection

  /**
   * A list of repositories and gists this profile owner has pinned to their profile
   */
  pinnedItems: IPinnableItemConnection

  /**
   * Returns how many more items this profile owner can pin to their profile.
   */
  pinnedItemsRemaining: number

  /**
   * A list of repositories this user has pinned to their profile
   * @deprecated "pinnedRepositories will be removed Use ProfileOwner.pinnedItems instead. Removal on 2019-07-01 UTC."
   */
  pinnedRepositories: IRepositoryConnection

  /**
   * Find project by number.
   */
  project: IProject | null

  /**
   * A list of projects under the owner.
   */
  projects: IProjectConnection

  /**
   * The HTTP path listing organization's projects
   */
  projectsResourcePath: any

  /**
   * The HTTP URL listing organization's projects
   */
  projectsUrl: any

  /**
   * A list of repositories that the user owns.
   */
  repositories: IRepositoryConnection

  /**
   * Find Repository.
   */
  repository: IRepository | null

  /**
   * When true the organization requires all members, billing managers, and outside collaborators to enable two-factor authentication.
   */
  requiresTwoFactorAuthentication: boolean | null

  /**
   * The HTTP path for this organization.
   */
  resourcePath: any

  /**
   * The Organization's SAML identity providers
   */
  samlIdentityProvider: IOrganizationIdentityProvider | null

  /**
   * Find an organization's team by its slug.
   */
  team: ITeam | null

  /**
   * A list of teams in this organization.
   */
  teams: ITeamConnection

  /**
   * The HTTP path listing organization's teams
   */
  teamsResourcePath: any

  /**
   * The HTTP URL listing organization's teams
   */
  teamsUrl: any

  /**
   * The HTTP URL for this organization.
   */
  url: any

  /**
   * Organization is adminable by the viewer.
   */
  viewerCanAdminister: boolean

  /**
   * Can the viewer pin repositories and gists to the profile?
   */
  viewerCanChangePinnedItems: boolean

  /**
   * Can the current viewer create new projects on this owner.
   */
  viewerCanCreateProjects: boolean

  /**
   * Viewer can create repositories on this organization
   */
  viewerCanCreateRepositories: boolean

  /**
   * Viewer can create teams on this organization.
   */
  viewerCanCreateTeams: boolean

  /**
   * Viewer is an active member of this organization.
   */
  viewerIsAMember: boolean

  /**
   * The organization's public profile URL.
   */
  websiteUrl: any | null
}

export interface IAnyPinnableItemsOnOrganizationArguments {
  /**
   * Filter to only a particular kind of pinnable item.
   */
  type?: PinnableItemType | null
}

export interface IAvatarUrlOnOrganizationArguments {
  /**
   * The size of the resulting square image.
   */
  size?: number | null
}

export interface IMemberStatusesOnOrganizationArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for user statuses returned from the connection.
   */
  orderBy?: IUserStatusOrder | null
}

export interface IMembersWithRoleOnOrganizationArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPendingMembersOnOrganizationArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPinnableItemsOnOrganizationArguments {
  /**
   * Filter the types of pinnable items that are returned.
   */
  types?: PinnableItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPinnedItemsOnOrganizationArguments {
  /**
   * Filter the types of pinned items that are returned.
   */
  types?: PinnableItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPinnedRepositoriesOnOrganizationArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Array of viewer's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the current viewer owns.
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IProjectOnOrganizationArguments {
  /**
   * The project number to find.
   */
  number: number
}

export interface IProjectsOnOrganizationArguments {
  /**
   * Ordering options for projects returned from the connection
   */
  orderBy?: IProjectOrder | null

  /**
   * Query to search projects by, currently only searching by name.
   */
  search?: string | null

  /**
   * A list of states to filter the projects by.
   */
  states?: ProjectState[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IRepositoriesOnOrganizationArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Array of viewer's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the current viewer owns.
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * If non-null, filters repositories according to whether they are forks of another repository
   */
  isFork?: boolean | null
}

export interface IRepositoryOnOrganizationArguments {
  /**
   * Name of Repository to find.
   */
  name: string
}

export interface ITeamOnOrganizationArguments {
  /**
   * The name or slug of the team to find.
   */
  slug: string
}

export interface ITeamsOnOrganizationArguments {
  /**
   * If non-null, filters teams according to privacy
   */
  privacy?: TeamPrivacy | null

  /**
   * If non-null, filters teams according to whether the viewer is an admin or member on team
   */
  role?: TeamRole | null

  /**
   * If non-null, filters teams with query on team name and team slug
   */
  query?: string | null

  /**
   * User logins to filter by
   */
  userLogins?: string[] | null

  /**
   * Ordering options for teams returned from the connection
   */
  orderBy?: ITeamOrder | null

  /**
   * If true, filters teams that are mapped to an LDAP Group (Enterprise only)
   */
  ldapMapped?: boolean | null

  /**
   * If true, restrict to only root teams
   * @default false
   */
  rootTeamsOnly?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Represents an object which can take actions on GitHub. Typically a User or Bot.
 */
export type Actor = IOrganization | IGitHubUser | IBot

/**
 * Represents an object which can take actions on GitHub. Typically a User or Bot.
 */
export interface IActor {
  __typename: 'Actor'

  /**
   * A URL pointing to the actor's public avatar.
   */
  avatarUrl: any

  /**
   * The username of the actor.
   */
  login: string

  /**
   * The HTTP path for this actor.
   */
  resourcePath: any

  /**
   * The HTTP URL for this actor.
   */
  url: any
}

export interface IAvatarUrlOnActorArguments {
  /**
   * The size of the resulting square image.
   */
  size?: number | null
}

/**
 * Represents an owner of a registry package.
 */
export type RegistryPackageOwner = IOrganization | IGitHubUser | IRepository

/**
 * Represents an owner of a registry package.
 */
export interface IRegistryPackageOwner {
  __typename: 'RegistryPackageOwner'
  id: string
}

/**
 * Represents an interface to search packages on an object.
 */
export type RegistryPackageSearch = IOrganization | IGitHubUser

/**
 * Represents an interface to search packages on an object.
 */
export interface IRegistryPackageSearch {
  __typename: 'RegistryPackageSearch'
  id: string
}

/**
 * Represents an owner of a Project.
 */
export type ProjectOwner = IOrganization | IGitHubUser | IRepository

/**
 * Represents an owner of a Project.
 */
export interface IProjectOwner {
  __typename: 'ProjectOwner'
  id: string

  /**
   * Find project by number.
   */
  project: IProject | null

  /**
   * A list of projects under the owner.
   */
  projects: IProjectConnection

  /**
   * The HTTP path listing owners projects
   */
  projectsResourcePath: any

  /**
   * The HTTP URL listing owners projects
   */
  projectsUrl: any

  /**
   * Can the current viewer create new projects on this owner.
   */
  viewerCanCreateProjects: boolean
}

export interface IProjectOnProjectOwnerArguments {
  /**
   * The project number to find.
   */
  number: number
}

export interface IProjectsOnProjectOwnerArguments {
  /**
   * Ordering options for projects returned from the connection
   */
  orderBy?: IProjectOrder | null

  /**
   * Query to search projects by, currently only searching by name.
   */
  search?: string | null

  /**
   * A list of states to filter the projects by.
   */
  states?: ProjectState[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Projects manage issues, pull requests and notes within a project owner.
 */
export interface IProject {
  __typename: 'Project'

  /**
   * The project's description body.
   */
  body: string | null

  /**
   * The projects description body rendered to HTML.
   */
  bodyHTML: any

  /**
   * `true` if the object is closed (definition of closed may depend on type)
   */
  closed: boolean

  /**
   * Identifies the date and time when the object was closed.
   */
  closedAt: any | null

  /**
   * List of columns in the project
   */
  columns: IProjectColumnConnection

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The actor who originally created the project.
   */
  creator: Actor | null

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string

  /**
   * The project's name.
   */
  name: string

  /**
   * The project's number.
   */
  number: number

  /**
   * The project's owner. Currently limited to repositories, organizations, and users.
   */
  owner: ProjectOwner

  /**
   * List of pending cards in this project
   */
  pendingCards: IProjectCardConnection

  /**
   * The HTTP path for this project
   */
  resourcePath: any

  /**
   * Whether the project is open or closed.
   */
  state: ProjectState

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this project
   */
  url: any

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean
}

export interface IColumnsOnProjectArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPendingCardsOnProjectArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * A list of archived states to filter the cards by
   */
  archivedStates?: (ProjectCardArchivedState | null)[] | null
}

/**
 * An object that can be closed
 */
export type Closable = IProject | IIssue | IPullRequest | IMilestone

/**
 * An object that can be closed
 */
export interface IClosable {
  __typename: 'Closable'

  /**
   * `true` if the object is closed (definition of closed may depend on type)
   */
  closed: boolean

  /**
   * Identifies the date and time when the object was closed.
   */
  closedAt: any | null
}

/**
 * Entities that can be updated.
 */
export type Updatable =
  | IProject
  | IIssue
  | IPullRequest
  | IIssueComment
  | ICommitComment
  | IPullRequestReviewComment
  | IPullRequestReview
  | IGistComment

/**
 * Entities that can be updated.
 */
export interface IUpdatable {
  __typename: 'Updatable'

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean
}

/**
 * The connection type for ProjectColumn.
 */
export interface IProjectColumnConnection {
  __typename: 'ProjectColumnConnection'

  /**
   * A list of edges.
   */
  edges: (IProjectColumnEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IProjectColumn | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IProjectColumnEdge {
  __typename: 'ProjectColumnEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IProjectColumn | null
}

/**
 * A column inside a project.
 */
export interface IProjectColumn {
  __typename: 'ProjectColumn'

  /**
   * List of cards in the column
   */
  cards: IProjectCardConnection

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string

  /**
   * The project column's name.
   */
  name: string

  /**
   * The project that contains this column.
   */
  project: IProject

  /**
   * The semantic purpose of the column
   */
  purpose: ProjectColumnPurpose | null

  /**
   * The HTTP path for this project column
   */
  resourcePath: any

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this project column
   */
  url: any
}

export interface ICardsOnProjectColumnArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * A list of archived states to filter the cards by
   */
  archivedStates?: (ProjectCardArchivedState | null)[] | null
}

/**
 * The possible archived states of a project card.
 */
export const enum ProjectCardArchivedState {
  /**
   * A project card that is archived
   */
  ARCHIVED = 'ARCHIVED',

  /**
   * A project card that is not archived
   */
  NOT_ARCHIVED = 'NOT_ARCHIVED'
}

/**
 * The connection type for ProjectCard.
 */
export interface IProjectCardConnection {
  __typename: 'ProjectCardConnection'

  /**
   * A list of edges.
   */
  edges: (IProjectCardEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IProjectCard | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IProjectCardEdge {
  __typename: 'ProjectCardEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IProjectCard | null
}

/**
 * A card in a project.
 */
export interface IProjectCard {
  __typename: 'ProjectCard'

  /**
   * The project column this card is associated under. A card may only belong to one
   * project column at a time. The column field will be null if the card is created
   * in a pending state and has yet to be associated with a column. Once cards are
   * associated with a column, they will not become pending in the future.
   *
   */
  column: IProjectColumn | null

  /**
   * The card content item
   */
  content: ProjectCardItem | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The actor who created this card
   */
  creator: Actor | null

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string

  /**
   * Whether the card is archived
   */
  isArchived: boolean

  /**
   * The card note
   */
  note: string | null

  /**
   * The project that contains this card.
   */
  project: IProject

  /**
   * The HTTP path for this card
   */
  resourcePath: any

  /**
   * The state of ProjectCard
   */
  state: ProjectCardState | null

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this card
   */
  url: any
}

/**
 * Types that can be inside Project Cards.
 */
export type ProjectCardItem = IIssue | IPullRequest

/**
 * An Issue is a place to discuss ideas, enhancements, tasks, and bugs for a project.
 */
export interface IIssue {
  __typename: 'Issue'

  /**
   * Reason that the conversation was locked.
   */
  activeLockReason: LockReason | null

  /**
   * A list of Users assigned to this object.
   */
  assignees: IUserConnection

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the subject of the comment.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * Identifies the body of the issue.
   */
  body: string

  /**
   * Identifies the body of the issue rendered to HTML.
   */
  bodyHTML: any

  /**
   * Identifies the body of the issue rendered to text.
   */
  bodyText: string

  /**
   * `true` if the object is closed (definition of closed may depend on type)
   */
  closed: boolean

  /**
   * Identifies the date and time when the object was closed.
   */
  closedAt: any | null

  /**
   * A list of comments associated with the Issue.
   */
  comments: IIssueCommentConnection

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The actor who edited the comment.
   */
  editor: Actor | null
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * A list of labels associated with the object.
   */
  labels: ILabelConnection | null

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * `true` if the object is locked
   */
  locked: boolean

  /**
   * Identifies the milestone associated with the issue.
   */
  milestone: IMilestone | null

  /**
   * Identifies the issue number.
   */
  number: number

  /**
   * A list of Users that are participating in the Issue conversation.
   */
  participants: IUserConnection

  /**
   * List of project cards associated with this issue.
   */
  projectCards: IProjectCardConnection

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * A list of reactions grouped by content left on the subject.
   */
  reactionGroups: IReactionGroup[] | null

  /**
   * A list of Reactions left on the Issue.
   */
  reactions: IReactionConnection

  /**
   * The repository associated with this node.
   */
  repository: IRepository

  /**
   * The HTTP path for this issue
   */
  resourcePath: any

  /**
   * Identifies the state of the issue.
   */
  state: IssueState

  /**
   * A list of events, comments, commits, etc. associated with the issue.
   */
  timeline: IIssueTimelineConnection

  /**
   * A list of events, comments, commits, etc. associated with the issue.
   */
  timelineItems: IIssueTimelineItemsConnection

  /**
   * Identifies the issue title.
   */
  title: string

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this issue
   */
  url: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Can user react to this subject
   */
  viewerCanReact: boolean

  /**
   * Check if the viewer is able to change their subscription status for the repository.
   */
  viewerCanSubscribe: boolean

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean

  /**
   * Identifies if the viewer is watching, not watching, or ignoring the subscribable entity.
   */
  viewerSubscription: SubscriptionState | null
}

export interface IAssigneesOnIssueArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ICommentsOnIssueArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ILabelsOnIssueArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IParticipantsOnIssueArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IProjectCardsOnIssueArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * A list of archived states to filter the cards by
   */
  archivedStates?: (ProjectCardArchivedState | null)[] | null
}

export interface IReactionsOnIssueArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Allows filtering Reactions by emoji.
   */
  content?: ReactionContent | null

  /**
   * Allows specifying the order in which reactions are returned.
   */
  orderBy?: IReactionOrder | null
}

export interface ITimelineOnIssueArguments {
  /**
   * Allows filtering timeline events by a `since` timestamp.
   */
  since?: any | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ITimelineItemsOnIssueArguments {
  /**
   * Filter timeline items by a `since` timestamp.
   */
  since?: any | null

  /**
   * Skips the first _n_ elements in the list.
   */
  skip?: number | null

  /**
   * Filter timeline items by type.
   */
  itemTypes?: IssueTimelineItemsItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IUserContentEditsOnIssueArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * An object that can have users assigned to it.
 */
export type Assignable = IIssue | IPullRequest

/**
 * An object that can have users assigned to it.
 */
export interface IAssignable {
  __typename: 'Assignable'

  /**
   * A list of Users assigned to this object.
   */
  assignees: IUserConnection
}

export interface IAssigneesOnAssignableArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The connection type for User.
 */
export interface IUserConnection {
  __typename: 'UserConnection'

  /**
   * A list of edges.
   */
  edges: (IUserEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a user.
 */
export interface IUserEdge {
  __typename: 'UserEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IGitHubUser | null
}

/**
 * A user is an individual's account on GitHub that owns repositories and can make new content.
 */
export interface IGitHubUser {
  __typename: 'User'

  /**
   * Determine if this repository owner has any items that can be pinned to their profile.
   */
  anyPinnableItems: boolean

  /**
   * A URL pointing to the user's public avatar.
   */
  avatarUrl: any

  /**
   * The user's public profile bio.
   */
  bio: string | null

  /**
   * The user's public profile bio as HTML.
   */
  bioHTML: any

  /**
   * A list of commit comments made by this user.
   */
  commitComments: ICommitCommentConnection

  /**
   * The user's public profile company.
   */
  company: string | null

  /**
   * The user's public profile company as HTML.
   */
  companyHTML: any

  /**
   * The collection of contributions this user has made to different repositories.
   */
  contributionsCollection: IContributionsCollection

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The user's publicly visible profile email.
   */
  email: string

  /**
   * A list of users the given user is followed by.
   */
  followers: IFollowerConnection

  /**
   * A list of users the given user is following.
   */
  following: IFollowingConnection

  /**
   * Find gist by repo name.
   */
  gist: IGist | null

  /**
   * A list of gist comments made by this user.
   */
  gistComments: IGistCommentConnection

  /**
   * A list of the Gists the user has created.
   */
  gists: IGistConnection
  id: string

  /**
   * Whether or not this user is a participant in the GitHub Security Bug Bounty.
   */
  isBountyHunter: boolean

  /**
   * Whether or not this user is a participant in the GitHub Campus Experts Program.
   */
  isCampusExpert: boolean

  /**
   * Whether or not this user is a GitHub Developer Program member.
   */
  isDeveloperProgramMember: boolean

  /**
   * Whether or not this user is a GitHub employee.
   */
  isEmployee: boolean

  /**
   * Whether or not the user has marked themselves as for hire.
   */
  isHireable: boolean

  /**
   * Whether or not this user is a site administrator.
   */
  isSiteAdmin: boolean

  /**
   * Whether or not this user is the viewing user.
   */
  isViewer: boolean

  /**
   * A list of issue comments made by this user.
   */
  issueComments: IIssueCommentConnection

  /**
   * A list of issues associated with this user.
   */
  issues: IIssueConnection

  /**
   * Showcases a selection of repositories and gists that the profile owner has either curated or that have been selected automatically based on popularity.
   */
  itemShowcase: IProfileItemShowcase

  /**
   * The user's public profile location.
   */
  location: string | null

  /**
   * The username used to login.
   */
  login: string

  /**
   * The user's public profile name.
   */
  name: string | null

  /**
   * Find an organization by its login that the user belongs to.
   */
  organization: IOrganization | null

  /**
   * A list of organizations the user belongs to.
   */
  organizations: IOrganizationConnection

  /**
   * A list of repositories and gists this profile owner can pin to their profile.
   */
  pinnableItems: IPinnableItemConnection

  /**
   * A list of repositories and gists this profile owner has pinned to their profile
   */
  pinnedItems: IPinnableItemConnection

  /**
   * Returns how many more items this profile owner can pin to their profile.
   */
  pinnedItemsRemaining: number

  /**
   * A list of repositories this user has pinned to their profile
   * @deprecated "pinnedRepositories will be removed Use ProfileOwner.pinnedItems instead. Removal on 2019-07-01 UTC."
   */
  pinnedRepositories: IRepositoryConnection

  /**
   * Find project by number.
   */
  project: IProject | null

  /**
   * A list of projects under the owner.
   */
  projects: IProjectConnection

  /**
   * The HTTP path listing user's projects
   */
  projectsResourcePath: any

  /**
   * The HTTP URL listing user's projects
   */
  projectsUrl: any

  /**
   * A list of public keys associated with this user.
   */
  publicKeys: IPublicKeyConnection

  /**
   * A list of pull requests associated with this user.
   */
  pullRequests: IPullRequestConnection

  /**
   * A list of repositories that the user owns.
   */
  repositories: IRepositoryConnection

  /**
   * A list of repositories that the user recently contributed to.
   */
  repositoriesContributedTo: IRepositoryConnection

  /**
   * Find Repository.
   */
  repository: IRepository | null

  /**
   * The HTTP path for this user
   */
  resourcePath: any

  /**
   * Repositories the user has starred.
   */
  starredRepositories: IStarredRepositoryConnection

  /**
   * The user's description of what they're currently doing.
   */
  status: IUserStatus | null

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this user
   */
  url: any

  /**
   * Can the viewer pin repositories and gists to the profile?
   */
  viewerCanChangePinnedItems: boolean

  /**
   * Can the current viewer create new projects on this owner.
   */
  viewerCanCreateProjects: boolean

  /**
   * Whether or not the viewer is able to follow the user.
   */
  viewerCanFollow: boolean

  /**
   * Whether or not this user is followed by the viewer.
   */
  viewerIsFollowing: boolean

  /**
   * A list of repositories the given user is watching.
   */
  watching: IRepositoryConnection

  /**
   * A URL pointing to the user's public website/blog.
   */
  websiteUrl: any | null
}

export interface IAnyPinnableItemsOnUserArguments {
  /**
   * Filter to only a particular kind of pinnable item.
   */
  type?: PinnableItemType | null
}

export interface IAvatarUrlOnUserArguments {
  /**
   * The size of the resulting square image.
   */
  size?: number | null
}

export interface ICommitCommentsOnUserArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IContributionsCollectionOnUserArguments {
  /**
   * The ID of the organization used to filter contributions.
   */
  organizationID?: string | null

  /**
   * Only contributions made at this time or later will be counted. If omitted, defaults to a year ago.
   */
  from?: any | null

  /**
   * Only contributions made before and up to and including this time will be counted. If omitted, defaults to the current time.
   */
  to?: any | null
}

export interface IFollowersOnUserArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IFollowingOnUserArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IGistOnUserArguments {
  /**
   * The gist name to find.
   */
  name: string
}

export interface IGistCommentsOnUserArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IGistsOnUserArguments {
  /**
   * Filters Gists according to privacy.
   */
  privacy?: GistPrivacy | null

  /**
   * Ordering options for gists returned from the connection
   */
  orderBy?: IGistOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IIssueCommentsOnUserArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IIssuesOnUserArguments {
  /**
   * Ordering options for issues returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * A list of states to filter the issues by.
   */
  states?: IssueState[] | null

  /**
   * Filtering options for issues returned from the connection.
   */
  filterBy?: IIssueFilters | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IOrganizationOnUserArguments {
  /**
   * The login of the organization to find.
   */
  login: string
}

export interface IOrganizationsOnUserArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPinnableItemsOnUserArguments {
  /**
   * Filter the types of pinnable items that are returned.
   */
  types?: PinnableItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPinnedItemsOnUserArguments {
  /**
   * Filter the types of pinned items that are returned.
   */
  types?: PinnableItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPinnedRepositoriesOnUserArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Array of viewer's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the current viewer owns.
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IProjectOnUserArguments {
  /**
   * The project number to find.
   */
  number: number
}

export interface IProjectsOnUserArguments {
  /**
   * Ordering options for projects returned from the connection
   */
  orderBy?: IProjectOrder | null

  /**
   * Query to search projects by, currently only searching by name.
   */
  search?: string | null

  /**
   * A list of states to filter the projects by.
   */
  states?: ProjectState[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPublicKeysOnUserArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPullRequestsOnUserArguments {
  /**
   * A list of states to filter the pull requests by.
   */
  states?: PullRequestState[] | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * The head ref name to filter the pull requests by.
   */
  headRefName?: string | null

  /**
   * The base ref name to filter the pull requests by.
   */
  baseRefName?: string | null

  /**
   * Ordering options for pull requests returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IRepositoriesOnUserArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Array of viewer's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the current viewer owns.
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * If non-null, filters repositories according to whether they are forks of another repository
   */
  isFork?: boolean | null
}

export interface IRepositoriesContributedToOnUserArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * If true, include user repositories
   */
  includeUserRepositories?: boolean | null

  /**
   * If non-null, include only the specified types of contributions. The GitHub.com UI uses [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
   */
  contributionTypes?: (RepositoryContributionType | null)[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IRepositoryOnUserArguments {
  /**
   * Name of Repository to find.
   */
  name: string
}

export interface IStarredRepositoriesOnUserArguments {
  /**
   * Filters starred repositories to only return repositories owned by the viewer.
   */
  ownedByViewer?: boolean | null

  /**
   * Order for connection
   */
  orderBy?: IStarOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IWatchingOnUserArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Affiliation options for repositories returned from the connection
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Represents an owner of a Repository.
 */
export type RepositoryOwner = IOrganization | IGitHubUser

/**
 * Represents an owner of a Repository.
 */
export interface IRepositoryOwner {
  __typename: 'RepositoryOwner'

  /**
   * A URL pointing to the owner's public avatar.
   */
  avatarUrl: any
  id: string

  /**
   * The username used to login.
   */
  login: string

  /**
   * A list of repositories this user has pinned to their profile
   * @deprecated "pinnedRepositories will be removed Use ProfileOwner.pinnedItems instead. Removal on 2019-07-01 UTC."
   */
  pinnedRepositories: IRepositoryConnection

  /**
   * A list of repositories that the user owns.
   */
  repositories: IRepositoryConnection

  /**
   * Find Repository.
   */
  repository: IRepository | null

  /**
   * The HTTP URL for the owner.
   */
  resourcePath: any

  /**
   * The HTTP URL for the owner.
   */
  url: any
}

export interface IAvatarUrlOnRepositoryOwnerArguments {
  /**
   * The size of the resulting square image.
   */
  size?: number | null
}

export interface IPinnedRepositoriesOnRepositoryOwnerArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Array of viewer's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the current viewer owns.
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IRepositoriesOnRepositoryOwnerArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Array of viewer's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the current viewer owns.
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * If non-null, filters repositories according to whether they are forks of another repository
   */
  isFork?: boolean | null
}

export interface IRepositoryOnRepositoryOwnerArguments {
  /**
   * Name of Repository to find.
   */
  name: string
}

/**
 * The privacy of a repository
 */
export const enum RepositoryPrivacy {
  /**
   * Public
   */
  PUBLIC = 'PUBLIC',

  /**
   * Private
   */
  PRIVATE = 'PRIVATE'
}

/**
 * Ordering options for repository connections
 */
export interface IRepositoryOrder {
  /**
   * The field to order repositories by.
   */
  field: RepositoryOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which repository connections can be ordered.
 */
export const enum RepositoryOrderField {
  /**
   * Order repositories by creation time
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order repositories by update time
   */
  UPDATED_AT = 'UPDATED_AT',

  /**
   * Order repositories by push time
   */
  PUSHED_AT = 'PUSHED_AT',

  /**
   * Order repositories by name
   */
  NAME = 'NAME',

  /**
   * Order repositories by number of stargazers
   */
  STARGAZERS = 'STARGAZERS'
}

/**
 * Possible directions in which to order a list of items when provided an `orderBy` argument.
 */
export const enum OrderDirection {
  /**
   * Specifies an ascending order for a given `orderBy` argument.
   */
  ASC = 'ASC',

  /**
   * Specifies a descending order for a given `orderBy` argument.
   */
  DESC = 'DESC'
}

/**
 * The affiliation of a user to a repository
 */
export const enum RepositoryAffiliation {
  /**
   * Repositories that are owned by the authenticated user.
   */
  OWNER = 'OWNER',

  /**
   * Repositories that the user has been added to as a collaborator.
   */
  COLLABORATOR = 'COLLABORATOR',

  /**
   * Repositories that the user has access to through being a member of an organization. This includes every repository on every team that the user is on.
   */
  ORGANIZATION_MEMBER = 'ORGANIZATION_MEMBER'
}

/**
 * A list of repositories owned by the subject.
 */
export interface IRepositoryConnection {
  __typename: 'RepositoryConnection'

  /**
   * A list of edges.
   */
  edges: (IRepositoryEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IRepository | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number

  /**
   * The total size in kilobytes of all repositories in the connection.
   */
  totalDiskUsage: number
}

/**
 * An edge in a connection.
 */
export interface IRepositoryEdge {
  __typename: 'RepositoryEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IRepository | null
}

/**
 * A repository contains the content for a project.
 */
export interface IRepository {
  __typename: 'Repository'

  /**
   * A list of users that can be assigned to issues in this repository.
   */
  assignableUsers: IUserConnection

  /**
   * A list of branch protection rules for this repository.
   */
  branchProtectionRules: IBranchProtectionRuleConnection

  /**
   * Returns the code of conduct for this repository
   */
  codeOfConduct: ICodeOfConduct | null

  /**
   * A list of collaborators associated with the repository.
   */
  collaborators: IRepositoryCollaboratorConnection | null

  /**
   * A list of commit comments associated with the repository.
   */
  commitComments: ICommitCommentConnection

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The Ref associated with the repository's default branch.
   */
  defaultBranchRef: IRef | null

  /**
   * A list of deploy keys that are on this repository.
   */
  deployKeys: IDeployKeyConnection

  /**
   * Deployments associated with the repository
   */
  deployments: IDeploymentConnection

  /**
   * The description of the repository.
   */
  description: string | null

  /**
   * The description of the repository rendered to HTML.
   */
  descriptionHTML: any

  /**
   * The number of kilobytes this repository occupies on disk.
   */
  diskUsage: number | null

  /**
   * Returns how many forks there are of this repository in the whole network.
   */
  forkCount: number

  /**
   * A list of direct forked repositories.
   */
  forks: IRepositoryConnection

  /**
   * Indicates if the repository has issues feature enabled.
   */
  hasIssuesEnabled: boolean

  /**
   * Indicates if the repository has wiki feature enabled.
   */
  hasWikiEnabled: boolean

  /**
   * The repository's URL.
   */
  homepageUrl: any | null
  id: string

  /**
   * Indicates if the repository is unmaintained.
   */
  isArchived: boolean

  /**
   * Returns whether or not this repository disabled.
   */
  isDisabled: boolean

  /**
   * Identifies if the repository is a fork.
   */
  isFork: boolean

  /**
   * Indicates if the repository has been locked or not.
   */
  isLocked: boolean

  /**
   * Identifies if the repository is a mirror.
   */
  isMirror: boolean

  /**
   * Identifies if the repository is private.
   */
  isPrivate: boolean

  /**
   * Returns a single issue from the current repository by number.
   */
  issue: IIssue | null

  /**
   * Returns a single issue-like object from the current repository by number.
   */
  issueOrPullRequest: IssueOrPullRequest | null

  /**
   * A list of issues that have been opened in the repository.
   */
  issues: IIssueConnection

  /**
   * Returns a single label by name
   */
  label: ILabel | null

  /**
   * A list of labels associated with the repository.
   */
  labels: ILabelConnection | null

  /**
   * A list containing a breakdown of the language composition of the repository.
   */
  languages: ILanguageConnection | null

  /**
   * The license associated with the repository
   */
  licenseInfo: ILicense | null

  /**
   * The reason the repository has been locked.
   */
  lockReason: RepositoryLockReason | null

  /**
   * A list of Users that can be mentioned in the context of the repository.
   */
  mentionableUsers: IUserConnection

  /**
   * Whether or not PRs are merged with a merge commit on this repository.
   */
  mergeCommitAllowed: boolean

  /**
   * Returns a single milestone from the current repository by number.
   */
  milestone: IMilestone | null

  /**
   * A list of milestones associated with the repository.
   */
  milestones: IMilestoneConnection | null

  /**
   * The repository's original mirror URL.
   */
  mirrorUrl: any | null

  /**
   * The name of the repository.
   */
  name: string

  /**
   * The repository's name with owner.
   */
  nameWithOwner: string

  /**
   * A Git object in the repository
   */
  object: GitObject | null

  /**
   * The User owner of the repository.
   */
  owner: RepositoryOwner

  /**
   * The repository parent, if this is a fork.
   */
  parent: IRepository | null

  /**
   * The primary language of the repository's code.
   */
  primaryLanguage: ILanguage | null

  /**
   * Find project by number.
   */
  project: IProject | null

  /**
   * A list of projects under the owner.
   */
  projects: IProjectConnection

  /**
   * The HTTP path listing the repository's projects
   */
  projectsResourcePath: any

  /**
   * The HTTP URL listing the repository's projects
   */
  projectsUrl: any

  /**
   * Returns a single pull request from the current repository by number.
   */
  pullRequest: IPullRequest | null

  /**
   * A list of pull requests that have been opened in the repository.
   */
  pullRequests: IPullRequestConnection

  /**
   * Identifies when the repository was last pushed to.
   */
  pushedAt: any | null

  /**
   * Whether or not rebase-merging is enabled on this repository.
   */
  rebaseMergeAllowed: boolean

  /**
   * Fetch a given ref from the repository
   */
  ref: IRef | null

  /**
   * Fetch a list of refs from the repository
   */
  refs: IRefConnection | null

  /**
   * Lookup a single release given various criteria.
   */
  release: IRelease | null

  /**
   * List of releases which are dependent on this repository.
   */
  releases: IReleaseConnection

  /**
   * A list of applied repository-topic associations for this repository.
   */
  repositoryTopics: IRepositoryTopicConnection

  /**
   * The HTTP path for this repository
   */
  resourcePath: any

  /**
   * A description of the repository, rendered to HTML without any links in it.
   */
  shortDescriptionHTML: any

  /**
   * Whether or not squash-merging is enabled on this repository.
   */
  squashMergeAllowed: boolean

  /**
   * The SSH URL to clone this repository
   */
  sshUrl: any

  /**
   * A list of users who have starred this starrable.
   */
  stargazers: IStargazerConnection

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this repository
   */
  url: any

  /**
   * Indicates whether the viewer has admin permissions on this repository.
   */
  viewerCanAdminister: boolean

  /**
   * Can the current viewer create new projects on this owner.
   */
  viewerCanCreateProjects: boolean

  /**
   * Check if the viewer is able to change their subscription status for the repository.
   */
  viewerCanSubscribe: boolean

  /**
   * Indicates whether the viewer can update the topics of this repository.
   */
  viewerCanUpdateTopics: boolean

  /**
   * Returns a boolean indicating whether the viewing user has starred this starrable.
   */
  viewerHasStarred: boolean

  /**
   * The users permission level on the repository. Will return null if authenticated as an GitHub App.
   */
  viewerPermission: RepositoryPermission | null

  /**
   * Identifies if the viewer is watching, not watching, or ignoring the subscribable entity.
   */
  viewerSubscription: SubscriptionState | null

  /**
   * A list of users watching the repository.
   */
  watchers: IUserConnection
}

export interface IAssignableUsersOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IBranchProtectionRulesOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ICollaboratorsOnRepositoryArguments {
  /**
   * Collaborators affiliation level with a repository.
   */
  affiliation?: CollaboratorAffiliation | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ICommitCommentsOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IDeployKeysOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IDeploymentsOnRepositoryArguments {
  /**
   * Environments to list deployments for
   */
  environments?: string[] | null

  /**
   * Ordering options for deployments returned from the connection.
   */
  orderBy?: IDeploymentOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IForksOnRepositoryArguments {
  /**
   * If non-null, filters repositories according to privacy
   */
  privacy?: RepositoryPrivacy | null

  /**
   * Ordering options for repositories returned from the connection
   */
  orderBy?: IRepositoryOrder | null

  /**
   * Array of viewer's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the current viewer owns.
   */
  affiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * Array of owner's affiliation options for repositories returned from the connection. For example, OWNER will include only repositories that the organization or user being viewed owns.
   */
  ownerAffiliations?: (RepositoryAffiliation | null)[] | null

  /**
   * If non-null, filters repositories according to whether they have been locked
   */
  isLocked?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IIssueOnRepositoryArguments {
  /**
   * The number for the issue to be returned.
   */
  number: number
}

export interface IIssueOrPullRequestOnRepositoryArguments {
  /**
   * The number for the issue to be returned.
   */
  number: number
}

export interface IIssuesOnRepositoryArguments {
  /**
   * Ordering options for issues returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * A list of states to filter the issues by.
   */
  states?: IssueState[] | null

  /**
   * Filtering options for issues returned from the connection.
   */
  filterBy?: IIssueFilters | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ILabelOnRepositoryArguments {
  /**
   * Label name
   */
  name: string
}

export interface ILabelsOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * If provided, searches labels by name and description.
   */
  query?: string | null
}

export interface ILanguagesOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Order for connection
   */
  orderBy?: ILanguageOrder | null
}

export interface IMentionableUsersOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IMilestoneOnRepositoryArguments {
  /**
   * The number for the milestone to be returned.
   */
  number: number
}

export interface IMilestonesOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Filter by the state of the milestones.
   */
  states?: MilestoneState[] | null

  /**
   * Ordering options for milestones.
   */
  orderBy?: IMilestoneOrder | null
}

export interface IObjectOnRepositoryArguments {
  /**
   * The Git object ID
   */
  oid?: any | null

  /**
   * A Git revision expression suitable for rev-parse
   */
  expression?: string | null
}

export interface IProjectOnRepositoryArguments {
  /**
   * The project number to find.
   */
  number: number
}

export interface IProjectsOnRepositoryArguments {
  /**
   * Ordering options for projects returned from the connection
   */
  orderBy?: IProjectOrder | null

  /**
   * Query to search projects by, currently only searching by name.
   */
  search?: string | null

  /**
   * A list of states to filter the projects by.
   */
  states?: ProjectState[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPullRequestOnRepositoryArguments {
  /**
   * The number for the pull request to be returned.
   */
  number: number
}

export interface IPullRequestsOnRepositoryArguments {
  /**
   * A list of states to filter the pull requests by.
   */
  states?: PullRequestState[] | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * The head ref name to filter the pull requests by.
   */
  headRefName?: string | null

  /**
   * The base ref name to filter the pull requests by.
   */
  baseRefName?: string | null

  /**
   * Ordering options for pull requests returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IRefOnRepositoryArguments {
  /**
   * The ref to retrieve. Fully qualified matches are checked in order (`refs/heads/master`) before falling back onto checks for short name matches (`master`).
   */
  qualifiedName: string
}

export interface IRefsOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * A ref name prefix like `refs/heads/`, `refs/tags/`, etc.
   */
  refPrefix: string

  /**
   * DEPRECATED: use orderBy. The ordering direction.
   */
  direction?: OrderDirection | null

  /**
   * Ordering options for refs returned from the connection.
   */
  orderBy?: IRefOrder | null
}

export interface IReleaseOnRepositoryArguments {
  /**
   * The name of the Tag the Release was created from
   */
  tagName: string
}

export interface IReleasesOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Order for connection
   */
  orderBy?: IReleaseOrder | null
}

export interface IRepositoryTopicsOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IShortDescriptionHTMLOnRepositoryArguments {
  /**
   * How many characters to return.
   * @default 200
   */
  limit?: number | null
}

export interface IStargazersOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Order for connection
   */
  orderBy?: IStarOrder | null
}

export interface IWatchersOnRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Entities that can be subscribed to for web and email notifications.
 */
export type Subscribable = IIssue | IRepository | IPullRequest | ICommit | ITeam

/**
 * Entities that can be subscribed to for web and email notifications.
 */
export interface ISubscribable {
  __typename: 'Subscribable'
  id: string

  /**
   * Check if the viewer is able to change their subscription status for the repository.
   */
  viewerCanSubscribe: boolean

  /**
   * Identifies if the viewer is watching, not watching, or ignoring the subscribable entity.
   */
  viewerSubscription: SubscriptionState | null
}

/**
 * The possible states of a subscription.
 */
export const enum SubscriptionState {
  /**
   * The User is only notified when participating or @mentioned.
   */
  UNSUBSCRIBED = 'UNSUBSCRIBED',

  /**
   * The User is notified of all conversations.
   */
  SUBSCRIBED = 'SUBSCRIBED',

  /**
   * The User is never notified.
   */
  IGNORED = 'IGNORED'
}

/**
 * Things that can be starred.
 */
export type Starrable = IRepository | ITopic | IGist

/**
 * Things that can be starred.
 */
export interface IStarrable {
  __typename: 'Starrable'
  id: string

  /**
   * A list of users who have starred this starrable.
   */
  stargazers: IStargazerConnection

  /**
   * Returns a boolean indicating whether the viewing user has starred this starrable.
   */
  viewerHasStarred: boolean
}

export interface IStargazersOnStarrableArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Order for connection
   */
  orderBy?: IStarOrder | null
}

/**
 * Ways in which star connections can be ordered.
 */
export interface IStarOrder {
  /**
   * The field in which to order nodes by.
   */
  field: StarOrderField

  /**
   * The direction in which to order nodes.
   */
  direction: OrderDirection
}

/**
 * Properties by which star connections can be ordered.
 */
export const enum StarOrderField {
  /**
   * Allows ordering a list of stars by when they were created.
   */
  STARRED_AT = 'STARRED_AT'
}

/**
 * The connection type for User.
 */
export interface IStargazerConnection {
  __typename: 'StargazerConnection'

  /**
   * A list of edges.
   */
  edges: (IStargazerEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a user that's starred a repository.
 */
export interface IStargazerEdge {
  __typename: 'StargazerEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string
  node: IGitHubUser

  /**
   * Identifies when the item was starred.
   */
  starredAt: any
}

/**
 * Represents a type that can be retrieved by a URL.
 */
export type UniformResourceLocatable =
  | IOrganization
  | IIssue
  | IGitHubUser
  | IRepository
  | IPullRequest
  | IPullRequestCommit
  | ICommit
  | IMilestone
  | IClosedEvent
  | IMergedEvent
  | ICrossReferencedEvent
  | IReviewDismissedEvent
  | IRelease
  | IRepositoryTopic
  | IBot

/**
 * Represents a type that can be retrieved by a URL.
 */
export interface IUniformResourceLocatable {
  __typename: 'UniformResourceLocatable'

  /**
   * The HTML path to this resource.
   */
  resourcePath: any

  /**
   * The URL to this resource.
   */
  url: any
}

/**
 * A subset of repository info.
 */
export type RepositoryInfo = IRepository

/**
 * A subset of repository info.
 */
export interface IRepositoryInfo {
  __typename: 'RepositoryInfo'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The description of the repository.
   */
  description: string | null

  /**
   * The description of the repository rendered to HTML.
   */
  descriptionHTML: any

  /**
   * Returns how many forks there are of this repository in the whole network.
   */
  forkCount: number

  /**
   * Indicates if the repository has issues feature enabled.
   */
  hasIssuesEnabled: boolean

  /**
   * Indicates if the repository has wiki feature enabled.
   */
  hasWikiEnabled: boolean

  /**
   * The repository's URL.
   */
  homepageUrl: any | null

  /**
   * Indicates if the repository is unmaintained.
   */
  isArchived: boolean

  /**
   * Identifies if the repository is a fork.
   */
  isFork: boolean

  /**
   * Indicates if the repository has been locked or not.
   */
  isLocked: boolean

  /**
   * Identifies if the repository is a mirror.
   */
  isMirror: boolean

  /**
   * Identifies if the repository is private.
   */
  isPrivate: boolean

  /**
   * The license associated with the repository
   */
  licenseInfo: ILicense | null

  /**
   * The reason the repository has been locked.
   */
  lockReason: RepositoryLockReason | null

  /**
   * The repository's original mirror URL.
   */
  mirrorUrl: any | null

  /**
   * The name of the repository.
   */
  name: string

  /**
   * The repository's name with owner.
   */
  nameWithOwner: string

  /**
   * The User owner of the repository.
   */
  owner: RepositoryOwner

  /**
   * Identifies when the repository was last pushed to.
   */
  pushedAt: any | null

  /**
   * The HTTP path for this repository
   */
  resourcePath: any

  /**
   * A description of the repository, rendered to HTML without any links in it.
   */
  shortDescriptionHTML: any

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this repository
   */
  url: any
}

export interface IShortDescriptionHTMLOnRepositoryInfoArguments {
  /**
   * How many characters to return.
   * @default 200
   */
  limit?: number | null
}

/**
 * The possible reasons a given repository could be in a locked state.
 */
export const enum RepositoryLockReason {
  /**
   * The repository is locked due to a move.
   */
  MOVING = 'MOVING',

  /**
   * The repository is locked due to a billing related reason.
   */
  BILLING = 'BILLING',

  /**
   * The repository is locked due to a rename.
   */
  RENAME = 'RENAME',

  /**
   * The repository is locked due to a migration.
   */
  MIGRATING = 'MIGRATING'
}

/**
 * The connection type for BranchProtectionRule.
 */
export interface IBranchProtectionRuleConnection {
  __typename: 'BranchProtectionRuleConnection'

  /**
   * A list of edges.
   */
  edges: (IBranchProtectionRuleEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IBranchProtectionRule | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IBranchProtectionRuleEdge {
  __typename: 'BranchProtectionRuleEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IBranchProtectionRule | null
}

/**
 * A branch protection rule.
 */
export interface IBranchProtectionRule {
  __typename: 'BranchProtectionRule'

  /**
   * A list of conflicts matching branches protection rule and other branch protection rules
   */
  branchProtectionRuleConflicts: IBranchProtectionRuleConflictConnection

  /**
   * The actor who created this branch protection rule.
   */
  creator: Actor | null

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * Will new commits pushed to matching branches dismiss pull request review approvals.
   */
  dismissesStaleReviews: boolean
  id: string

  /**
   * Can admins overwrite branch protection.
   */
  isAdminEnforced: boolean

  /**
   * Repository refs that are protected by this rule
   */
  matchingRefs: IRefConnection

  /**
   * Identifies the protection rule pattern.
   */
  pattern: string

  /**
   * A list push allowances for this branch protection rule.
   */
  pushAllowances: IPushAllowanceConnection

  /**
   * The repository associated with this branch protection rule.
   */
  repository: IRepository | null

  /**
   * Number of approving reviews required to update matching branches.
   */
  requiredApprovingReviewCount: number | null

  /**
   * List of required status check contexts that must pass for commits to be accepted to matching branches.
   */
  requiredStatusCheckContexts: (string | null)[] | null

  /**
   * Are approving reviews required to update matching branches.
   */
  requiresApprovingReviews: boolean

  /**
   * Are commits required to be signed.
   */
  requiresCommitSignatures: boolean

  /**
   * Are status checks required to update matching branches.
   */
  requiresStatusChecks: boolean

  /**
   * Are branches required to be up to date before merging.
   */
  requiresStrictStatusChecks: boolean

  /**
   * Is pushing to matching branches restricted.
   */
  restrictsPushes: boolean

  /**
   * Is dismissal of pull request reviews restricted.
   */
  restrictsReviewDismissals: boolean

  /**
   * A list review dismissal allowances for this branch protection rule.
   */
  reviewDismissalAllowances: IReviewDismissalAllowanceConnection
}

export interface IBranchProtectionRuleConflictsOnBranchProtectionRuleArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IMatchingRefsOnBranchProtectionRuleArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPushAllowancesOnBranchProtectionRuleArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IReviewDismissalAllowancesOnBranchProtectionRuleArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The connection type for BranchProtectionRuleConflict.
 */
export interface IBranchProtectionRuleConflictConnection {
  __typename: 'BranchProtectionRuleConflictConnection'

  /**
   * A list of edges.
   */
  edges: (IBranchProtectionRuleConflictEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IBranchProtectionRuleConflict | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IBranchProtectionRuleConflictEdge {
  __typename: 'BranchProtectionRuleConflictEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IBranchProtectionRuleConflict | null
}

/**
 * A conflict between two branch protection rules.
 */
export interface IBranchProtectionRuleConflict {
  __typename: 'BranchProtectionRuleConflict'

  /**
   * Identifies the branch protection rule.
   */
  branchProtectionRule: IBranchProtectionRule | null

  /**
   * Identifies the conflicting branch protection rule.
   */
  conflictingBranchProtectionRule: IBranchProtectionRule | null

  /**
   * Identifies the branch ref that has conflicting rules
   */
  ref: IRef | null
}

/**
 * Represents a Git reference.
 */
export interface IRef {
  __typename: 'Ref'

  /**
   * A list of pull requests with this ref as the head ref.
   */
  associatedPullRequests: IPullRequestConnection
  id: string

  /**
   * The ref name.
   */
  name: string

  /**
   * The ref's prefix, such as `refs/heads/` or `refs/tags/`.
   */
  prefix: string

  /**
   * The repository the ref belongs to.
   */
  repository: IRepository

  /**
   * The object the ref points to.
   */
  target: GitObject
}

export interface IAssociatedPullRequestsOnRefArguments {
  /**
   * A list of states to filter the pull requests by.
   */
  states?: PullRequestState[] | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * The head ref name to filter the pull requests by.
   */
  headRefName?: string | null

  /**
   * The base ref name to filter the pull requests by.
   */
  baseRefName?: string | null

  /**
   * Ordering options for pull requests returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The possible states of a pull request.
 */
export const enum PullRequestState {
  /**
   * A pull request that is still open.
   */
  OPEN = 'OPEN',

  /**
   * A pull request that has been closed without being merged.
   */
  CLOSED = 'CLOSED',

  /**
   * A pull request that has been closed by being merged.
   */
  MERGED = 'MERGED'
}

/**
 * Ways in which lists of issues can be ordered upon return.
 */
export interface IIssueOrder {
  /**
   * The field in which to order issues by.
   */
  field: IssueOrderField

  /**
   * The direction in which to order issues by the specified field.
   */
  direction: OrderDirection
}

/**
 * Properties by which issue connections can be ordered.
 */
export const enum IssueOrderField {
  /**
   * Order issues by creation time
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order issues by update time
   */
  UPDATED_AT = 'UPDATED_AT',

  /**
   * Order issues by comment count
   */
  COMMENTS = 'COMMENTS'
}

/**
 * The connection type for PullRequest.
 */
export interface IPullRequestConnection {
  __typename: 'PullRequestConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPullRequest | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPullRequestEdge {
  __typename: 'PullRequestEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPullRequest | null
}

/**
 * A repository pull request.
 */
export interface IPullRequest {
  __typename: 'PullRequest'

  /**
   * Reason that the conversation was locked.
   */
  activeLockReason: LockReason | null

  /**
   * The number of additions in this pull request.
   */
  additions: number

  /**
   * A list of Users assigned to this object.
   */
  assignees: IUserConnection

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the subject of the comment.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * Identifies the base Ref associated with the pull request.
   */
  baseRef: IRef | null

  /**
   * Identifies the name of the base Ref associated with the pull request, even if the ref has been deleted.
   */
  baseRefName: string

  /**
   * Identifies the oid of the base ref associated with the pull request, even if the ref has been deleted.
   */
  baseRefOid: any

  /**
   * The repository associated with this pull request's base Ref.
   */
  baseRepository: IRepository | null

  /**
   * The body as Markdown.
   */
  body: string

  /**
   * The body rendered to HTML.
   */
  bodyHTML: any

  /**
   * The body rendered to text.
   */
  bodyText: string

  /**
   * The number of changed files in this pull request.
   */
  changedFiles: number

  /**
   * `true` if the pull request is closed
   */
  closed: boolean

  /**
   * Identifies the date and time when the object was closed.
   */
  closedAt: any | null

  /**
   * A list of comments associated with the pull request.
   */
  comments: IIssueCommentConnection

  /**
   * A list of commits present in this pull request's head branch not present in the base branch.
   */
  commits: IPullRequestCommitConnection

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The number of deletions in this pull request.
   */
  deletions: number

  /**
   * The actor who edited this pull request's body.
   */
  editor: Actor | null

  /**
   * Lists the files changed within this pull request.
   */
  files: IPullRequestChangedFileConnection | null

  /**
   * Identifies the head Ref associated with the pull request.
   */
  headRef: IRef | null

  /**
   * Identifies the name of the head Ref associated with the pull request, even if the ref has been deleted.
   */
  headRefName: string

  /**
   * Identifies the oid of the head ref associated with the pull request, even if the ref has been deleted.
   */
  headRefOid: any

  /**
   * The repository associated with this pull request's head Ref.
   */
  headRepository: IRepository | null

  /**
   * The owner of the repository associated with this pull request's head Ref.
   */
  headRepositoryOwner: RepositoryOwner | null
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * The head and base repositories are different.
   */
  isCrossRepository: boolean

  /**
   * A list of labels associated with the object.
   */
  labels: ILabelConnection | null

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * `true` if the pull request is locked
   */
  locked: boolean

  /**
   * Indicates whether maintainers can modify the pull request.
   */
  maintainerCanModify: boolean

  /**
   * The commit that was created when this pull request was merged.
   */
  mergeCommit: ICommit | null

  /**
   * Whether or not the pull request can be merged based on the existence of merge conflicts.
   */
  mergeable: MergeableState

  /**
   * Whether or not the pull request was merged.
   */
  merged: boolean

  /**
   * The date and time that the pull request was merged.
   */
  mergedAt: any | null

  /**
   * The actor who merged the pull request.
   */
  mergedBy: Actor | null

  /**
   * Identifies the milestone associated with the pull request.
   */
  milestone: IMilestone | null

  /**
   * Identifies the pull request number.
   */
  number: number

  /**
   * A list of Users that are participating in the Pull Request conversation.
   */
  participants: IUserConnection

  /**
   * The permalink to the pull request.
   */
  permalink: any

  /**
   * The commit that GitHub automatically generated to test if this pull request could be merged. This field will not return a value if the pull request is merged, or if the test merge commit is still being generated. See the `mergeable` field for more details on the mergeability of the pull request.
   */
  potentialMergeCommit: ICommit | null

  /**
   * List of project cards associated with this pull request.
   */
  projectCards: IProjectCardConnection

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * A list of reactions grouped by content left on the subject.
   */
  reactionGroups: IReactionGroup[] | null

  /**
   * A list of Reactions left on the Issue.
   */
  reactions: IReactionConnection

  /**
   * The repository associated with this node.
   */
  repository: IRepository

  /**
   * The HTTP path for this pull request.
   */
  resourcePath: any

  /**
   * The HTTP path for reverting this pull request.
   */
  revertResourcePath: any

  /**
   * The HTTP URL for reverting this pull request.
   */
  revertUrl: any

  /**
   * A list of review requests associated with the pull request.
   */
  reviewRequests: IReviewRequestConnection | null

  /**
   * The list of all review threads for this pull request.
   */
  reviewThreads: IPullRequestReviewThreadConnection

  /**
   * A list of reviews associated with the pull request.
   */
  reviews: IPullRequestReviewConnection | null

  /**
   * Identifies the state of the pull request.
   */
  state: PullRequestState

  /**
   * A list of reviewer suggestions based on commit history and past review comments.
   */
  suggestedReviewers: (ISuggestedReviewer | null)[]

  /**
   * A list of events, comments, commits, etc. associated with the pull request.
   */
  timeline: IPullRequestTimelineConnection

  /**
   * A list of events, comments, commits, etc. associated with the pull request.
   */
  timelineItems: IPullRequestTimelineItemsConnection

  /**
   * Identifies the pull request title.
   */
  title: string

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this pull request.
   */
  url: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Whether or not the viewer can apply suggestion.
   */
  viewerCanApplySuggestion: boolean

  /**
   * Can user react to this subject
   */
  viewerCanReact: boolean

  /**
   * Check if the viewer is able to change their subscription status for the repository.
   */
  viewerCanSubscribe: boolean

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean

  /**
   * Identifies if the viewer is watching, not watching, or ignoring the subscribable entity.
   */
  viewerSubscription: SubscriptionState | null
}

export interface IAssigneesOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ICommentsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ICommitsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IFilesOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ILabelsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IParticipantsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IProjectCardsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * A list of archived states to filter the cards by
   */
  archivedStates?: (ProjectCardArchivedState | null)[] | null
}

export interface IReactionsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Allows filtering Reactions by emoji.
   */
  content?: ReactionContent | null

  /**
   * Allows specifying the order in which reactions are returned.
   */
  orderBy?: IReactionOrder | null
}

export interface IReviewRequestsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IReviewThreadsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IReviewsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * A list of states to filter the reviews.
   */
  states?: PullRequestReviewState[] | null

  /**
   * Filter by author of the review.
   */
  author?: string | null
}

export interface ITimelineOnPullRequestArguments {
  /**
   * Allows filtering timeline events by a `since` timestamp.
   */
  since?: any | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface ITimelineItemsOnPullRequestArguments {
  /**
   * Filter timeline items by a `since` timestamp.
   */
  since?: any | null

  /**
   * Skips the first _n_ elements in the list.
   */
  skip?: number | null

  /**
   * Filter timeline items by type.
   */
  itemTypes?: PullRequestTimelineItemsItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IUserContentEditsOnPullRequestArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Represents a comment.
 */
export type Comment =
  | IIssue
  | IPullRequest
  | IIssueComment
  | ICommitComment
  | IPullRequestReviewComment
  | IPullRequestReview
  | IGistComment

/**
 * Represents a comment.
 */
export interface IComment {
  __typename: 'Comment'

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the subject of the comment.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * The body as Markdown.
   */
  body: string

  /**
   * The body rendered to HTML.
   */
  bodyHTML: any

  /**
   * The body rendered to text.
   */
  bodyText: string

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * The actor who edited the comment.
   */
  editor: Actor | null
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean
}

export interface IUserContentEditsOnCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * A comment author association with repository.
 */
export const enum CommentAuthorAssociation {
  /**
   * Author is a member of the organization that owns the repository.
   */
  MEMBER = 'MEMBER',

  /**
   * Author is the owner of the repository.
   */
  OWNER = 'OWNER',

  /**
   * Author has been invited to collaborate on the repository.
   */
  COLLABORATOR = 'COLLABORATOR',

  /**
   * Author has previously committed to the repository.
   */
  CONTRIBUTOR = 'CONTRIBUTOR',

  /**
   * Author has not previously committed to the repository.
   */
  FIRST_TIME_CONTRIBUTOR = 'FIRST_TIME_CONTRIBUTOR',

  /**
   * Author has not previously committed to GitHub.
   */
  FIRST_TIMER = 'FIRST_TIMER',

  /**
   * Author has no association with the repository.
   */
  NONE = 'NONE'
}

/**
 * A list of edits to content.
 */
export interface IUserContentEditConnection {
  __typename: 'UserContentEditConnection'

  /**
   * A list of edges.
   */
  edges: (IUserContentEditEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IUserContentEdit | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IUserContentEditEdge {
  __typename: 'UserContentEditEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IUserContentEdit | null
}

/**
 * An edit on user content
 */
export interface IUserContentEdit {
  __typename: 'UserContentEdit'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the date and time when the object was deleted.
   */
  deletedAt: any | null

  /**
   * The actor who deleted this content
   */
  deletedBy: Actor | null

  /**
   * A summary of the changes for this edit
   */
  diff: string | null

  /**
   * When this content was edited
   */
  editedAt: any

  /**
   * The actor who edited this content
   */
  editor: Actor | null
  id: string

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any
}

/**
 * Comments that can be updated.
 */
export type UpdatableComment =
  | IIssue
  | IPullRequest
  | IIssueComment
  | ICommitComment
  | IPullRequestReviewComment
  | IPullRequestReview
  | IGistComment

/**
 * Comments that can be updated.
 */
export interface IUpdatableComment {
  __typename: 'UpdatableComment'

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]
}

/**
 * The possible errors that will prevent a user from updating a comment.
 */
export const enum CommentCannotUpdateReason {
  /**
   * You must be the author or have write access to this repository to update this comment.
   */
  INSUFFICIENT_ACCESS = 'INSUFFICIENT_ACCESS',

  /**
   * Unable to create comment because issue is locked.
   */
  LOCKED = 'LOCKED',

  /**
   * You must be logged in to update this comment.
   */
  LOGIN_REQUIRED = 'LOGIN_REQUIRED',

  /**
   * Repository is under maintenance.
   */
  MAINTENANCE = 'MAINTENANCE',

  /**
   * At least one email address must be verified to update this comment.
   */
  VERIFIED_EMAIL_REQUIRED = 'VERIFIED_EMAIL_REQUIRED',

  /**
   * You cannot update this comment
   */
  DENIED = 'DENIED'
}

/**
 * An object that can have labels assigned to it.
 */
export type Labelable = IIssue | IPullRequest

/**
 * An object that can have labels assigned to it.
 */
export interface ILabelable {
  __typename: 'Labelable'

  /**
   * A list of labels associated with the object.
   */
  labels: ILabelConnection | null
}

export interface ILabelsOnLabelableArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The connection type for Label.
 */
export interface ILabelConnection {
  __typename: 'LabelConnection'

  /**
   * A list of edges.
   */
  edges: (ILabelEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ILabel | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ILabelEdge {
  __typename: 'LabelEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ILabel | null
}

/**
 * A label for categorizing Issues or Milestones with a given Repository.
 */
export interface ILabel {
  __typename: 'Label'

  /**
   * Identifies the label color.
   */
  color: string

  /**
   * Identifies the date and time when the label was created.
   */
  createdAt: any | null

  /**
   * A brief description of this label.
   */
  description: string | null
  id: string

  /**
   * Indicates whether or not this is a default label.
   */
  isDefault: boolean

  /**
   * A list of issues associated with this label.
   */
  issues: IIssueConnection

  /**
   * Identifies the label name.
   */
  name: string

  /**
   * A list of pull requests associated with this label.
   */
  pullRequests: IPullRequestConnection

  /**
   * The repository associated with this label.
   */
  repository: IRepository

  /**
   * The HTTP path for this label.
   */
  resourcePath: any

  /**
   * Identifies the date and time when the label was last updated.
   */
  updatedAt: any | null

  /**
   * The HTTP URL for this label.
   */
  url: any
}

export interface IIssuesOnLabelArguments {
  /**
   * Ordering options for issues returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * A list of states to filter the issues by.
   */
  states?: IssueState[] | null

  /**
   * Filtering options for issues returned from the connection.
   */
  filterBy?: IIssueFilters | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPullRequestsOnLabelArguments {
  /**
   * A list of states to filter the pull requests by.
   */
  states?: PullRequestState[] | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * The head ref name to filter the pull requests by.
   */
  headRefName?: string | null

  /**
   * The base ref name to filter the pull requests by.
   */
  baseRefName?: string | null

  /**
   * Ordering options for pull requests returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The possible states of an issue.
 */
export const enum IssueState {
  /**
   * An issue that is still open
   */
  OPEN = 'OPEN',

  /**
   * An issue that has been closed
   */
  CLOSED = 'CLOSED'
}

/**
 * Ways in which to filter lists of issues.
 */
export interface IIssueFilters {
  /**
   * List issues assigned to given name. Pass in `null` for issues with no assigned user, and `*` for issues assigned to any user.
   */
  assignee?: string | null

  /**
   * List issues created by given name.
   */
  createdBy?: string | null

  /**
   * List issues where the list of label names exist on the issue.
   */
  labels?: string[] | null

  /**
   * List issues where the given name is mentioned in the issue.
   */
  mentioned?: string | null

  /**
   * List issues by given milestone argument. If an string representation of an integer is passed, it should refer to a milestone by its number field. Pass in `null` for issues with no milestone, and `*` for issues that are assigned to any milestone.
   */
  milestone?: string | null

  /**
   * List issues that have been updated at or after the given date.
   */
  since?: any | null

  /**
   * List issues filtered by the list of states given.
   */
  states?: IssueState[] | null

  /**
   * List issues subscribed to by viewer.
   * @default false
   */
  viewerSubscribed?: boolean | null
}

/**
 * The connection type for Issue.
 */
export interface IIssueConnection {
  __typename: 'IssueConnection'

  /**
   * A list of edges.
   */
  edges: (IIssueEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IIssue | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IIssueEdge {
  __typename: 'IssueEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IIssue | null
}

/**
 * An object that can be locked.
 */
export type Lockable = IIssue | IPullRequest

/**
 * An object that can be locked.
 */
export interface ILockable {
  __typename: 'Lockable'

  /**
   * Reason that the conversation was locked.
   */
  activeLockReason: LockReason | null

  /**
   * `true` if the object is locked
   */
  locked: boolean
}

/**
 * The possible reasons that an issue or pull request was locked.
 */
export const enum LockReason {
  /**
   * The issue or pull request was locked because the conversation was off-topic.
   */
  OFF_TOPIC = 'OFF_TOPIC',

  /**
   * The issue or pull request was locked because the conversation was too heated.
   */
  TOO_HEATED = 'TOO_HEATED',

  /**
   * The issue or pull request was locked because the conversation was resolved.
   */
  RESOLVED = 'RESOLVED',

  /**
   * The issue or pull request was locked because the conversation was spam.
   */
  SPAM = 'SPAM'
}

/**
 * Represents a subject that can be reacted on.
 */
export type Reactable =
  | IIssue
  | IPullRequest
  | IIssueComment
  | ICommitComment
  | IPullRequestReviewComment
  | IPullRequestReview

/**
 * Represents a subject that can be reacted on.
 */
export interface IReactable {
  __typename: 'Reactable'

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string

  /**
   * A list of reactions grouped by content left on the subject.
   */
  reactionGroups: IReactionGroup[] | null

  /**
   * A list of Reactions left on the Issue.
   */
  reactions: IReactionConnection

  /**
   * Can user react to this subject
   */
  viewerCanReact: boolean
}

export interface IReactionsOnReactableArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Allows filtering Reactions by emoji.
   */
  content?: ReactionContent | null

  /**
   * Allows specifying the order in which reactions are returned.
   */
  orderBy?: IReactionOrder | null
}

/**
 * A group of emoji reactions to a particular piece of content.
 */
export interface IReactionGroup {
  __typename: 'ReactionGroup'

  /**
   * Identifies the emoji reaction.
   */
  content: ReactionContent

  /**
   * Identifies when the reaction was created.
   */
  createdAt: any | null

  /**
   * The subject that was reacted to.
   */
  subject: Reactable

  /**
   * Users who have reacted to the reaction subject with the emotion represented by this reaction group
   */
  users: IReactingUserConnection

  /**
   * Whether or not the authenticated user has left a reaction on the subject.
   */
  viewerHasReacted: boolean
}

export interface IUsersOnReactionGroupArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Emojis that can be attached to Issues, Pull Requests and Comments.
 */
export const enum ReactionContent {
  /**
   * Represents the 👍 emoji.
   */
  THUMBS_UP = 'THUMBS_UP',

  /**
   * Represents the 👎 emoji.
   */
  THUMBS_DOWN = 'THUMBS_DOWN',

  /**
   * Represents the 😄 emoji.
   */
  LAUGH = 'LAUGH',

  /**
   * Represents the 🎉 emoji.
   */
  HOORAY = 'HOORAY',

  /**
   * Represents the 😕 emoji.
   */
  CONFUSED = 'CONFUSED',

  /**
   * Represents the ❤️ emoji.
   */
  HEART = 'HEART',

  /**
   * Represents the 🚀 emoji.
   */
  ROCKET = 'ROCKET',

  /**
   * Represents the 👀 emoji.
   */
  EYES = 'EYES'
}

/**
 * The connection type for User.
 */
export interface IReactingUserConnection {
  __typename: 'ReactingUserConnection'

  /**
   * A list of edges.
   */
  edges: (IReactingUserEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a user that's made a reaction.
 */
export interface IReactingUserEdge {
  __typename: 'ReactingUserEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string
  node: IGitHubUser

  /**
   * The moment when the user made the reaction.
   */
  reactedAt: any
}

/**
 * Ways in which lists of reactions can be ordered upon return.
 */
export interface IReactionOrder {
  /**
   * The field in which to order reactions by.
   */
  field: ReactionOrderField

  /**
   * The direction in which to order reactions by the specified field.
   */
  direction: OrderDirection
}

/**
 * A list of fields that reactions can be ordered by.
 */
export const enum ReactionOrderField {
  /**
   * Allows ordering a list of reactions by when they were created.
   */
  CREATED_AT = 'CREATED_AT'
}

/**
 * A list of reactions that have been left on the subject.
 */
export interface IReactionConnection {
  __typename: 'ReactionConnection'

  /**
   * A list of edges.
   */
  edges: (IReactionEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IReaction | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number

  /**
   * Whether or not the authenticated user has left a reaction on the subject.
   */
  viewerHasReacted: boolean
}

/**
 * An edge in a connection.
 */
export interface IReactionEdge {
  __typename: 'ReactionEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IReaction | null
}

/**
 * An emoji reaction to a particular piece of content.
 */
export interface IReaction {
  __typename: 'Reaction'

  /**
   * Identifies the emoji reaction.
   */
  content: ReactionContent

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string

  /**
   * The reactable piece of content
   */
  reactable: Reactable

  /**
   * Identifies the user who created this reaction.
   */
  user: IGitHubUser | null
}

/**
 * Represents a object that belongs to a repository.
 */
export type RepositoryNode =
  | IIssue
  | IPullRequest
  | IIssueComment
  | ICommitComment
  | IPullRequestReviewComment
  | IPullRequestReview
  | ICommitCommentThread
  | IPullRequestCommitCommentThread

/**
 * Represents a object that belongs to a repository.
 */
export interface IRepositoryNode {
  __typename: 'RepositoryNode'

  /**
   * The repository associated with this node.
   */
  repository: IRepository
}

/**
 * The connection type for IssueComment.
 */
export interface IIssueCommentConnection {
  __typename: 'IssueCommentConnection'

  /**
   * A list of edges.
   */
  edges: (IIssueCommentEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IIssueComment | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IIssueCommentEdge {
  __typename: 'IssueCommentEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IIssueComment | null
}

/**
 * Represents a comment on an Issue.
 */
export interface IIssueComment {
  __typename: 'IssueComment'

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the subject of the comment.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * The body as Markdown.
   */
  body: string

  /**
   * The body rendered to HTML.
   */
  bodyHTML: any

  /**
   * The body rendered to text.
   */
  bodyText: string

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The actor who edited the comment.
   */
  editor: Actor | null
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * Returns whether or not a comment has been minimized.
   */
  isMinimized: boolean

  /**
   * Identifies the issue associated with the comment.
   */
  issue: IIssue

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * Returns why the comment was minimized.
   */
  minimizedReason: string | null

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * Returns the pull request associated with the comment, if this comment was made on a
   * pull request.
   *
   */
  pullRequest: IPullRequest | null

  /**
   * A list of reactions grouped by content left on the subject.
   */
  reactionGroups: IReactionGroup[] | null

  /**
   * A list of Reactions left on the Issue.
   */
  reactions: IReactionConnection

  /**
   * The repository associated with this node.
   */
  repository: IRepository

  /**
   * The HTTP path for this issue comment
   */
  resourcePath: any

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this issue comment
   */
  url: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Check if the current viewer can delete this object.
   */
  viewerCanDelete: boolean

  /**
   * Check if the current viewer can minimize this object.
   */
  viewerCanMinimize: boolean

  /**
   * Can user react to this subject
   */
  viewerCanReact: boolean

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean
}

export interface IReactionsOnIssueCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Allows filtering Reactions by emoji.
   */
  content?: ReactionContent | null

  /**
   * Allows specifying the order in which reactions are returned.
   */
  orderBy?: IReactionOrder | null
}

export interface IUserContentEditsOnIssueCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Entities that can be deleted.
 */
export type Deletable =
  | IIssueComment
  | ICommitComment
  | IPullRequestReviewComment
  | IPullRequestReview
  | IGistComment

/**
 * Entities that can be deleted.
 */
export interface IDeletable {
  __typename: 'Deletable'

  /**
   * Check if the current viewer can delete this object.
   */
  viewerCanDelete: boolean
}

/**
 * The connection type for PullRequestCommit.
 */
export interface IPullRequestCommitConnection {
  __typename: 'PullRequestCommitConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestCommitEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPullRequestCommit | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPullRequestCommitEdge {
  __typename: 'PullRequestCommitEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPullRequestCommit | null
}

/**
 * Represents a Git commit part of a pull request.
 */
export interface IPullRequestCommit {
  __typename: 'PullRequestCommit'

  /**
   * The Git commit object
   */
  commit: ICommit
  id: string

  /**
   * The pull request this commit belongs to
   */
  pullRequest: IPullRequest

  /**
   * The HTTP path for this pull request commit
   */
  resourcePath: any

  /**
   * The HTTP URL for this pull request commit
   */
  url: any
}

/**
 * Represents a Git commit.
 */
export interface ICommit {
  __typename: 'Commit'

  /**
   * An abbreviated version of the Git object ID
   */
  abbreviatedOid: string

  /**
   * The number of additions in this commit.
   */
  additions: number

  /**
   * The pull requests associated with a commit
   */
  associatedPullRequests: IPullRequestConnection | null

  /**
   * Authorship details of the commit.
   */
  author: IGitActor | null

  /**
   * Check if the committer and the author match.
   */
  authoredByCommitter: boolean

  /**
   * The datetime when this commit was authored.
   */
  authoredDate: any

  /**
   * Fetches `git blame` information.
   */
  blame: IBlame

  /**
   * The number of changed files in this commit.
   */
  changedFiles: number

  /**
   * Comments made on the commit.
   */
  comments: ICommitCommentConnection

  /**
   * The HTTP path for this Git object
   */
  commitResourcePath: any

  /**
   * The HTTP URL for this Git object
   */
  commitUrl: any

  /**
   * The datetime when this commit was committed.
   */
  committedDate: any

  /**
   * Check if commited via GitHub web UI.
   */
  committedViaWeb: boolean

  /**
   * Committership details of the commit.
   */
  committer: IGitActor | null

  /**
   * The number of deletions in this commit.
   */
  deletions: number

  /**
   * The deployments associated with a commit.
   */
  deployments: IDeploymentConnection | null

  /**
   * The linear commit history starting from (and including) this commit, in the same order as `git log`.
   */
  history: ICommitHistoryConnection
  id: string

  /**
   * The Git commit message
   */
  message: string

  /**
   * The Git commit message body
   */
  messageBody: string

  /**
   * The commit message body rendered to HTML.
   */
  messageBodyHTML: any

  /**
   * The Git commit message headline
   */
  messageHeadline: string

  /**
   * The commit message headline rendered to HTML.
   */
  messageHeadlineHTML: any

  /**
   * The Git object ID
   */
  oid: any

  /**
   * The parents of a commit.
   */
  parents: ICommitConnection

  /**
   * The datetime when this commit was pushed.
   */
  pushedDate: any | null

  /**
   * The Repository this commit belongs to
   */
  repository: IRepository

  /**
   * The HTTP path for this commit
   */
  resourcePath: any

  /**
   * Commit signing information, if present.
   */
  signature: GitSignature | null

  /**
   * Status information for this commit
   */
  status: IStatus | null

  /**
   * Returns a URL to download a tarball archive for a repository.
   * Note: For private repositories, these links are temporary and expire after five minutes.
   */
  tarballUrl: any

  /**
   * Commit's root Tree
   */
  tree: ITree

  /**
   * The HTTP path for the tree of this commit
   */
  treeResourcePath: any

  /**
   * The HTTP URL for the tree of this commit
   */
  treeUrl: any

  /**
   * The HTTP URL for this commit
   */
  url: any

  /**
   * Check if the viewer is able to change their subscription status for the repository.
   */
  viewerCanSubscribe: boolean

  /**
   * Identifies if the viewer is watching, not watching, or ignoring the subscribable entity.
   */
  viewerSubscription: SubscriptionState | null

  /**
   * Returns a URL to download a zipball archive for a repository.
   * Note: For private repositories, these links are temporary and expire after five minutes.
   */
  zipballUrl: any
}

export interface IAssociatedPullRequestsOnCommitArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for pull requests.
   */
  orderBy?: IPullRequestOrder | null
}

export interface IBlameOnCommitArguments {
  /**
   * The file whose Git blame information you want.
   */
  path: string
}

export interface ICommentsOnCommitArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IDeploymentsOnCommitArguments {
  /**
   * Environments to list deployments for
   */
  environments?: string[] | null

  /**
   * Ordering options for deployments returned from the connection.
   */
  orderBy?: IDeploymentOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IHistoryOnCommitArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * If non-null, filters history to only show commits touching files under this path.
   */
  path?: string | null

  /**
   * If non-null, filters history to only show commits with matching authorship.
   */
  author?: ICommitAuthor | null

  /**
   * Allows specifying a beginning time or date for fetching commits.
   */
  since?: any | null

  /**
   * Allows specifying an ending time or date for fetching commits.
   */
  until?: any | null
}

export interface IParentsOnCommitArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Represents a Git object.
 */
export type GitObject = ICommit | ITree | IBlob | ITag

/**
 * Represents a Git object.
 */
export interface IGitObject {
  __typename: 'GitObject'

  /**
   * An abbreviated version of the Git object ID
   */
  abbreviatedOid: string

  /**
   * The HTTP path for this Git object
   */
  commitResourcePath: any

  /**
   * The HTTP URL for this Git object
   */
  commitUrl: any
  id: string

  /**
   * The Git object ID
   */
  oid: any

  /**
   * The Repository the Git object belongs to
   */
  repository: IRepository
}

/**
 * Ways in which lists of issues can be ordered upon return.
 */
export interface IPullRequestOrder {
  /**
   * The field in which to order pull requests by.
   */
  field: PullRequestOrderField

  /**
   * The direction in which to order pull requests by the specified field.
   */
  direction: OrderDirection
}

/**
 * Properties by which pull_requests connections can be ordered.
 */
export const enum PullRequestOrderField {
  /**
   * Order pull_requests by creation time
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order pull_requests by update time
   */
  UPDATED_AT = 'UPDATED_AT'
}

/**
 * Represents an actor in a Git commit (ie. an author or committer).
 */
export interface IGitActor {
  __typename: 'GitActor'

  /**
   * A URL pointing to the author's public avatar.
   */
  avatarUrl: any

  /**
   * The timestamp of the Git action (authoring or committing).
   */
  date: any | null

  /**
   * The email in the Git commit.
   */
  email: string | null

  /**
   * The name in the Git commit.
   */
  name: string | null

  /**
   * The GitHub user corresponding to the email field. Null if no such user exists.
   */
  user: IGitHubUser | null
}

export interface IAvatarUrlOnGitActorArguments {
  /**
   * The size of the resulting square image.
   */
  size?: number | null
}

/**
 * Represents a Git blame.
 */
export interface IBlame {
  __typename: 'Blame'

  /**
   * The list of ranges from a Git blame.
   */
  ranges: IBlameRange[]
}

/**
 * Represents a range of information from a Git blame.
 */
export interface IBlameRange {
  __typename: 'BlameRange'

  /**
   * Identifies the recency of the change, from 1 (new) to 10 (old). This is calculated as a 2-quantile and determines the length of distance between the median age of all the changes in the file and the recency of the current range's change.
   */
  age: number

  /**
   * Identifies the line author
   */
  commit: ICommit

  /**
   * The ending line for the range
   */
  endingLine: number

  /**
   * The starting line for the range
   */
  startingLine: number
}

/**
 * The connection type for CommitComment.
 */
export interface ICommitCommentConnection {
  __typename: 'CommitCommentConnection'

  /**
   * A list of edges.
   */
  edges: (ICommitCommentEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICommitComment | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ICommitCommentEdge {
  __typename: 'CommitCommentEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ICommitComment | null
}

/**
 * Represents a comment on a given Commit.
 */
export interface ICommitComment {
  __typename: 'CommitComment'

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the subject of the comment.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * Identifies the comment body.
   */
  body: string

  /**
   * Identifies the comment body rendered to HTML.
   */
  bodyHTML: any

  /**
   * The body rendered to text.
   */
  bodyText: string

  /**
   * Identifies the commit associated with the comment, if the commit exists.
   */
  commit: ICommit | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The actor who edited the comment.
   */
  editor: Actor | null
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * Returns whether or not a comment has been minimized.
   */
  isMinimized: boolean

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * Returns why the comment was minimized.
   */
  minimizedReason: string | null

  /**
   * Identifies the file path associated with the comment.
   */
  path: string | null

  /**
   * Identifies the line position associated with the comment.
   */
  position: number | null

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * A list of reactions grouped by content left on the subject.
   */
  reactionGroups: IReactionGroup[] | null

  /**
   * A list of Reactions left on the Issue.
   */
  reactions: IReactionConnection

  /**
   * The repository associated with this node.
   */
  repository: IRepository

  /**
   * The HTTP path permalink for this commit comment.
   */
  resourcePath: any

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL permalink for this commit comment.
   */
  url: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Check if the current viewer can delete this object.
   */
  viewerCanDelete: boolean

  /**
   * Check if the current viewer can minimize this object.
   */
  viewerCanMinimize: boolean

  /**
   * Can user react to this subject
   */
  viewerCanReact: boolean

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean
}

export interface IReactionsOnCommitCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Allows filtering Reactions by emoji.
   */
  content?: ReactionContent | null

  /**
   * Allows specifying the order in which reactions are returned.
   */
  orderBy?: IReactionOrder | null
}

export interface IUserContentEditsOnCommitCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Ordering options for deployment connections
 */
export interface IDeploymentOrder {
  /**
   * The field to order deployments by.
   */
  field: DeploymentOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which deployment connections can be ordered.
 */
export const enum DeploymentOrderField {
  /**
   * Order collection by creation time
   */
  CREATED_AT = 'CREATED_AT'
}

/**
 * The connection type for Deployment.
 */
export interface IDeploymentConnection {
  __typename: 'DeploymentConnection'

  /**
   * A list of edges.
   */
  edges: (IDeploymentEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IDeployment | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IDeploymentEdge {
  __typename: 'DeploymentEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IDeployment | null
}

/**
 * Represents triggered deployment instance.
 */
export interface IDeployment {
  __typename: 'Deployment'

  /**
   * Identifies the commit sha of the deployment.
   */
  commit: ICommit | null

  /**
   * Identifies the oid of the deployment commit, even if the commit has been deleted.
   */
  commitOid: string

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the actor who triggered the deployment.
   */
  creator: Actor | null

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The deployment description.
   */
  description: string | null

  /**
   * The environment to which this deployment was made.
   */
  environment: string | null
  id: string

  /**
   * The latest status of this deployment.
   */
  latestStatus: IDeploymentStatus | null

  /**
   * Extra information that a deployment system might need.
   */
  payload: string | null

  /**
   * Identifies the Ref of the deployment, if the deployment was created by ref.
   */
  ref: IRef | null

  /**
   * Identifies the repository associated with the deployment.
   */
  repository: IRepository

  /**
   * The current state of the deployment.
   */
  state: DeploymentState | null

  /**
   * A list of statuses associated with the deployment.
   */
  statuses: IDeploymentStatusConnection | null

  /**
   * The deployment task.
   */
  task: string | null

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any
}

export interface IStatusesOnDeploymentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Describes the status of a given deployment attempt.
 */
export interface IDeploymentStatus {
  __typename: 'DeploymentStatus'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the actor who triggered the deployment.
   */
  creator: Actor | null

  /**
   * Identifies the deployment associated with status.
   */
  deployment: IDeployment

  /**
   * Identifies the description of the deployment.
   */
  description: string | null

  /**
   * Identifies the environment URL of the deployment.
   */
  environmentUrl: any | null
  id: string

  /**
   * Identifies the log URL of the deployment.
   */
  logUrl: any | null

  /**
   * Identifies the current state of the deployment.
   */
  state: DeploymentStatusState

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any
}

/**
 * The possible states for a deployment status.
 */
export const enum DeploymentStatusState {
  /**
   * The deployment is pending.
   */
  PENDING = 'PENDING',

  /**
   * The deployment was successful.
   */
  SUCCESS = 'SUCCESS',

  /**
   * The deployment has failed.
   */
  FAILURE = 'FAILURE',

  /**
   * The deployment is inactive.
   */
  INACTIVE = 'INACTIVE',

  /**
   * The deployment experienced an error.
   */
  ERROR = 'ERROR',

  /**
   * The deployment is queued
   */
  QUEUED = 'QUEUED',

  /**
   * The deployment is in progress.
   */
  IN_PROGRESS = 'IN_PROGRESS'
}

/**
 * The possible states in which a deployment can be.
 */
export const enum DeploymentState {
  /**
   * The pending deployment was not updated after 30 minutes.
   */
  ABANDONED = 'ABANDONED',

  /**
   * The deployment is currently active.
   */
  ACTIVE = 'ACTIVE',

  /**
   * An inactive transient deployment.
   */
  DESTROYED = 'DESTROYED',

  /**
   * The deployment experienced an error.
   */
  ERROR = 'ERROR',

  /**
   * The deployment has failed.
   */
  FAILURE = 'FAILURE',

  /**
   * The deployment is inactive.
   */
  INACTIVE = 'INACTIVE',

  /**
   * The deployment is pending.
   */
  PENDING = 'PENDING',

  /**
   * The deployment has queued
   */
  QUEUED = 'QUEUED',

  /**
   * The deployment is in progress.
   */
  IN_PROGRESS = 'IN_PROGRESS'
}

/**
 * The connection type for DeploymentStatus.
 */
export interface IDeploymentStatusConnection {
  __typename: 'DeploymentStatusConnection'

  /**
   * A list of edges.
   */
  edges: (IDeploymentStatusEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IDeploymentStatus | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IDeploymentStatusEdge {
  __typename: 'DeploymentStatusEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IDeploymentStatus | null
}

/**
 * Specifies an author for filtering Git commits.
 */
export interface ICommitAuthor {
  /**
   * ID of a User to filter by. If non-null, only commits authored by this user will be returned. This field takes precedence over emails.
   */
  id?: string | null

  /**
   * Email addresses to filter by. Commits authored by any of the specified email addresses will be returned.
   */
  emails?: string[] | null
}

/**
 * The connection type for Commit.
 */
export interface ICommitHistoryConnection {
  __typename: 'CommitHistoryConnection'

  /**
   * A list of edges.
   */
  edges: (ICommitEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICommit | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ICommitEdge {
  __typename: 'CommitEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ICommit | null
}

/**
 * The connection type for Commit.
 */
export interface ICommitConnection {
  __typename: 'CommitConnection'

  /**
   * A list of edges.
   */
  edges: (ICommitEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICommit | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Information about a signature (GPG or S/MIME) on a Commit or Tag.
 */
export type GitSignature = IGpgSignature | ISmimeSignature | IUnknownSignature

/**
 * Information about a signature (GPG or S/MIME) on a Commit or Tag.
 */
export interface IGitSignature {
  __typename: 'GitSignature'

  /**
   * Email used to sign this object.
   */
  email: string

  /**
   * True if the signature is valid and verified by GitHub.
   */
  isValid: boolean

  /**
   * Payload for GPG signing object. Raw ODB object without the signature header.
   */
  payload: string

  /**
   * ASCII-armored signature header from object.
   */
  signature: string

  /**
   * GitHub user corresponding to the email signing this commit.
   */
  signer: IGitHubUser | null

  /**
   * The state of this signature. `VALID` if signature is valid and verified by GitHub, otherwise represents reason why signature is considered invalid.
   */
  state: GitSignatureState

  /**
   * True if the signature was made with GitHub's signing key.
   */
  wasSignedByGitHub: boolean
}

/**
 * The state of a Git signature.
 */
export const enum GitSignatureState {
  /**
   * Valid signature and verified by GitHub
   */
  VALID = 'VALID',

  /**
   * Invalid signature
   */
  INVALID = 'INVALID',

  /**
   * Malformed signature
   */
  MALFORMED_SIG = 'MALFORMED_SIG',

  /**
   * Key used for signing not known to GitHub
   */
  UNKNOWN_KEY = 'UNKNOWN_KEY',

  /**
   * Invalid email used for signing
   */
  BAD_EMAIL = 'BAD_EMAIL',

  /**
   * Email used for signing unverified on GitHub
   */
  UNVERIFIED_EMAIL = 'UNVERIFIED_EMAIL',

  /**
   * Email used for signing not known to GitHub
   */
  NO_USER = 'NO_USER',

  /**
   * Unknown signature type
   */
  UNKNOWN_SIG_TYPE = 'UNKNOWN_SIG_TYPE',

  /**
   * Unsigned
   */
  UNSIGNED = 'UNSIGNED',

  /**
   * Internal error - the GPG verification service is unavailable at the moment
   */
  GPGVERIFY_UNAVAILABLE = 'GPGVERIFY_UNAVAILABLE',

  /**
   * Internal error - the GPG verification service misbehaved
   */
  GPGVERIFY_ERROR = 'GPGVERIFY_ERROR',

  /**
   * The usage flags for the key that signed this don't allow signing
   */
  NOT_SIGNING_KEY = 'NOT_SIGNING_KEY',

  /**
   * Signing key expired
   */
  EXPIRED_KEY = 'EXPIRED_KEY',

  /**
   * Valid signature, pending certificate revocation checking
   */
  OCSP_PENDING = 'OCSP_PENDING',

  /**
   * Valid siganture, though certificate revocation check failed
   */
  OCSP_ERROR = 'OCSP_ERROR',

  /**
   * The signing certificate or its chain could not be verified
   */
  BAD_CERT = 'BAD_CERT',

  /**
   * One or more certificates in chain has been revoked
   */
  OCSP_REVOKED = 'OCSP_REVOKED'
}

/**
 * Represents a commit status.
 */
export interface IStatus {
  __typename: 'Status'

  /**
   * The commit this status is attached to.
   */
  commit: ICommit | null

  /**
   * Looks up an individual status context by context name.
   */
  context: IStatusContext | null

  /**
   * The individual status contexts for this commit.
   */
  contexts: IStatusContext[]
  id: string

  /**
   * The combined commit status.
   */
  state: StatusState
}

export interface IContextOnStatusArguments {
  /**
   * The context name.
   */
  name: string
}

/**
 * Represents an individual commit status context
 */
export interface IStatusContext {
  __typename: 'StatusContext'

  /**
   * This commit this status context is attached to.
   */
  commit: ICommit | null

  /**
   * The name of this status context.
   */
  context: string

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The actor who created this status context.
   */
  creator: Actor | null

  /**
   * The description for this status context.
   */
  description: string | null
  id: string

  /**
   * The state of this status context.
   */
  state: StatusState

  /**
   * The URL for this status context.
   */
  targetUrl: any | null
}

/**
 * The possible commit status states.
 */
export const enum StatusState {
  /**
   * Status is expected.
   */
  EXPECTED = 'EXPECTED',

  /**
   * Status is errored.
   */
  ERROR = 'ERROR',

  /**
   * Status is failing.
   */
  FAILURE = 'FAILURE',

  /**
   * Status is pending.
   */
  PENDING = 'PENDING',

  /**
   * Status is successful.
   */
  SUCCESS = 'SUCCESS'
}

/**
 * Represents a Git tree.
 */
export interface ITree {
  __typename: 'Tree'

  /**
   * An abbreviated version of the Git object ID
   */
  abbreviatedOid: string

  /**
   * The HTTP path for this Git object
   */
  commitResourcePath: any

  /**
   * The HTTP URL for this Git object
   */
  commitUrl: any

  /**
   * A list of tree entries.
   */
  entries: ITreeEntry[] | null
  id: string

  /**
   * The Git object ID
   */
  oid: any

  /**
   * The Repository the Git object belongs to
   */
  repository: IRepository
}

/**
 * Represents a Git tree entry.
 */
export interface ITreeEntry {
  __typename: 'TreeEntry'

  /**
   * Entry file mode.
   */
  mode: number

  /**
   * Entry file name.
   */
  name: string

  /**
   * Entry file object.
   */
  object: GitObject | null

  /**
   * Entry file Git object ID.
   */
  oid: any

  /**
   * The Repository the tree entry belongs to
   */
  repository: IRepository

  /**
   * Entry file type.
   */
  type: string
}

/**
 * The connection type for PullRequestChangedFile.
 */
export interface IPullRequestChangedFileConnection {
  __typename: 'PullRequestChangedFileConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestChangedFileEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPullRequestChangedFile | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPullRequestChangedFileEdge {
  __typename: 'PullRequestChangedFileEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPullRequestChangedFile | null
}

/**
 * A file changed in a pull request.
 */
export interface IPullRequestChangedFile {
  __typename: 'PullRequestChangedFile'

  /**
   * The number of additions to the file.
   */
  additions: number

  /**
   * The number of deletions to the file.
   */
  deletions: number

  /**
   * The path of the file.
   */
  path: string
}

/**
 * Whether or not a PullRequest can be merged.
 */
export const enum MergeableState {
  /**
   * The pull request can be merged.
   */
  MERGEABLE = 'MERGEABLE',

  /**
   * The pull request cannot be merged due to merge conflicts.
   */
  CONFLICTING = 'CONFLICTING',

  /**
   * The mergeability of the pull request is still being calculated.
   */
  UNKNOWN = 'UNKNOWN'
}

/**
 * Represents a Milestone object on a given repository.
 */
export interface IMilestone {
  __typename: 'Milestone'

  /**
   * `true` if the object is closed (definition of closed may depend on type)
   */
  closed: boolean

  /**
   * Identifies the date and time when the object was closed.
   */
  closedAt: any | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the actor who created the milestone.
   */
  creator: Actor | null

  /**
   * Identifies the description of the milestone.
   */
  description: string | null

  /**
   * Identifies the due date of the milestone.
   */
  dueOn: any | null
  id: string

  /**
   * A list of issues associated with the milestone.
   */
  issues: IIssueConnection

  /**
   * Identifies the number of the milestone.
   */
  number: number

  /**
   * A list of pull requests associated with the milestone.
   */
  pullRequests: IPullRequestConnection

  /**
   * The repository associated with this milestone.
   */
  repository: IRepository

  /**
   * The HTTP path for this milestone
   */
  resourcePath: any

  /**
   * Identifies the state of the milestone.
   */
  state: MilestoneState

  /**
   * Identifies the title of the milestone.
   */
  title: string

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this milestone
   */
  url: any
}

export interface IIssuesOnMilestoneArguments {
  /**
   * Ordering options for issues returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * A list of states to filter the issues by.
   */
  states?: IssueState[] | null

  /**
   * Filtering options for issues returned from the connection.
   */
  filterBy?: IIssueFilters | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPullRequestsOnMilestoneArguments {
  /**
   * A list of states to filter the pull requests by.
   */
  states?: PullRequestState[] | null

  /**
   * A list of label names to filter the pull requests by.
   */
  labels?: string[] | null

  /**
   * The head ref name to filter the pull requests by.
   */
  headRefName?: string | null

  /**
   * The base ref name to filter the pull requests by.
   */
  baseRefName?: string | null

  /**
   * Ordering options for pull requests returned from the connection.
   */
  orderBy?: IIssueOrder | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The possible states of a milestone.
 */
export const enum MilestoneState {
  /**
   * A milestone that is still open.
   */
  OPEN = 'OPEN',

  /**
   * A milestone that has been closed.
   */
  CLOSED = 'CLOSED'
}

/**
 * The connection type for ReviewRequest.
 */
export interface IReviewRequestConnection {
  __typename: 'ReviewRequestConnection'

  /**
   * A list of edges.
   */
  edges: (IReviewRequestEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IReviewRequest | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IReviewRequestEdge {
  __typename: 'ReviewRequestEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IReviewRequest | null
}

/**
 * A request for a user to review a pull request.
 */
export interface IReviewRequest {
  __typename: 'ReviewRequest'

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string

  /**
   * Identifies the pull request associated with this review request.
   */
  pullRequest: IPullRequest

  /**
   * The reviewer that is requested.
   */
  requestedReviewer: RequestedReviewer | null
}

/**
 * Types that can be requested reviewers.
 */
export type RequestedReviewer = IGitHubUser | ITeam

/**
 * A team of users in an organization.
 */
export interface ITeam {
  __typename: 'Team'

  /**
   * A list of teams that are ancestors of this team.
   */
  ancestors: ITeamConnection

  /**
   * A URL pointing to the team's avatar.
   */
  avatarUrl: any | null

  /**
   * List of child teams belonging to this team
   */
  childTeams: ITeamConnection

  /**
   * The slug corresponding to the organization and team.
   */
  combinedSlug: string

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The description of the team.
   */
  description: string | null

  /**
   * The HTTP path for editing this team
   */
  editTeamResourcePath: any

  /**
   * The HTTP URL for editing this team
   */
  editTeamUrl: any
  id: string

  /**
   * A list of pending invitations for users to this team
   */
  invitations: IOrganizationInvitationConnection | null

  /**
   * Get the status messages members of this entity have set that are either public or visible only to the organization.
   */
  memberStatuses: IUserStatusConnection

  /**
   * A list of users who are members of this team.
   */
  members: ITeamMemberConnection

  /**
   * The HTTP path for the team' members
   */
  membersResourcePath: any

  /**
   * The HTTP URL for the team' members
   */
  membersUrl: any

  /**
   * The name of the team.
   */
  name: string

  /**
   * The HTTP path creating a new team
   */
  newTeamResourcePath: any

  /**
   * The HTTP URL creating a new team
   */
  newTeamUrl: any

  /**
   * The organization that owns this team.
   */
  organization: IOrganization

  /**
   * The parent team of the team.
   */
  parentTeam: ITeam | null

  /**
   * The level of privacy the team has.
   */
  privacy: TeamPrivacy

  /**
   * A list of repositories this team has access to.
   */
  repositories: ITeamRepositoryConnection

  /**
   * The HTTP path for this team's repositories
   */
  repositoriesResourcePath: any

  /**
   * The HTTP URL for this team's repositories
   */
  repositoriesUrl: any

  /**
   * The HTTP path for this team
   */
  resourcePath: any

  /**
   * The slug corresponding to the team.
   */
  slug: string

  /**
   * The HTTP path for this team's teams
   */
  teamsResourcePath: any

  /**
   * The HTTP URL for this team's teams
   */
  teamsUrl: any

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this team
   */
  url: any

  /**
   * Team is adminable by the viewer.
   */
  viewerCanAdminister: boolean

  /**
   * Check if the viewer is able to change their subscription status for the repository.
   */
  viewerCanSubscribe: boolean

  /**
   * Identifies if the viewer is watching, not watching, or ignoring the subscribable entity.
   */
  viewerSubscription: SubscriptionState | null
}

export interface IAncestorsOnTeamArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IAvatarUrlOnTeamArguments {
  /**
   * The size in pixels of the resulting square image.
   * @default 400
   */
  size?: number | null
}

export interface IChildTeamsOnTeamArguments {
  /**
   * Order for connection
   */
  orderBy?: ITeamOrder | null

  /**
   * User logins to filter by
   */
  userLogins?: string[] | null

  /**
   * Whether to list immediate child teams or all descendant child teams.
   * @default true
   */
  immediateOnly?: boolean | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IInvitationsOnTeamArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IMemberStatusesOnTeamArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for user statuses returned from the connection.
   */
  orderBy?: IUserStatusOrder | null
}

export interface IMembersOnTeamArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * The search string to look for.
   */
  query?: string | null

  /**
   * Filter by membership type
   * @default "ALL"
   */
  membership?: TeamMembershipType | null

  /**
   * Filter by team member role
   */
  role?: TeamMemberRole | null

  /**
   * Order for the connection.
   */
  orderBy?: ITeamMemberOrder | null
}

export interface IRepositoriesOnTeamArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * The search string to look for.
   */
  query?: string | null

  /**
   * Order for the connection.
   */
  orderBy?: ITeamRepositoryOrder | null
}

/**
 * Entities that have members who can set status messages.
 */
export type MemberStatusable = IOrganization | ITeam

/**
 * Entities that have members who can set status messages.
 */
export interface IMemberStatusable {
  __typename: 'MemberStatusable'

  /**
   * Get the status messages members of this entity have set that are either public or visible only to the organization.
   */
  memberStatuses: IUserStatusConnection
}

export interface IMemberStatusesOnMemberStatusableArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for user statuses returned from the connection.
   */
  orderBy?: IUserStatusOrder | null
}

/**
 * Ordering options for user status connections.
 */
export interface IUserStatusOrder {
  /**
   * The field to order user statuses by.
   */
  field: UserStatusOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which user status connections can be ordered.
 */
export const enum UserStatusOrderField {
  /**
   * Order user statuses by when they were updated.
   */
  UPDATED_AT = 'UPDATED_AT'
}

/**
 * The connection type for UserStatus.
 */
export interface IUserStatusConnection {
  __typename: 'UserStatusConnection'

  /**
   * A list of edges.
   */
  edges: (IUserStatusEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IUserStatus | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IUserStatusEdge {
  __typename: 'UserStatusEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IUserStatus | null
}

/**
 * The user's description of what they're currently doing.
 */
export interface IUserStatus {
  __typename: 'UserStatus'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * An emoji summarizing the user's status.
   */
  emoji: string | null

  /**
   * ID of the object.
   */
  id: string

  /**
   * Whether this status indicates the user is not fully available on GitHub.
   */
  indicatesLimitedAvailability: boolean

  /**
   * A brief message describing what the user is doing.
   */
  message: string | null

  /**
   * The organization whose members can see this status. If null, this status is publicly visible.
   */
  organization: IOrganization | null

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The user who has this status.
   */
  user: IGitHubUser
}

/**
 * The connection type for Team.
 */
export interface ITeamConnection {
  __typename: 'TeamConnection'

  /**
   * A list of edges.
   */
  edges: (ITeamEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ITeam | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ITeamEdge {
  __typename: 'TeamEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ITeam | null
}

/**
 * Ways in which team connections can be ordered.
 */
export interface ITeamOrder {
  /**
   * The field in which to order nodes by.
   */
  field: TeamOrderField

  /**
   * The direction in which to order nodes.
   */
  direction: OrderDirection
}

/**
 * Properties by which team connections can be ordered.
 */
export const enum TeamOrderField {
  /**
   * Allows ordering a list of teams by name.
   */
  NAME = 'NAME'
}

/**
 * The connection type for OrganizationInvitation.
 */
export interface IOrganizationInvitationConnection {
  __typename: 'OrganizationInvitationConnection'

  /**
   * A list of edges.
   */
  edges: (IOrganizationInvitationEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IOrganizationInvitation | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IOrganizationInvitationEdge {
  __typename: 'OrganizationInvitationEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IOrganizationInvitation | null
}

/**
 * An Invitation for a user to an organization.
 */
export interface IOrganizationInvitation {
  __typename: 'OrganizationInvitation'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The email address of the user invited to the organization.
   */
  email: string | null
  id: string

  /**
   * The type of invitation that was sent (e.g. email, user).
   */
  invitationType: OrganizationInvitationType

  /**
   * The user who was invited to the organization.
   */
  invitee: IGitHubUser | null

  /**
   * The user who created the invitation.
   */
  inviter: IGitHubUser

  /**
   * The organization the invite is for
   */
  organization: IOrganization

  /**
   * The user's pending role in the organization (e.g. member, owner).
   */
  role: OrganizationInvitationRole
}

/**
 * The possible organization invitation types.
 */
export const enum OrganizationInvitationType {
  /**
   * The invitation was to an existing user.
   */
  USER = 'USER',

  /**
   * The invitation was to an email address.
   */
  EMAIL = 'EMAIL'
}

/**
 * The possible organization invitation roles.
 */
export const enum OrganizationInvitationRole {
  /**
   * The user is invited to be a direct member of the organization.
   */
  DIRECT_MEMBER = 'DIRECT_MEMBER',

  /**
   * The user is invited to be an admin of the organization.
   */
  ADMIN = 'ADMIN',

  /**
   * The user is invited to be a billing manager of the organization.
   */
  BILLING_MANAGER = 'BILLING_MANAGER',

  /**
   * The user's previous role will be reinstated.
   */
  REINSTATE = 'REINSTATE'
}

/**
 * Defines which types of team members are included in the returned list. Can be one of IMMEDIATE, CHILD_TEAM or ALL.
 */
export const enum TeamMembershipType {
  /**
   * Includes only immediate members of the team.
   */
  IMMEDIATE = 'IMMEDIATE',

  /**
   * Includes only child team members for the team.
   */
  CHILD_TEAM = 'CHILD_TEAM',

  /**
   * Includes immediate and child team members for the team.
   */
  ALL = 'ALL'
}

/**
 * The possible team member roles; either 'maintainer' or 'member'.
 */
export const enum TeamMemberRole {
  /**
   * A team maintainer has permission to add and remove team members.
   */
  MAINTAINER = 'MAINTAINER',

  /**
   * A team member has no administrative permissions on the team.
   */
  MEMBER = 'MEMBER'
}

/**
 * Ordering options for team member connections
 */
export interface ITeamMemberOrder {
  /**
   * The field to order team members by.
   */
  field: TeamMemberOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which team member connections can be ordered.
 */
export const enum TeamMemberOrderField {
  /**
   * Order team members by login
   */
  LOGIN = 'LOGIN',

  /**
   * Order team members by creation time
   */
  CREATED_AT = 'CREATED_AT'
}

/**
 * The connection type for User.
 */
export interface ITeamMemberConnection {
  __typename: 'TeamMemberConnection'

  /**
   * A list of edges.
   */
  edges: (ITeamMemberEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a user who is a member of a team.
 */
export interface ITeamMemberEdge {
  __typename: 'TeamMemberEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The HTTP path to the organization's member access page.
   */
  memberAccessResourcePath: any

  /**
   * The HTTP URL to the organization's member access page.
   */
  memberAccessUrl: any
  node: IGitHubUser

  /**
   * The role the member has on the team.
   */
  role: TeamMemberRole
}

/**
 * The possible team privacy values.
 */
export const enum TeamPrivacy {
  /**
   * A secret team can only be seen by its members.
   */
  SECRET = 'SECRET',

  /**
   * A visible team can be seen and @mentioned by every member of the organization.
   */
  VISIBLE = 'VISIBLE'
}

/**
 * Ordering options for team repository connections
 */
export interface ITeamRepositoryOrder {
  /**
   * The field to order repositories by.
   */
  field: TeamRepositoryOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which team repository connections can be ordered.
 */
export const enum TeamRepositoryOrderField {
  /**
   * Order repositories by creation time
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order repositories by update time
   */
  UPDATED_AT = 'UPDATED_AT',

  /**
   * Order repositories by push time
   */
  PUSHED_AT = 'PUSHED_AT',

  /**
   * Order repositories by name
   */
  NAME = 'NAME',

  /**
   * Order repositories by permission
   */
  PERMISSION = 'PERMISSION',

  /**
   * Order repositories by number of stargazers
   */
  STARGAZERS = 'STARGAZERS'
}

/**
 * The connection type for Repository.
 */
export interface ITeamRepositoryConnection {
  __typename: 'TeamRepositoryConnection'

  /**
   * A list of edges.
   */
  edges: (ITeamRepositoryEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IRepository | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a team repository.
 */
export interface ITeamRepositoryEdge {
  __typename: 'TeamRepositoryEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string
  node: IRepository

  /**
   * The permission level the team has on the repository
   */
  permission: RepositoryPermission
}

/**
 * The access level to a repository
 */
export const enum RepositoryPermission {
  /**
   * Can read, clone, push, and add collaborators
   */
  ADMIN = 'ADMIN',

  /**
   * Can read, clone and push
   */
  WRITE = 'WRITE',

  /**
   * Can read and clone
   */
  READ = 'READ'
}

/**
 * Review comment threads for a pull request review.
 */
export interface IPullRequestReviewThreadConnection {
  __typename: 'PullRequestReviewThreadConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestReviewThreadEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPullRequestReviewThread | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPullRequestReviewThreadEdge {
  __typename: 'PullRequestReviewThreadEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPullRequestReviewThread | null
}

/**
 * A threaded list of comments for a given pull request.
 */
export interface IPullRequestReviewThread {
  __typename: 'PullRequestReviewThread'

  /**
   * A list of pull request comments associated with the thread.
   */
  comments: IPullRequestReviewCommentConnection
  id: string

  /**
   * Whether this thread has been resolved
   */
  isResolved: boolean

  /**
   * Identifies the pull request associated with this thread.
   */
  pullRequest: IPullRequest

  /**
   * Identifies the repository associated with this thread.
   */
  repository: IRepository

  /**
   * The user who resolved this thread
   */
  resolvedBy: IGitHubUser | null

  /**
   * Whether or not the viewer can resolve this thread
   */
  viewerCanResolve: boolean

  /**
   * Whether or not the viewer can unresolve this thread
   */
  viewerCanUnresolve: boolean
}

export interface ICommentsOnPullRequestReviewThreadArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The connection type for PullRequestReviewComment.
 */
export interface IPullRequestReviewCommentConnection {
  __typename: 'PullRequestReviewCommentConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestReviewCommentEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPullRequestReviewComment | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPullRequestReviewCommentEdge {
  __typename: 'PullRequestReviewCommentEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPullRequestReviewComment | null
}

/**
 * A review comment associated with a given repository pull request.
 */
export interface IPullRequestReviewComment {
  __typename: 'PullRequestReviewComment'

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the subject of the comment.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * The comment body of this review comment.
   */
  body: string

  /**
   * The comment body of this review comment rendered to HTML.
   */
  bodyHTML: any

  /**
   * The comment body of this review comment rendered as plain text.
   */
  bodyText: string

  /**
   * Identifies the commit associated with the comment.
   */
  commit: ICommit

  /**
   * Identifies when the comment was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The diff hunk to which the comment applies.
   */
  diffHunk: string

  /**
   * Identifies when the comment was created in a draft state.
   */
  draftedAt: any

  /**
   * The actor who edited the comment.
   */
  editor: Actor | null
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * Returns whether or not a comment has been minimized.
   */
  isMinimized: boolean

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * Returns why the comment was minimized.
   */
  minimizedReason: string | null

  /**
   * Identifies the original commit associated with the comment.
   */
  originalCommit: ICommit | null

  /**
   * The original line index in the diff to which the comment applies.
   */
  originalPosition: number

  /**
   * Identifies when the comment body is outdated
   */
  outdated: boolean

  /**
   * The path to which the comment applies.
   */
  path: string

  /**
   * The line index in the diff to which the comment applies.
   */
  position: number | null

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * The pull request associated with this review comment.
   */
  pullRequest: IPullRequest

  /**
   * The pull request review associated with this review comment.
   */
  pullRequestReview: IPullRequestReview | null

  /**
   * A list of reactions grouped by content left on the subject.
   */
  reactionGroups: IReactionGroup[] | null

  /**
   * A list of Reactions left on the Issue.
   */
  reactions: IReactionConnection

  /**
   * The comment this is a reply to.
   */
  replyTo: IPullRequestReviewComment | null

  /**
   * The repository associated with this node.
   */
  repository: IRepository

  /**
   * The HTTP path permalink for this review comment.
   */
  resourcePath: any

  /**
   * Identifies the state of the comment.
   */
  state: PullRequestReviewCommentState

  /**
   * Identifies when the comment was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL permalink for this review comment.
   */
  url: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Check if the current viewer can delete this object.
   */
  viewerCanDelete: boolean

  /**
   * Check if the current viewer can minimize this object.
   */
  viewerCanMinimize: boolean

  /**
   * Can user react to this subject
   */
  viewerCanReact: boolean

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean
}

export interface IReactionsOnPullRequestReviewCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Allows filtering Reactions by emoji.
   */
  content?: ReactionContent | null

  /**
   * Allows specifying the order in which reactions are returned.
   */
  orderBy?: IReactionOrder | null
}

export interface IUserContentEditsOnPullRequestReviewCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * A review object for a given pull request.
 */
export interface IPullRequestReview {
  __typename: 'PullRequestReview'

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the subject of the comment.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * Identifies the pull request review body.
   */
  body: string

  /**
   * The body of this review rendered to HTML.
   */
  bodyHTML: any

  /**
   * The body of this review rendered as plain text.
   */
  bodyText: string

  /**
   * A list of review comments for the current pull request review.
   */
  comments: IPullRequestReviewCommentConnection

  /**
   * Identifies the commit associated with this pull request review.
   */
  commit: ICommit | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The actor who edited the comment.
   */
  editor: Actor | null
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * A list of teams that this review was made on behalf of.
   */
  onBehalfOf: ITeamConnection

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * Identifies the pull request associated with this pull request review.
   */
  pullRequest: IPullRequest

  /**
   * A list of reactions grouped by content left on the subject.
   */
  reactionGroups: IReactionGroup[] | null

  /**
   * A list of Reactions left on the Issue.
   */
  reactions: IReactionConnection

  /**
   * The repository associated with this node.
   */
  repository: IRepository

  /**
   * The HTTP path permalink for this PullRequestReview.
   */
  resourcePath: any

  /**
   * Identifies the current state of the pull request review.
   */
  state: PullRequestReviewState

  /**
   * Identifies when the Pull Request Review was submitted
   */
  submittedAt: any | null

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL permalink for this PullRequestReview.
   */
  url: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Check if the current viewer can delete this object.
   */
  viewerCanDelete: boolean

  /**
   * Can user react to this subject
   */
  viewerCanReact: boolean

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean
}

export interface ICommentsOnPullRequestReviewArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IOnBehalfOfOnPullRequestReviewArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IReactionsOnPullRequestReviewArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Allows filtering Reactions by emoji.
   */
  content?: ReactionContent | null

  /**
   * Allows specifying the order in which reactions are returned.
   */
  orderBy?: IReactionOrder | null
}

export interface IUserContentEditsOnPullRequestReviewArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The possible states of a pull request review.
 */
export const enum PullRequestReviewState {
  /**
   * A review that has not yet been submitted.
   */
  PENDING = 'PENDING',

  /**
   * An informational review.
   */
  COMMENTED = 'COMMENTED',

  /**
   * A review allowing the pull request to merge.
   */
  APPROVED = 'APPROVED',

  /**
   * A review blocking the pull request from merging.
   */
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',

  /**
   * A review that has been dismissed.
   */
  DISMISSED = 'DISMISSED'
}

/**
 * The possible states of a pull request review comment.
 */
export const enum PullRequestReviewCommentState {
  /**
   * A comment that is part of a pending review
   */
  PENDING = 'PENDING',

  /**
   * A comment that is part of a submitted review
   */
  SUBMITTED = 'SUBMITTED'
}

/**
 * The connection type for PullRequestReview.
 */
export interface IPullRequestReviewConnection {
  __typename: 'PullRequestReviewConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestReviewEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPullRequestReview | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPullRequestReviewEdge {
  __typename: 'PullRequestReviewEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPullRequestReview | null
}

/**
 * A suggestion to review a pull request based on a user's commit history and review comments.
 */
export interface ISuggestedReviewer {
  __typename: 'SuggestedReviewer'

  /**
   * Is this suggestion based on past commits?
   */
  isAuthor: boolean

  /**
   * Is this suggestion based on past review comments?
   */
  isCommenter: boolean

  /**
   * Identifies the user suggested to review the pull request.
   */
  reviewer: IGitHubUser
}

/**
 * The connection type for PullRequestTimelineItem.
 */
export interface IPullRequestTimelineConnection {
  __typename: 'PullRequestTimelineConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestTimelineItemEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (PullRequestTimelineItem | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPullRequestTimelineItemEdge {
  __typename: 'PullRequestTimelineItemEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: PullRequestTimelineItem | null
}

/**
 * An item in an pull request timeline
 */
export type PullRequestTimelineItem =
  | ICommit
  | ICommitCommentThread
  | IPullRequestReview
  | IPullRequestReviewThread
  | IPullRequestReviewComment
  | IIssueComment
  | IClosedEvent
  | IReopenedEvent
  | ISubscribedEvent
  | IUnsubscribedEvent
  | IMergedEvent
  | IReferencedEvent
  | ICrossReferencedEvent
  | IAssignedEvent
  | IUnassignedEvent
  | ILabeledEvent
  | IUnlabeledEvent
  | IMilestonedEvent
  | IDemilestonedEvent
  | IRenamedTitleEvent
  | ILockedEvent
  | IUnlockedEvent
  | IDeployedEvent
  | IDeploymentEnvironmentChangedEvent
  | IHeadRefDeletedEvent
  | IHeadRefRestoredEvent
  | IHeadRefForcePushedEvent
  | IBaseRefForcePushedEvent
  | IReviewRequestedEvent
  | IReviewRequestRemovedEvent
  | IReviewDismissedEvent
  | IUserBlockedEvent

/**
 * A thread of comments on a commit.
 */
export interface ICommitCommentThread {
  __typename: 'CommitCommentThread'

  /**
   * The comments that exist in this thread.
   */
  comments: ICommitCommentConnection

  /**
   * The commit the comments were made on.
   */
  commit: ICommit
  id: string

  /**
   * The file the comments were made on.
   */
  path: string | null

  /**
   * The position in the diff for the commit that the comment was made on.
   */
  position: number | null

  /**
   * The repository associated with this node.
   */
  repository: IRepository
}

export interface ICommentsOnCommitCommentThreadArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Represents a 'closed' event on any `Closable`.
 */
export interface IClosedEvent {
  __typename: 'ClosedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Object that was closed.
   */
  closable: Closable

  /**
   * Object which triggered the creation of this event.
   */
  closer: Closer | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * The HTTP path for this closed event.
   */
  resourcePath: any

  /**
   * The HTTP URL for this closed event.
   */
  url: any
}

/**
 * The object which triggered a `ClosedEvent`.
 */
export type Closer = ICommit | IPullRequest

/**
 * Represents a 'reopened' event on any `Closable`.
 */
export interface IReopenedEvent {
  __typename: 'ReopenedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Object that was reopened.
   */
  closable: Closable

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string
}

/**
 * Represents a 'subscribed' event on a given `Subscribable`.
 */
export interface ISubscribedEvent {
  __typename: 'SubscribedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Object referenced by event.
   */
  subscribable: Subscribable
}

/**
 * Represents an 'unsubscribed' event on a given `Subscribable`.
 */
export interface IUnsubscribedEvent {
  __typename: 'UnsubscribedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Object referenced by event.
   */
  subscribable: Subscribable
}

/**
 * Represents a 'merged' event on a given pull request.
 */
export interface IMergedEvent {
  __typename: 'MergedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the commit associated with the `merge` event.
   */
  commit: ICommit | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the Ref associated with the `merge` event.
   */
  mergeRef: IRef | null

  /**
   * Identifies the name of the Ref associated with the `merge` event.
   */
  mergeRefName: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest

  /**
   * The HTTP path for this merged event.
   */
  resourcePath: any

  /**
   * The HTTP URL for this merged event.
   */
  url: any
}

/**
 * Represents a 'referenced' event on a given `ReferencedSubject`.
 */
export interface IReferencedEvent {
  __typename: 'ReferencedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the commit associated with the 'referenced' event.
   */
  commit: ICommit | null

  /**
   * Identifies the repository associated with the 'referenced' event.
   */
  commitRepository: IRepository

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Reference originated in a different repository.
   */
  isCrossRepository: boolean

  /**
   * Checks if the commit message itself references the subject. Can be false in the case of a commit comment reference.
   */
  isDirectReference: boolean

  /**
   * Object referenced by event.
   */
  subject: ReferencedSubject
}

/**
 * Any referencable object
 */
export type ReferencedSubject = IIssue | IPullRequest

/**
 * Represents a mention made by one issue or pull request to another.
 */
export interface ICrossReferencedEvent {
  __typename: 'CrossReferencedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Reference originated in a different repository.
   */
  isCrossRepository: boolean

  /**
   * Identifies when the reference was made.
   */
  referencedAt: any

  /**
   * The HTTP path for this pull request.
   */
  resourcePath: any

  /**
   * Issue or pull request that made the reference.
   */
  source: ReferencedSubject

  /**
   * Issue or pull request to which the reference was made.
   */
  target: ReferencedSubject

  /**
   * The HTTP URL for this pull request.
   */
  url: any

  /**
   * Checks if the target will be closed when the source is merged.
   */
  willCloseTarget: boolean
}

/**
 * Represents an 'assigned' event on any assignable object.
 */
export interface IAssignedEvent {
  __typename: 'AssignedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the assignable associated with the event.
   */
  assignable: Assignable

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the user who was assigned.
   */
  user: IGitHubUser | null
}

/**
 * Represents an 'unassigned' event on any assignable object.
 */
export interface IUnassignedEvent {
  __typename: 'UnassignedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the assignable associated with the event.
   */
  assignable: Assignable

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the subject (user) who was unassigned.
   */
  user: IGitHubUser | null
}

/**
 * Represents a 'labeled' event on a given issue or pull request.
 */
export interface ILabeledEvent {
  __typename: 'LabeledEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the label associated with the 'labeled' event.
   */
  label: ILabel

  /**
   * Identifies the `Labelable` associated with the event.
   */
  labelable: Labelable
}

/**
 * Represents an 'unlabeled' event on a given issue or pull request.
 */
export interface IUnlabeledEvent {
  __typename: 'UnlabeledEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the label associated with the 'unlabeled' event.
   */
  label: ILabel

  /**
   * Identifies the `Labelable` associated with the event.
   */
  labelable: Labelable
}

/**
 * Represents a 'milestoned' event on a given issue or pull request.
 */
export interface IMilestonedEvent {
  __typename: 'MilestonedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the milestone title associated with the 'milestoned' event.
   */
  milestoneTitle: string

  /**
   * Object referenced by event.
   */
  subject: MilestoneItem
}

/**
 * Types that can be inside a Milestone.
 */
export type MilestoneItem = IIssue | IPullRequest

/**
 * Represents a 'demilestoned' event on a given issue or pull request.
 */
export interface IDemilestonedEvent {
  __typename: 'DemilestonedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the milestone title associated with the 'demilestoned' event.
   */
  milestoneTitle: string

  /**
   * Object referenced by event.
   */
  subject: MilestoneItem
}

/**
 * Represents a 'renamed' event on a given issue or pull request
 */
export interface IRenamedTitleEvent {
  __typename: 'RenamedTitleEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the current title of the issue or pull request.
   */
  currentTitle: string
  id: string

  /**
   * Identifies the previous title of the issue or pull request.
   */
  previousTitle: string

  /**
   * Subject that was renamed.
   */
  subject: RenamedTitleSubject
}

/**
 * An object which has a renamable title
 */
export type RenamedTitleSubject = IIssue | IPullRequest

/**
 * Represents a 'locked' event on a given issue or pull request.
 */
export interface ILockedEvent {
  __typename: 'LockedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Reason that the conversation was locked (optional).
   */
  lockReason: LockReason | null

  /**
   * Object that was locked.
   */
  lockable: Lockable
}

/**
 * Represents an 'unlocked' event on a given issue or pull request.
 */
export interface IUnlockedEvent {
  __typename: 'UnlockedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Object that was unlocked.
   */
  lockable: Lockable
}

/**
 * Represents a 'deployed' event on a given pull request.
 */
export interface IDeployedEvent {
  __typename: 'DeployedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The deployment associated with the 'deployed' event.
   */
  deployment: IDeployment
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest

  /**
   * The ref associated with the 'deployed' event.
   */
  ref: IRef | null
}

/**
 * Represents a 'deployment_environment_changed' event on a given pull request.
 */
export interface IDeploymentEnvironmentChangedEvent {
  __typename: 'DeploymentEnvironmentChangedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The deployment status that updated the deployment environment.
   */
  deploymentStatus: IDeploymentStatus
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest
}

/**
 * Represents a 'head_ref_deleted' event on a given pull request.
 */
export interface IHeadRefDeletedEvent {
  __typename: 'HeadRefDeletedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the Ref associated with the `head_ref_deleted` event.
   */
  headRef: IRef | null

  /**
   * Identifies the name of the Ref associated with the `head_ref_deleted` event.
   */
  headRefName: string
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest
}

/**
 * Represents a 'head_ref_restored' event on a given pull request.
 */
export interface IHeadRefRestoredEvent {
  __typename: 'HeadRefRestoredEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest
}

/**
 * Represents a 'head_ref_force_pushed' event on a given pull request.
 */
export interface IHeadRefForcePushedEvent {
  __typename: 'HeadRefForcePushedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the after commit SHA for the 'head_ref_force_pushed' event.
   */
  afterCommit: ICommit | null

  /**
   * Identifies the before commit SHA for the 'head_ref_force_pushed' event.
   */
  beforeCommit: ICommit | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest

  /**
   * Identifies the fully qualified ref name for the 'head_ref_force_pushed' event.
   */
  ref: IRef | null
}

/**
 * Represents a 'base_ref_force_pushed' event on a given pull request.
 */
export interface IBaseRefForcePushedEvent {
  __typename: 'BaseRefForcePushedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the after commit SHA for the 'base_ref_force_pushed' event.
   */
  afterCommit: ICommit | null

  /**
   * Identifies the before commit SHA for the 'base_ref_force_pushed' event.
   */
  beforeCommit: ICommit | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest

  /**
   * Identifies the fully qualified ref name for the 'base_ref_force_pushed' event.
   */
  ref: IRef | null
}

/**
 * Represents an 'review_requested' event on a given pull request.
 */
export interface IReviewRequestedEvent {
  __typename: 'ReviewRequestedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest

  /**
   * Identifies the reviewer whose review was requested.
   */
  requestedReviewer: RequestedReviewer | null
}

/**
 * Represents an 'review_request_removed' event on a given pull request.
 */
export interface IReviewRequestRemovedEvent {
  __typename: 'ReviewRequestRemovedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest

  /**
   * Identifies the reviewer whose review request was removed.
   */
  requestedReviewer: RequestedReviewer | null
}

/**
 * Represents a 'review_dismissed' event on a given issue or pull request.
 */
export interface IReviewDismissedEvent {
  __typename: 'ReviewDismissedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * Identifies the optional message associated with the 'review_dismissed' event.
   */
  dismissalMessage: string | null

  /**
   * Identifies the optional message associated with the event, rendered to HTML.
   */
  dismissalMessageHTML: string | null
  id: string

  /**
   * Identifies the message associated with the 'review_dismissed' event.
   * @deprecated "`message` is being removed because it not nullable, whereas the underlying field is optional. Use `dismissalMessage` instead. Removal on 2019-07-01 UTC."
   */
  message: string

  /**
   * The message associated with the event, rendered to HTML.
   * @deprecated "`messageHtml` is being removed because it not nullable, whereas the underlying field is optional. Use `dismissalMessageHTML` instead. Removal on 2019-07-01 UTC."
   */
  messageHtml: any

  /**
   * Identifies the previous state of the review with the 'review_dismissed' event.
   */
  previousReviewState: PullRequestReviewState

  /**
   * PullRequest referenced by event.
   */
  pullRequest: IPullRequest

  /**
   * Identifies the commit which caused the review to become stale.
   */
  pullRequestCommit: IPullRequestCommit | null

  /**
   * The HTTP path for this review dismissed event.
   */
  resourcePath: any

  /**
   * Identifies the review associated with the 'review_dismissed' event.
   */
  review: IPullRequestReview | null

  /**
   * The HTTP URL for this review dismissed event.
   */
  url: any
}

/**
 * Represents a 'user_blocked' event on a given user.
 */
export interface IUserBlockedEvent {
  __typename: 'UserBlockedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Number of days that the user was blocked for.
   */
  blockDuration: UserBlockDuration

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * The user who was blocked.
   */
  subject: IGitHubUser | null
}

/**
 * The possible durations that a user can be blocked for.
 */
export const enum UserBlockDuration {
  /**
   * The user was blocked for 1 day
   */
  ONE_DAY = 'ONE_DAY',

  /**
   * The user was blocked for 3 days
   */
  THREE_DAYS = 'THREE_DAYS',

  /**
   * The user was blocked for 7 days
   */
  ONE_WEEK = 'ONE_WEEK',

  /**
   * The user was blocked for 30 days
   */
  ONE_MONTH = 'ONE_MONTH',

  /**
   * The user was blocked permanently
   */
  PERMANENT = 'PERMANENT'
}

/**
 * The possible item types found in a timeline.
 */
export const enum PullRequestTimelineItemsItemType {
  /**
   * Represents a Git commit part of a pull request.
   */
  PULL_REQUEST_COMMIT = 'PULL_REQUEST_COMMIT',

  /**
   * Represents a commit comment thread part of a pull request.
   */
  PULL_REQUEST_COMMIT_COMMENT_THREAD = 'PULL_REQUEST_COMMIT_COMMENT_THREAD',

  /**
   * A review object for a given pull request.
   */
  PULL_REQUEST_REVIEW = 'PULL_REQUEST_REVIEW',

  /**
   * A threaded list of comments for a given pull request.
   */
  PULL_REQUEST_REVIEW_THREAD = 'PULL_REQUEST_REVIEW_THREAD',

  /**
   * Represents the latest point in the pull request timeline for which the viewer has seen the pull request's commits.
   */
  PULL_REQUEST_REVISION_MARKER = 'PULL_REQUEST_REVISION_MARKER',

  /**
   * Represents a 'base_ref_changed' event on a given issue or pull request.
   */
  BASE_REF_CHANGED_EVENT = 'BASE_REF_CHANGED_EVENT',

  /**
   * Represents a 'base_ref_force_pushed' event on a given pull request.
   */
  BASE_REF_FORCE_PUSHED_EVENT = 'BASE_REF_FORCE_PUSHED_EVENT',

  /**
   * Represents a 'deployed' event on a given pull request.
   */
  DEPLOYED_EVENT = 'DEPLOYED_EVENT',

  /**
   * Represents a 'deployment_environment_changed' event on a given pull request.
   */
  DEPLOYMENT_ENVIRONMENT_CHANGED_EVENT = 'DEPLOYMENT_ENVIRONMENT_CHANGED_EVENT',

  /**
   * Represents a 'head_ref_deleted' event on a given pull request.
   */
  HEAD_REF_DELETED_EVENT = 'HEAD_REF_DELETED_EVENT',

  /**
   * Represents a 'head_ref_force_pushed' event on a given pull request.
   */
  HEAD_REF_FORCE_PUSHED_EVENT = 'HEAD_REF_FORCE_PUSHED_EVENT',

  /**
   * Represents a 'head_ref_restored' event on a given pull request.
   */
  HEAD_REF_RESTORED_EVENT = 'HEAD_REF_RESTORED_EVENT',

  /**
   * Represents a 'merged' event on a given pull request.
   */
  MERGED_EVENT = 'MERGED_EVENT',

  /**
   * Represents a 'review_dismissed' event on a given issue or pull request.
   */
  REVIEW_DISMISSED_EVENT = 'REVIEW_DISMISSED_EVENT',

  /**
   * Represents an 'review_requested' event on a given pull request.
   */
  REVIEW_REQUESTED_EVENT = 'REVIEW_REQUESTED_EVENT',

  /**
   * Represents an 'review_request_removed' event on a given pull request.
   */
  REVIEW_REQUEST_REMOVED_EVENT = 'REVIEW_REQUEST_REMOVED_EVENT',

  /**
   * Represents a comment on an Issue.
   */
  ISSUE_COMMENT = 'ISSUE_COMMENT',

  /**
   * Represents a mention made by one issue or pull request to another.
   */
  CROSS_REFERENCED_EVENT = 'CROSS_REFERENCED_EVENT',

  /**
   * Represents a 'added_to_project' event on a given issue or pull request.
   */
  ADDED_TO_PROJECT_EVENT = 'ADDED_TO_PROJECT_EVENT',

  /**
   * Represents an 'assigned' event on any assignable object.
   */
  ASSIGNED_EVENT = 'ASSIGNED_EVENT',

  /**
   * Represents a 'closed' event on any `Closable`.
   */
  CLOSED_EVENT = 'CLOSED_EVENT',

  /**
   * Represents a 'comment_deleted' event on a given issue or pull request.
   */
  COMMENT_DELETED_EVENT = 'COMMENT_DELETED_EVENT',

  /**
   * Represents a 'converted_note_to_issue' event on a given issue or pull request.
   */
  CONVERTED_NOTE_TO_ISSUE_EVENT = 'CONVERTED_NOTE_TO_ISSUE_EVENT',

  /**
   * Represents a 'demilestoned' event on a given issue or pull request.
   */
  DEMILESTONED_EVENT = 'DEMILESTONED_EVENT',

  /**
   * Represents a 'labeled' event on a given issue or pull request.
   */
  LABELED_EVENT = 'LABELED_EVENT',

  /**
   * Represents a 'locked' event on a given issue or pull request.
   */
  LOCKED_EVENT = 'LOCKED_EVENT',

  /**
   * Represents a 'mentioned' event on a given issue or pull request.
   */
  MENTIONED_EVENT = 'MENTIONED_EVENT',

  /**
   * Represents a 'milestoned' event on a given issue or pull request.
   */
  MILESTONED_EVENT = 'MILESTONED_EVENT',

  /**
   * Represents a 'moved_columns_in_project' event on a given issue or pull request.
   */
  MOVED_COLUMNS_IN_PROJECT_EVENT = 'MOVED_COLUMNS_IN_PROJECT_EVENT',

  /**
   * Represents a 'pinned' event on a given issue or pull request.
   */
  PINNED_EVENT = 'PINNED_EVENT',

  /**
   * Represents a 'referenced' event on a given `ReferencedSubject`.
   */
  REFERENCED_EVENT = 'REFERENCED_EVENT',

  /**
   * Represents a 'removed_from_project' event on a given issue or pull request.
   */
  REMOVED_FROM_PROJECT_EVENT = 'REMOVED_FROM_PROJECT_EVENT',

  /**
   * Represents a 'renamed' event on a given issue or pull request
   */
  RENAMED_TITLE_EVENT = 'RENAMED_TITLE_EVENT',

  /**
   * Represents a 'reopened' event on any `Closable`.
   */
  REOPENED_EVENT = 'REOPENED_EVENT',

  /**
   * Represents a 'subscribed' event on a given `Subscribable`.
   */
  SUBSCRIBED_EVENT = 'SUBSCRIBED_EVENT',

  /**
   * Represents a 'transferred' event on a given issue or pull request.
   */
  TRANSFERRED_EVENT = 'TRANSFERRED_EVENT',

  /**
   * Represents an 'unassigned' event on any assignable object.
   */
  UNASSIGNED_EVENT = 'UNASSIGNED_EVENT',

  /**
   * Represents an 'unlabeled' event on a given issue or pull request.
   */
  UNLABELED_EVENT = 'UNLABELED_EVENT',

  /**
   * Represents an 'unlocked' event on a given issue or pull request.
   */
  UNLOCKED_EVENT = 'UNLOCKED_EVENT',

  /**
   * Represents a 'user_blocked' event on a given user.
   */
  USER_BLOCKED_EVENT = 'USER_BLOCKED_EVENT',

  /**
   * Represents an 'unpinned' event on a given issue or pull request.
   */
  UNPINNED_EVENT = 'UNPINNED_EVENT',

  /**
   * Represents an 'unsubscribed' event on a given `Subscribable`.
   */
  UNSUBSCRIBED_EVENT = 'UNSUBSCRIBED_EVENT'
}

/**
 * The connection type for PullRequestTimelineItems.
 */
export interface IPullRequestTimelineItemsConnection {
  __typename: 'PullRequestTimelineItemsConnection'

  /**
   * A list of edges.
   */
  edges: (IPullRequestTimelineItemsEdge | null)[] | null

  /**
   * Identifies the count of items after applying `before` and `after` filters.
   */
  filteredCount: number

  /**
   * A list of nodes.
   */
  nodes: (PullRequestTimelineItems | null)[] | null

  /**
   * Identifies the count of items after applying `before`/`after` filters and `first`/`last`/`skip` slicing.
   */
  pageCount: number

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number

  /**
   * Identifies the date and time when the timeline was last updated.
   */
  updatedAt: any
}

/**
 * An edge in a connection.
 */
export interface IPullRequestTimelineItemsEdge {
  __typename: 'PullRequestTimelineItemsEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: PullRequestTimelineItems | null
}

/**
 * An item in a pull request timeline
 */
export type PullRequestTimelineItems =
  | IPullRequestCommit
  | IPullRequestCommitCommentThread
  | IPullRequestReview
  | IPullRequestReviewThread
  | IPullRequestRevisionMarker
  | IBaseRefChangedEvent
  | IBaseRefForcePushedEvent
  | IDeployedEvent
  | IDeploymentEnvironmentChangedEvent
  | IHeadRefDeletedEvent
  | IHeadRefForcePushedEvent
  | IHeadRefRestoredEvent
  | IMergedEvent
  | IReviewDismissedEvent
  | IReviewRequestedEvent
  | IReviewRequestRemovedEvent
  | IIssueComment
  | ICrossReferencedEvent
  | IAddedToProjectEvent
  | IAssignedEvent
  | IClosedEvent
  | ICommentDeletedEvent
  | IConvertedNoteToIssueEvent
  | IDemilestonedEvent
  | ILabeledEvent
  | ILockedEvent
  | IMentionedEvent
  | IMilestonedEvent
  | IMovedColumnsInProjectEvent
  | IPinnedEvent
  | IReferencedEvent
  | IRemovedFromProjectEvent
  | IRenamedTitleEvent
  | IReopenedEvent
  | ISubscribedEvent
  | ITransferredEvent
  | IUnassignedEvent
  | IUnlabeledEvent
  | IUnlockedEvent
  | IUserBlockedEvent
  | IUnpinnedEvent
  | IUnsubscribedEvent

/**
 * Represents a commit comment thread part of a pull request.
 */
export interface IPullRequestCommitCommentThread {
  __typename: 'PullRequestCommitCommentThread'

  /**
   * The comments that exist in this thread.
   */
  comments: ICommitCommentConnection

  /**
   * The commit the comments were made on.
   */
  commit: ICommit
  id: string

  /**
   * The file the comments were made on.
   */
  path: string | null

  /**
   * The position in the diff for the commit that the comment was made on.
   */
  position: number | null

  /**
   * The pull request this commit comment thread belongs to
   */
  pullRequest: IPullRequest

  /**
   * The repository associated with this node.
   */
  repository: IRepository
}

export interface ICommentsOnPullRequestCommitCommentThreadArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Represents the latest point in the pull request timeline for which the viewer has seen the pull request's commits.
 */
export interface IPullRequestRevisionMarker {
  __typename: 'PullRequestRevisionMarker'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The last commit the viewer has seen.
   */
  lastSeenCommit: ICommit

  /**
   * The pull request to which the marker belongs.
   */
  pullRequest: IPullRequest
}

/**
 * Represents a 'base_ref_changed' event on a given issue or pull request.
 */
export interface IBaseRefChangedEvent {
  __typename: 'BaseRefChangedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string
}

/**
 * Represents a 'added_to_project' event on a given issue or pull request.
 */
export interface IAddedToProjectEvent {
  __typename: 'AddedToProjectEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string
}

/**
 * Represents a 'comment_deleted' event on a given issue or pull request.
 */
export interface ICommentDeletedEvent {
  __typename: 'CommentDeletedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string
}

/**
 * Represents a 'converted_note_to_issue' event on a given issue or pull request.
 */
export interface IConvertedNoteToIssueEvent {
  __typename: 'ConvertedNoteToIssueEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string
}

/**
 * Represents a 'mentioned' event on a given issue or pull request.
 */
export interface IMentionedEvent {
  __typename: 'MentionedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string
}

/**
 * Represents a 'moved_columns_in_project' event on a given issue or pull request.
 */
export interface IMovedColumnsInProjectEvent {
  __typename: 'MovedColumnsInProjectEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string
}

/**
 * Represents a 'pinned' event on a given issue or pull request.
 */
export interface IPinnedEvent {
  __typename: 'PinnedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the issue associated with the event.
   */
  issue: IIssue
}

/**
 * Represents a 'removed_from_project' event on a given issue or pull request.
 */
export interface IRemovedFromProjectEvent {
  __typename: 'RemovedFromProjectEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string
}

/**
 * Represents a 'transferred' event on a given issue or pull request.
 */
export interface ITransferredEvent {
  __typename: 'TransferredEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The repository this came from
   */
  fromRepository: IRepository | null
  id: string

  /**
   * Identifies the issue associated with the event.
   */
  issue: IIssue
}

/**
 * Represents an 'unpinned' event on a given issue or pull request.
 */
export interface IUnpinnedEvent {
  __typename: 'UnpinnedEvent'

  /**
   * Identifies the actor who performed the event.
   */
  actor: Actor | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * Identifies the issue associated with the event.
   */
  issue: IIssue
}

/**
 * The connection type for Ref.
 */
export interface IRefConnection {
  __typename: 'RefConnection'

  /**
   * A list of edges.
   */
  edges: (IRefEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IRef | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IRefEdge {
  __typename: 'RefEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IRef | null
}

/**
 * The connection type for PushAllowance.
 */
export interface IPushAllowanceConnection {
  __typename: 'PushAllowanceConnection'

  /**
   * A list of edges.
   */
  edges: (IPushAllowanceEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPushAllowance | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPushAllowanceEdge {
  __typename: 'PushAllowanceEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPushAllowance | null
}

/**
 * A team or user who has the ability to push to a protected branch.
 */
export interface IPushAllowance {
  __typename: 'PushAllowance'

  /**
   * The actor that can push.
   */
  actor: PushAllowanceActor | null

  /**
   * Identifies the branch protection rule associated with the allowed user or team.
   */
  branchProtectionRule: IBranchProtectionRule | null
  id: string
}

/**
 * Types that can be an actor.
 */
export type PushAllowanceActor = IGitHubUser | ITeam

/**
 * The connection type for ReviewDismissalAllowance.
 */
export interface IReviewDismissalAllowanceConnection {
  __typename: 'ReviewDismissalAllowanceConnection'

  /**
   * A list of edges.
   */
  edges: (IReviewDismissalAllowanceEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IReviewDismissalAllowance | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IReviewDismissalAllowanceEdge {
  __typename: 'ReviewDismissalAllowanceEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IReviewDismissalAllowance | null
}

/**
 * A team or user who has the ability to dismiss a review on a protected branch.
 */
export interface IReviewDismissalAllowance {
  __typename: 'ReviewDismissalAllowance'

  /**
   * The actor that can dismiss.
   */
  actor: ReviewDismissalAllowanceActor | null

  /**
   * Identifies the branch protection rule associated with the allowed user or team.
   */
  branchProtectionRule: IBranchProtectionRule | null
  id: string
}

/**
 * Types that can be an actor.
 */
export type ReviewDismissalAllowanceActor = IGitHubUser | ITeam

/**
 * Collaborators affiliation level with a subject.
 */
export const enum CollaboratorAffiliation {
  /**
   * All outside collaborators of an organization-owned subject.
   */
  OUTSIDE = 'OUTSIDE',

  /**
   * All collaborators with permissions to an organization-owned subject, regardless of organization membership status.
   */
  DIRECT = 'DIRECT',

  /**
   * All collaborators the authenticated user can see.
   */
  ALL = 'ALL'
}

/**
 * The connection type for User.
 */
export interface IRepositoryCollaboratorConnection {
  __typename: 'RepositoryCollaboratorConnection'

  /**
   * A list of edges.
   */
  edges: (IRepositoryCollaboratorEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a user who is a collaborator of a repository.
 */
export interface IRepositoryCollaboratorEdge {
  __typename: 'RepositoryCollaboratorEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string
  node: IGitHubUser

  /**
   * The permission the user has on the repository.
   */
  permission: RepositoryPermission

  /**
   * A list of sources for the user's access to the repository.
   */
  permissionSources: IPermissionSource[] | null
}

/**
 * A level of permission and source for a user's access to a repository.
 */
export interface IPermissionSource {
  __typename: 'PermissionSource'

  /**
   * The organization the repository belongs to.
   */
  organization: IOrganization

  /**
   * The level of access this source has granted to the user.
   */
  permission: DefaultRepositoryPermissionField

  /**
   * The source of this permission.
   */
  source: PermissionGranter
}

/**
 * The possible default permissions for repositories.
 */
export const enum DefaultRepositoryPermissionField {
  /**
   * No access
   */
  NONE = 'NONE',

  /**
   * Can read repos by default
   */
  READ = 'READ',

  /**
   * Can read and write repos by default
   */
  WRITE = 'WRITE',

  /**
   * Can read, write, and administrate repos by default
   */
  ADMIN = 'ADMIN'
}

/**
 * Types that can grant permissions on a repository to a user
 */
export type PermissionGranter = IOrganization | IRepository | ITeam

/**
 * The connection type for DeployKey.
 */
export interface IDeployKeyConnection {
  __typename: 'DeployKeyConnection'

  /**
   * A list of edges.
   */
  edges: (IDeployKeyEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IDeployKey | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IDeployKeyEdge {
  __typename: 'DeployKeyEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IDeployKey | null
}

/**
 * A repository deploy key.
 */
export interface IDeployKey {
  __typename: 'DeployKey'

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any
  id: string

  /**
   * The deploy key.
   */
  key: string

  /**
   * Whether or not the deploy key is read only.
   */
  readOnly: boolean

  /**
   * The deploy key title.
   */
  title: string

  /**
   * Whether or not the deploy key has been verified.
   */
  verified: boolean
}

/**
 * Used for return value of Repository.issueOrPullRequest.
 */
export type IssueOrPullRequest = IIssue | IPullRequest

/**
 * Ordering options for language connections.
 */
export interface ILanguageOrder {
  /**
   * The field to order languages by.
   */
  field: LanguageOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which language connections can be ordered.
 */
export const enum LanguageOrderField {
  /**
   * Order languages by the size of all files containing the language
   */
  SIZE = 'SIZE'
}

/**
 * A list of languages associated with the parent.
 */
export interface ILanguageConnection {
  __typename: 'LanguageConnection'

  /**
   * A list of edges.
   */
  edges: (ILanguageEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ILanguage | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number

  /**
   * The total size in bytes of files written in that language.
   */
  totalSize: number
}

/**
 * Represents the language of a repository.
 */
export interface ILanguageEdge {
  __typename: 'LanguageEdge'
  cursor: string
  node: ILanguage

  /**
   * The number of bytes of code written in the language.
   */
  size: number
}

/**
 * Represents a given language found in repositories.
 */
export interface ILanguage {
  __typename: 'Language'

  /**
   * The color defined for the current language.
   */
  color: string | null
  id: string

  /**
   * The name of the current language.
   */
  name: string
}

/**
 * Ordering options for milestone connections.
 */
export interface IMilestoneOrder {
  /**
   * The field to order milestones by.
   */
  field: MilestoneOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which milestone connections can be ordered.
 */
export const enum MilestoneOrderField {
  /**
   * Order milestones by when they are due.
   */
  DUE_DATE = 'DUE_DATE',

  /**
   * Order milestones by when they were created.
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order milestones by when they were last updated.
   */
  UPDATED_AT = 'UPDATED_AT',

  /**
   * Order milestones by their number.
   */
  NUMBER = 'NUMBER'
}

/**
 * The connection type for Milestone.
 */
export interface IMilestoneConnection {
  __typename: 'MilestoneConnection'

  /**
   * A list of edges.
   */
  edges: (IMilestoneEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IMilestone | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IMilestoneEdge {
  __typename: 'MilestoneEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IMilestone | null
}

/**
 * Ways in which lists of projects can be ordered upon return.
 */
export interface IProjectOrder {
  /**
   * The field in which to order projects by.
   */
  field: ProjectOrderField

  /**
   * The direction in which to order projects by the specified field.
   */
  direction: OrderDirection
}

/**
 * Properties by which project connections can be ordered.
 */
export const enum ProjectOrderField {
  /**
   * Order projects by creation time
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order projects by update time
   */
  UPDATED_AT = 'UPDATED_AT',

  /**
   * Order projects by name
   */
  NAME = 'NAME'
}

/**
 * State of the project; either 'open' or 'closed'
 */
export const enum ProjectState {
  /**
   * The project is open.
   */
  OPEN = 'OPEN',

  /**
   * The project is closed.
   */
  CLOSED = 'CLOSED'
}

/**
 * A list of projects associated with the owner.
 */
export interface IProjectConnection {
  __typename: 'ProjectConnection'

  /**
   * A list of edges.
   */
  edges: (IProjectEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IProject | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IProjectEdge {
  __typename: 'ProjectEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IProject | null
}

/**
 * Ways in which lists of git refs can be ordered upon return.
 */
export interface IRefOrder {
  /**
   * The field in which to order refs by.
   */
  field: RefOrderField

  /**
   * The direction in which to order refs by the specified field.
   */
  direction: OrderDirection
}

/**
 * Properties by which ref connections can be ordered.
 */
export const enum RefOrderField {
  /**
   * Order refs by underlying commit date if the ref prefix is refs/tags/
   */
  TAG_COMMIT_DATE = 'TAG_COMMIT_DATE',

  /**
   * Order refs by their alphanumeric name
   */
  ALPHABETICAL = 'ALPHABETICAL'
}

/**
 * A release contains the content for a release.
 */
export interface IRelease {
  __typename: 'Release'

  /**
   * The author of the release
   */
  author: IGitHubUser | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the description of the release.
   */
  description: string | null
  id: string

  /**
   * Whether or not the release is a draft
   */
  isDraft: boolean

  /**
   * Whether or not the release is a prerelease
   */
  isPrerelease: boolean

  /**
   * Identifies the title of the release.
   */
  name: string | null

  /**
   * Identifies the date and time when the release was created.
   */
  publishedAt: any | null

  /**
   * List of releases assets which are dependent on this release.
   */
  releaseAssets: IReleaseAssetConnection

  /**
   * The HTTP path for this issue
   */
  resourcePath: any

  /**
   * The Git tag the release points to
   */
  tag: IRef | null

  /**
   * The name of the release's Git tag
   */
  tagName: string

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this issue
   */
  url: any
}

export interface IReleaseAssetsOnReleaseArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * A list of names to filter the assets by.
   */
  name?: string | null
}

/**
 * The connection type for ReleaseAsset.
 */
export interface IReleaseAssetConnection {
  __typename: 'ReleaseAssetConnection'

  /**
   * A list of edges.
   */
  edges: (IReleaseAssetEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IReleaseAsset | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IReleaseAssetEdge {
  __typename: 'ReleaseAssetEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IReleaseAsset | null
}

/**
 * A release asset contains the content for a release asset.
 */
export interface IReleaseAsset {
  __typename: 'ReleaseAsset'

  /**
   * The asset's content-type
   */
  contentType: string

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The number of times this asset was downloaded
   */
  downloadCount: number

  /**
   * Identifies the URL where you can download the release asset via the browser.
   */
  downloadUrl: any
  id: string

  /**
   * Identifies the title of the release asset.
   */
  name: string

  /**
   * Release that the asset is associated with
   */
  release: IRelease | null

  /**
   * The size (in bytes) of the asset
   */
  size: number

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The user that performed the upload
   */
  uploadedBy: IGitHubUser

  /**
   * Identifies the URL of the release asset.
   */
  url: any
}

/**
 * Ways in which lists of releases can be ordered upon return.
 */
export interface IReleaseOrder {
  /**
   * The field in which to order releases by.
   */
  field: ReleaseOrderField

  /**
   * The direction in which to order releases by the specified field.
   */
  direction: OrderDirection
}

/**
 * Properties by which release connections can be ordered.
 */
export const enum ReleaseOrderField {
  /**
   * Order releases by creation time
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order releases alphabetically by name
   */
  NAME = 'NAME'
}

/**
 * The connection type for Release.
 */
export interface IReleaseConnection {
  __typename: 'ReleaseConnection'

  /**
   * A list of edges.
   */
  edges: (IReleaseEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IRelease | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IReleaseEdge {
  __typename: 'ReleaseEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IRelease | null
}

/**
 * The connection type for RepositoryTopic.
 */
export interface IRepositoryTopicConnection {
  __typename: 'RepositoryTopicConnection'

  /**
   * A list of edges.
   */
  edges: (IRepositoryTopicEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IRepositoryTopic | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IRepositoryTopicEdge {
  __typename: 'RepositoryTopicEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IRepositoryTopic | null
}

/**
 * A repository-topic connects a repository to a topic.
 */
export interface IRepositoryTopic {
  __typename: 'RepositoryTopic'
  id: string

  /**
   * The HTTP path for this repository-topic.
   */
  resourcePath: any

  /**
   * The topic.
   */
  topic: ITopic

  /**
   * The HTTP URL for this repository-topic.
   */
  url: any
}

/**
 * A topic aggregates entities that are related to a subject.
 */
export interface ITopic {
  __typename: 'Topic'
  id: string

  /**
   * The topic's name.
   */
  name: string

  /**
   * A list of related topics, including aliases of this topic, sorted with the most relevant
   * first. Returns up to 10 Topics.
   *
   */
  relatedTopics: ITopic[]

  /**
   * A list of users who have starred this starrable.
   */
  stargazers: IStargazerConnection

  /**
   * Returns a boolean indicating whether the viewing user has starred this starrable.
   */
  viewerHasStarred: boolean
}

export interface IRelatedTopicsOnTopicArguments {
  /**
   * How many topics to return.
   * @default 3
   */
  first?: number | null
}

export interface IStargazersOnTopicArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Order for connection
   */
  orderBy?: IStarOrder | null
}

/**
 * Represents any entity on GitHub that has a profile page.
 */
export type ProfileOwner = IOrganization | IGitHubUser

/**
 * Represents any entity on GitHub that has a profile page.
 */
export interface IProfileOwner {
  __typename: 'ProfileOwner'

  /**
   * Determine if this repository owner has any items that can be pinned to their profile.
   */
  anyPinnableItems: boolean

  /**
   * The public profile email.
   */
  email: string | null
  id: string

  /**
   * Showcases a selection of repositories and gists that the profile owner has either curated or that have been selected automatically based on popularity.
   */
  itemShowcase: IProfileItemShowcase

  /**
   * The public profile location.
   */
  location: string | null

  /**
   * The username used to login.
   */
  login: string

  /**
   * The public profile name.
   */
  name: string | null

  /**
   * A list of repositories and gists this profile owner can pin to their profile.
   */
  pinnableItems: IPinnableItemConnection

  /**
   * A list of repositories and gists this profile owner has pinned to their profile
   */
  pinnedItems: IPinnableItemConnection

  /**
   * Returns how many more items this profile owner can pin to their profile.
   */
  pinnedItemsRemaining: number

  /**
   * Can the viewer pin repositories and gists to the profile?
   */
  viewerCanChangePinnedItems: boolean

  /**
   * The public profile website URL.
   */
  websiteUrl: any | null
}

export interface IAnyPinnableItemsOnProfileOwnerArguments {
  /**
   * Filter to only a particular kind of pinnable item.
   */
  type?: PinnableItemType | null
}

export interface IPinnableItemsOnProfileOwnerArguments {
  /**
   * Filter the types of pinnable items that are returned.
   */
  types?: PinnableItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IPinnedItemsOnProfileOwnerArguments {
  /**
   * Filter the types of pinned items that are returned.
   */
  types?: PinnableItemType[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * Represents items that can be pinned to a profile page.
 */
export const enum PinnableItemType {
  /**
   * A repository.
   */
  REPOSITORY = 'REPOSITORY',

  /**
   * A gist.
   */
  GIST = 'GIST'
}

/**
 * A curatable list of repositories relating to a repository owner, which defaults to showing the most popular repositories they own.
 */
export interface IProfileItemShowcase {
  __typename: 'ProfileItemShowcase'

  /**
   * Whether or not the owner has pinned any repositories or gists.
   */
  hasPinnedItems: boolean

  /**
   * The repositories and gists in the showcase. If the profile owner has any pinned items, those will be returned. Otherwise, the profile owner's popular repositories will be returned.
   */
  items: IPinnableItemConnection
}

export interface IItemsOnProfileItemShowcaseArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The connection type for PinnableItem.
 */
export interface IPinnableItemConnection {
  __typename: 'PinnableItemConnection'

  /**
   * A list of edges.
   */
  edges: (IPinnableItemEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (PinnableItem | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPinnableItemEdge {
  __typename: 'PinnableItemEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: PinnableItem | null
}

/**
 * Types that can be pinned to a profile page.
 */
export type PinnableItem = IGist | IRepository

/**
 * A Gist.
 */
export interface IGist {
  __typename: 'Gist'

  /**
   * A list of comments associated with the gist
   */
  comments: IGistCommentConnection

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The gist description.
   */
  description: string | null

  /**
   * The files in this gist.
   */
  files: (IGistFile | null)[] | null
  id: string

  /**
   * Identifies if the gist is a fork.
   */
  isFork: boolean

  /**
   * Whether the gist is public or not.
   */
  isPublic: boolean

  /**
   * The gist name.
   */
  name: string

  /**
   * The gist owner.
   */
  owner: RepositoryOwner | null

  /**
   * Identifies when the gist was last pushed to.
   */
  pushedAt: any | null

  /**
   * A list of users who have starred this starrable.
   */
  stargazers: IStargazerConnection

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * Returns a boolean indicating whether the viewing user has starred this starrable.
   */
  viewerHasStarred: boolean
}

export interface ICommentsOnGistArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

export interface IFilesOnGistArguments {
  /**
   * The maximum number of files to return.
   * @default 10
   */
  limit?: number | null
}

export interface IStargazersOnGistArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Order for connection
   */
  orderBy?: IStarOrder | null
}

/**
 * The connection type for GistComment.
 */
export interface IGistCommentConnection {
  __typename: 'GistCommentConnection'

  /**
   * A list of edges.
   */
  edges: (IGistCommentEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGistComment | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IGistCommentEdge {
  __typename: 'GistCommentEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IGistComment | null
}

/**
 * Represents a comment on an Gist.
 */
export interface IGistComment {
  __typename: 'GistComment'

  /**
   * The actor who authored the comment.
   */
  author: Actor | null

  /**
   * Author's association with the gist.
   */
  authorAssociation: CommentAuthorAssociation

  /**
   * Identifies the comment body.
   */
  body: string

  /**
   * The comment body rendered to HTML.
   */
  bodyHTML: any

  /**
   * The body rendered to text.
   */
  bodyText: string

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Check if this comment was created via an email reply.
   */
  createdViaEmail: boolean

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * The actor who edited the comment.
   */
  editor: Actor | null

  /**
   * The associated gist.
   */
  gist: IGist
  id: string

  /**
   * Check if this comment was edited and includes an edit with the creation data
   */
  includesCreatedEdit: boolean

  /**
   * Returns whether or not a comment has been minimized.
   */
  isMinimized: boolean

  /**
   * The moment the editor made the last edit
   */
  lastEditedAt: any | null

  /**
   * Returns why the comment was minimized.
   */
  minimizedReason: string | null

  /**
   * Identifies when the comment was published at.
   */
  publishedAt: any | null

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * A list of edits to this content.
   */
  userContentEdits: IUserContentEditConnection | null

  /**
   * Check if the current viewer can delete this object.
   */
  viewerCanDelete: boolean

  /**
   * Check if the current viewer can minimize this object.
   */
  viewerCanMinimize: boolean

  /**
   * Check if the current viewer can update this object.
   */
  viewerCanUpdate: boolean

  /**
   * Reasons why the current viewer can not update this comment.
   */
  viewerCannotUpdateReasons: CommentCannotUpdateReason[]

  /**
   * Did the viewer author this comment.
   */
  viewerDidAuthor: boolean
}

export interface IUserContentEditsOnGistCommentArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * A file in a gist.
 */
export interface IGistFile {
  __typename: 'GistFile'

  /**
   * The file name encoded to remove characters that are invalid in URL paths.
   */
  encodedName: string | null

  /**
   * The gist file encoding.
   */
  encoding: string | null

  /**
   * The file extension from the file name.
   */
  extension: string | null

  /**
   * Indicates if this file is an image.
   */
  isImage: boolean

  /**
   * Whether the file's contents were truncated.
   */
  isTruncated: boolean

  /**
   * The programming language this file is written in.
   */
  language: ILanguage | null

  /**
   * The gist file name.
   */
  name: string | null

  /**
   * The gist file size in bytes.
   */
  size: number | null

  /**
   * UTF8 text data or null if the file is binary
   */
  text: string | null
}

export interface ITextOnGistFileArguments {
  /**
   * Optionally truncate the returned file to this length.
   */
  truncate?: number | null
}

/**
 * A contributions collection aggregates contributions such as opened issues and commits created by a user.
 */
export interface IContributionsCollection {
  __typename: 'ContributionsCollection'

  /**
   * Commit contributions made by the user, grouped by repository.
   */
  commitContributionsByRepository: ICommitContributionsByRepository[]

  /**
   * A calendar of this user's contributions on GitHub.
   */
  contributionCalendar: IContributionCalendar

  /**
   * The years the user has been making contributions with the most recent year first.
   */
  contributionYears: number[]

  /**
   * Determine if this collection's time span ends in the current month.
   *
   */
  doesEndInCurrentMonth: boolean

  /**
   * The date of the first restricted contribution the user made in this time period. Can only be non-null when the user has enabled private contribution counts.
   */
  earliestRestrictedContributionDate: any | null

  /**
   * The ending date and time of this collection.
   */
  endedAt: any

  /**
   * The first issue the user opened on GitHub. This will be null if that issue was opened outside the collection's time range and ignoreTimeRange is false. If the issue is not visible but the user has opted to show private contributions, a RestrictedContribution will be returned.
   */
  firstIssueContribution: CreatedIssueOrRestrictedContribution | null

  /**
   * The first pull request the user opened on GitHub. This will be null if that pull request was opened outside the collection's time range and ignoreTimeRange is not true. If the pull request is not visible but the user has opted to show private contributions, a RestrictedContribution will be returned.
   */
  firstPullRequestContribution: CreatedPullRequestOrRestrictedContribution | null

  /**
   * The first repository the user created on GitHub. This will be null if that first repository was created outside the collection's time range and ignoreTimeRange is false. If the repository is not visible, then a RestrictedContribution is returned.
   */
  firstRepositoryContribution: CreatedRepositoryOrRestrictedContribution | null

  /**
   * Does the user have any more activity in the timeline that occurred prior to the collection's time range?
   */
  hasActivityInThePast: boolean

  /**
   * Determine if there are any contributions in this collection.
   */
  hasAnyContributions: boolean

  /**
   * Determine if the user made any contributions in this time frame whose details are not visible because they were made in a private repository. Can only be true if the user enabled private contribution counts.
   */
  hasAnyRestrictedContributions: boolean

  /**
   * Whether or not the collector's time span is all within the same day.
   */
  isSingleDay: boolean

  /**
   * A list of issues the user opened.
   */
  issueContributions: ICreatedIssueContributionConnection

  /**
   * Issue contributions made by the user, grouped by repository.
   */
  issueContributionsByRepository: IIssueContributionsByRepository[]

  /**
   * When the user signed up for GitHub. This will be null if that sign up date falls outside the collection's time range and ignoreTimeRange is false.
   */
  joinedGitHubContribution: IJoinedGitHubContribution | null

  /**
   * The date of the most recent restricted contribution the user made in this time period. Can only be non-null when the user has enabled private contribution counts.
   */
  latestRestrictedContributionDate: any | null

  /**
   * When this collection's time range does not include any activity from the user, use this
   * to get a different collection from an earlier time range that does have activity.
   *
   */
  mostRecentCollectionWithActivity: IContributionsCollection | null

  /**
   * Returns a different contributions collection from an earlier time range than this one
   * that does not have any contributions.
   *
   */
  mostRecentCollectionWithoutActivity: IContributionsCollection | null

  /**
   * The issue the user opened on GitHub that received the most comments in the specified
   * time frame.
   *
   */
  popularIssueContribution: ICreatedIssueContribution | null

  /**
   * The pull request the user opened on GitHub that received the most comments in the
   * specified time frame.
   *
   */
  popularPullRequestContribution: ICreatedPullRequestContribution | null

  /**
   * Pull request contributions made by the user.
   */
  pullRequestContributions: ICreatedPullRequestContributionConnection

  /**
   * Pull request contributions made by the user, grouped by repository.
   */
  pullRequestContributionsByRepository: IPullRequestContributionsByRepository[]

  /**
   * Pull request review contributions made by the user.
   */
  pullRequestReviewContributions: ICreatedPullRequestReviewContributionConnection

  /**
   * Pull request review contributions made by the user, grouped by repository.
   */
  pullRequestReviewContributionsByRepository: IPullRequestReviewContributionsByRepository[]

  /**
   * A list of repositories owned by the user that the user created in this time range.
   */
  repositoryContributions: ICreatedRepositoryContributionConnection

  /**
   * A count of contributions made by the user that the viewer cannot access. Only non-zero when the user has chosen to share their private contribution counts.
   */
  restrictedContributionsCount: number

  /**
   * The beginning date and time of this collection.
   */
  startedAt: any

  /**
   * How many commits were made by the user in this time span.
   */
  totalCommitContributions: number

  /**
   * How many issues the user opened.
   */
  totalIssueContributions: number

  /**
   * How many pull requests the user opened.
   */
  totalPullRequestContributions: number

  /**
   * How many pull request reviews the user left.
   */
  totalPullRequestReviewContributions: number

  /**
   * How many different repositories the user committed to.
   */
  totalRepositoriesWithContributedCommits: number

  /**
   * How many different repositories the user opened issues in.
   */
  totalRepositoriesWithContributedIssues: number

  /**
   * How many different repositories the user left pull request reviews in.
   */
  totalRepositoriesWithContributedPullRequestReviews: number

  /**
   * How many different repositories the user opened pull requests in.
   */
  totalRepositoriesWithContributedPullRequests: number

  /**
   * How many repositories the user created.
   */
  totalRepositoryContributions: number

  /**
   * The user who made the contributions in this collection.
   */
  user: IGitHubUser
}

export interface ICommitContributionsByRepositoryOnContributionsCollectionArguments {
  /**
   * How many repositories should be included.
   * @default 25
   */
  maxRepositories?: number | null
}

export interface IFirstIssueContributionOnContributionsCollectionArguments {
  /**
   * If true, the first issue will be returned even if it was opened outside of the collection's time range.
   *
   * **Upcoming Change on 2019-07-01 UTC**
   * **Description:** `ignoreTimeRange` will be removed. Use a `ContributionsCollection` starting sufficiently far back
   * **Reason:** ignore_time_range will be removed
   *
   * @default false
   */
  ignoreTimeRange?: boolean | null
}

export interface IFirstPullRequestContributionOnContributionsCollectionArguments {
  /**
   * If true, the first pull request will be returned even if it was opened outside of the collection's time range.
   *
   * **Upcoming Change on 2019-07-01 UTC**
   * **Description:** `ignoreTimeRange` will be removed. Use a `ContributionsCollection` starting sufficiently far back
   * **Reason:** ignore_time_range will be removed
   *
   * @default false
   */
  ignoreTimeRange?: boolean | null
}

export interface IFirstRepositoryContributionOnContributionsCollectionArguments {
  /**
   * If true, the first repository will be returned even if it was opened outside of the collection's time range.
   *
   * **Upcoming Change on 2019-07-01 UTC**
   * **Description:** `ignoreTimeRange` will be removed. Use a `ContributionsCollection` starting sufficiently far back
   * **Reason:** ignore_time_range will be removed
   *
   * @default false
   */
  ignoreTimeRange?: boolean | null
}

export interface IIssueContributionsOnContributionsCollectionArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Should the user's first issue ever be excluded from the result.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented issue be excluded from the result.
   * @default false
   */
  excludePopular?: boolean | null

  /**
   * Ordering options for contributions returned from the connection.
   */
  orderBy?: IContributionOrder | null
}

export interface IIssueContributionsByRepositoryOnContributionsCollectionArguments {
  /**
   * How many repositories should be included.
   * @default 25
   */
  maxRepositories?: number | null

  /**
   * Should the user's first issue ever be excluded from the result.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented issue be excluded from the result.
   * @default false
   */
  excludePopular?: boolean | null
}

export interface IJoinedGitHubContributionOnContributionsCollectionArguments {
  /**
   * If true, the contribution will be returned even if the user signed up outside of the collection's time range.
   *
   * **Upcoming Change on 2019-07-01 UTC**
   * **Description:** `ignoreTimeRange` will be removed. Use a `ContributionsCollection` starting sufficiently far back
   * **Reason:** ignore_time_range will be removed
   *
   * @default false
   */
  ignoreTimeRange?: boolean | null
}

export interface IPullRequestContributionsOnContributionsCollectionArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Should the user's first pull request ever be excluded from the result.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented pull request be excluded from the result.
   * @default false
   */
  excludePopular?: boolean | null

  /**
   * Ordering options for contributions returned from the connection.
   */
  orderBy?: IContributionOrder | null
}

export interface IPullRequestContributionsByRepositoryOnContributionsCollectionArguments {
  /**
   * How many repositories should be included.
   * @default 25
   */
  maxRepositories?: number | null

  /**
   * Should the user's first pull request ever be excluded from the result.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented pull request be excluded from the result.
   * @default false
   */
  excludePopular?: boolean | null
}

export interface IPullRequestReviewContributionsOnContributionsCollectionArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for contributions returned from the connection.
   */
  orderBy?: IContributionOrder | null
}

export interface IPullRequestReviewContributionsByRepositoryOnContributionsCollectionArguments {
  /**
   * How many repositories should be included.
   * @default 25
   */
  maxRepositories?: number | null
}

export interface IRepositoryContributionsOnContributionsCollectionArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Should the user's first repository ever be excluded from the result.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Ordering options for contributions returned from the connection.
   */
  orderBy?: IContributionOrder | null
}

export interface ITotalIssueContributionsOnContributionsCollectionArguments {
  /**
   * Should the user's first issue ever be excluded from this count.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented issue be excluded from this count.
   * @default false
   */
  excludePopular?: boolean | null
}

export interface ITotalPullRequestContributionsOnContributionsCollectionArguments {
  /**
   * Should the user's first pull request ever be excluded from this count.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented pull request be excluded from this count.
   * @default false
   */
  excludePopular?: boolean | null
}

export interface ITotalRepositoriesWithContributedIssuesOnContributionsCollectionArguments {
  /**
   * Should the user's first issue ever be excluded from this count.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented issue be excluded from this count.
   * @default false
   */
  excludePopular?: boolean | null
}

export interface ITotalRepositoriesWithContributedPullRequestsOnContributionsCollectionArguments {
  /**
   * Should the user's first pull request ever be excluded from this count.
   * @default false
   */
  excludeFirst?: boolean | null

  /**
   * Should the user's most commented pull request be excluded from this count.
   * @default false
   */
  excludePopular?: boolean | null
}

export interface ITotalRepositoryContributionsOnContributionsCollectionArguments {
  /**
   * Should the user's first repository ever be excluded from this count.
   * @default false
   */
  excludeFirst?: boolean | null
}

/**
 * This aggregates commits made by a user within one repository.
 */
export interface ICommitContributionsByRepository {
  __typename: 'CommitContributionsByRepository'

  /**
   * The commit contributions, each representing a day.
   */
  contributions: ICreatedCommitContributionConnection

  /**
   * The repository in which the commits were made.
   */
  repository: IRepository

  /**
   * The HTTP path for the user's commits to the repository in this time range.
   */
  resourcePath: any

  /**
   * The HTTP URL for the user's commits to the repository in this time range.
   */
  url: any
}

export interface IContributionsOnCommitContributionsByRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for commit contributions returned from the connection.
   */
  orderBy?: ICommitContributionOrder | null
}

/**
 * Ordering options for commit contribution connections.
 */
export interface ICommitContributionOrder {
  /**
   * The field by which to order commit contributions.
   */
  field: CommitContributionOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which commit contribution connections can be ordered.
 */
export const enum CommitContributionOrderField {
  /**
   * Order commit contributions by when they were made.
   */
  OCCURRED_AT = 'OCCURRED_AT',

  /**
   * Order commit contributions by how many commits they represent.
   */
  COMMIT_COUNT = 'COMMIT_COUNT'
}

/**
 * The connection type for CreatedCommitContribution.
 */
export interface ICreatedCommitContributionConnection {
  __typename: 'CreatedCommitContributionConnection'

  /**
   * A list of edges.
   */
  edges: (ICreatedCommitContributionEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICreatedCommitContribution | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of commits across days and repositories in the connection.
   *
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ICreatedCommitContributionEdge {
  __typename: 'CreatedCommitContributionEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ICreatedCommitContribution | null
}

/**
 * Represents the contribution a user made by committing to a repository.
 */
export interface ICreatedCommitContribution {
  __typename: 'CreatedCommitContribution'

  /**
   * How many commits were made on this day to this repository by the user.
   */
  commitCount: number

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The repository the user made a commit in.
   */
  repository: IRepository

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * Represents a contribution a user made on GitHub, such as opening an issue.
 */
export type Contribution =
  | ICreatedCommitContribution
  | ICreatedIssueContribution
  | IRestrictedContribution
  | ICreatedPullRequestContribution
  | ICreatedRepositoryContribution
  | IJoinedGitHubContribution
  | ICreatedPullRequestReviewContribution

/**
 * Represents a contribution a user made on GitHub, such as opening an issue.
 */
export interface IContribution {
  __typename: 'Contribution'

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * A calendar of contributions made on GitHub by a user.
 */
export interface IContributionCalendar {
  __typename: 'ContributionCalendar'

  /**
   * A list of hex color codes used in this calendar. The darker the color, the more contributions it represents.
   */
  colors: string[]

  /**
   * Determine if the color set was chosen because it's currently Halloween.
   */
  isHalloween: boolean

  /**
   * A list of the months of contributions in this calendar.
   */
  months: IContributionCalendarMonth[]

  /**
   * The count of total contributions in the calendar.
   */
  totalContributions: number

  /**
   * A list of the weeks of contributions in this calendar.
   */
  weeks: IContributionCalendarWeek[]
}

/**
 * A month of contributions in a user's contribution graph.
 */
export interface IContributionCalendarMonth {
  __typename: 'ContributionCalendarMonth'

  /**
   * The date of the first day of this month.
   */
  firstDay: any

  /**
   * The name of the month.
   */
  name: string

  /**
   * How many weeks started in this month.
   */
  totalWeeks: number

  /**
   * The year the month occurred in.
   */
  year: number
}

/**
 * A week of contributions in a user's contribution graph.
 */
export interface IContributionCalendarWeek {
  __typename: 'ContributionCalendarWeek'

  /**
   * The days of contributions in this week.
   */
  contributionDays: IContributionCalendarDay[]

  /**
   * The date of the earliest square in this week.
   */
  firstDay: any
}

/**
 * Represents a single day of contributions on GitHub by a user.
 */
export interface IContributionCalendarDay {
  __typename: 'ContributionCalendarDay'

  /**
   * The hex color code that represents how many contributions were made on this day compared to others in the calendar.
   */
  color: string

  /**
   * How many contributions were made by the user on this day.
   */
  contributionCount: number

  /**
   * The day this square represents.
   */
  date: any

  /**
   * A number representing which day of the week this square represents, e.g., 1 is Monday.
   */
  weekday: number
}

/**
 * Represents either a issue the viewer can access or a restricted contribution.
 */
export type CreatedIssueOrRestrictedContribution =
  | ICreatedIssueContribution
  | IRestrictedContribution

/**
 * Represents the contribution a user made on GitHub by opening an issue.
 */
export interface ICreatedIssueContribution {
  __typename: 'CreatedIssueContribution'

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * The issue that was opened.
   */
  issue: IIssue

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * Represents a private contribution a user made on GitHub.
 */
export interface IRestrictedContribution {
  __typename: 'RestrictedContribution'

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * Represents either a pull request the viewer can access or a restricted contribution.
 */
export type CreatedPullRequestOrRestrictedContribution =
  | ICreatedPullRequestContribution
  | IRestrictedContribution

/**
 * Represents the contribution a user made on GitHub by opening a pull request.
 */
export interface ICreatedPullRequestContribution {
  __typename: 'CreatedPullRequestContribution'

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The pull request that was opened.
   */
  pullRequest: IPullRequest

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * Represents either a repository the viewer can access or a restricted contribution.
 */
export type CreatedRepositoryOrRestrictedContribution =
  | ICreatedRepositoryContribution
  | IRestrictedContribution

/**
 * Represents the contribution a user made on GitHub by creating a repository.
 */
export interface ICreatedRepositoryContribution {
  __typename: 'CreatedRepositoryContribution'

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The repository that was created.
   */
  repository: IRepository

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * Ordering options for contribution connections.
 */
export interface IContributionOrder {
  /**
   * The field by which to order contributions.
   */
  field: ContributionOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which contribution connections can be ordered.
 */
export const enum ContributionOrderField {
  /**
   * Order contributions by when they were made.
   */
  OCCURRED_AT = 'OCCURRED_AT'
}

/**
 * The connection type for CreatedIssueContribution.
 */
export interface ICreatedIssueContributionConnection {
  __typename: 'CreatedIssueContributionConnection'

  /**
   * A list of edges.
   */
  edges: (ICreatedIssueContributionEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICreatedIssueContribution | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ICreatedIssueContributionEdge {
  __typename: 'CreatedIssueContributionEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ICreatedIssueContribution | null
}

/**
 * This aggregates issues opened by a user within one repository.
 */
export interface IIssueContributionsByRepository {
  __typename: 'IssueContributionsByRepository'

  /**
   * The issue contributions.
   */
  contributions: ICreatedIssueContributionConnection

  /**
   * The repository in which the issues were opened.
   */
  repository: IRepository
}

export interface IContributionsOnIssueContributionsByRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for contributions returned from the connection.
   */
  orderBy?: IContributionOrder | null
}

/**
 * Represents a user signing up for a GitHub account.
 */
export interface IJoinedGitHubContribution {
  __typename: 'JoinedGitHubContribution'

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * The connection type for CreatedPullRequestContribution.
 */
export interface ICreatedPullRequestContributionConnection {
  __typename: 'CreatedPullRequestContributionConnection'

  /**
   * A list of edges.
   */
  edges: (ICreatedPullRequestContributionEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICreatedPullRequestContribution | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ICreatedPullRequestContributionEdge {
  __typename: 'CreatedPullRequestContributionEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ICreatedPullRequestContribution | null
}

/**
 * This aggregates pull requests opened by a user within one repository.
 */
export interface IPullRequestContributionsByRepository {
  __typename: 'PullRequestContributionsByRepository'

  /**
   * The pull request contributions.
   */
  contributions: ICreatedPullRequestContributionConnection

  /**
   * The repository in which the pull requests were opened.
   */
  repository: IRepository
}

export interface IContributionsOnPullRequestContributionsByRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for contributions returned from the connection.
   */
  orderBy?: IContributionOrder | null
}

/**
 * The connection type for CreatedPullRequestReviewContribution.
 */
export interface ICreatedPullRequestReviewContributionConnection {
  __typename: 'CreatedPullRequestReviewContributionConnection'

  /**
   * A list of edges.
   */
  edges: (ICreatedPullRequestReviewContributionEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICreatedPullRequestReviewContribution | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ICreatedPullRequestReviewContributionEdge {
  __typename: 'CreatedPullRequestReviewContributionEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ICreatedPullRequestReviewContribution | null
}

/**
 * Represents the contribution a user made by leaving a review on a pull request.
 */
export interface ICreatedPullRequestReviewContribution {
  __typename: 'CreatedPullRequestReviewContribution'

  /**
   * Whether this contribution is associated with a record you do not have access to. For
   * example, your own 'first issue' contribution may have been made on a repository you can no
   * longer access.
   *
   */
  isRestricted: boolean

  /**
   * When this contribution was made.
   */
  occurredAt: any

  /**
   * The pull request the user reviewed.
   */
  pullRequest: IPullRequest

  /**
   * The review the user left on the pull request.
   */
  pullRequestReview: IPullRequestReview

  /**
   * The repository containing the pull request that the user reviewed.
   */
  repository: IRepository

  /**
   * The HTTP path for this contribution.
   */
  resourcePath: any

  /**
   * The HTTP URL for this contribution.
   */
  url: any

  /**
   * The user who made this contribution.
   *
   */
  user: IGitHubUser
}

/**
 * This aggregates pull request reviews made by a user within one repository.
 */
export interface IPullRequestReviewContributionsByRepository {
  __typename: 'PullRequestReviewContributionsByRepository'

  /**
   * The pull request review contributions.
   */
  contributions: ICreatedPullRequestReviewContributionConnection

  /**
   * The repository in which the pull request reviews were made.
   */
  repository: IRepository
}

export interface IContributionsOnPullRequestReviewContributionsByRepositoryArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null

  /**
   * Ordering options for contributions returned from the connection.
   */
  orderBy?: IContributionOrder | null
}

/**
 * The connection type for CreatedRepositoryContribution.
 */
export interface ICreatedRepositoryContributionConnection {
  __typename: 'CreatedRepositoryContributionConnection'

  /**
   * A list of edges.
   */
  edges: (ICreatedRepositoryContributionEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ICreatedRepositoryContribution | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ICreatedRepositoryContributionEdge {
  __typename: 'CreatedRepositoryContributionEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ICreatedRepositoryContribution | null
}

/**
 * The connection type for User.
 */
export interface IFollowerConnection {
  __typename: 'FollowerConnection'

  /**
   * A list of edges.
   */
  edges: (IUserEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * The connection type for User.
 */
export interface IFollowingConnection {
  __typename: 'FollowingConnection'

  /**
   * A list of edges.
   */
  edges: (IUserEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * The privacy of a Gist
 */
export const enum GistPrivacy {
  /**
   * Public
   */
  PUBLIC = 'PUBLIC',

  /**
   * Secret
   */
  SECRET = 'SECRET',

  /**
   * Gists that are public and secret
   */
  ALL = 'ALL'
}

/**
 * Ordering options for gist connections
 */
export interface IGistOrder {
  /**
   * The field to order repositories by.
   */
  field: GistOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which gist connections can be ordered.
 */
export const enum GistOrderField {
  /**
   * Order gists by creation time
   */
  CREATED_AT = 'CREATED_AT',

  /**
   * Order gists by update time
   */
  UPDATED_AT = 'UPDATED_AT',

  /**
   * Order gists by push time
   */
  PUSHED_AT = 'PUSHED_AT'
}

/**
 * The connection type for Gist.
 */
export interface IGistConnection {
  __typename: 'GistConnection'

  /**
   * A list of edges.
   */
  edges: (IGistEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGist | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IGistEdge {
  __typename: 'GistEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IGist | null
}

/**
 * The connection type for Organization.
 */
export interface IOrganizationConnection {
  __typename: 'OrganizationConnection'

  /**
   * A list of edges.
   */
  edges: (IOrganizationEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IOrganization | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IOrganizationEdge {
  __typename: 'OrganizationEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IOrganization | null
}

/**
 * The connection type for PublicKey.
 */
export interface IPublicKeyConnection {
  __typename: 'PublicKeyConnection'

  /**
   * A list of edges.
   */
  edges: (IPublicKeyEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IPublicKey | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IPublicKeyEdge {
  __typename: 'PublicKeyEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IPublicKey | null
}

/**
 * A user's public key.
 */
export interface IPublicKey {
  __typename: 'PublicKey'

  /**
   * The last time this authorization was used to perform an action
   */
  accessedAt: any | null

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * The fingerprint for this PublicKey
   */
  fingerprint: string | null
  id: string

  /**
   * Whether this PublicKey is read-only or not
   */
  isReadOnly: boolean

  /**
   * The public key string
   */
  key: string

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any
}

/**
 * The reason a repository is listed as 'contributed'.
 */
export const enum RepositoryContributionType {
  /**
   * Created a commit
   */
  COMMIT = 'COMMIT',

  /**
   * Created an issue
   */
  ISSUE = 'ISSUE',

  /**
   * Created a pull request
   */
  PULL_REQUEST = 'PULL_REQUEST',

  /**
   * Created the repository
   */
  REPOSITORY = 'REPOSITORY',

  /**
   * Reviewed a pull request
   */
  PULL_REQUEST_REVIEW = 'PULL_REQUEST_REVIEW'
}

/**
 * The connection type for Repository.
 */
export interface IStarredRepositoryConnection {
  __typename: 'StarredRepositoryConnection'

  /**
   * A list of edges.
   */
  edges: (IStarredRepositoryEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IRepository | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a starred repository.
 */
export interface IStarredRepositoryEdge {
  __typename: 'StarredRepositoryEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string
  node: IRepository

  /**
   * Identifies when the item was starred.
   */
  starredAt: any
}

/**
 * The connection type for IssueTimelineItem.
 */
export interface IIssueTimelineConnection {
  __typename: 'IssueTimelineConnection'

  /**
   * A list of edges.
   */
  edges: (IIssueTimelineItemEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IssueTimelineItem | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IIssueTimelineItemEdge {
  __typename: 'IssueTimelineItemEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IssueTimelineItem | null
}

/**
 * An item in an issue timeline
 */
export type IssueTimelineItem =
  | ICommit
  | IIssueComment
  | ICrossReferencedEvent
  | IClosedEvent
  | IReopenedEvent
  | ISubscribedEvent
  | IUnsubscribedEvent
  | IReferencedEvent
  | IAssignedEvent
  | IUnassignedEvent
  | ILabeledEvent
  | IUnlabeledEvent
  | IUserBlockedEvent
  | IMilestonedEvent
  | IDemilestonedEvent
  | IRenamedTitleEvent
  | ILockedEvent
  | IUnlockedEvent
  | ITransferredEvent

/**
 * The possible item types found in a timeline.
 */
export const enum IssueTimelineItemsItemType {
  /**
   * Represents a comment on an Issue.
   */
  ISSUE_COMMENT = 'ISSUE_COMMENT',

  /**
   * Represents a mention made by one issue or pull request to another.
   */
  CROSS_REFERENCED_EVENT = 'CROSS_REFERENCED_EVENT',

  /**
   * Represents a 'added_to_project' event on a given issue or pull request.
   */
  ADDED_TO_PROJECT_EVENT = 'ADDED_TO_PROJECT_EVENT',

  /**
   * Represents an 'assigned' event on any assignable object.
   */
  ASSIGNED_EVENT = 'ASSIGNED_EVENT',

  /**
   * Represents a 'closed' event on any `Closable`.
   */
  CLOSED_EVENT = 'CLOSED_EVENT',

  /**
   * Represents a 'comment_deleted' event on a given issue or pull request.
   */
  COMMENT_DELETED_EVENT = 'COMMENT_DELETED_EVENT',

  /**
   * Represents a 'converted_note_to_issue' event on a given issue or pull request.
   */
  CONVERTED_NOTE_TO_ISSUE_EVENT = 'CONVERTED_NOTE_TO_ISSUE_EVENT',

  /**
   * Represents a 'demilestoned' event on a given issue or pull request.
   */
  DEMILESTONED_EVENT = 'DEMILESTONED_EVENT',

  /**
   * Represents a 'labeled' event on a given issue or pull request.
   */
  LABELED_EVENT = 'LABELED_EVENT',

  /**
   * Represents a 'locked' event on a given issue or pull request.
   */
  LOCKED_EVENT = 'LOCKED_EVENT',

  /**
   * Represents a 'mentioned' event on a given issue or pull request.
   */
  MENTIONED_EVENT = 'MENTIONED_EVENT',

  /**
   * Represents a 'milestoned' event on a given issue or pull request.
   */
  MILESTONED_EVENT = 'MILESTONED_EVENT',

  /**
   * Represents a 'moved_columns_in_project' event on a given issue or pull request.
   */
  MOVED_COLUMNS_IN_PROJECT_EVENT = 'MOVED_COLUMNS_IN_PROJECT_EVENT',

  /**
   * Represents a 'pinned' event on a given issue or pull request.
   */
  PINNED_EVENT = 'PINNED_EVENT',

  /**
   * Represents a 'referenced' event on a given `ReferencedSubject`.
   */
  REFERENCED_EVENT = 'REFERENCED_EVENT',

  /**
   * Represents a 'removed_from_project' event on a given issue or pull request.
   */
  REMOVED_FROM_PROJECT_EVENT = 'REMOVED_FROM_PROJECT_EVENT',

  /**
   * Represents a 'renamed' event on a given issue or pull request
   */
  RENAMED_TITLE_EVENT = 'RENAMED_TITLE_EVENT',

  /**
   * Represents a 'reopened' event on any `Closable`.
   */
  REOPENED_EVENT = 'REOPENED_EVENT',

  /**
   * Represents a 'subscribed' event on a given `Subscribable`.
   */
  SUBSCRIBED_EVENT = 'SUBSCRIBED_EVENT',

  /**
   * Represents a 'transferred' event on a given issue or pull request.
   */
  TRANSFERRED_EVENT = 'TRANSFERRED_EVENT',

  /**
   * Represents an 'unassigned' event on any assignable object.
   */
  UNASSIGNED_EVENT = 'UNASSIGNED_EVENT',

  /**
   * Represents an 'unlabeled' event on a given issue or pull request.
   */
  UNLABELED_EVENT = 'UNLABELED_EVENT',

  /**
   * Represents an 'unlocked' event on a given issue or pull request.
   */
  UNLOCKED_EVENT = 'UNLOCKED_EVENT',

  /**
   * Represents a 'user_blocked' event on a given user.
   */
  USER_BLOCKED_EVENT = 'USER_BLOCKED_EVENT',

  /**
   * Represents an 'unpinned' event on a given issue or pull request.
   */
  UNPINNED_EVENT = 'UNPINNED_EVENT',

  /**
   * Represents an 'unsubscribed' event on a given `Subscribable`.
   */
  UNSUBSCRIBED_EVENT = 'UNSUBSCRIBED_EVENT'
}

/**
 * The connection type for IssueTimelineItems.
 */
export interface IIssueTimelineItemsConnection {
  __typename: 'IssueTimelineItemsConnection'

  /**
   * A list of edges.
   */
  edges: (IIssueTimelineItemsEdge | null)[] | null

  /**
   * Identifies the count of items after applying `before` and `after` filters.
   */
  filteredCount: number

  /**
   * A list of nodes.
   */
  nodes: (IssueTimelineItems | null)[] | null

  /**
   * Identifies the count of items after applying `before`/`after` filters and `first`/`last`/`skip` slicing.
   */
  pageCount: number

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number

  /**
   * Identifies the date and time when the timeline was last updated.
   */
  updatedAt: any
}

/**
 * An edge in a connection.
 */
export interface IIssueTimelineItemsEdge {
  __typename: 'IssueTimelineItemsEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IssueTimelineItems | null
}

/**
 * An item in an issue timeline
 */
export type IssueTimelineItems =
  | IIssueComment
  | ICrossReferencedEvent
  | IAddedToProjectEvent
  | IAssignedEvent
  | IClosedEvent
  | ICommentDeletedEvent
  | IConvertedNoteToIssueEvent
  | IDemilestonedEvent
  | ILabeledEvent
  | ILockedEvent
  | IMentionedEvent
  | IMilestonedEvent
  | IMovedColumnsInProjectEvent
  | IPinnedEvent
  | IReferencedEvent
  | IRemovedFromProjectEvent
  | IRenamedTitleEvent
  | IReopenedEvent
  | ISubscribedEvent
  | ITransferredEvent
  | IUnassignedEvent
  | IUnlabeledEvent
  | IUnlockedEvent
  | IUserBlockedEvent
  | IUnpinnedEvent
  | IUnsubscribedEvent

/**
 * Various content states of a ProjectCard
 */
export const enum ProjectCardState {
  /**
   * The card has content only.
   */
  CONTENT_ONLY = 'CONTENT_ONLY',

  /**
   * The card has a note only.
   */
  NOTE_ONLY = 'NOTE_ONLY',

  /**
   * The card is redacted.
   */
  REDACTED = 'REDACTED'
}

/**
 * The semantic purpose of the column - todo, in progress, or done.
 */
export const enum ProjectColumnPurpose {
  /**
   * The column contains cards still to be worked on
   */
  TODO = 'TODO',

  /**
   * The column contains cards which are currently being worked on
   */
  IN_PROGRESS = 'IN_PROGRESS',

  /**
   * The column contains cards which are complete
   */
  DONE = 'DONE'
}

/**
 * The connection type for User.
 */
export interface IOrganizationMemberConnection {
  __typename: 'OrganizationMemberConnection'

  /**
   * A list of edges.
   */
  edges: (IOrganizationMemberEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IGitHubUser | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * Represents a user within an organization.
 */
export interface IOrganizationMemberEdge {
  __typename: 'OrganizationMemberEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * Whether the organization member has two factor enabled or not. Returns null if information is not available to viewer.
   */
  hasTwoFactorEnabled: boolean | null

  /**
   * The item at the end of the edge.
   */
  node: IGitHubUser | null

  /**
   * The role this user has in the organization.
   */
  role: OrganizationMemberRole | null
}

/**
 * The possible roles within an organization for its members.
 */
export const enum OrganizationMemberRole {
  /**
   * The user is a member of the organization.
   */
  MEMBER = 'MEMBER',

  /**
   * The user is an administrator of the organization.
   */
  ADMIN = 'ADMIN'
}

/**
 * An Identity Provider configured to provision SAML and SCIM identities for Organizations
 */
export interface IOrganizationIdentityProvider {
  __typename: 'OrganizationIdentityProvider'

  /**
   * The digest algorithm used to sign SAML requests for the Identity Provider.
   */
  digestMethod: any | null

  /**
   * External Identities provisioned by this Identity Provider
   */
  externalIdentities: IExternalIdentityConnection
  id: string

  /**
   * The x509 certificate used by the Identity Provder to sign assertions and responses.
   */
  idpCertificate: any | null

  /**
   * The Issuer Entity ID for the SAML Identity Provider
   */
  issuer: string | null

  /**
   * Organization this Identity Provider belongs to
   */
  organization: IOrganization | null

  /**
   * The signature algorithm used to sign SAML requests for the Identity Provider.
   */
  signatureMethod: any | null

  /**
   * The URL endpoint for the Identity Provider's SAML SSO.
   */
  ssoUrl: any | null
}

export interface IExternalIdentitiesOnOrganizationIdentityProviderArguments {
  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * The connection type for ExternalIdentity.
 */
export interface IExternalIdentityConnection {
  __typename: 'ExternalIdentityConnection'

  /**
   * A list of edges.
   */
  edges: (IExternalIdentityEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (IExternalIdentity | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface IExternalIdentityEdge {
  __typename: 'ExternalIdentityEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IExternalIdentity | null
}

/**
 * An external identity provisioned by SAML SSO or SCIM.
 */
export interface IExternalIdentity {
  __typename: 'ExternalIdentity'

  /**
   * The GUID for this identity
   */
  guid: string
  id: string

  /**
   * Organization invitation for this SCIM-provisioned external identity
   */
  organizationInvitation: IOrganizationInvitation | null

  /**
   * SAML Identity attributes
   */
  samlIdentity: IExternalIdentitySamlAttributes | null

  /**
   * SCIM Identity attributes
   */
  scimIdentity: IExternalIdentityScimAttributes | null

  /**
   * User linked to this external identity. Will be NULL if this identity has not been claimed by an organization member.
   */
  user: IGitHubUser | null
}

/**
 * SAML attributes for the External Identity
 */
export interface IExternalIdentitySamlAttributes {
  __typename: 'ExternalIdentitySamlAttributes'

  /**
   * The NameID of the SAML identity
   */
  nameId: string | null
}

/**
 * SCIM attributes for the External Identity
 */
export interface IExternalIdentityScimAttributes {
  __typename: 'ExternalIdentityScimAttributes'

  /**
   * The userName of the SCIM identity
   */
  username: string | null
}

/**
 * The role of a user on a team.
 */
export const enum TeamRole {
  /**
   * User has admin rights on the team.
   */
  ADMIN = 'ADMIN',

  /**
   * User is a member of the team.
   */
  MEMBER = 'MEMBER'
}

/**
 * Represents the client's rate limit.
 */
export interface IRateLimit {
  __typename: 'RateLimit'

  /**
   * The point cost for the current query counting against the rate limit.
   */
  cost: number

  /**
   * The maximum number of points the client is permitted to consume in a 60 minute window.
   */
  limit: number

  /**
   * The maximum number of nodes this query may return
   */
  nodeCount: number

  /**
   * The number of points remaining in the current rate limit window.
   */
  remaining: number

  /**
   * The time at which the current rate limit window resets in UTC epoch seconds.
   */
  resetAt: any
}

/**
 * Represents the individual results of a search.
 */
export const enum SearchType {
  /**
   * Returns results matching issues in repositories.
   */
  ISSUE = 'ISSUE',

  /**
   * Returns results matching repositories.
   */
  REPOSITORY = 'REPOSITORY',

  /**
   * Returns results matching users and organizations on GitHub.
   */
  USER = 'USER'
}

/**
 * A list of results that matched against a search query.
 */
export interface ISearchResultItemConnection {
  __typename: 'SearchResultItemConnection'

  /**
   * The number of pieces of code that matched the search query.
   */
  codeCount: number

  /**
   * A list of edges.
   */
  edges: (ISearchResultItemEdge | null)[] | null

  /**
   * The number of issues that matched the search query.
   */
  issueCount: number

  /**
   * A list of nodes.
   */
  nodes: (SearchResultItem | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * The number of repositories that matched the search query.
   */
  repositoryCount: number

  /**
   * The number of users that matched the search query.
   */
  userCount: number

  /**
   * The number of wiki pages that matched the search query.
   */
  wikiCount: number
}

/**
 * An edge in a connection.
 */
export interface ISearchResultItemEdge {
  __typename: 'SearchResultItemEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: SearchResultItem | null

  /**
   * Text matches on the result found.
   */
  textMatches: (ITextMatch | null)[] | null
}

/**
 * The results of a search.
 */
export type SearchResultItem =
  | IIssue
  | IPullRequest
  | IRepository
  | IGitHubUser
  | IOrganization
  | IMarketplaceListing

/**
 * A text match within a search result.
 */
export interface ITextMatch {
  __typename: 'TextMatch'

  /**
   * The specific text fragment within the property matched on.
   */
  fragment: string

  /**
   * Highlights within the matched fragment.
   */
  highlights: ITextMatchHighlight[]

  /**
   * The property matched on.
   */
  property: string
}

/**
 * Represents a single highlight in a search result match.
 */
export interface ITextMatchHighlight {
  __typename: 'TextMatchHighlight'

  /**
   * The indice in the fragment where the matched text begins.
   */
  beginIndice: number

  /**
   * The indice in the fragment where the matched text ends.
   */
  endIndice: number

  /**
   * The text matched.
   */
  text: string
}

/**
 * Ordering options for security advisory connections
 */
export interface ISecurityAdvisoryOrder {
  /**
   * The field to order security advisories by.
   */
  field: SecurityAdvisoryOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which security advisory connections can be ordered.
 */
export const enum SecurityAdvisoryOrderField {
  /**
   * Order advisories by publication time
   */
  PUBLISHED_AT = 'PUBLISHED_AT',

  /**
   * Order advisories by update time
   */
  UPDATED_AT = 'UPDATED_AT'
}

/**
 * An advisory identifier to filter results on.
 */
export interface ISecurityAdvisoryIdentifierFilter {
  /**
   * The identifier type.
   */
  type: SecurityAdvisoryIdentifierType

  /**
   * The identifier string. Supports exact or partial matching.
   */
  value: string
}

/**
 * Identifier formats available for advisories.
 */
export const enum SecurityAdvisoryIdentifierType {
  /**
   * Common Vulnerabilities and Exposures Identifier.
   */
  CVE = 'CVE',

  /**
   * GitHub Security Advisory ID.
   */
  GHSA = 'GHSA'
}

/**
 * The connection type for SecurityAdvisory.
 */
export interface ISecurityAdvisoryConnection {
  __typename: 'SecurityAdvisoryConnection'

  /**
   * A list of edges.
   */
  edges: (ISecurityAdvisoryEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ISecurityAdvisory | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ISecurityAdvisoryEdge {
  __typename: 'SecurityAdvisoryEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ISecurityAdvisory | null
}

/**
 * A GitHub Security Advisory
 */
export interface ISecurityAdvisory {
  __typename: 'SecurityAdvisory'

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null

  /**
   * This is a long plaintext description of the advisory
   */
  description: string

  /**
   * The GitHub Security Advisory ID
   */
  ghsaId: string
  id: string

  /**
   * A list of identifiers for this advisory
   */
  identifiers: ISecurityAdvisoryIdentifier[]

  /**
   * When the advisory was published
   */
  publishedAt: any

  /**
   * A list of references for this advisory
   */
  references: ISecurityAdvisoryReference[]

  /**
   * The severity of the advisory
   */
  severity: SecurityAdvisorySeverity

  /**
   * A short plaintext summary of the advisory
   */
  summary: string

  /**
   * When the advisory was last updated
   */
  updatedAt: any

  /**
   * Vulnerabilities associated with this Advisory
   */
  vulnerabilities: ISecurityVulnerabilityConnection

  /**
   * When the advisory was withdrawn, if it has been withdrawn
   */
  withdrawnAt: any | null
}

export interface IVulnerabilitiesOnSecurityAdvisoryArguments {
  /**
   * Ordering options for the returned topics.
   */
  orderBy?: ISecurityVulnerabilityOrder | null

  /**
   * An ecosystem to filter vulnerabilities by.
   */
  ecosystem?: SecurityAdvisoryEcosystem | null

  /**
   * A package name to filter vulnerabilities by.
   */
  package?: string | null

  /**
   * A list of severities to filter vulnerabilities by.
   */
  severities?: SecurityAdvisorySeverity[] | null

  /**
   * Returns the elements in the list that come after the specified cursor.
   */
  after?: string | null

  /**
   * Returns the elements in the list that come before the specified cursor.
   */
  before?: string | null

  /**
   * Returns the first _n_ elements from the list.
   */
  first?: number | null

  /**
   * Returns the last _n_ elements from the list.
   */
  last?: number | null
}

/**
 * A GitHub Security Advisory Identifier
 */
export interface ISecurityAdvisoryIdentifier {
  __typename: 'SecurityAdvisoryIdentifier'

  /**
   * The identifier type, e.g. GHSA, CVE
   */
  type: string

  /**
   * The identifier
   */
  value: string
}

/**
 * A GitHub Security Advisory Reference
 */
export interface ISecurityAdvisoryReference {
  __typename: 'SecurityAdvisoryReference'

  /**
   * A publicly accessible reference
   */
  url: any
}

/**
 * Severity of the vulnerability.
 */
export const enum SecurityAdvisorySeverity {
  /**
   * Low.
   */
  LOW = 'LOW',

  /**
   * Moderate.
   */
  MODERATE = 'MODERATE',

  /**
   * High.
   */
  HIGH = 'HIGH',

  /**
   * Critical.
   */
  CRITICAL = 'CRITICAL'
}

/**
 * Ordering options for security vulnerability connections
 */
export interface ISecurityVulnerabilityOrder {
  /**
   * The field to order security vulnerabilities by.
   */
  field: SecurityVulnerabilityOrderField

  /**
   * The ordering direction.
   */
  direction: OrderDirection
}

/**
 * Properties by which security vulnerability connections can be ordered.
 */
export const enum SecurityVulnerabilityOrderField {
  /**
   * Order vulnerability by update time
   */
  UPDATED_AT = 'UPDATED_AT'
}

/**
 * The possible ecosystems of a security vulnerability's package.
 */
export const enum SecurityAdvisoryEcosystem {
  /**
   * Ruby gems hosted at RubyGems.org
   */
  RUBYGEMS = 'RUBYGEMS',

  /**
   * JavaScript packages hosted at npmjs.com
   */
  NPM = 'NPM',

  /**
   * Python packages hosted at PyPI.org
   */
  PIP = 'PIP',

  /**
   * Java artifacts hosted at the Maven central repository
   */
  MAVEN = 'MAVEN',

  /**
   * .NET packages hosted at the NuGet Gallery
   */
  NUGET = 'NUGET'
}

/**
 * The connection type for SecurityVulnerability.
 */
export interface ISecurityVulnerabilityConnection {
  __typename: 'SecurityVulnerabilityConnection'

  /**
   * A list of edges.
   */
  edges: (ISecurityVulnerabilityEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ISecurityVulnerability | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ISecurityVulnerabilityEdge {
  __typename: 'SecurityVulnerabilityEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ISecurityVulnerability | null
}

/**
 * An individual vulnerability within an Advisory
 */
export interface ISecurityVulnerability {
  __typename: 'SecurityVulnerability'

  /**
   * The Advisory associated with this Vulnerability
   */
  advisory: ISecurityAdvisory

  /**
   * The first version containing a fix for the vulnerability
   */
  firstPatchedVersion: ISecurityAdvisoryPackageVersion | null

  /**
   * A description of the vulnerable package
   */
  package: ISecurityAdvisoryPackage

  /**
   * The severity of the vulnerability within this package
   */
  severity: SecurityAdvisorySeverity

  /**
   * When the vulnerability was last updated
   */
  updatedAt: any

  /**
   * A string that describes the vulnerable package versions.
   * This string follows a basic syntax with a few forms.
   * + `= 0.2.0` denotes a single vulnerable version.
   * + `<= 1.0.8` denotes a version range up to and including the specified version
   * + `< 0.1.11` denotes a version range up to, but excluding, the specified version
   * + `>= 4.3.0, < 4.3.5` denotes a version range with a known minimum and maximum version.
   * + `>= 0.0.1` denotes a version range with a known minimum, but no known maximum
   *
   */
  vulnerableVersionRange: string
}

/**
 * An individual package version
 */
export interface ISecurityAdvisoryPackageVersion {
  __typename: 'SecurityAdvisoryPackageVersion'

  /**
   * The package name or version
   */
  identifier: string
}

/**
 * An individual package
 */
export interface ISecurityAdvisoryPackage {
  __typename: 'SecurityAdvisoryPackage'

  /**
   * The ecosystem the package belongs to, e.g. RUBYGEMS, NPM
   */
  ecosystem: SecurityAdvisoryEcosystem

  /**
   * The package name
   */
  name: string
}

/**
 * The root query for implementing GraphQL mutations.
 */
export interface IMutation {
  __typename: 'Mutation'

  /**
   * Applies a suggested topic to the repository.
   */
  acceptTopicSuggestion: IAcceptTopicSuggestionPayload | null

  /**
   * Adds assignees to an assignable object.
   */
  addAssigneesToAssignable: IAddAssigneesToAssignablePayload | null

  /**
   * Adds a comment to an Issue or Pull Request.
   */
  addComment: IAddCommentPayload | null

  /**
   * Adds labels to a labelable object.
   */
  addLabelsToLabelable: IAddLabelsToLabelablePayload | null

  /**
   * Adds a card to a ProjectColumn. Either `contentId` or `note` must be provided but **not** both.
   */
  addProjectCard: IAddProjectCardPayload | null

  /**
   * Adds a column to a Project.
   */
  addProjectColumn: IAddProjectColumnPayload | null

  /**
   * Adds a review to a Pull Request.
   */
  addPullRequestReview: IAddPullRequestReviewPayload | null

  /**
   * Adds a comment to a review.
   */
  addPullRequestReviewComment: IAddPullRequestReviewCommentPayload | null

  /**
   * Adds a reaction to a subject.
   */
  addReaction: IAddReactionPayload | null

  /**
   * Adds a star to a Starrable.
   */
  addStar: IAddStarPayload | null

  /**
   * Update your status on GitHub.
   */
  changeUserStatus: IChangeUserStatusPayload | null

  /**
   * Clears all labels from a labelable object.
   */
  clearLabelsFromLabelable: IClearLabelsFromLabelablePayload | null

  /**
   * Creates a new project by cloning configuration from an existing project.
   */
  cloneProject: ICloneProjectPayload | null

  /**
   * Close an issue.
   */
  closeIssue: ICloseIssuePayload | null

  /**
   * Close a pull request.
   */
  closePullRequest: IClosePullRequestPayload | null

  /**
   * Convert a project note card to one associated with a newly created issue.
   */
  convertProjectCardNoteToIssue: IConvertProjectCardNoteToIssuePayload | null

  /**
   * Create a new branch protection rule
   */
  createBranchProtectionRule: ICreateBranchProtectionRulePayload | null

  /**
   * Creates a new issue.
   */
  createIssue: ICreateIssuePayload | null

  /**
   * Creates a new project.
   */
  createProject: ICreateProjectPayload | null

  /**
   * Create a new pull request
   */
  createPullRequest: ICreatePullRequestPayload | null

  /**
   * Rejects a suggested topic for the repository.
   */
  declineTopicSuggestion: IDeclineTopicSuggestionPayload | null

  /**
   * Delete a branch protection rule
   */
  deleteBranchProtectionRule: IDeleteBranchProtectionRulePayload | null

  /**
   * Deletes an Issue object.
   */
  deleteIssue: IDeleteIssuePayload | null

  /**
   * Deletes an IssueComment object.
   */
  deleteIssueComment: IDeleteIssueCommentPayload | null

  /**
   * Deletes a project.
   */
  deleteProject: IDeleteProjectPayload | null

  /**
   * Deletes a project card.
   */
  deleteProjectCard: IDeleteProjectCardPayload | null

  /**
   * Deletes a project column.
   */
  deleteProjectColumn: IDeleteProjectColumnPayload | null

  /**
   * Deletes a pull request review.
   */
  deletePullRequestReview: IDeletePullRequestReviewPayload | null

  /**
   * Deletes a pull request review comment.
   */
  deletePullRequestReviewComment: IDeletePullRequestReviewCommentPayload | null

  /**
   * Dismisses an approved or rejected pull request review.
   */
  dismissPullRequestReview: IDismissPullRequestReviewPayload | null

  /**
   * Lock a lockable object
   */
  lockLockable: ILockLockablePayload | null

  /**
   * Merge a pull request.
   */
  mergePullRequest: IMergePullRequestPayload | null

  /**
   * Moves a project card to another place.
   */
  moveProjectCard: IMoveProjectCardPayload | null

  /**
   * Moves a project column to another place.
   */
  moveProjectColumn: IMoveProjectColumnPayload | null

  /**
   * Removes assignees from an assignable object.
   */
  removeAssigneesFromAssignable: IRemoveAssigneesFromAssignablePayload | null

  /**
   * Removes labels from a Labelable object.
   */
  removeLabelsFromLabelable: IRemoveLabelsFromLabelablePayload | null

  /**
   * Removes outside collaborator from all repositories in an organization.
   */
  removeOutsideCollaborator: IRemoveOutsideCollaboratorPayload | null

  /**
   * Removes a reaction from a subject.
   */
  removeReaction: IRemoveReactionPayload | null

  /**
   * Removes a star from a Starrable.
   */
  removeStar: IRemoveStarPayload | null

  /**
   * Reopen a issue.
   */
  reopenIssue: IReopenIssuePayload | null

  /**
   * Reopen a pull request.
   */
  reopenPullRequest: IReopenPullRequestPayload | null

  /**
   * Set review requests on a pull request.
   */
  requestReviews: IRequestReviewsPayload | null

  /**
   * Marks a review thread as resolved.
   */
  resolveReviewThread: IResolveReviewThreadPayload | null

  /**
   * Submits a pending pull request review.
   */
  submitPullRequestReview: ISubmitPullRequestReviewPayload | null

  /**
   * Unlock a lockable object
   */
  unlockLockable: IUnlockLockablePayload | null

  /**
   * Unmark an issue as a duplicate of another issue.
   */
  unmarkIssueAsDuplicate: IUnmarkIssueAsDuplicatePayload | null

  /**
   * Marks a review thread as unresolved.
   */
  unresolveReviewThread: IUnresolveReviewThreadPayload | null

  /**
   * Create a new branch protection rule
   */
  updateBranchProtectionRule: IUpdateBranchProtectionRulePayload | null

  /**
   * Updates an Issue.
   */
  updateIssue: IUpdateIssuePayload | null

  /**
   * Updates an IssueComment object.
   */
  updateIssueComment: IUpdateIssueCommentPayload | null

  /**
   * Updates an existing project.
   */
  updateProject: IUpdateProjectPayload | null

  /**
   * Updates an existing project card.
   */
  updateProjectCard: IUpdateProjectCardPayload | null

  /**
   * Updates an existing project column.
   */
  updateProjectColumn: IUpdateProjectColumnPayload | null

  /**
   * Update a pull request
   */
  updatePullRequest: IUpdatePullRequestPayload | null

  /**
   * Updates the body of a pull request review.
   */
  updatePullRequestReview: IUpdatePullRequestReviewPayload | null

  /**
   * Updates a pull request review comment.
   */
  updatePullRequestReviewComment: IUpdatePullRequestReviewCommentPayload | null

  /**
   * Updates the state for subscribable subjects.
   */
  updateSubscription: IUpdateSubscriptionPayload | null

  /**
   * Replaces the repository's topics with the given topics.
   */
  updateTopics: IUpdateTopicsPayload | null
}

export interface IAcceptTopicSuggestionOnMutationArguments {
  input: IAcceptTopicSuggestionInput
}

export interface IAddAssigneesToAssignableOnMutationArguments {
  input: IAddAssigneesToAssignableInput
}

export interface IAddCommentOnMutationArguments {
  input: IAddCommentInput
}

export interface IAddLabelsToLabelableOnMutationArguments {
  input: IAddLabelsToLabelableInput
}

export interface IAddProjectCardOnMutationArguments {
  input: IAddProjectCardInput
}

export interface IAddProjectColumnOnMutationArguments {
  input: IAddProjectColumnInput
}

export interface IAddPullRequestReviewOnMutationArguments {
  input: IAddPullRequestReviewInput
}

export interface IAddPullRequestReviewCommentOnMutationArguments {
  input: IAddPullRequestReviewCommentInput
}

export interface IAddReactionOnMutationArguments {
  input: IAddReactionInput
}

export interface IAddStarOnMutationArguments {
  input: IAddStarInput
}

export interface IChangeUserStatusOnMutationArguments {
  input: IChangeUserStatusInput
}

export interface IClearLabelsFromLabelableOnMutationArguments {
  input: IClearLabelsFromLabelableInput
}

export interface ICloneProjectOnMutationArguments {
  input: ICloneProjectInput
}

export interface ICloseIssueOnMutationArguments {
  input: ICloseIssueInput
}

export interface IClosePullRequestOnMutationArguments {
  input: IClosePullRequestInput
}

export interface IConvertProjectCardNoteToIssueOnMutationArguments {
  input: IConvertProjectCardNoteToIssueInput
}

export interface ICreateBranchProtectionRuleOnMutationArguments {
  input: ICreateBranchProtectionRuleInput
}

export interface ICreateIssueOnMutationArguments {
  input: ICreateIssueInput
}

export interface ICreateProjectOnMutationArguments {
  input: ICreateProjectInput
}

export interface ICreatePullRequestOnMutationArguments {
  input: ICreatePullRequestInput
}

export interface IDeclineTopicSuggestionOnMutationArguments {
  input: IDeclineTopicSuggestionInput
}

export interface IDeleteBranchProtectionRuleOnMutationArguments {
  input: IDeleteBranchProtectionRuleInput
}

export interface IDeleteIssueOnMutationArguments {
  input: IDeleteIssueInput
}

export interface IDeleteIssueCommentOnMutationArguments {
  input: IDeleteIssueCommentInput
}

export interface IDeleteProjectOnMutationArguments {
  input: IDeleteProjectInput
}

export interface IDeleteProjectCardOnMutationArguments {
  input: IDeleteProjectCardInput
}

export interface IDeleteProjectColumnOnMutationArguments {
  input: IDeleteProjectColumnInput
}

export interface IDeletePullRequestReviewOnMutationArguments {
  input: IDeletePullRequestReviewInput
}

export interface IDeletePullRequestReviewCommentOnMutationArguments {
  input: IDeletePullRequestReviewCommentInput
}

export interface IDismissPullRequestReviewOnMutationArguments {
  input: IDismissPullRequestReviewInput
}

export interface ILockLockableOnMutationArguments {
  input: ILockLockableInput
}

export interface IMergePullRequestOnMutationArguments {
  input: IMergePullRequestInput
}

export interface IMoveProjectCardOnMutationArguments {
  input: IMoveProjectCardInput
}

export interface IMoveProjectColumnOnMutationArguments {
  input: IMoveProjectColumnInput
}

export interface IRemoveAssigneesFromAssignableOnMutationArguments {
  input: IRemoveAssigneesFromAssignableInput
}

export interface IRemoveLabelsFromLabelableOnMutationArguments {
  input: IRemoveLabelsFromLabelableInput
}

export interface IRemoveOutsideCollaboratorOnMutationArguments {
  input: IRemoveOutsideCollaboratorInput
}

export interface IRemoveReactionOnMutationArguments {
  input: IRemoveReactionInput
}

export interface IRemoveStarOnMutationArguments {
  input: IRemoveStarInput
}

export interface IReopenIssueOnMutationArguments {
  input: IReopenIssueInput
}

export interface IReopenPullRequestOnMutationArguments {
  input: IReopenPullRequestInput
}

export interface IRequestReviewsOnMutationArguments {
  input: IRequestReviewsInput
}

export interface IResolveReviewThreadOnMutationArguments {
  input: IResolveReviewThreadInput
}

export interface ISubmitPullRequestReviewOnMutationArguments {
  input: ISubmitPullRequestReviewInput
}

export interface IUnlockLockableOnMutationArguments {
  input: IUnlockLockableInput
}

export interface IUnmarkIssueAsDuplicateOnMutationArguments {
  input: IUnmarkIssueAsDuplicateInput
}

export interface IUnresolveReviewThreadOnMutationArguments {
  input: IUnresolveReviewThreadInput
}

export interface IUpdateBranchProtectionRuleOnMutationArguments {
  input: IUpdateBranchProtectionRuleInput
}

export interface IUpdateIssueOnMutationArguments {
  input: IUpdateIssueInput
}

export interface IUpdateIssueCommentOnMutationArguments {
  input: IUpdateIssueCommentInput
}

export interface IUpdateProjectOnMutationArguments {
  input: IUpdateProjectInput
}

export interface IUpdateProjectCardOnMutationArguments {
  input: IUpdateProjectCardInput
}

export interface IUpdateProjectColumnOnMutationArguments {
  input: IUpdateProjectColumnInput
}

export interface IUpdatePullRequestOnMutationArguments {
  input: IUpdatePullRequestInput
}

export interface IUpdatePullRequestReviewOnMutationArguments {
  input: IUpdatePullRequestReviewInput
}

export interface IUpdatePullRequestReviewCommentOnMutationArguments {
  input: IUpdatePullRequestReviewCommentInput
}

export interface IUpdateSubscriptionOnMutationArguments {
  input: IUpdateSubscriptionInput
}

export interface IUpdateTopicsOnMutationArguments {
  input: IUpdateTopicsInput
}

/**
 * Autogenerated input type of AcceptTopicSuggestion
 */
export interface IAcceptTopicSuggestionInput {
  /**
   * The Node ID of the repository.
   */
  repositoryId: string

  /**
   * The name of the suggested topic.
   */
  name: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AcceptTopicSuggestion
 */
export interface IAcceptTopicSuggestionPayload {
  __typename: 'AcceptTopicSuggestionPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The accepted topic.
   */
  topic: ITopic | null
}

/**
 * Autogenerated input type of AddAssigneesToAssignable
 */
export interface IAddAssigneesToAssignableInput {
  /**
   * The id of the assignable object to add assignees to.
   */
  assignableId: string

  /**
   * The id of users to add as assignees.
   */
  assigneeIds: string[]

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddAssigneesToAssignable
 */
export interface IAddAssigneesToAssignablePayload {
  __typename: 'AddAssigneesToAssignablePayload'

  /**
   * The item that was assigned.
   */
  assignable: Assignable | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null
}

/**
 * Autogenerated input type of AddComment
 */
export interface IAddCommentInput {
  /**
   * The Node ID of the subject to modify.
   */
  subjectId: string

  /**
   * The contents of the comment.
   */
  body: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddComment
 */
export interface IAddCommentPayload {
  __typename: 'AddCommentPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The edge from the subject's comment connection.
   */
  commentEdge: IIssueCommentEdge | null

  /**
   * The subject
   */
  subject: Node | null

  /**
   * The edge from the subject's timeline connection.
   */
  timelineEdge: IIssueTimelineItemEdge | null
}

/**
 * Autogenerated input type of AddLabelsToLabelable
 */
export interface IAddLabelsToLabelableInput {
  /**
   * The id of the labelable object to add labels to.
   */
  labelableId: string

  /**
   * The ids of the labels to add.
   */
  labelIds: string[]

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddLabelsToLabelable
 */
export interface IAddLabelsToLabelablePayload {
  __typename: 'AddLabelsToLabelablePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The item that was labeled.
   */
  labelable: Labelable | null
}

/**
 * Autogenerated input type of AddProjectCard
 */
export interface IAddProjectCardInput {
  /**
   * The Node ID of the ProjectColumn.
   */
  projectColumnId: string

  /**
   * The content of the card. Must be a member of the ProjectCardItem union
   */
  contentId?: string | null

  /**
   * The note on the card.
   */
  note?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddProjectCard
 */
export interface IAddProjectCardPayload {
  __typename: 'AddProjectCardPayload'

  /**
   * The edge from the ProjectColumn's card connection.
   */
  cardEdge: IProjectCardEdge | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The ProjectColumn
   */
  projectColumn: IProjectColumn | null
}

/**
 * Autogenerated input type of AddProjectColumn
 */
export interface IAddProjectColumnInput {
  /**
   * The Node ID of the project.
   */
  projectId: string

  /**
   * The name of the column.
   */
  name: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddProjectColumn
 */
export interface IAddProjectColumnPayload {
  __typename: 'AddProjectColumnPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The edge from the project's column connection.
   */
  columnEdge: IProjectColumnEdge | null

  /**
   * The project
   */
  project: IProject | null
}

/**
 * Autogenerated input type of AddPullRequestReview
 */
export interface IAddPullRequestReviewInput {
  /**
   * The Node ID of the pull request to modify.
   */
  pullRequestId: string

  /**
   * The commit OID the review pertains to.
   */
  commitOID?: any | null

  /**
   * The contents of the review body comment.
   */
  body?: string | null

  /**
   * The event to perform on the pull request review.
   */
  event?: PullRequestReviewEvent | null

  /**
   * The review line comments.
   */
  comments?: (IDraftPullRequestReviewComment | null)[] | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * The possible events to perform on a pull request review.
 */
export const enum PullRequestReviewEvent {
  /**
   * Submit general feedback without explicit approval.
   */
  COMMENT = 'COMMENT',

  /**
   * Submit feedback and approve merging these changes.
   */
  APPROVE = 'APPROVE',

  /**
   * Submit feedback that must be addressed before merging.
   */
  REQUEST_CHANGES = 'REQUEST_CHANGES',

  /**
   * Dismiss review so it now longer effects merging.
   */
  DISMISS = 'DISMISS'
}

/**
 * Specifies a review comment to be left with a Pull Request Review.
 */
export interface IDraftPullRequestReviewComment {
  /**
   * Path to the file being commented on.
   */
  path: string

  /**
   * Position in the file to leave a comment on.
   */
  position: number

  /**
   * Body of the comment to leave.
   */
  body: string
}

/**
 * Autogenerated return type of AddPullRequestReview
 */
export interface IAddPullRequestReviewPayload {
  __typename: 'AddPullRequestReviewPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The newly created pull request review.
   */
  pullRequestReview: IPullRequestReview | null

  /**
   * The edge from the pull request's review connection.
   */
  reviewEdge: IPullRequestReviewEdge | null
}

/**
 * Autogenerated input type of AddPullRequestReviewComment
 */
export interface IAddPullRequestReviewCommentInput {
  /**
   * The Node ID of the review to modify.
   */
  pullRequestReviewId: string

  /**
   * The SHA of the commit to comment on.
   */
  commitOID?: any | null

  /**
   * The text of the comment.
   */
  body: string

  /**
   * The relative path of the file to comment on.
   */
  path?: string | null

  /**
   * The line index in the diff to comment on.
   */
  position?: number | null

  /**
   * The comment id to reply to.
   */
  inReplyTo?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddPullRequestReviewComment
 */
export interface IAddPullRequestReviewCommentPayload {
  __typename: 'AddPullRequestReviewCommentPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The newly created comment.
   */
  comment: IPullRequestReviewComment | null

  /**
   * The edge from the review's comment connection.
   */
  commentEdge: IPullRequestReviewCommentEdge | null
}

/**
 * Autogenerated input type of AddReaction
 */
export interface IAddReactionInput {
  /**
   * The Node ID of the subject to modify.
   */
  subjectId: string

  /**
   * The name of the emoji to react with.
   */
  content: ReactionContent

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddReaction
 */
export interface IAddReactionPayload {
  __typename: 'AddReactionPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The reaction object.
   */
  reaction: IReaction | null

  /**
   * The reactable subject.
   */
  subject: Reactable | null
}

/**
 * Autogenerated input type of AddStar
 */
export interface IAddStarInput {
  /**
   * The Starrable ID to star.
   */
  starrableId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of AddStar
 */
export interface IAddStarPayload {
  __typename: 'AddStarPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The starrable.
   */
  starrable: Starrable | null
}

/**
 * Autogenerated input type of ChangeUserStatus
 */
export interface IChangeUserStatusInput {
  /**
   * The emoji to represent your status. Can either be a native Unicode emoji or an emoji name with colons, e.g., :grinning:.
   */
  emoji?: string | null

  /**
   * A short description of your current status.
   */
  message?: string | null

  /**
   * The ID of the organization whose members will be allowed to see the status. If omitted, the status will be publicly visible.
   */
  organizationId?: string | null

  /**
   * Whether this status should indicate you are not fully available on GitHub, e.g., you are away.
   * @default false
   */
  limitedAvailability?: boolean | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of ChangeUserStatus
 */
export interface IChangeUserStatusPayload {
  __typename: 'ChangeUserStatusPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * Your updated status.
   */
  status: IUserStatus | null
}

/**
 * Autogenerated input type of ClearLabelsFromLabelable
 */
export interface IClearLabelsFromLabelableInput {
  /**
   * The id of the labelable object to clear the labels from.
   */
  labelableId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of ClearLabelsFromLabelable
 */
export interface IClearLabelsFromLabelablePayload {
  __typename: 'ClearLabelsFromLabelablePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The item that was unlabeled.
   */
  labelable: Labelable | null
}

/**
 * Autogenerated input type of CloneProject
 */
export interface ICloneProjectInput {
  /**
   * The owner ID to create the project under.
   */
  targetOwnerId: string

  /**
   * The source project to clone.
   */
  sourceId: string

  /**
   * Whether or not to clone the source project's workflows.
   */
  includeWorkflows: boolean

  /**
   * The name of the project.
   */
  name: string

  /**
   * The description of the project.
   */
  body?: string | null

  /**
   * The visibility of the project, defaults to false (private).
   */
  public?: boolean | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of CloneProject
 */
export interface ICloneProjectPayload {
  __typename: 'CloneProjectPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The id of the JobStatus for populating cloned fields.
   */
  jobStatusId: string | null

  /**
   * The new cloned project.
   */
  project: IProject | null
}

/**
 * Autogenerated input type of CloseIssue
 */
export interface ICloseIssueInput {
  /**
   * ID of the issue to be closed.
   */
  issueId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of CloseIssue
 */
export interface ICloseIssuePayload {
  __typename: 'CloseIssuePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The issue that was closed.
   */
  issue: IIssue | null
}

/**
 * Autogenerated input type of ClosePullRequest
 */
export interface IClosePullRequestInput {
  /**
   * ID of the pull request to be closed.
   */
  pullRequestId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of ClosePullRequest
 */
export interface IClosePullRequestPayload {
  __typename: 'ClosePullRequestPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The pull request that was closed.
   */
  pullRequest: IPullRequest | null
}

/**
 * Autogenerated input type of ConvertProjectCardNoteToIssue
 */
export interface IConvertProjectCardNoteToIssueInput {
  /**
   * The ProjectCard ID to convert.
   */
  projectCardId: string

  /**
   * The ID of the repository to create the issue in.
   */
  repositoryId: string

  /**
   * The title of the newly created issue. Defaults to the card's note text.
   */
  title?: string | null

  /**
   * The body of the newly created issue.
   */
  body?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of ConvertProjectCardNoteToIssue
 */
export interface IConvertProjectCardNoteToIssuePayload {
  __typename: 'ConvertProjectCardNoteToIssuePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated ProjectCard.
   */
  projectCard: IProjectCard | null
}

/**
 * Autogenerated input type of CreateBranchProtectionRule
 */
export interface ICreateBranchProtectionRuleInput {
  /**
   * The global relay id of the repository in which a new branch protection rule should be created in.
   */
  repositoryId: string

  /**
   * The glob-like pattern used to determine matching branches.
   */
  pattern: string

  /**
   * Are approving reviews required to update matching branches.
   */
  requiresApprovingReviews?: boolean | null

  /**
   * Number of approving reviews required to update matching branches.
   */
  requiredApprovingReviewCount?: number | null

  /**
   * Are commits required to be signed.
   */
  requiresCommitSignatures?: boolean | null

  /**
   * Can admins overwrite branch protection.
   */
  isAdminEnforced?: boolean | null

  /**
   * Are status checks required to update matching branches.
   */
  requiresStatusChecks?: boolean | null

  /**
   * Are branches required to be up to date before merging.
   */
  requiresStrictStatusChecks?: boolean | null

  /**
   * Are reviews from code owners required to update matching branches.
   */
  requiresCodeOwnerReviews?: boolean | null

  /**
   * Will new commits pushed to matching branches dismiss pull request review approvals.
   */
  dismissesStaleReviews?: boolean | null

  /**
   * Is dismissal of pull request reviews restricted.
   */
  restrictsReviewDismissals?: boolean | null

  /**
   * A list of User or Team IDs allowed to dismiss reviews on pull requests targeting matching branches.
   */
  reviewDismissalActorIds?: string[] | null

  /**
   * Is pushing to matching branches restricted.
   */
  restrictsPushes?: boolean | null

  /**
   * A list of User or Team IDs allowed to push to matching branches.
   */
  pushActorIds?: string[] | null

  /**
   * List of required status check contexts that must pass for commits to be accepted to matching branches.
   */
  requiredStatusCheckContexts?: string[] | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of CreateBranchProtectionRule
 */
export interface ICreateBranchProtectionRulePayload {
  __typename: 'CreateBranchProtectionRulePayload'

  /**
   * The newly created BranchProtectionRule.
   */
  branchProtectionRule: IBranchProtectionRule | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null
}

/**
 * Autogenerated input type of CreateIssue
 */
export interface ICreateIssueInput {
  /**
   * The Node ID of the repository.
   */
  repositoryId: string

  /**
   * The title for the issue.
   */
  title: string

  /**
   * The body for the issue description.
   */
  body?: string | null

  /**
   * The Node ID for the user assignee for this issue.
   */
  assigneeIds?: string[] | null

  /**
   * The Node ID of the milestone for this issue.
   */
  milestoneId?: string | null

  /**
   * An array of Node IDs of labels for this issue.
   */
  labelIds?: string[] | null

  /**
   * An array of Node IDs for projects associated with this issue.
   */
  projectIds?: string[] | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of CreateIssue
 */
export interface ICreateIssuePayload {
  __typename: 'CreateIssuePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The new issue.
   */
  issue: IIssue | null
}

/**
 * Autogenerated input type of CreateProject
 */
export interface ICreateProjectInput {
  /**
   * The owner ID to create the project under.
   */
  ownerId: string

  /**
   * The name of project.
   */
  name: string

  /**
   * The description of project.
   */
  body?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of CreateProject
 */
export interface ICreateProjectPayload {
  __typename: 'CreateProjectPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The new project.
   */
  project: IProject | null
}

/**
 * Autogenerated input type of CreatePullRequest
 */
export interface ICreatePullRequestInput {
  /**
   * The Node ID of the repository.
   */
  repositoryId: string

  /**
   * The name of the branch you want your changes pulled into. This should be an existing branch
   * on the current repository. You cannot update the base branch on a pull request to point
   * to another repository.
   *
   */
  baseRefName: string

  /**
   * The name of the branch where your changes are implemented. For cross-repository pull requests
   * in the same network, namespace `head_ref_name` with a user like this: `username:branch`.
   *
   */
  headRefName: string

  /**
   * The title of the pull request.
   */
  title: string

  /**
   * The contents of the pull request.
   */
  body?: string | null

  /**
   * Indicates whether maintainers can modify the pull request.
   * @default true
   */
  maintainerCanModify?: boolean | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of CreatePullRequest
 */
export interface ICreatePullRequestPayload {
  __typename: 'CreatePullRequestPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The new pull request.
   */
  pullRequest: IPullRequest | null
}

/**
 * Autogenerated input type of DeclineTopicSuggestion
 */
export interface IDeclineTopicSuggestionInput {
  /**
   * The Node ID of the repository.
   */
  repositoryId: string

  /**
   * The name of the suggested topic.
   */
  name: string

  /**
   * The reason why the suggested topic is declined.
   */
  reason: TopicSuggestionDeclineReason

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Reason that the suggested topic is declined.
 */
export const enum TopicSuggestionDeclineReason {
  /**
   * The suggested topic is not relevant to the repository.
   */
  NOT_RELEVANT = 'NOT_RELEVANT',

  /**
   * The suggested topic is too specific for the repository (e.g. #ruby-on-rails-version-4-2-1).
   */
  TOO_SPECIFIC = 'TOO_SPECIFIC',

  /**
   * The viewer does not like the suggested topic.
   */
  PERSONAL_PREFERENCE = 'PERSONAL_PREFERENCE',

  /**
   * The suggested topic is too general for the repository.
   */
  TOO_GENERAL = 'TOO_GENERAL'
}

/**
 * Autogenerated return type of DeclineTopicSuggestion
 */
export interface IDeclineTopicSuggestionPayload {
  __typename: 'DeclineTopicSuggestionPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The declined topic.
   */
  topic: ITopic | null
}

/**
 * Autogenerated input type of DeleteBranchProtectionRule
 */
export interface IDeleteBranchProtectionRuleInput {
  /**
   * The global relay id of the branch protection rule to be deleted.
   */
  branchProtectionRuleId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeleteBranchProtectionRule
 */
export interface IDeleteBranchProtectionRulePayload {
  __typename: 'DeleteBranchProtectionRulePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null
}

/**
 * Autogenerated input type of DeleteIssue
 */
export interface IDeleteIssueInput {
  /**
   * The ID of the issue to delete.
   */
  issueId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeleteIssue
 */
export interface IDeleteIssuePayload {
  __typename: 'DeleteIssuePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The repository the issue belonged to
   */
  repository: IRepository | null
}

/**
 * Autogenerated input type of DeleteIssueComment
 */
export interface IDeleteIssueCommentInput {
  /**
   * The ID of the comment to delete.
   */
  id: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeleteIssueComment
 */
export interface IDeleteIssueCommentPayload {
  __typename: 'DeleteIssueCommentPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null
}

/**
 * Autogenerated input type of DeleteProject
 */
export interface IDeleteProjectInput {
  /**
   * The Project ID to update.
   */
  projectId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeleteProject
 */
export interface IDeleteProjectPayload {
  __typename: 'DeleteProjectPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The repository or organization the project was removed from.
   */
  owner: ProjectOwner | null
}

/**
 * Autogenerated input type of DeleteProjectCard
 */
export interface IDeleteProjectCardInput {
  /**
   * The id of the card to delete.
   */
  cardId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeleteProjectCard
 */
export interface IDeleteProjectCardPayload {
  __typename: 'DeleteProjectCardPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The column the deleted card was in.
   */
  column: IProjectColumn | null

  /**
   * The deleted card ID.
   */
  deletedCardId: string | null
}

/**
 * Autogenerated input type of DeleteProjectColumn
 */
export interface IDeleteProjectColumnInput {
  /**
   * The id of the column to delete.
   */
  columnId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeleteProjectColumn
 */
export interface IDeleteProjectColumnPayload {
  __typename: 'DeleteProjectColumnPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The deleted column ID.
   */
  deletedColumnId: string | null

  /**
   * The project the deleted column was in.
   */
  project: IProject | null
}

/**
 * Autogenerated input type of DeletePullRequestReview
 */
export interface IDeletePullRequestReviewInput {
  /**
   * The Node ID of the pull request review to delete.
   */
  pullRequestReviewId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeletePullRequestReview
 */
export interface IDeletePullRequestReviewPayload {
  __typename: 'DeletePullRequestReviewPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The deleted pull request review.
   */
  pullRequestReview: IPullRequestReview | null
}

/**
 * Autogenerated input type of DeletePullRequestReviewComment
 */
export interface IDeletePullRequestReviewCommentInput {
  /**
   * The ID of the comment to delete.
   */
  id: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DeletePullRequestReviewComment
 */
export interface IDeletePullRequestReviewCommentPayload {
  __typename: 'DeletePullRequestReviewCommentPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The pull request review the deleted comment belonged to.
   */
  pullRequestReview: IPullRequestReview | null
}

/**
 * Autogenerated input type of DismissPullRequestReview
 */
export interface IDismissPullRequestReviewInput {
  /**
   * The Node ID of the pull request review to modify.
   */
  pullRequestReviewId: string

  /**
   * The contents of the pull request review dismissal message.
   */
  message: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of DismissPullRequestReview
 */
export interface IDismissPullRequestReviewPayload {
  __typename: 'DismissPullRequestReviewPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The dismissed pull request review.
   */
  pullRequestReview: IPullRequestReview | null
}

/**
 * Autogenerated input type of LockLockable
 */
export interface ILockLockableInput {
  /**
   * ID of the issue or pull request to be locked.
   */
  lockableId: string

  /**
   * A reason for why the issue or pull request will be locked.
   */
  lockReason?: LockReason | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of LockLockable
 */
export interface ILockLockablePayload {
  __typename: 'LockLockablePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The item that was locked.
   */
  lockedRecord: Lockable | null
}

/**
 * Autogenerated input type of MergePullRequest
 */
export interface IMergePullRequestInput {
  /**
   * ID of the pull request to be merged.
   */
  pullRequestId: string

  /**
   * Commit headline to use for the merge commit; if omitted, a default message will be used.
   */
  commitHeadline?: string | null

  /**
   * Commit body to use for the merge commit; if omitted, a default message will be used
   */
  commitBody?: string | null

  /**
   * OID that the pull request head ref must match to allow merge; if omitted, no check is performed.
   */
  expectedHeadOid?: any | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of MergePullRequest
 */
export interface IMergePullRequestPayload {
  __typename: 'MergePullRequestPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The pull request that was merged.
   */
  pullRequest: IPullRequest | null
}

/**
 * Autogenerated input type of MoveProjectCard
 */
export interface IMoveProjectCardInput {
  /**
   * The id of the card to move.
   */
  cardId: string

  /**
   * The id of the column to move it into.
   */
  columnId: string

  /**
   * Place the new card after the card with this id. Pass null to place it at the top.
   */
  afterCardId?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of MoveProjectCard
 */
export interface IMoveProjectCardPayload {
  __typename: 'MoveProjectCardPayload'

  /**
   * The new edge of the moved card.
   */
  cardEdge: IProjectCardEdge | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null
}

/**
 * Autogenerated input type of MoveProjectColumn
 */
export interface IMoveProjectColumnInput {
  /**
   * The id of the column to move.
   */
  columnId: string

  /**
   * Place the new column after the column with this id. Pass null to place it at the front.
   */
  afterColumnId?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of MoveProjectColumn
 */
export interface IMoveProjectColumnPayload {
  __typename: 'MoveProjectColumnPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The new edge of the moved column.
   */
  columnEdge: IProjectColumnEdge | null
}

/**
 * Autogenerated input type of RemoveAssigneesFromAssignable
 */
export interface IRemoveAssigneesFromAssignableInput {
  /**
   * The id of the assignable object to remove assignees from.
   */
  assignableId: string

  /**
   * The id of users to remove as assignees.
   */
  assigneeIds: string[]

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of RemoveAssigneesFromAssignable
 */
export interface IRemoveAssigneesFromAssignablePayload {
  __typename: 'RemoveAssigneesFromAssignablePayload'

  /**
   * The item that was unassigned.
   */
  assignable: Assignable | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null
}

/**
 * Autogenerated input type of RemoveLabelsFromLabelable
 */
export interface IRemoveLabelsFromLabelableInput {
  /**
   * The id of the Labelable to remove labels from.
   */
  labelableId: string

  /**
   * The ids of labels to remove.
   */
  labelIds: string[]

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of RemoveLabelsFromLabelable
 */
export interface IRemoveLabelsFromLabelablePayload {
  __typename: 'RemoveLabelsFromLabelablePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The Labelable the labels were removed from.
   */
  labelable: Labelable | null
}

/**
 * Autogenerated input type of RemoveOutsideCollaborator
 */
export interface IRemoveOutsideCollaboratorInput {
  /**
   * The ID of the outside collaborator to remove.
   */
  userId: string

  /**
   * The ID of the organization to remove the outside collaborator from.
   */
  organizationId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of RemoveOutsideCollaborator
 */
export interface IRemoveOutsideCollaboratorPayload {
  __typename: 'RemoveOutsideCollaboratorPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The user that was removed as an outside collaborator.
   */
  removedUser: IGitHubUser | null
}

/**
 * Autogenerated input type of RemoveReaction
 */
export interface IRemoveReactionInput {
  /**
   * The Node ID of the subject to modify.
   */
  subjectId: string

  /**
   * The name of the emoji reaction to remove.
   */
  content: ReactionContent

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of RemoveReaction
 */
export interface IRemoveReactionPayload {
  __typename: 'RemoveReactionPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The reaction object.
   */
  reaction: IReaction | null

  /**
   * The reactable subject.
   */
  subject: Reactable | null
}

/**
 * Autogenerated input type of RemoveStar
 */
export interface IRemoveStarInput {
  /**
   * The Starrable ID to unstar.
   */
  starrableId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of RemoveStar
 */
export interface IRemoveStarPayload {
  __typename: 'RemoveStarPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The starrable.
   */
  starrable: Starrable | null
}

/**
 * Autogenerated input type of ReopenIssue
 */
export interface IReopenIssueInput {
  /**
   * ID of the issue to be opened.
   */
  issueId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of ReopenIssue
 */
export interface IReopenIssuePayload {
  __typename: 'ReopenIssuePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The issue that was opened.
   */
  issue: IIssue | null
}

/**
 * Autogenerated input type of ReopenPullRequest
 */
export interface IReopenPullRequestInput {
  /**
   * ID of the pull request to be reopened.
   */
  pullRequestId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of ReopenPullRequest
 */
export interface IReopenPullRequestPayload {
  __typename: 'ReopenPullRequestPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The pull request that was reopened.
   */
  pullRequest: IPullRequest | null
}

/**
 * Autogenerated input type of RequestReviews
 */
export interface IRequestReviewsInput {
  /**
   * The Node ID of the pull request to modify.
   */
  pullRequestId: string

  /**
   * The Node IDs of the user to request.
   */
  userIds?: string[] | null

  /**
   * The Node IDs of the team to request.
   */
  teamIds?: string[] | null

  /**
   * Add users to the set rather than replace.
   */
  union?: boolean | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of RequestReviews
 */
export interface IRequestReviewsPayload {
  __typename: 'RequestReviewsPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The pull request that is getting requests.
   */
  pullRequest: IPullRequest | null

  /**
   * The edge from the pull request to the requested reviewers.
   */
  requestedReviewersEdge: IUserEdge | null
}

/**
 * Autogenerated input type of ResolveReviewThread
 */
export interface IResolveReviewThreadInput {
  /**
   * The ID of the thread to resolve
   */
  threadId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of ResolveReviewThread
 */
export interface IResolveReviewThreadPayload {
  __typename: 'ResolveReviewThreadPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The thread to resolve.
   */
  thread: IPullRequestReviewThread | null
}

/**
 * Autogenerated input type of SubmitPullRequestReview
 */
export interface ISubmitPullRequestReviewInput {
  /**
   * The Pull Request Review ID to submit.
   */
  pullRequestReviewId: string

  /**
   * The event to send to the Pull Request Review.
   */
  event: PullRequestReviewEvent

  /**
   * The text field to set on the Pull Request Review.
   */
  body?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of SubmitPullRequestReview
 */
export interface ISubmitPullRequestReviewPayload {
  __typename: 'SubmitPullRequestReviewPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The submitted pull request review.
   */
  pullRequestReview: IPullRequestReview | null
}

/**
 * Autogenerated input type of UnlockLockable
 */
export interface IUnlockLockableInput {
  /**
   * ID of the issue or pull request to be unlocked.
   */
  lockableId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UnlockLockable
 */
export interface IUnlockLockablePayload {
  __typename: 'UnlockLockablePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The item that was unlocked.
   */
  unlockedRecord: Lockable | null
}

/**
 * Autogenerated input type of UnmarkIssueAsDuplicate
 */
export interface IUnmarkIssueAsDuplicateInput {
  /**
   * ID of the issue or pull request currently marked as a duplicate.
   */
  duplicateId: string

  /**
   * ID of the issue or pull request currently considered canonical/authoritative/original.
   */
  canonicalId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UnmarkIssueAsDuplicate
 */
export interface IUnmarkIssueAsDuplicatePayload {
  __typename: 'UnmarkIssueAsDuplicatePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The issue or pull request that was marked as a duplicate.
   */
  duplicate: IssueOrPullRequest | null
}

/**
 * Autogenerated input type of UnresolveReviewThread
 */
export interface IUnresolveReviewThreadInput {
  /**
   * The ID of the thread to unresolve
   */
  threadId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UnresolveReviewThread
 */
export interface IUnresolveReviewThreadPayload {
  __typename: 'UnresolveReviewThreadPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The thread to resolve.
   */
  thread: IPullRequestReviewThread | null
}

/**
 * Autogenerated input type of UpdateBranchProtectionRule
 */
export interface IUpdateBranchProtectionRuleInput {
  /**
   * The global relay id of the branch protection rule to be updated.
   */
  branchProtectionRuleId: string

  /**
   * The glob-like pattern used to determine matching branches.
   */
  pattern?: string | null

  /**
   * Are approving reviews required to update matching branches.
   */
  requiresApprovingReviews?: boolean | null

  /**
   * Number of approving reviews required to update matching branches.
   */
  requiredApprovingReviewCount?: number | null

  /**
   * Are commits required to be signed.
   */
  requiresCommitSignatures?: boolean | null

  /**
   * Can admins overwrite branch protection.
   */
  isAdminEnforced?: boolean | null

  /**
   * Are status checks required to update matching branches.
   */
  requiresStatusChecks?: boolean | null

  /**
   * Are branches required to be up to date before merging.
   */
  requiresStrictStatusChecks?: boolean | null

  /**
   * Are reviews from code owners required to update matching branches.
   */
  requiresCodeOwnerReviews?: boolean | null

  /**
   * Will new commits pushed to matching branches dismiss pull request review approvals.
   */
  dismissesStaleReviews?: boolean | null

  /**
   * Is dismissal of pull request reviews restricted.
   */
  restrictsReviewDismissals?: boolean | null

  /**
   * A list of User or Team IDs allowed to dismiss reviews on pull requests targeting matching branches.
   */
  reviewDismissalActorIds?: string[] | null

  /**
   * Is pushing to matching branches restricted.
   */
  restrictsPushes?: boolean | null

  /**
   * A list of User or Team IDs allowed to push to matching branches.
   */
  pushActorIds?: string[] | null

  /**
   * List of required status check contexts that must pass for commits to be accepted to matching branches.
   */
  requiredStatusCheckContexts?: string[] | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateBranchProtectionRule
 */
export interface IUpdateBranchProtectionRulePayload {
  __typename: 'UpdateBranchProtectionRulePayload'

  /**
   * The newly created BranchProtectionRule.
   */
  branchProtectionRule: IBranchProtectionRule | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null
}

/**
 * Autogenerated input type of UpdateIssue
 */
export interface IUpdateIssueInput {
  /**
   * The ID of the Issue to modify.
   */
  id: string

  /**
   * The title for the issue.
   */
  title?: string | null

  /**
   * The body for the issue description.
   */
  body?: string | null

  /**
   * An array of Node IDs of users for this issue.
   */
  assigneeIds?: string[] | null

  /**
   * The Node ID of the milestone for this issue.
   */
  milestoneId?: string | null

  /**
   * An array of Node IDs of labels for this issue.
   */
  labelIds?: string[] | null

  /**
   * The desired issue state.
   */
  state?: IssueState | null

  /**
   * An array of Node IDs for projects associated with this issue.
   */
  projectIds?: string[] | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateIssue
 */
export interface IUpdateIssuePayload {
  __typename: 'UpdateIssuePayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The issue.
   */
  issue: IIssue | null
}

/**
 * Autogenerated input type of UpdateIssueComment
 */
export interface IUpdateIssueCommentInput {
  /**
   * The ID of the IssueComment to modify.
   */
  id: string

  /**
   * The updated text of the comment.
   */
  body: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateIssueComment
 */
export interface IUpdateIssueCommentPayload {
  __typename: 'UpdateIssueCommentPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated comment.
   */
  issueComment: IIssueComment | null
}

/**
 * Autogenerated input type of UpdateProject
 */
export interface IUpdateProjectInput {
  /**
   * The Project ID to update.
   */
  projectId: string

  /**
   * The name of project.
   */
  name?: string | null

  /**
   * The description of project.
   */
  body?: string | null

  /**
   * Whether the project is open or closed.
   */
  state?: ProjectState | null

  /**
   * Whether the project is public or not.
   */
  public?: boolean | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateProject
 */
export interface IUpdateProjectPayload {
  __typename: 'UpdateProjectPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated project.
   */
  project: IProject | null
}

/**
 * Autogenerated input type of UpdateProjectCard
 */
export interface IUpdateProjectCardInput {
  /**
   * The ProjectCard ID to update.
   */
  projectCardId: string

  /**
   * Whether or not the ProjectCard should be archived
   */
  isArchived?: boolean | null

  /**
   * The note of ProjectCard.
   */
  note?: string | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateProjectCard
 */
export interface IUpdateProjectCardPayload {
  __typename: 'UpdateProjectCardPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated ProjectCard.
   */
  projectCard: IProjectCard | null
}

/**
 * Autogenerated input type of UpdateProjectColumn
 */
export interface IUpdateProjectColumnInput {
  /**
   * The ProjectColumn ID to update.
   */
  projectColumnId: string

  /**
   * The name of project column.
   */
  name: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateProjectColumn
 */
export interface IUpdateProjectColumnPayload {
  __typename: 'UpdateProjectColumnPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated project column.
   */
  projectColumn: IProjectColumn | null
}

/**
 * Autogenerated input type of UpdatePullRequest
 */
export interface IUpdatePullRequestInput {
  /**
   * The Node ID of the pull request.
   */
  pullRequestId: string

  /**
   * The name of the branch you want your changes pulled into. This should be an existing branch
   * on the current repository.
   *
   */
  baseRefName?: string | null

  /**
   * The title of the pull request.
   */
  title?: string | null

  /**
   * The contents of the pull request.
   */
  body?: string | null

  /**
   * Indicates whether maintainers can modify the pull request.
   */
  maintainerCanModify?: boolean | null

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdatePullRequest
 */
export interface IUpdatePullRequestPayload {
  __typename: 'UpdatePullRequestPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated pull request.
   */
  pullRequest: IPullRequest | null
}

/**
 * Autogenerated input type of UpdatePullRequestReview
 */
export interface IUpdatePullRequestReviewInput {
  /**
   * The Node ID of the pull request review to modify.
   */
  pullRequestReviewId: string

  /**
   * The contents of the pull request review body.
   */
  body: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdatePullRequestReview
 */
export interface IUpdatePullRequestReviewPayload {
  __typename: 'UpdatePullRequestReviewPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated pull request review.
   */
  pullRequestReview: IPullRequestReview | null
}

/**
 * Autogenerated input type of UpdatePullRequestReviewComment
 */
export interface IUpdatePullRequestReviewCommentInput {
  /**
   * The Node ID of the comment to modify.
   */
  pullRequestReviewCommentId: string

  /**
   * The text of the comment.
   */
  body: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdatePullRequestReviewComment
 */
export interface IUpdatePullRequestReviewCommentPayload {
  __typename: 'UpdatePullRequestReviewCommentPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The updated comment.
   */
  pullRequestReviewComment: IPullRequestReviewComment | null
}

/**
 * Autogenerated input type of UpdateSubscription
 */
export interface IUpdateSubscriptionInput {
  /**
   * The Node ID of the subscribable object to modify.
   */
  subscribableId: string

  /**
   * The new state of the subscription.
   */
  state: SubscriptionState

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateSubscription
 */
export interface IUpdateSubscriptionPayload {
  __typename: 'UpdateSubscriptionPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * The input subscribable entity.
   */
  subscribable: Subscribable | null
}

/**
 * Autogenerated input type of UpdateTopics
 */
export interface IUpdateTopicsInput {
  /**
   * The Node ID of the repository.
   */
  repositoryId: string

  /**
   * An array of topic names.
   */
  topicNames: string[]

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated return type of UpdateTopics
 */
export interface IUpdateTopicsPayload {
  __typename: 'UpdateTopicsPayload'

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null

  /**
   * Names of the provided topics that are not valid.
   */
  invalidTopicNames: string[] | null

  /**
   * The updated repository.
   */
  repository: IRepository | null
}

/**
 * Represents a Git blob.
 */
export interface IBlob {
  __typename: 'Blob'

  /**
   * An abbreviated version of the Git object ID
   */
  abbreviatedOid: string

  /**
   * Byte size of Blob object
   */
  byteSize: number

  /**
   * The HTTP path for this Git object
   */
  commitResourcePath: any

  /**
   * The HTTP URL for this Git object
   */
  commitUrl: any
  id: string

  /**
   * Indicates whether the Blob is binary or text
   */
  isBinary: boolean

  /**
   * Indicates whether the contents is truncated
   */
  isTruncated: boolean

  /**
   * The Git object ID
   */
  oid: any

  /**
   * The Repository the Git object belongs to
   */
  repository: IRepository

  /**
   * UTF8 text data or null if the Blob is binary
   */
  text: string | null
}

/**
 * A special type of user which takes actions on behalf of GitHub Apps.
 */
export interface IBot {
  __typename: 'Bot'

  /**
   * A URL pointing to the GitHub App's public avatar.
   */
  avatarUrl: any

  /**
   * Identifies the date and time when the object was created.
   */
  createdAt: any

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number | null
  id: string

  /**
   * The username of the actor.
   */
  login: string

  /**
   * The HTTP path for this bot
   */
  resourcePath: any

  /**
   * Identifies the date and time when the object was last updated.
   */
  updatedAt: any

  /**
   * The HTTP URL for this bot
   */
  url: any
}

export interface IAvatarUrlOnBotArguments {
  /**
   * The size of the resulting square image.
   */
  size?: number | null
}

/**
 * The possible PubSub channels for an issue.
 */
export const enum IssuePubSubTopic {
  /**
   * The channel ID for observing issue updates.
   */
  UPDATED = 'UPDATED',

  /**
   * The channel ID for marking an issue as read.
   */
  MARKASREAD = 'MARKASREAD',

  /**
   * The channel ID for updating items on the issue timeline.
   */
  TIMELINE = 'TIMELINE',

  /**
   * The channel ID for observing issue state updates.
   */
  STATE = 'STATE'
}

/**
 * The possible states in which authentication can be configured with an identity provider.
 */
export const enum IdentityProviderConfigurationState {
  /**
   * Authentication with an identity provider is configured and enforced.
   */
  ENFORCED = 'ENFORCED',

  /**
   * Authentication with an identity provider is configured but not enforced.
   */
  CONFIGURED = 'CONFIGURED',

  /**
   * Authentication with an identity provider is not configured.
   */
  UNCONFIGURED = 'UNCONFIGURED'
}

/**
 * An edge in a connection.
 */
export interface IRepositoryInvitationEdge {
  __typename: 'RepositoryInvitationEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IRepositoryInvitation | null
}

/**
 * An invitation for a user to be added to a repository.
 */
export interface IRepositoryInvitation {
  __typename: 'RepositoryInvitation'
  id: string

  /**
   * The user who received the invitation.
   */
  invitee: IGitHubUser

  /**
   * The user who created the invitation.
   */
  inviter: IGitHubUser

  /**
   * The permission granted on this repository by this invitation.
   */
  permission: RepositoryPermission

  /**
   * The Repository the user is invited to.
   */
  repository: RepositoryInfo | null
}

/**
 * The possible PubSub channels for a pull request.
 */
export const enum PullRequestPubSubTopic {
  /**
   * The channel ID for observing pull request updates.
   */
  UPDATED = 'UPDATED',

  /**
   * The channel ID for marking an pull request as read.
   */
  MARKASREAD = 'MARKASREAD',

  /**
   * The channel ID for observing head ref updates.
   */
  HEAD_REF = 'HEAD_REF',

  /**
   * The channel ID for updating items on the pull request timeline.
   */
  TIMELINE = 'TIMELINE',

  /**
   * The channel ID for observing pull request state updates.
   */
  STATE = 'STATE'
}

/**
 * The affiliation type between collaborator and repository.
 */
export const enum RepositoryCollaboratorAffiliation {
  /**
   * All collaborators of the repository.
   */
  ALL = 'ALL',

  /**
   * All outside collaborators of an organization-owned repository.
   */
  OUTSIDE = 'OUTSIDE'
}

/**
 * The connection type for Topic.
 */
export interface ITopicConnection {
  __typename: 'TopicConnection'

  /**
   * A list of edges.
   */
  edges: (ITopicEdge | null)[] | null

  /**
   * A list of nodes.
   */
  nodes: (ITopic | null)[] | null

  /**
   * Information to aid in pagination.
   */
  pageInfo: IPageInfo

  /**
   * Identifies the total count of items in the connection.
   */
  totalCount: number
}

/**
 * An edge in a connection.
 */
export interface ITopicEdge {
  __typename: 'TopicEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: ITopic | null
}

/**
 * An edge in a connection.
 */
export interface IAppEdge {
  __typename: 'AppEdge'

  /**
   * A cursor for use in pagination.
   */
  cursor: string

  /**
   * The item at the end of the edge.
   */
  node: IApp | null
}

/**
 * Types that can be inside Collection Items.
 */
export type CollectionItemContent = IRepository | IOrganization | IGitHubUser

/**
 * Autogenerated input type of MinimizeComment
 */
export interface IMinimizeCommentInput {
  /**
   * The Node ID of the subject to modify.
   */
  subjectId: string

  /**
   * The classification of comment
   */
  classifier: ReportedContentClassifiers

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * The reasons a piece of content can be reported or minimized.
 */
export const enum ReportedContentClassifiers {
  /**
   * A spammy piece of content
   */
  SPAM = 'SPAM',

  /**
   * An abusive or harassing piece of content
   */
  ABUSE = 'ABUSE',

  /**
   * An irrelevant piece of content
   */
  OFF_TOPIC = 'OFF_TOPIC',

  /**
   * An outdated piece of content
   */
  OUTDATED = 'OUTDATED',

  /**
   * The content has been resolved
   */
  RESOLVED = 'RESOLVED'
}

/**
 * Autogenerated input type of UnminimizeComment
 */
export interface IUnminimizeCommentInput {
  /**
   * The Node ID of the subject to modify.
   */
  subjectId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated input type of ImportProject
 */
export interface IImportProjectInput {
  /**
   * The name of the Organization or User to create the Project under.
   */
  ownerName: string

  /**
   * The name of Project.
   */
  name: string

  /**
   * The description of Project.
   */
  body?: string | null

  /**
   * Whether the Project is public or not.
   * @default false
   */
  public?: boolean | null

  /**
   * A list of columns containing issues and pull requests.
   */
  columnImports: IProjectColumnImport[]

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * A project column and a list of its issues and PRs.
 */
export interface IProjectColumnImport {
  /**
   * The name of the column.
   */
  columnName: string

  /**
   * The position of the column, starting from 0.
   */
  position: number

  /**
   * A list of issues and pull requests in the column.
   */
  issues?: IProjectCardImport[] | null
}

/**
 * An issue or PR and its owning repository to be used in a project card.
 */
export interface IProjectCardImport {
  /**
   * Repository name with owner (owner/repository).
   */
  repository: string

  /**
   * The issue or pull request number.
   */
  number: number
}

/**
 * Autogenerated input type of PinIssue
 */
export interface IPinIssueInput {
  /**
   * The ID of the issue to be pinned
   */
  issueId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Autogenerated input type of UnpinIssue
 */
export interface IUnpinIssueInput {
  /**
   * The ID of the issue to be unpinned
   */
  issueId: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * A content attachment
 */
export interface IContentAttachment {
  __typename: 'ContentAttachment'

  /**
   * The body text of the content attachment. This parameter supports markdown.
   */
  body: string

  /**
   * The content reference that the content attachment is attached to.
   */
  contentReference: IContentReference

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number
  id: string

  /**
   * The title of the content attachment.
   */
  title: string
}

/**
 * A content reference
 */
export interface IContentReference {
  __typename: 'ContentReference'

  /**
   * Identifies the primary key from the database.
   */
  databaseId: number
  id: string

  /**
   * The reference of the content reference.
   */
  reference: string
}

/**
 * Autogenerated input type of CreateContentAttachment
 */
export interface ICreateContentAttachmentInput {
  /**
   * The node ID of the content_reference.
   */
  contentReferenceId: string

  /**
   * The title of the content attachment.
   */
  title: string

  /**
   * The body of the content attachment, which may contain markdown.
   */
  body: string

  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId?: string | null
}

/**
 * Represents a GPG signature on a Commit or Tag.
 */
export interface IGpgSignature {
  __typename: 'GpgSignature'

  /**
   * Email used to sign this object.
   */
  email: string

  /**
   * True if the signature is valid and verified by GitHub.
   */
  isValid: boolean

  /**
   * Hex-encoded ID of the key that signed this object.
   */
  keyId: string | null

  /**
   * Payload for GPG signing object. Raw ODB object without the signature header.
   */
  payload: string

  /**
   * ASCII-armored signature header from object.
   */
  signature: string

  /**
   * GitHub user corresponding to the email signing this commit.
   */
  signer: IGitHubUser | null

  /**
   * The state of this signature. `VALID` if signature is valid and verified by GitHub, otherwise represents reason why signature is considered invalid.
   */
  state: GitSignatureState

  /**
   * True if the signature was made with GitHub's signing key.
   */
  wasSignedByGitHub: boolean
}

/**
 * Represents an S/MIME signature on a Commit or Tag.
 */
export interface ISmimeSignature {
  __typename: 'SmimeSignature'

  /**
   * Email used to sign this object.
   */
  email: string

  /**
   * True if the signature is valid and verified by GitHub.
   */
  isValid: boolean

  /**
   * Payload for GPG signing object. Raw ODB object without the signature header.
   */
  payload: string

  /**
   * ASCII-armored signature header from object.
   */
  signature: string

  /**
   * GitHub user corresponding to the email signing this commit.
   */
  signer: IGitHubUser | null

  /**
   * The state of this signature. `VALID` if signature is valid and verified by GitHub, otherwise represents reason why signature is considered invalid.
   */
  state: GitSignatureState

  /**
   * True if the signature was made with GitHub's signing key.
   */
  wasSignedByGitHub: boolean
}

/**
 * Represents a Git tag.
 */
export interface ITag {
  __typename: 'Tag'

  /**
   * An abbreviated version of the Git object ID
   */
  abbreviatedOid: string

  /**
   * The HTTP path for this Git object
   */
  commitResourcePath: any

  /**
   * The HTTP URL for this Git object
   */
  commitUrl: any
  id: string

  /**
   * The Git tag message.
   */
  message: string | null

  /**
   * The Git tag name.
   */
  name: string

  /**
   * The Git object ID
   */
  oid: any

  /**
   * The Repository the Git object belongs to
   */
  repository: IRepository

  /**
   * Details about the tag author.
   */
  tagger: IGitActor | null

  /**
   * The Git object the tag points to.
   */
  target: GitObject
}

/**
 * Represents an unknown signature on a Commit or Tag.
 */
export interface IUnknownSignature {
  __typename: 'UnknownSignature'

  /**
   * Email used to sign this object.
   */
  email: string

  /**
   * True if the signature is valid and verified by GitHub.
   */
  isValid: boolean

  /**
   * Payload for GPG signing object. Raw ODB object without the signature header.
   */
  payload: string

  /**
   * ASCII-armored signature header from object.
   */
  signature: string

  /**
   * GitHub user corresponding to the email signing this commit.
   */
  signer: IGitHubUser | null

  /**
   * The state of this signature. `VALID` if signature is valid and verified by GitHub, otherwise represents reason why signature is considered invalid.
   */
  state: GitSignatureState

  /**
   * True if the signature was made with GitHub's signing key.
   */
  wasSignedByGitHub: boolean
}

// tslint:enable
