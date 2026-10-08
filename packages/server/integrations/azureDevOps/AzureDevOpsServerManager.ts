import {fetch} from '@whatwg-node/fetch'
import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
import AzureDevOpsProjectId from 'parabol-client/shared/gqlIds/AzureDevOpsProjectId'
import azureDevOpsOAuthScope from 'parabol-client/shared/integrations/azureDevOpsOAuthScope'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import {ExternalLinks} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import type {IntegrationProviderAzureDevOps} from '../../postgres/types/IntegrationProvider'
import makeCreateAzureTaskComment from '../../utils/makeCreateAzureTaskComment'
import {generateHTML} from '../../utils/tiptap/generateHTML'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import type {
  OAuth2AuthorizeResponse,
  OAuth2PkceAuthorizationParams,
  OAuth2PkceRefreshAuthorizationParams,
  OAuth2TokenResponse
} from '../OAuth2Manager'
import RepoAccess from '../platform/RepoAccess'
import type {
  CreateTaskParams,
  CreateTaskResponse,
  TaskIntegrationManager
} from '../platform/TaskIntegrationManager'
import resolveAzureDevOpsWorkItemProject from './resolveAzureDevOpsWorkItemProject'

export interface AzureDevOpsProfile {
  id: string
  displayName: string
  emailAddress: string
}

export interface AzureDevOpsOrganization {
  accountId: string
  accountName: string
}

export interface AzureDevOpsProjectReference {
  id: string
  name: string
}

export interface AzureDevOpsRawWorkItem {
  id: number
  url: string
  fields: Record<string, unknown>
  _links?: {html?: {href: string}}
}

export interface AzureDevOpsField {
  referenceName: string
  name: string
  type: string
  readOnly: boolean
}

export interface AzureDevOpsComment {
  text: string
  createdBy?: {displayName?: string}
}

interface ListResponse<T> {
  value: T[]
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  contentType?: string
}

const API_VERSION = '7.1'
const COMMENTS_API_VERSION = '7.1-preview.4'
const REQUEST_TIMEOUT_MS = 10_000
const MAX_BATCH_SIZE = 200
const PROJECT_PAGE_SIZE = 200
const MAX_PROJECT_PAGES = 10
const INSTANCE_ID_PATTERN = /^dev\.azure\.com\/[A-Za-z0-9][A-Za-z0-9_-]*$/
const REDIRECT_PATH = 'auth/ado2'

export const isAzureDevOpsInstanceId = (instanceId: string) => INSTANCE_ID_PATTERN.test(instanceId)

export const NOT_SHARED_MESSAGE =
  'That Azure DevOps project is not shared with this team. Choose projects in Team Settings > Integrations.'

class AzureDevOpsServerManager implements TaskIntegrationManager {
  fetch = fetch
  public title = 'AzureDevOps'
  private accessToken: string
  private readonly auth: TeamMemberIntegrationAuth | null
  private readonly provider: IntegrationProviderAzureDevOps | null
  readonly access: RepoAccess

  constructor(
    auth: TeamMemberIntegrationAuth | null,
    provider: IntegrationProviderAzureDevOps | null,
    access = new RepoAccess('selected', [])
  ) {
    this.auth = auth
    this.provider = provider
    this.access = access
    this.accessToken = auth?.accessToken ?? ''
  }

  async authorize(
    code: string,
    codeVerifier: string | null
  ): Promise<OAuth2AuthorizeResponse | Error> {
    if (!codeVerifier) {
      return new Error('Missing OAuth2 Verifier required for Azure DevOps authentication')
    }
    const auth = await this.fetchToken({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri: makeAppURL(appOrigin, REDIRECT_PATH)
    })
    if (auth instanceof Error) return auth
    const profile = await this.getProfile()
    if (profile instanceof Error) return profile
    return {...auth, providerUserId: profile.id}
  }

  async refresh(refreshToken: string) {
    return this.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: azureDevOpsOAuthScope,
      redirect_uri: makeAppURL(appOrigin, REDIRECT_PATH)
    })
  }

  private async fetchToken(
    params: OAuth2PkceAuthorizationParams | OAuth2PkceRefreshAuthorizationParams
  ) {
    if (!this.provider) return new Error('No Azure DevOps provider found')
    const {clientId, clientSecret, tenantId} = this.provider
    const oAuthRes = await authorizeOAuth2<OAuth2TokenResponse>({
      authUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      body: {...params, client_id: clientId, client_secret: clientSecret},
      contentType: 'application/x-www-form-urlencoded'
    })
    if (!(oAuthRes instanceof Error)) this.accessToken = oAuthRes.accessToken
    return oAuthRes
  }

  private async request<T>(url: string, options: RequestOptions = {}) {
    const {method = 'GET', body, contentType = 'application/json'} = options
    try {
      const res = await this.fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
          'Content-Type': contentType,
          'User-Agent': 'parabol'
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })
      const isJson = (res.headers.get('content-type') ?? '').includes('application/json')
      if (!isJson) {
        await res.body?.cancel()
        // a rejected token is answered with a 203 and the HTML sign-in page instead of a 401
        if (res.status === 203 || res.status === 401) {
          return new Error('Azure DevOps rejected the access token. Reconnect Azure DevOps.')
        }
        return new Error(`Azure DevOps returned an unexpected response (${res.status})`)
      }
      const json = (await res.json()) as T | {message?: string}
      if (!res.ok) {
        const message = json && typeof json === 'object' && 'message' in json && json.message
        return new Error(message || `Azure DevOps request failed (${res.status})`)
      }
      return {json: json as T, continuationToken: res.headers.get('x-ms-continuationtoken')}
    } catch (e) {
      if (e instanceof Error && e.name === 'TimeoutError') {
        return new Error('Azure DevOps took too long to respond')
      }
      return e instanceof Error ? e : new Error('Azure DevOps is unreachable')
    }
  }

  private projectUrl(instanceId: string, projectId: string | null, path: string) {
    if (!isAzureDevOpsInstanceId(instanceId)) {
      return new Error(`Invalid Azure DevOps organization: ${instanceId}`)
    }
    const project = projectId ? `${encodeURIComponent(projectId)}/` : ''
    return `https://${instanceId}/${project}_apis/${path}`
  }

  private canReach(instanceId: string, projectId: string) {
    return this.access.allows(AzureDevOpsProjectId.join(instanceId, projectId))
  }

  async getProfile() {
    const res = await this.request<AzureDevOpsProfile>(
      `https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=${API_VERSION}`
    )
    if (res instanceof Error) return res
    if (!res.json.id) return new Error('Azure DevOps: could not read the authorized user')
    return res.json
  }

  async listOrganizations() {
    const memberId = this.auth?.providerUserId ?? (await this.getProfile())
    if (memberId instanceof Error) return memberId
    const id = typeof memberId === 'string' ? memberId : memberId.id
    const res = await this.request<ListResponse<AzureDevOpsOrganization>>(
      `https://app.vssps.visualstudio.com/_apis/accounts?memberId=${encodeURIComponent(id)}&api-version=${API_VERSION}`
    )
    return res instanceof Error ? res : res.json.value
  }

  async listProjects(instanceId: string) {
    const projects: AzureDevOpsProjectReference[] = []
    let continuationToken: string | null = null
    for (let page = 0; page < MAX_PROJECT_PAGES; page++) {
      const continuation: string = continuationToken
        ? `&continuationToken=${encodeURIComponent(continuationToken)}`
        : ''
      const url = this.projectUrl(
        instanceId,
        null,
        `projects?$top=${PROJECT_PAGE_SIZE}${continuation}&api-version=${API_VERSION}`
      )
      if (url instanceof Error) return url
      const res = await this.request<ListResponse<AzureDevOpsProjectReference>>(url)
      if (res instanceof Error) return res
      projects.push(...res.json.value.map(({id, name}) => ({id, name})))
      continuationToken = res.continuationToken
      if (!continuationToken) break
    }
    return projects
  }

  /** The ids a WIQL query matches. A null projectId runs it across the organization, where @project is not defined */
  async queryWorkItemIds(instanceId: string, projectId: string | null, query: string, top: number) {
    const url = this.projectUrl(
      instanceId,
      projectId,
      `wit/wiql?$top=${top}&timePrecision=true&api-version=${API_VERSION}`
    )
    if (url instanceof Error) return url
    const res = await this.request<{workItems?: {id: number}[]}>(url, {
      method: 'POST',
      body: {query}
    })
    if (res instanceof Error) return res
    return (res.json.workItems ?? []).map(({id}) => id)
  }

  /** Only the work items in projects this connection shares; ids outside them are dropped, never reported */
  async getWorkItems(instanceId: string, ids: number[]) {
    const url = this.projectUrl(instanceId, null, `wit/workitemsbatch?api-version=${API_VERSION}`)
    if (url instanceof Error) return url
    const workItems: AzureDevOpsRawWorkItem[] = []
    for (let i = 0; i < ids.length; i += MAX_BATCH_SIZE) {
      const res = await this.request<ListResponse<AzureDevOpsRawWorkItem | null>>(url, {
        method: 'POST',
        body: {ids: ids.slice(i, i + MAX_BATCH_SIZE), $expand: 'Links', errorPolicy: 'Omit'}
      })
      if (res instanceof Error) return res
      workItems.push(...res.json.value.filter((workItem) => workItem !== null))
    }
    return workItems.filter(
      (workItem) => resolveAzureDevOpsWorkItemProject(this.access, instanceId, workItem) !== null
    )
  }

  async listComments(instanceId: string, projectId: string, workItemId: string, top: number) {
    if (!this.canReach(instanceId, projectId)) return new Error(NOT_SHARED_MESSAGE)
    const url = this.projectUrl(
      instanceId,
      projectId,
      `wit/workItems/${encodeURIComponent(workItemId)}/comments?$top=${top}&order=desc&api-version=${COMMENTS_API_VERSION}`
    )
    if (url instanceof Error) return url
    const res = await this.request<{comments?: AzureDevOpsComment[]}>(url)
    return res instanceof Error ? res : (res.json.comments ?? [])
  }

  async addComment(instanceId: string, projectId: string, workItemId: string, text: string) {
    if (!this.canReach(instanceId, projectId)) return new Error(NOT_SHARED_MESSAGE)
    const url = this.projectUrl(
      instanceId,
      projectId,
      `wit/workItems/${encodeURIComponent(workItemId)}/comments?api-version=${COMMENTS_API_VERSION}`
    )
    if (url instanceof Error) return url
    const res = await this.request<{url: string}>(url, {method: 'POST', body: {text}})
    return res instanceof Error ? res : res.json.url
  }

  async setField(
    instanceId: string,
    projectId: string,
    workItemId: string,
    referenceName: string,
    value: string | number
  ) {
    if (!this.canReach(instanceId, projectId)) return new Error(NOT_SHARED_MESSAGE)
    const url = this.projectUrl(
      instanceId,
      projectId,
      `wit/workitems/${encodeURIComponent(workItemId)}?api-version=${API_VERSION}`
    )
    if (url instanceof Error) return url
    const res = await this.request<{id: number}>(url, {
      method: 'PATCH',
      contentType: 'application/json-patch+json',
      body: [{op: 'add', path: `/fields/${referenceName}`, value}]
    })
    return res instanceof Error ? res : res.json
  }

  /** Every field in the project, which is the only place Azure DevOps reports a field's data type */
  async listFields(instanceId: string, projectId: string) {
    if (!this.canReach(instanceId, projectId)) return new Error(NOT_SHARED_MESSAGE)
    const url = this.projectUrl(instanceId, projectId, `wit/fields?api-version=${API_VERSION}`)
    if (url instanceof Error) return url
    const res = await this.request<ListResponse<AzureDevOpsField>>(url)
    return res instanceof Error ? res : res.json.value
  }

  async listWorkItemTypeFieldNames(instanceId: string, projectId: string, workItemType: string) {
    if (!this.canReach(instanceId, projectId)) return new Error(NOT_SHARED_MESSAGE)
    const url = this.projectUrl(
      instanceId,
      projectId,
      `wit/workitemtypes/${encodeURIComponent(workItemType)}/fields?api-version=${API_VERSION}`
    )
    if (url instanceof Error) return url
    const res = await this.request<ListResponse<{referenceName: string}>>(url)
    return res instanceof Error ? res : res.json.value.map(({referenceName}) => referenceName)
  }

  /** What the project's process calls a backlog item: User Story, Product Backlog Item, Issue or Requirement */
  private async getBacklogWorkItemType(instanceId: string, projectId: string) {
    const url = this.projectUrl(
      instanceId,
      projectId,
      `wit/workitemtypecategories/Microsoft.RequirementCategory?api-version=${API_VERSION}`
    )
    if (url instanceof Error) return url
    const res = await this.request<{defaultWorkItemType?: {name?: string}}>(url)
    if (res instanceof Error) return res
    return (
      res.json.defaultWorkItemType?.name ??
      new Error('Azure DevOps: this project has no backlog work item type')
    )
  }

  async createWorkItem(params: {
    instanceId: string
    projectId: string
    title: string
    description: string | null
  }) {
    const {instanceId, projectId, title, description} = params
    if (!this.canReach(instanceId, projectId)) return new Error(NOT_SHARED_MESSAGE)
    const workItemType = await this.getBacklogWorkItemType(instanceId, projectId)
    if (workItemType instanceof Error) return workItemType
    const url = this.projectUrl(
      instanceId,
      projectId,
      `wit/workitems/$${encodeURIComponent(workItemType)}?api-version=${API_VERSION}`
    )
    if (url instanceof Error) return url
    const res = await this.request<{id: number}>(url, {
      method: 'PATCH',
      contentType: 'application/json-patch+json',
      body: [
        {op: 'add', path: '/fields/System.Title', value: title},
        ...(description
          ? [{op: 'add', path: '/fields/System.Description', value: description}]
          : [])
      ]
    })
    return res instanceof Error ? res : res.json
  }

  async createTask({
    title,
    bodyContent,
    integrationRepoId
  }: CreateTaskParams): Promise<CreateTaskResponse> {
    if (!this.auth) return new Error('Azure DevOps is not connected')
    const description = bodyContent ? generateHTML(bodyContent, serverTipTapExtensions) : null
    const {instanceId, projectId} = AzureDevOpsProjectId.split(integrationRepoId)
    if (!instanceId || !projectId) {
      return new Error(`Invalid Azure DevOps project: ${integrationRepoId}`)
    }
    const workItem = await this.createWorkItem({title, description, instanceId, projectId})
    if (workItem instanceof Error) return workItem
    const issueKey = String(workItem.id)
    return {
      integrationHash: AzureDevOpsIssueId.join(instanceId, projectId, issueKey),
      issueId: issueKey,
      integration: {
        accessUserId: this.auth.userId,
        instanceId,
        service: 'azureDevOps',
        projectKey: projectId,
        issueKey
      }
    }
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string,
    integrationHash?: string
  ): Promise<string | Error> {
    const {instanceId, projectKey} = AzureDevOpsIssueId.split(integrationHash ?? '')
    if (!instanceId || !projectKey) {
      return new Error(`Invalid integrationHash: ${integrationHash}`)
    }
    const comment = makeCreateAzureTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
    return this.addComment(instanceId, projectKey, issueId, comment)
  }

  async addScoreComment(params: {
    instanceId: string
    projectId: string
    workItemId: string
    dimensionName: string
    finalScore: string
    meetingName: string
    discussionURL: string
  }) {
    const {instanceId, projectId, workItemId, dimensionName, finalScore, meetingName} = params
    const comment = `<div><b>${dimensionName}: ${finalScore}</b></div>
    <div>See the <a href='${params.discussionURL}'>discussion</a> in ${meetingName}</div>

    <div>Powered by <a href='${ExternalLinks.GETTING_STARTED_SPRINT_POKER}'>Parabol</a></div>`
    return this.addComment(instanceId, projectId, workItemId, comment)
  }
}

export default AzureDevOpsServerManager
