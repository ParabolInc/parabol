import {fetch} from '@whatwg-node/fetch'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import JiraProjectKeyId from 'parabol-client/shared/gqlIds/JiraProjectKeyId'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import AtlassianManager, {
  AtlassianError,
  RateLimitError
} from 'parabol-client/utils/AtlassianManager'
import composeJQL from 'parabol-client/utils/composeJQL'
import {MAX_REQUEST_TIME} from 'parabol-client/utils/constants'
import {
  OAuth2AuthorizationParams,
  OAuth2RefreshAuthorizationParams
} from '../integrations/OAuth2Manager'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import {Logger} from './Logger'
import {makeOAuth2Redirect} from './makeOAuth2Redirect'

export interface JiraUser {
  self: string
  key: string
  accountId: string
  name: string
  emailAddress: string
  avatarUrls: {[key: string]: string}
  displayName: string
  active: boolean
  timeZone: string
}

export interface AccessibleResource {
  id: string
  name: string
  scopes: string[]
  avatarUrl: string
  url: string
}

interface AvatarURLs {
  '48x48': string
  '24x24': string
  '16x16': string
  '32x32': string
}
export interface JiraProject {
  self: string
  id: string
  key: string
  name: string
  avatarUrls: AvatarURLs
  projectCategory: {
    self: string
    id: string
    name: string
    description: string
  }
  simplified: boolean
  style: string
}

export interface JiraProjectResponse {
  self: string
  nextPage: string
  maxResults: number
  startAt: number
  total: number
  isLast: boolean
  values: JiraProject[]
}

export interface JiraIssueType {
  self: string
  id: string
  description: string
  iconUrl: string
  name: string
  subtask: boolean
  fields?: {
    issuetype: {
      required: boolean
      name: string
      key: string
      hasDefaultValue: false
      operations: string[]
    }
  }
}

interface GetProjectsResult {
  cloudId: string
  newProjects: JiraProject[]
}

interface Reporter {
  id: string
}

interface Assignee {
  id: string
}

interface CreateIssueFields {
  assignee: Assignee
  summary: string
  description?: Record<any, any>
  reporter?: Reporter // probably can't use, it throws a lot of errors
  project?: Partial<JiraProject>
  issuetype?: Partial<JiraIssueType>
}

interface IssueCreateMetadata {
  projects: (Pick<JiraProject, 'self' | 'id' | 'key' | 'name' | 'avatarUrls'> & {
    issuetypes: [JiraIssueType, ...JiraIssueType[]]
  })[]
}

export interface JiraCreateIssueResponse {
  id: string
  key: string
  self: string
}

type GetProjectsCallback = (
  error: AtlassianError | Error | null,
  result: GetProjectsResult | null
) => void

type JiraIssueProperties = any
type JiraIssueNames = any
type JiraIssueSchema = any
type JiraIssueTransition = any
type JiraOperations = any
type JiraIssueUpdateMetadata = any
type JiraPageOfChangelogs = any
type JiraVersionedRepresentations = any
type JiraIncludedFields = any

interface JiraIssueBean<F = {description: any; summary: string; created: string}, R = unknown> {
  expand: string
  id: string
  self: string
  key: string
  renderedFields: R
  properties: JiraIssueProperties
  names: JiraIssueNames
  schema: JiraIssueSchema
  transitions: JiraIssueTransition[]
  operations: JiraOperations
  editmeta: JiraIssueUpdateMetadata
  changelog: JiraPageOfChangelogs
  versionedRepresentations: JiraVersionedRepresentations
  fieldsToInclude: JiraIncludedFields
  fields: F
}

export type JiraIssueRaw = JiraIssueBean<
  {description: string; summary: string; issuetype: {id: string; iconUrl: string}; created: string},
  {description: string}
>

interface JiraAuthor {
  self: string
  emailAddress: string
  avatarUrls: AvatarURLs
  displayName: string
  active: boolean
  timeZone: string
  accountType: 'atlassian'
}

interface JiraAddCommentResponse {
  self: string
  id: string
  author: JiraAuthor
  body: {
    version: 1
    type: 'doc'
    content: any[]
  }
  updateAuthor: JiraAuthor
  created: string
  updated: string
  jsdPublic: true
}

export type JiraGetIssueRes = JiraIssueBean<JiraGQLFields>

export interface JiraGQLFields {
  issuetype: {
    id: string
    iconUrl: string
  }
  project?: {
    simplified: boolean
  }
  cloudId: string
  description: any
  descriptionHTML: string
  issueKey: string
  summary: string
  lastUpdated: string
}
interface JiraSearchResponse<
  T = {
    summary: string
    description: string
    issuetype: {id: string; iconUrl: string}
    created: string
  }
> {
  expand: string
  startAt: number
  maxResults: number
  total: number
  issues: {
    expand: string
    id: string
    self: string
    key: string
    fields: T
    renderedFields: {
      description: string
    }
    changelog: {
      histories: {
        created: string
      }[]
    }
  }[]
}

/*
interface JiraField {
  issuetype: {
    id: string
  }
  clauseNames: string[]
  custom: boolean
  id: string
  key: string
  name: string
  navigable: boolean
  orderable: boolean
  schema: {
    custom: string
    customId: number
    type: string
  }
  searchable: boolean
  untranslatedName: string
}
*/

export interface JiraScreen {
  id: string
  name: string
  description: string
}

export interface JiraScreenTab {
  id: string
  name: string
}

export interface JiraAddScreenFieldResponse {
  id: string
  name: string
}

interface JiraPageBean<T> {
  startAt: number
  maxResults: number
  total: number
  isLast: boolean
  values: T[]
}

export type JiraScreensResponse = JiraPageBean<JiraScreen>

class AtlassianServerManager extends AtlassianManager {
  fetch = fetch
  static async init(code: string) {
    return AtlassianServerManager.fetchToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: makeOAuth2Redirect()
    })
  }

  static async refresh(refreshToken: string) {
    return AtlassianServerManager.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  private static async fetchToken(
    partialQueryParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    const body = {
      ...partialQueryParams,
      client_id: process.env.ATLASSIAN_CLIENT_ID!,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET!
    }

    const authUrl = `https://auth.atlassian.com/oauth/token`
    return authorizeOAuth2({authUrl, body})
  }

  constructor(accessToken: string) {
    super(accessToken)
  }

  async getAccessibleResources() {
    return this.get<AccessibleResource[]>(
      'https://api.atlassian.com/oauth/token/accessible-resources'
    )
  }

  async getMyself(cloudId: string) {
    return this.get<JiraUser>(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`)
  }

  async getPaginatedProjects(cloudId: string, url: string, callback: GetProjectsCallback) {
    const res = await this.get<JiraProjectResponse>(url)
    if (res instanceof Error || res instanceof RateLimitError) {
      callback(res, null)
    } else {
      callback(null, {cloudId, newProjects: res.values})
      if (res.nextPage) {
        await this.getPaginatedProjects(cloudId, res.nextPage, callback).catch(Logger.error)
      }
    }
  }

  async getProjects(cloudIds: string[], callback: GetProjectsCallback) {
    return Promise.all(
      cloudIds.map(async (cloudId) => {
        return this.getPaginatedProjects(
          cloudId,
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?orderBy=name`,
          callback
        ).catch(Logger.error)
      })
    )
  }

  async getImage(imageUrl: string) {
    try {
      const imageRes = await this.fetch(imageUrl, {
        headers: {Authorization: this.headers.Authorization},
        signal: AbortSignal.timeout(MAX_REQUEST_TIME)
      })

      if (!imageRes) return null
      const arrayBuffer = await imageRes.arrayBuffer()
      return {
        imageBuffer: Buffer.from(arrayBuffer),
        contentType: imageRes.headers.get('content-type')
      }
    } catch (error) {
      return null
    }
  }

  async getAllProjects(cloudIds: string[]) {
    const projects = [] as (JiraProject & {cloudId: string})[]
    let error: Error | undefined
    const getProjectsPage = async (
      cloudId: string,
      startAt: number,
      maxResults: number
    ): Promise<void> => {
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?orderBy=name&startAt=${startAt}`
      const res = await this.get<JiraProjectResponse>(url)
      if (res instanceof Error || res instanceof RateLimitError) {
        error = res
      } else {
        const pagedProjects = res.values.map((project) => ({
          ...project,
          cloudId
        }))
        projects.push(...pagedProjects)

        if (pagedProjects.length < maxResults && res.nextPage) {
          Logger.log(
            'Underfetched in getAllProjects, requested',
            maxResults,
            'got',
            pagedProjects.length
          )
          const nextStart = res.startAt + pagedProjects.length
          const nextMaxResults = maxResults - pagedProjects.length
          return getProjectsPage(cloudId, nextStart, nextMaxResults)
        }
      }
    }

    const getProjects = async (cloudId: string) => {
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?orderBy=name`
      const res = await this.get<JiraProjectResponse>(url)
      if (res instanceof Error || res instanceof RateLimitError) {
        error = res
      } else {
        const pagedProjects = res.values.map((project) => ({
          ...project,
          cloudId
        }))
        projects.push(...pagedProjects)
        if (res.nextPage) {
          const {total} = res
          const nextStart = res.startAt + pagedProjects.length
          const fetches = [] as Array<Promise<void>>
          // 50 is the default maxResults for Jira, Jira does not respond with more than that
          const maxResults = 50
          for (let i = nextStart; i < total; i += maxResults) {
            fetches.push(getProjectsPage(cloudId, i, maxResults))
          }
          await Promise.all(fetches)
        }
      }
    }

    await Promise.all(cloudIds.map((cloudId) => getProjects(cloudId)))

    if (error) {
      Logger.log('getAllProjects ERROR:', error)
    }
    return projects
  }

  async getProject(cloudId: string, projectKey: string) {
    const project = await this.get<JiraProject>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`
    )

    return project
  }

  async getCreateMeta(cloudId: string, projectKeys?: string[]) {
    let args = ''
    if (projectKeys) {
      args += `projectKeys=${projectKeys.join(',')}`
    }
    if (args.length) {
      args = '?' + args
    }
    return this.get<IssueCreateMetadata>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/createmeta${args}`
    )
  }

  async getEditMeta(cloudId: string, issueKey: string) {
    return this.get<IssueCreateMetadata>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/editmeta`
    )
  }

  async createIssue(cloudId: string, projectKey: string, issueFields: CreateIssueFields) {
    const payload = {
      fields: {
        project: {
          key: projectKey
        },
        ...issueFields
      } as CreateIssueFields
    }
    return this.post<JiraCreateIssueResponse>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`,
      payload
    )
  }

  async getCloudNameLookup() {
    const sites = await this.getAccessibleResources()
    const cloudNameLookup = {} as {[cloudId: string]: string}
    if (sites instanceof Error || sites instanceof RateLimitError) {
      return sites
    }
    sites.forEach((site) => {
      cloudNameLookup[site.id] = site.name
    })
    return cloudNameLookup
  }

  async getIssue(
    cloudId: string,
    issueKey: string,
    extraFieldIds: string[] = [],
    extraExpand: string[] = []
  ) {
    const reqFields = extraFieldIds.includes('*all')
      ? '*all'
      : ['summary', 'description', 'issuetype', 'created', ...extraFieldIds].join(',')
    const expand = ['renderedFields', 'changelog', 'editmeta', 'names', ...extraExpand].join(',')
    const issueRes = await this.get<JiraIssueRaw>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}?fields=${reqFields}&expand=${expand}`
    )
    if (issueRes instanceof Error || issueRes instanceof RateLimitError) return issueRes
    return {
      ...issueRes,
      fields: {
        ...issueRes.fields,
        descriptionHTML: issueRes.renderedFields.description,
        cloudId,
        issueKey,
        id: JiraIssueId.join(cloudId, issueKey),
        lastUpdated: issueRes.changelog.histories[0]?.created ?? issueRes.fields.created
      }
    }
  }

  async getIssues(
    queryString: string | null,
    isJQL: boolean,
    projectFiltersByCloudId: {[cloudId: string]: string[]},
    maxResults: number,
    startAt?: number
  ) {
    const allIssues = [] as JiraGQLFields[]
    let firstError: Error | undefined
    const reqs = Object.entries(projectFiltersByCloudId).map(async ([cloudId, projectKeys]) => {
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`
      const jql = composeJQL(queryString, isJQL, projectKeys)
      const payload = {
        jql,
        maxResults,
        startAt,
        fields: ['summary', 'description', 'issuetype', 'created'],
        expand: ['renderedFields,changelog']
      }

      const res = await this.post<JiraSearchResponse>(url, payload)
      if (res instanceof Error) {
        if (!firstError) {
          firstError = res
          if (firstError.message.includes('not installed on this instance')) {
            firstError.message = 'Jira access revoked. Please reintegrate with Jira.'
          }
        }
        return
      }
      const issues = res.issues.map((issue) => {
        const {key: issueKey, fields, renderedFields, changelog} = issue
        const {description, summary, issuetype, created} = fields
        const {description: descriptionHTML} = renderedFields
        return {
          issuetype,
          summary,
          description,
          descriptionHTML,
          cloudId,
          issueKey,
          lastUpdated: changelog.histories[0]?.created ?? created
        }
      })
      allIssues.push(...issues)
    })
    await Promise.all(reqs)
    return {error: firstError, issues: allIssues}
  }

  async getComments(cloudId: string, issueKey: string) {
    return this.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/comment`
    ) as any
  }

  async getFieldScreens(cloudId: string, fieldId: string) {
    return this.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/field/${fieldId}/screens`
    ) as any
  }

  async addComment(cloudId: string, issueKey: string, body: any) {
    const payload = {
      body
    }
    return this.post<JiraAddCommentResponse>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}/comment`,
      payload
    )
  }

  async updateStoryPoints(
    cloudId: string,
    issueKey: string,
    storyPoints: string | number,
    fieldId: string
  ) {
    // according to Jira docs fields related to the time tracking have to be set in a different way than other fields
    // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-put
    // more context: https://github.com/ParabolInc/parabol/issues/5705#issuecomment-1007501068
    let payload: Record<string, any>
    const timeTrackingFieldId = 'timetracking'
    const timeTrackingFieldLookup = {
      timeoriginalestimate: 'originalEstimate',
      timeestimate: 'remainingEstimate'
    } as const
    const timeTrackingFieldName =
      timeTrackingFieldLookup[fieldId as keyof typeof timeTrackingFieldLookup]
    if (!!timeTrackingFieldName) {
      payload = {
        update: {
          [timeTrackingFieldId]: [
            {
              set: {
                // time tracking fields have to be set in time format, we're setting them in (h)ours
                [timeTrackingFieldName]: `${storyPoints}h`
              }
            }
          ]
        }
      }
    } else {
      payload = {
        fields: {
          [fieldId]: storyPoints
        }
      }
    }
    const res = await this.put(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
      payload
    )
    if (res === null) return
    if (res.message.includes('The app is not installed on this instance')) {
      throw new Error(
        'The user who added this issue was removed from Jira. Please remove & re-add the issue'
      )
    }
    if (
      res.message.startsWith(timeTrackingFieldName ? timeTrackingFieldId : fieldId) &&
      res.message.includes('is not on the appropriate screen')
    ) {
      const projectKey = JiraProjectKeyId.join(issueKey)
      const project = await this.getProject(cloudId, projectKey)

      if (project instanceof RateLimitError || project instanceof Error) {
        throw project as Error
      }

      if (project.simplified) {
        if (timeTrackingFieldName) {
          throw new Error(SprintPokerDefaults.JIRA_FIELD_UPDATE_ERROR_ESTIMATION_TIMETRACKING)
        }
        throw new Error(SprintPokerDefaults.JIRA_FIELD_UPDATE_ERROR_ESTIMATION)
      }

      throw new Error(SprintPokerDefaults.JIRA_FIELD_UPDATE_ERROR)
    }
    throw res
  }

  async getScreens(cloudId: string, maxResults: number, startAt = 0) {
    return this.get<JiraScreensResponse>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens?maxResults=${maxResults}&startAt=${startAt}`
    )
  }

  async getScreenTabs(cloudId: string, screenId: string) {
    // a screen has at least 1 tab
    return this.get<[JiraScreenTab, ...JiraScreenTab[]]>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens/${screenId}/tabs`
    )
  }

  async addFieldToScreenTab(cloudId: string, screenId: string, tabId: string, fieldId: string) {
    return this.post<JiraAddScreenFieldResponse>(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens/${screenId}/tabs/${tabId}/fields/`,
      {fieldId}
    )
  }

  async removeFieldFromScreenTab(
    cloudId: string,
    screenId: string,
    tabId: string,
    fieldId: string
  ) {
    return this.delete(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens/${screenId}/tabs/${tabId}/fields/${fieldId}`
    )
  }
}

export default AtlassianServerManager
