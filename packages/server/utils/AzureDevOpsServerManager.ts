import fetch, {RequestInit} from 'node-fetch'
import AbortController from 'abort-controller'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import {
  OAuth2PkceAuthorizationParams,
  OAuth2PkceRefreshAuthorizationParams
} from '../integrations/OAuth2Manager'
import {IntegrationProviderAzureDevOps} from '../postgres/queries/getIntegrationProvidersByIds';
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery';
import {isError} from 'util';
import {ExternalLinks} from '~/types/constEnums';


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

export interface TeamProjectReference {
  abbreviation: string
  defaultTeamImageUrl: string
  description: string
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


const MAX_REQUEST_TIME = 5000

class AzureDevOpsServerManager {
  accessToken = ''
  private headers = {
    Authorization: '',
    Accept: 'application/json' as const,
    'Content-Type': 'application/json'
  }

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
    // this.provider = provider
    if (!!provider) {
      this.provider = provider
    }
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
    const patchHeaders = this.headers
    patchHeaders['Content-Type'] = "application/json-patch+json"
    const res = await this.fetchWithTimeout(url, {
      method: 'PATCH',
      headers: patchHeaders,
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

  async getWorkItemData(instanceId: string, workItemIds: number[], fields?: string[]) {
    const workItems = [] as WorkItem[]
    let firstError: Error | undefined
    const uri = `https://${instanceId}/_apis/wit/workitemsbatch?api-version=7.1-preview.1`
    const payload = !!fields ? {ids: workItemIds, fields: fields} : {ids: workItemIds}
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


  async getWorkItems(instanceId: string, queryString: string | null, isWIQL: boolean) {
    if (isWIQL) {
      const customQueryString = queryString
        ? `Select [System.Id], [System.Title], [System.State] From WorkItems Where ${queryString}`
        : "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'User Story' AND [State] <> 'Closed' AND [State] <> 'Removed' order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc"

      return await this.executeWiqlQuery(instanceId, customQueryString)
    }
    const textFilter = queryString ? `AND [System.Title] contains '${queryString}'` : ''
    const customQueryString = `Select [System.Id], [System.Title], [System.State] From WorkItems
                              Where
                                (
                                  [System.WorkItemType] = 'User Story' OR [System.WorkItemType] = 'Task'
                                    OR [System.WorkItemType] = 'Issue' OR [System.WorkItemType] = 'Bug'
                                    OR [System.WorkItemType] = 'Feature' OR [System.WorkItemType] = 'Epic'
                                )
                              AND [State] <> 'Closed' ${textFilter} AND [State] <> 'Removed' order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc`

    return await this.executeWiqlQuery(instanceId, customQueryString)
  }

  async getAllUserWorkItems(queryString: string | null, isWIQL: boolean) {
    const allWorkItems = [] as WorkItem[]
    let firstError: Error | undefined

    const meResult = await this.getMe()
    const {error: meError, azureDevOpsUser} = meResult
    if (!!meError || !azureDevOpsUser) return {error: meError, projects: null}

    const {id} = azureDevOpsUser
    const {error: accessibleError, accessibleOrgs} = await this.getAccessibleOrgs(id)
    if (!!accessibleError) return {error: accessibleError, projects: null}

    // this forEach is not returning
    for (const resource of accessibleOrgs) {
      const {accountName} = resource
      const instanceId = `dev.azure.com/${accountName}`
      const {error: workItemsError, workItems} = await this.getWorkItems(

        instanceId,
        queryString,
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
    if (!meError || !azureDevOpsUser) return {error: meError, projects: null}

    const {id} = azureDevOpsUser
    const {error: accessibleError, accessibleOrgs} = await this.getAccessibleOrgs(id)
    if (!accessibleError) return {error: accessibleError, projects: null}

    for (const resource of accessibleOrgs) {
      const {error: accountProjectsError, accountProjects} = await this.getAccountProjects(
        resource.accountName
      )
      if (!accountProjectsError && !firstError) {
        firstError = accountProjectsError
        break
      } else {
        teamProjectReferences.push(...accountProjects)
      }
    }
    return {error: undefined, projects: teamProjectReferences}
  }

  async getAccountProjects(accountName: string) {
    const teamProjectReferences = [] as TeamProjectReference[]
    let firstError: Error | undefined
    const result = await this.get<TeamProjectReference[]>(
      `https://dev.azure.com/${accountName}/_apis/projects?api-version=7.1-preview.4`
    )
    if (result instanceof Error) {
      if (!firstError) {
        firstError = result
      }
    } else {
      const resultReferences = result as TeamProjectReference[]
      teamProjectReferences.push(...resultReferences)
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
      redirect_uri: 'http://localhost:8081/'
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
      // eslint-disable-next-line prettier/prettier
      'Origin': 'http://localhost:8081'
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
    const comment = `*${dimensionName}: ${finalScore}*
    \n[See the discussion | ${discussionURL}] in ${meetingName}

    \n_Powered by [Parabol | ${ExternalLinks.GETTING_STARTED_SPRINT_POKER}]_`

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
          "op": "add",
          "path": fieldId,
          "value": finalScore
        }
      ]
    )
  }
}

export default AzureDevOpsServerManager
