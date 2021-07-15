
/**
 * Jira API throws a lot of different errors that could be placed in a different properties.
 * This type is used to expose the error under a simple interface for others to consume.
 */
export interface JiraApiError {
  errorMessage: string
}

export function isJiraApiError<T>(response: T | JiraApiError): response is JiraApiError {
  return 'errorMessage' in response
}

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

export function isAtlassianError<T>(response: T | AtlassianError): response is AtlassianError {
  return 'message' in response
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
    issuetypes: JiraIssueType[]
  })[]
}

interface JiraCreateIssueResponse {
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

export function isJiraNoAccessError<T>(
  response: T | JiraNoAccessError
): response is JiraNoAccessError {
  return 'errorMessages' in response
}

interface JiraFieldError {
  errors: {
    [fieldName: string]: string
  }
}

export function isJiraFieldError<T>(response: T | JiraFieldError): response is JiraFieldError {
  return 'errors' in response
}

type JiraError = JiraNoAccessError | JiraFieldError

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

interface JiraGQLFields {
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

export type JiraScreensResponse = JiraPageBean<JiraScreen>

const MAX_REQUEST_TIME = 5000

export type JiraPermissionScope =
  | 'read:jira-user'
  | 'read:jira-work'
  | 'write:jira-work'
  | 'offline_access'
  | 'manage:jira-project'

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
  private readonly fetchWithTimeout: (
    url: string,
    options: RequestInit,
    errorResponse?: any
  ) => ReturnType<typeof fetch>
  private readonly get: (url: string) => any
  private readonly post: (url: string, payload: any) => any
  private readonly put: (url: string, payload: any) => any
  private readonly delete: (url: string) => any
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000

  constructor(accessToken: string) {
    this.accessToken = accessToken
    const headers = {
      // an Authorization requires a preflight request, ie reqs are slow
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as const,
      'Content-Type': 'application/json'
    }
  }
  private readonly get = async <T>(url: string) => {
    const res = await this.fetchWithTimeout(url, {headers: this.headers})
    if (res instanceof Error) {
      return res
    }
    const json = (await res.json()) as AtlassianError | JiraNoAccessError | JiraGetError | T
    if ('message' in json) {
      if (json.message === 'No message available' && 'error' in json) {
        return new Error(json.error)
      }
      return new Error(json.message)
    }
    if ('errorMessages' in json) {
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

    this.delete = async (url) => {
      const res = await this.fetchWithTimeout(url, {
        method: 'DELETE',
        headers
      })
      if (res.status == 204) return null
      if ((res as any).code === -1) return res
      return res.json()
    }

    this.get = async (url) => {
      const res = await this.fetchWithTimeout(url, {headers})
      return (res as any).code === -1 ? res : res.json()
    }
    if ('errorMessages' in json) {
      return new Error(json.errorMessages[0])
    }
    if ('errors' in json) {
      const errorFieldName = Object.keys(json.errors)[0]
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

    if (res.status == 204) return null
    const error = (await res.json()) as AtlassianError
    return new Error(error.message)
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
    if (res instanceof Error) {
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

  async getProjectAvatar(avatarUrl: string) {
    // use fetchWithTimeout because we want a buffer
    const imageRes = await this.fetchWithTimeout(avatarUrl, {
      headers: {Authorization: this.headers.Authorization}
    })

    if (!imageRes || imageRes instanceof Error) return ''
    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer).toString('base64')
    const contentType = imageRes.headers.get('content-type')
    return `data:${contentType};base64,${buffer}`
  }
  async getAllProjects(cloudIds: string[]) {
    const projects = [] as (JiraProject & {cloudId: string})[]
    let error: Error | undefined
    const getProjectPage = async (cloudId: string, url: string) => {
      const res = await this.get<JiraProjectResponse>(url)
      if (res instanceof Error) {
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

  async convertMarkdownToADF(markdown: string) {
    return this.post<any>(
      'https://api.atlassian.com/pf-editor-service/convert?from=markdown&to=adf',
      {
        input: markdown
      }
    )
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
    if (sites instanceof Error) {
      return sites
    }
    sites.forEach((site) => {
      cloudNameLookup[site.id] = site.name
    })
    return cloudNameLookup
  }

  async getIssue(cloudId: string, issueKey: string, extraFieldIds: string[] = []) {
    const baseFields = ['summary', 'description']
    const reqFields = [...baseFields, ...extraFieldIds].join(',')
    const issueRes = await this.get<
      JiraIssueBean<{description: string; summary: string}, {description: string}>
    >(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}?fields=${reqFields}&expand=renderedFields`
    )
    if (issueRes instanceof Error) return issueRes
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
    queryString: string,
    isJQL: boolean,
    projectFiltersByCloudId: {[cloudId: string]: string[]}
  ) {
    const cloudIds = Object.keys(projectFiltersByCloudId)
    const allIssues = [] as JiraGQLFields[]
    let firstError: Error | undefined
    const composeJQL = (queryString: string | null, isJQL: boolean, projectKeys: string[]) => {
      const orderBy = 'order by lastViewed DESC'
      if (isJQL) return queryString || orderBy
      const projectFilter = projectKeys.length
        ? `project in (${projectKeys.map((val) => `\"${val}\"`).join(', ')})`
        : ''
      const textFilter = queryString ? `text ~ \"${queryString}\"` : ''
      const and = projectFilter && textFilter ? ' AND ' : ''
      return `${projectFilter}${and}${textFilter} ${orderBy}`
    }
    const reqs = cloudIds.map(async (cloudId) => {
      const projectKeys = projectFiltersByCloudId[cloudId]
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
    if (fields instanceof Error) return null

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
    fieldId: string,
    fieldName: string
  ) {
    const payload = {
      fields: {
        [fieldId]: isFinite(storyPoints as number) ? Number(storyPoints) : storyPoints
      }
    }
    const res = await this.put(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
      payload
    )
    if (res === null) return
    console.log('ERR', {res, storyPoints, fieldId, issueKey, cloudId})
    if (res.message.includes('The app is not installed on this instance')) {
      throw new Error(
      if ('errorMessages' in res) {
        const globalError = res.errorMessages?.[0]
        if (globalError) {
          if (globalError.includes('The app is not installed on this instance')) {
            throw new Error(
              'The user who added this issue was removed from Jira. Please remove & re-add the issue'
            )
          }
          throw new Error(globalError)
        }
      }
      if ('errors' in res) {
        const fieldError = res.errors[fieldId]
        if (fieldError.includes('is not on the appropriate screen')) {
          throw new Error(
            `Update failed! In Jira, add the field "${fieldName}" to the Issue screen.`
          )
        }
        throw new Error(`Jira: ${fieldError}`)
      }
    }
    throw res
  }

  const res = (await this.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens`
  )) as JiraScreensResponse | AtlassianError | JiraNoAccessError

  if(isJiraNoAccessError(res)) {
  return {errorMessage: res.errorMessages[0]}
}

if (isAtlassianError(res)) {
  return {errorMessage: res.message}
}

if (!('values' in res)) {
  return {errorMessage: "Couldn't fetch project screens!"}
}

return res
  }

async getScreenTabs(cloudId: string, screenId: string) {
  const res = (await this.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens/${screenId}/tabs`
  )) as JiraScreenTab[] | AtlassianError | JiraNoAccessError

  if (isJiraNoAccessError(res)) {
    return {errorMessage: res.errorMessages[0]}
  }

  if (isAtlassianError(res)) {
    return {errorMessage: res.message}
  }

  if (!Array.isArray(res)) {
    return {errorMessage: `Couldn't fetch screen: ${screenId} tabs!`}
  }

  return res
}

async addFieldToScreenTab(cloudId: string, screenId: string, tabId: string, fieldId: string) {
  const res = (await this.post(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens/${screenId}/tabs/${tabId}/fields/`,
    {fieldId}
  )) as JiraAddScreenFieldResponse | AtlassianError | JiraError

  if (isJiraNoAccessError(res)) {
    return {errorMessage: res.errorMessages[0]}
  }

  if (isJiraFieldError(res)) {
    return {errorMessage: res.errors[fieldId]}
  }

  if (isAtlassianError(res)) {
    return {errorMessage: res.message}
  }

  if (!('id' in res)) {
    return {
      errorMessage: `Couldn't add field: ${fieldId} to a screen: ${screenId} tab: ${tabId}!`
    }
  }

  return res
}

async removeFieldFromScreenTab(
  cloudId: string,
  screenId: string,
  tabId: string,
  fieldId: string
) {
  const res = (await this.delete(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/screens/${screenId}/tabs/${tabId}/fields/${fieldId}`
  )) as null | AtlassianError | JiraError
  if (res === null) return null
  if (isJiraNoAccessError(res)) {
    return {errorMessage: res.errorMessages[0]}
  }

  if (isJiraFieldError(res)) {
    return {errorMessage: res.errors[fieldId]}
  }

  if (isAtlassianError(res)) {
    return {errorMessage: res.message}
  }

  return res
}
}
