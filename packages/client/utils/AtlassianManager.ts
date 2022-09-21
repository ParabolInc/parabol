import AbortController from 'abort-controller'
import JiraIssueId from '../shared/gqlIds/JiraIssueId'
import JiraProjectKeyId from '../shared/gqlIds/JiraProjectKeyId'
import {SprintPokerDefaults} from '../types/constEnums'
import composeJQL from './composeJQL'

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

export interface AtlassianError {
  code: number
  message: string
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

interface JiraNoAccessError {
  errorMessages: ['The app is not installed on this instance.']
}
interface JiraFieldError {
  errors: {
    [fieldName: string]: string
  }
}

interface JiraGetError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}
type JiraError = JiraNoAccessError | JiraFieldError | JiraGetError

type JiraIssueProperties = any
type JiraIssueNames = any
type JiraIssueSchema = any
type JiraIssueTransition = any
type JiraOperations = any
type JiraIssueUpdateMetadata = any
type JiraPageOfChangelogs = any
type JiraVersionedRepresentations = any
type JiraIncludedFields = any

interface JiraIssueBean<F = {description: any; summary: string}, R = unknown> {
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
  {description: string; summary: string},
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
  project?: {
    simplified: boolean
  }
  cloudId: string
  description: any
  descriptionHTML: string
  issueKey: string
  summary: string
}
interface JiraSearchResponse<T = {summary: string; description: string}> {
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
  }[]
}

interface JiraField {
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

export function isJiraNoAccessError<T>(
  response: T | JiraNoAccessError
): response is JiraNoAccessError {
  return 'errorMessages' in response && response.errorMessages.length > 0
}

export type JiraScreensResponse = JiraPageBean<JiraScreen>

const MAX_REQUEST_TIME = 5000

export type JiraPermissionScope =
  | 'read:jira-user'
  | 'read:jira-work'
  | 'write:jira-work'
  | 'offline_access'
  | 'manage:jira-project'

export class RateLimitError {
  retryAt: Date
  name: 'RateLimitError' = 'RateLimitError'
  message: string

  constructor(message: string, retryAt: Date) {
    this.message = message
    this.retryAt = retryAt
  }
}
Object.setPrototypeOf(RateLimitError.prototype, Error.prototype)

export default abstract class AtlassianManager {
  abstract fetch: typeof fetch
  static SCOPE: JiraPermissionScope[] = [
    'read:jira-user',
    'read:jira-work',
    'write:jira-work',
    'offline_access'
  ]
  static MANAGE_SCOPE: JiraPermissionScope[] = [...AtlassianManager.SCOPE, 'manage:jira-project']
  accessToken: string
  private headers = {
    Authorization: '',
    Accept: 'application/json' as const,
    'Content-Type': 'application/json' as const
  }
  private readonly fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController()
    const {signal} = controller
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME)
    try {
      const res = await this.fetch(url, {...options, signal})
      clearTimeout(timeout)
      return res
    } catch (e) {
      clearTimeout(timeout)
      return new Error('Atlassian is down')
    }
  }
  private readonly get = async <T>(url: string) => {
    const res = await this.fetchWithTimeout(url, {headers: this.headers})
    if (res instanceof Error) {
      return res
    }
    const {headers} = res
    if (res.status === 429) {
      const retryAfterSeconds = headers.get('Retry-After') ?? '3'
      return new RateLimitError(
        'got jira rate limit error',
        new Date(Date.now() + Number(retryAfterSeconds) * 1000)
      )
    }
    const contentType = headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Error('Received non-JSON Atlassian Response')
    }
    const json = (await res.json()) as AtlassianError | JiraNoAccessError | JiraGetError | T
    if ('message' in json) {
      if (json.message === 'No message available' && 'error' in json) {
        return new Error(json.error)
      }
      return new Error(json.message)
    }
    if (isJiraNoAccessError(json)) {
      return new Error(json.errorMessages[0])
    }
    return json
  }
  private readonly post = async <T>(url: string, payload: any) => {
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload)
    })
    if (res instanceof Error) {
      return res
    }
    const json = (await res.json()) as JiraError | AtlassianError | T
    if ('message' in json) {
      return new Error(json.message)
    }
    if (isJiraNoAccessError(json)) {
      return new Error(json.errorMessages[0])
    }
    if ('errors' in json) {
      const errorFieldName = Object.keys(json.errors)[0] || 'Unknown'
      return new Error(`${errorFieldName}: ${json.errors[errorFieldName]}`)
    }
    return json
  }
  private readonly put = async (url: string, payload: any) => {
    const res = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(payload)
    })
    if (res instanceof Error) {
      return res
    }

    if (res.status === 204) return null
    const error = (await res.json()) as AtlassianError | JiraError
    if ('message' in error) {
      return new Error(error.message)
    }
    if (isJiraNoAccessError(error)) {
      return new Error(error.errorMessages[0])
    }
    if ('errors' in error) {
      const errorFieldName = Object.keys(error.errors)[0]
      if (errorFieldName) {
        return new Error(`${errorFieldName}: ${error.errors[errorFieldName]}`)
      }
    }
    return new Error(`Unknown Jira error: ${JSON.stringify(error)}`)
  }
  private readonly delete = async (url: string) => {
    const res = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: this.headers
    })
    if (res instanceof Error) {
      return res
    }

    if (res.status === 204) return null
    const error = (await res.json()) as AtlassianError | JiraError
    if ('message' in error) {
      return new Error(error.message)
    }
    if (isJiraNoAccessError(error)) {
      return new Error(error.errorMessages[0])
    }
    if ('errors' in error) {
      const errorFieldName = Object.keys(error.errors)[0]
      if (errorFieldName) {
        return new Error(`${errorFieldName}: ${error.errors[errorFieldName]}`)
      }
    }

    return new Error(`Unknown Jira error: ${JSON.stringify(error)}`)
  }

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.headers.Authorization = `Bearer ${accessToken}`
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
        await this.getPaginatedProjects(cloudId, res.nextPage, callback).catch(console.error)
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
        ).catch(console.error)
      })
    )
  }

  async getImage(imageUrl: string) {
    const imageRes = await this.fetchWithTimeout(imageUrl, {
      headers: {Authorization: this.headers.Authorization}
    })

    if (!imageRes || imageRes instanceof Error) return null
    const arrayBuffer = await imageRes.arrayBuffer()
    return {
      imageBuffer: Buffer.from(arrayBuffer),
      contentType: imageRes.headers.get('content-type')
    }
  }

  async getAllProjects(cloudIds: string[]) {
    const projects = [] as (JiraProject & {cloudId: string})[]
    let error: Error | undefined
    const getProjectPage = async (cloudId: string, url: string): Promise<void> => {
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
          return getProjectPage(cloudId, res.nextPage)
        }
      }
    }
    await Promise.all(
      cloudIds.map((cloudId) =>
        getProjectPage(
          cloudId,
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?orderBy=name`
        )
      )
    )

    if (error) {
      console.log('getAllProjects ERROR:', error)
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
      : ['summary', 'description', ...extraFieldIds].join(',')
    const expand = ['renderedFields', ...extraExpand].join(',')
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
        id: JiraIssueId.join(cloudId, issueKey)
      }
    }
  }

  async getIssues(
    queryString: string | null,
    isJQL: boolean,
    projectFiltersByCloudId: {[cloudId: string]: string[]}
  ) {
    const allIssues = [] as JiraGQLFields[]
    let firstError: Error | undefined
    const reqs = Object.entries(projectFiltersByCloudId).map(async ([cloudId, projectKeys]) => {
      const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search`
      const jql = composeJQL(queryString, isJQL, projectKeys)
      const payload = {
        jql,
        maxResults: 100,
        fields: ['summary', 'description'],
        expand: ['renderedFields']
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
        const {key: issueKey, fields, renderedFields} = issue
        const {description, summary} = fields
        const {description: descriptionHTML} = renderedFields
        return {
          summary,
          description,
          descriptionHTML,
          cloudId,
          issueKey
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

  async getFields(cloudId: string) {
    return this.get<JiraField[]>(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/field`)
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

  async getFirstValidJiraField(
    cloudId: string,
    possibleFieldNames: string[],
    testIssueKeyId: string
  ) {
    const fields = await this.getFields(cloudId)
    if (fields instanceof Error || fields instanceof RateLimitError) return null

    const possibleFields = possibleFieldNames
      .map((fieldName) => {
        return fields.find((field) => field.name === fieldName)
      })
      .filter(Boolean) as JiraField[]
    const updateResArr = await Promise.all(
      possibleFields.map((field) => {
        return this.put(
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${testIssueKeyId}`,
          {
            fields: {
              [field.id]: 0
            }
          }
        )
      })
    )
    const firstValidUpdateIdx = updateResArr.indexOf(null)
    if (firstValidUpdateIdx === -1) return null
    return possibleFields[firstValidUpdateIdx]
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
        throw project
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
