import AbortController from 'abort-controller'
import fetch, {RequestInit} from 'node-fetch'
import AzureDevOpsIssueId from 'parabol-client/shared/gqlIds/AzureDevOpsIssueId'
import IntegrationHash from 'parabol-client/shared/gqlIds/IntegrationHash'
import splitDraftContent from 'parabol-client/utils/draftjs/splitDraftContent'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {isError} from 'util'
import {ExternalLinks} from '~/types/constEnums'
import AzureDevOpsProjectId from '../../client/shared/gqlIds/AzureDevOpsProjectId'
import appOrigin from '../appOrigin'
import {AzureDevOpsRemoteProject} from '../graphql/public/resolverTypes'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import {
  OAuth2PkceAuthorizationParams,
  OAuth2PkceRefreshAuthorizationParams
} from '../integrations/OAuth2Manager'
import {
  CreateTaskResponse,
  TaskIntegrationManager
} from '../integrations/TaskIntegrationManagerFactory'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {IntegrationProviderAzureDevOps} from '../postgres/queries/getIntegrationProvidersByIds'
import makeCreateAzureTaskComment from './makeCreateAzureTaskComment'

export interface AzureDevOpsUser {
  // self: string
  displayName: string
  publicAlias: string
  emailAddress: string
  id: string
  coreRevision: number
  revision: number
  timeStamp: string
}

export interface Resource {
  accountId: string
  accountUri: string
  accountName: string
  properties: any
}

export interface AccessibleResources {
  count: number
  value: Resource[]
}

export interface ProjectProperty {
  name: string
  value: string
}

export interface ProjectProperties {
  count: number
  value: ProjectProperty[]
}

export interface ProcessType {
  custom: string
  inherited: string
  system: string
}

export interface Process {
  _links: ReferenceLinks
  description: string
  id: string
  isDefault: boolean
  name: string
  type: ProcessType
  url: string
}

export interface WorkItemQueryResult {
  asOf: string
  columns: WorkItemFieldReference[]
  queryResultType: QueryResultType
  queryType: QueryType
  sortColumns: WorkItemQuerySortColumn[]
  workItemRelations: WorkItemLink[]
  workItems: WorkItemReference[]
}

export interface WorkItemFieldReference {
  name: string
  referenceName: string
  url: string
}

export enum QueryResultType {
  WORKITEM = 'workItem',
  WORKITEMLINK = 'workItemLink'
}

export enum QueryType {
  FLAT = 'flat',
  ONEHOP = 'oneHop',
  TREE = 'tree'
}

export interface WorkItemQuerySortColumn {
  descending: boolean
  field: WorkItemFieldReference
}

export interface WorkItemLink {
  rel: string
  source: WorkItemReference
  target: WorkItemReference
}

export interface WorkItemReference {
  id: number
  url: string
}

export interface WorkItemBatchResponse {
  count: number
  value: WorkItem[]
}

export interface WorkItem {
  _links: ReferenceLinks
  commentVersionRef: WorkItemCommentVersionRef
  fields: object
  id: number
  relations: WorkItemRelations[]
  rev: number
  url: string
}

export interface CreateTaskIssueRes {
  id: number
  rev: number
  fields: object
  _links: ReferenceLinks
  url: string
}

export interface ReferenceLinks {
  links: object
}

export interface WorkItemCommentVersionRef {
  commentId: number
  createdInRevision: number
  isDeleted: boolean
  text: string
  url: string
  version: number
}

export interface WorkItemRelations {
  attributes: object
  rel: string
  url: string
}

export interface AccountProjects {
  count: number
  value: TeamProjectReference[]
}

export interface TeamProjectReference {
  id: string
  lastUpdateTime: string
  name: string
  revision: number
  state: string
  url: string
  visibility: string
}

export interface ProjectState {
  all: string
  createPending: string
  deleted: string
  deleting: string
  new: string
  unchanged: string
  wellFormed: string
}

export interface ProjectVisibility {
  private: string
  public: string
}

export interface AzureDevOpsError {
  code: number
  message: string
}

interface WorkItemAddCommentResponse {
  workItemId: number
  id: number
  version: number
  text: string
  createdBy: object
  createdDate: string
  modifiedBy: object
  modifiedDate: string
  url: string
}

interface WorkItemAddFieldResponse {
  id: number
  rev: number
  fields: object
  _links: object
  url: string
}

const MAX_REQUEST_TIME = 8000

class AzureDevOpsServerManager implements TaskIntegrationManager {
  public title = 'AzureDevOps'
  accessToken = ''
  private headers = {
    Authorization: '',
    Accept: 'application/json' as const,
    'Content-Type': 'application/json'
  }
  private readonly auth: IGetTeamMemberIntegrationAuthQueryResult | null

  async init(code: string, codeVerifier: string | null) {
    if (!codeVerifier) {
      return {
        error: {message: 'Missing OAuth2 Verifier required for Azure DevOps authentication'}
      }
    }
    return this.fetchToken({
      grant_type: 'authorization_code',
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: makeAppURL(appOrigin, 'auth/ado')
    })
  }

  private readonly provider: IntegrationProviderAzureDevOps | undefined

  constructor(
    auth: IGetTeamMemberIntegrationAuthQueryResult | null,
    provider: IntegrationProviderAzureDevOps | null
  ) {
    if (!!auth && !!auth.accessToken) {
      this.setToken(auth.accessToken)
    }
    if (!!provider) {
      this.provider = provider
    }
    this.auth = auth
  }

  setToken(token: string) {
    this.accessToken = token
    this.headers.Authorization = `Bearer ${token}`
  }

  private readonly fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController()
    const {signal} = controller
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME)
    try {
      const res = await fetch(url, {...options, signal})
      clearTimeout(timeout)
      return res
    } catch (e) {
      clearTimeout(timeout)
      return new Error('Azure DevOps is down')
    }
  }
  private readonly get = async <T>(url: string) => {
    const res = await this.fetchWithTimeout(url, {headers: this.headers})
    if (res instanceof Error) {
      return res
    }
    const {headers} = res
    const contentType = headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Error('Received non-JSON Azure DevOps Response')
    }
    const json = (await res.json()) as AzureDevOpsError | T
    if ('message' in json) {
      return new Error(json.message)
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
    const json = (await res.json()) as AzureDevOpsError | T
    if ('message' in json) {
      return new Error(json.message)
    }
    return json
  }

  private readonly patch = async <T>(url: string, payload: any) => {
    const res = await this.fetchWithTimeout(url, {
      method: 'PATCH',
      headers: {
        ...this.headers,
        ['Content-Type']: 'application/json-patch+json'
      },
      body: JSON.stringify(payload)
    })
    if (res instanceof Error) {
      return res
    }
    const json = (await res.json()) as AzureDevOpsError | T
    if ('message' in json) {
      return new Error(json.message)
    }
    return json
  }

  async createTask({
    rawContentStr,
    integrationRepoId
  }: {
    rawContentStr: string
    integrationRepoId: string
  }): Promise<CreateTaskResponse> {
    const {title} = splitDraftContent(rawContentStr)
    const {instanceId, projectId} = AzureDevOpsProjectId.split(integrationRepoId)
    const issueRes = await this.createIssue({title, instanceId, projectId})
    if (issueRes instanceof Error) return issueRes
    return {
      integrationHash: AzureDevOpsIssueId.join(instanceId, projectId, String(issueRes.id)),
      issueId: String(issueRes.id),
      integration: {
        accessUserId: this.auth!.userId,
        instanceId,
        service: 'azureDevOps',
        projectKey: projectId,
        issueKey: String(issueRes.id)
      }
    }
  }

  async createIssue({
    title,
    instanceId,
    projectId
  }: {
    title: string
    instanceId: string
    projectId: string
  }) {
    const uri = `https://${instanceId}/${projectId}/_apis/wit/workitems/$Issue?api-version=6.0`
    return this.patch<CreateTaskIssueRes>(uri, [
      {
        op: 'add',
        path: '/fields/System.Title',
        from: null,
        value: title
      }
    ])
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string,
    integrationHash: string
  ): Promise<string | Error> {
    const integration = IntegrationHash.split('azureDevOps', integrationHash)
    if (!integration?.projectKey || !integration?.issueKey) {
      return new Error(`Invalid integrationHash: ${integrationHash}`)
    }
    const {instanceId, projectKey} = integration
    const comment = makeCreateAzureTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
    const res = await this.post<WorkItemAddCommentResponse>(
      `https://${instanceId}/${projectKey}/_apis/wit/workItems/${issueId}/comments?api-version=7.1-preview.3`,
      {text: comment}
    )
    return res instanceof Error ? res : res.url
  }

  async getWorkItemData(instanceId: string, workItemIds: number[], fields?: string[]) {
    const workItems = [] as WorkItem[]
    let firstError: Error | undefined
    const uri = `https://${instanceId}/_apis/wit/workitemsbatch?api-version=7.1-preview.1`
    const payload = !!fields
      ? {ids: workItemIds, fields: fields}
      : {ids: workItemIds, $expand: 'Links'}
    const res = await this.post<WorkItemBatchResponse>(uri, payload)
    if (res instanceof Error) {
      if (!firstError) {
        firstError = res
      }
    } else {
      const mappedWorkItems = (res.value as WorkItem[]).map((workItem) => {
        return {
          ...workItem
        }
      })
      workItems.push(...mappedWorkItems)
    }
    return {error: firstError, workItems: workItems}
  }

  async executeWiqlQuery(instanceId: string, query: string) {
    const workItemReferences = [] as WorkItemReference[]
    let firstError: Error | undefined
    const payload = {
      query: query
    }
    const res = await this.post<WorkItemQueryResult>(
      `https://${instanceId}/_apis/wit/wiql?api-version=6.0`,
      payload
    )
    if (res instanceof Error) {
      if (!firstError) {
        firstError = res
      }
    } else {
      const workItems = res.workItems.map((workItem) => {
        const {id, url} = workItem
        return {
          id,
          url
        }
      })
      workItemReferences.push(...workItems)
    }
    return {error: firstError, workItems: workItemReferences}
  }

  async getWorkItems(
    instanceId: string,
    queryString: string | null,
    projectKeyFilters: string[] | null,
    isWIQL: boolean
  ) {
    let projectFilter = ''
    if (projectKeyFilters && projectKeyFilters.length > 0) {
      projectKeyFilters.forEach((projectKey, idx) => {
        if (idx === 0) projectFilter = `AND ( [System.TeamProject] = '${projectKey}'`
        else projectFilter += ` OR [System.TeamProject] = '${projectKey}'`
      })
      projectFilter += ` )`
    }
    let customQueryString = ''
    if (isWIQL)
      customQueryString = queryString
        ? `Select [System.Id], [System.Title], [System.State] From WorkItems Where ${queryString} ${projectFilter}`
        : `Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] IN('User Story', 'Task', 'Issue', 'Bug', 'Feature', 'Epic') AND [State] <> 'Closed' AND [State] <> 'Removed' order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc`
    else {
      const queryFilter = queryString ? `AND [System.Title] contains '${queryString}'` : ''
      customQueryString = `Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] IN('User Story', 'Task', 'Issue', 'Bug', 'Feature', 'Epic') AND [State] <> 'Closed' ${queryFilter} ${projectFilter} AND [State] <> 'Removed' order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc`
    }
    return await this.executeWiqlQuery(instanceId, customQueryString)
  }

  async getAllUserWorkItems(
    queryString: string | null,
    projectKeyFilters: string[] | null,
    isWIQL: boolean
  ) {
    const allWorkItems = [] as WorkItem[]
    let firstError: Error | undefined

    const meResult = await this.getMe()
    const {error: meError, azureDevOpsUser} = meResult
    if (!!meError || !azureDevOpsUser) return {error: meError, projects: null}

    const {id} = azureDevOpsUser
    const {error: accessibleError, accessibleOrgs} = await this.getAccessibleOrgs(id)
    if (!!accessibleError) return {error: accessibleError, projects: null}

    for (const resource of accessibleOrgs) {
      const {accountName} = resource
      const instanceId = `dev.azure.com/${accountName}`
      const {error: workItemsError, workItems} = await this.getWorkItems(
        instanceId,
        queryString,
        projectKeyFilters,
        isWIQL
      )
      if (!!workItemsError) {
        if (!firstError) {
          firstError = workItemsError
        }
      }
      if (!!workItems) {
        const resturnedIds = workItems.map((workItem) => workItem.id)
        if (resturnedIds.length > 0) {
          const {error: fullWorkItemsError, workItems: fullWorkItems} = await this.getWorkItemData(
            instanceId,
            resturnedIds
          )
          if (!!fullWorkItemsError) {
            if (!firstError) {
              firstError = fullWorkItemsError
            }
          } else {
            allWorkItems.push(...fullWorkItems)
          }
        }
      }
    }
    return {error: firstError, workItems: allWorkItems}
  }

  async getMe() {
    let azureDevOpsUser: AzureDevOpsUser | undefined
    let firstError: Error | undefined
    const result = await this.get<AzureDevOpsUser>(
      `https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.1-preview.3`
    )

    if (result instanceof Error) {
      if (!firstError) {
        firstError = result
      }
    } else {
      azureDevOpsUser = result
    }
    return {error: firstError, azureDevOpsUser: azureDevOpsUser}
  }

  async getAllUserProjects() {
    const teamProjectReferences = [] as TeamProjectReference[]
    let firstError: Error | undefined
    const meResult = await this.getMe()
    const {error: meError, azureDevOpsUser} = meResult
    if (!!meError || !azureDevOpsUser) return {error: meError, projects: null}

    const {id} = azureDevOpsUser
    const {error: accessibleError, accessibleOrgs} = await this.getAccessibleOrgs(id)
    if (!!accessibleError) return {error: accessibleError, projects: null}

    for (const resource of accessibleOrgs) {
      const {error: accountProjectsError, accountProjects} = await this.getAccountProjects(
        resource.accountName
      )
      if (!!accountProjectsError && !firstError) {
        firstError = accountProjectsError
        break
      } else {
        teamProjectReferences.push(...accountProjects)
      }
    }
    return {error: undefined, projects: teamProjectReferences}
  }

  async getProjectProperties(instanceId: string, projectId: string) {
    let firstError: Error | undefined
    const uri = `https://${instanceId}/_apis/projects/${projectId}/properties?keys=System.CurrentProcessTemplateId`
    const result = await this.get<ProjectProperties>(uri)
    if (result instanceof Error) {
      firstError = result
    }
    const requestedProperties = result as ProjectProperties
    return {error: firstError, projectProperties: requestedProperties}
  }

  async getProjectProcessTemplate(instanceId: string, projectId: string) {
    let firstError: Error | undefined
    const result = await this.getProjectProperties(instanceId, projectId)
    if (result.error) {
      firstError = result.error
    }
    const processTemplateProperty = result.projectProperties.value[0]
    if (processTemplateProperty?.name !== 'System.CurrentProcessTemplateId') {
      return {error: firstError, projectTemplate: ''}
    }
    const processTemplateDetailsResult = await this.getProcessTemplate(
      instanceId,
      processTemplateProperty?.value
    )
    if (processTemplateDetailsResult.error) {
      if (!firstError) {
        firstError = processTemplateDetailsResult.error
      }
    }
    return {error: firstError, projectTemplate: processTemplateDetailsResult.process}
  }

  async getProcessTemplate(instanceId: string, processId: string) {
    let firstError: Error | undefined
    const uri = `https://${instanceId}/_apis/process/processes/${processId}?api-version=6.0`
    const result = await this.get<Process>(uri)
    const unknownProcessErrorCode = 'VS402362'
    if (result instanceof Error) {
      if (result.message.includes(unknownProcessErrorCode, 0)) {
        return {error: firstError, process: 'Basic'}
      }
      firstError = result
    }
    return {error: firstError, process: result.name}
  }

  async getProject(instanceId: string, projectId: string) {
    const uri = `https://${instanceId}/_apis/projects/${projectId}`
    const res = await this.get<AzureDevOpsRemoteProject>(uri)
    if (res instanceof Error) {
      return {error: res}
    }
    return {project: res}
  }

  async getAccountProjects(accountName: string) {
    const teamProjectReferences = [] as TeamProjectReference[]
    let firstError: Error | undefined
    const result = await this.get<AccountProjects>(
      `https://dev.azure.com/${accountName}/_apis/projects?api-version=7.1-preview.4`
    )
    if (result instanceof Error) {
      if (!firstError) {
        firstError = result
      }
    } else {
      const projects = result.value.map((project) => {
        return {
          ...project
        }
      })
      teamProjectReferences.push(...projects)
    }
    return {error: firstError, accountProjects: teamProjectReferences}
  }

  async getAccessibleOrgs(userAccountId: string) {
    const accessibleOrgs = [] as Resource[]
    let firstError: Error | undefined
    const result = await this.get<AccessibleResources>(
      `https://app.vssps.visualstudio.com/_apis/accounts?memberId=${userAccountId}&api-version=7.1-preview.1`
    )

    if (result instanceof Error) {
      if (!firstError) {
        firstError = result
      }
    } else {
      const orgs = result.value.map((resource) => {
        return {
          ...resource
        }
      })
      accessibleOrgs.push(...orgs)
    }
    return {error: firstError, accessibleOrgs: accessibleOrgs}
  }

  async refresh(refreshToken: string) {
    return this.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: '499b84ac-1321-427f-aa17-267ca6975798/.default',
      redirect_uri: makeAppURL(appOrigin, 'auth/ado')
    })
  }

  private async fetchToken(
    params: OAuth2PkceAuthorizationParams | OAuth2PkceRefreshAuthorizationParams
  ) {
    if (!this.provider) {
      return new Error('No Azure DevOps provider found')
    }

    const body = {
      ...params,
      client_id: this.provider.clientId
    }

    const additonalHeaders = {
      Origin: appOrigin
    }
    const tenantId = this.provider.tenantId
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const contentType = 'application/x-www-form-urlencoded'
    const oAuthRes = await authorizeOAuth2({authUrl, body, additonalHeaders, contentType})
    if (!isError(oAuthRes)) {
      this.accessToken = oAuthRes.accessToken
    }
    return oAuthRes
  }

  async addScoreComment(
    instanceId: string,
    dimensionName: string,
    finalScore: string,
    meetingName: string,
    discussionURL: string,
    remoteIssueId: string,
    projectKey: string
  ) {
    const comment = `<div><b>${dimensionName}: ${finalScore}</b></div>
    <div>See the <a href='${discussionURL}'>discussion</a> in ${meetingName}</div>

    <div>Powered by <a href='${ExternalLinks.GETTING_STARTED_SPRINT_POKER}'>Parabol</a></div>`

    const res = await this.post<WorkItemAddCommentResponse>(
      `https://${instanceId}/${projectKey}/_apis/wit/workItems/${remoteIssueId}/comments?api-version=7.1-preview.3`,
      {
        text: comment
      }
    )

    if (res instanceof Error) {
      return res
    }

    return res
  }

  async addScoreField(
    instanceId: string,
    fieldId: string,
    finalScore: string | number,
    remoteIssueId: string,
    projectKey: string
  ) {
    return await this.patch<WorkItemAddFieldResponse>(
      `https://${instanceId}/${projectKey}/_apis/wit/workitems/${remoteIssueId}?api-version=7.1-preview.3`,
      [
        {
          op: 'add',
          path: fieldId,
          value: finalScore
        }
      ]
    )
  }
}

export default AzureDevOpsServerManager
