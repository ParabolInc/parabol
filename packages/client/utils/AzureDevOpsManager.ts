import AbortController from 'abort-controller'
//import {id} from 'parabol-client/validation/templates'
//import AzureDevOpsIssueId from '../shared/gqlIds/AzureDevOpsIssueId'
//import {SprintPokerDefaults} from '../types/constEnums'

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

/*interface AvatarURLs {
  '48x48': string
  '24x24': string
  '16x16': string
  '32x32': string
}*/

export interface AzureDevOpsError {
  code: number
  message: string
}

const MAX_REQUEST_TIME = 5000

export default abstract class AzureDevOpsManager {
  abstract fetch: typeof fetch
  accessToken: string
  private headers = {
    Authorization: '',
    Accept: 'application/json' as const,
    'Content-Type': 'application/json' as const
  }
  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.headers.Authorization = `Bearer ${accessToken}`
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
      return new Error('Azure DevOps is down')
    }
  }
  private readonly get = async <T>(url: string) => {
    const res = await this.fetchWithTimeout(url, {headers: this.headers})
    if (res instanceof Error) {
      return res
    }
    const {headers} = res
    // if (res.status === 429) {
    //   const retryAfterSeconds = headers.get('Retry-After') ?? '3'
    //   // return new RateLimitError(
    //   //   'got Azure DevOps rate limit error',
    //   //   new Date(Date.now() + Number(retryAfterSeconds) * 1000)
    //   // )
    //   return Error()
    // }
    const contentType = headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Error('Received non-JSON Azure DevOps Response')
    }
    const json = (await res.json()) as AzureDevOpsError | T // as AtlassianError | JiraNoAccessError | JiraGetError | T
    // if ('message' in json) {
    //   if (json.message === 'No message available' && 'error' in json) {
    //     return new Error(json.error)
    //   }
    //   return new Error(json.message)
    // }
    // if (isJiraNoAccessError(json)) {
    //   return new Error(json.errorMessages[0])
    // }
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

  async getWorkItemData(
    instanceId: string,
    projectId: string,
    workItemIds: string[],
    fields?: string[]
  ) {
    const workItems = [] as WorkItem[]
    let firstError: Error | undefined
    const params = new URLSearchParams()
    params.append('ids', workItemIds.toString())
    if (typeof fields !== 'undefined') {
      params.append('fields', fields.toString())
    }
    params.append('api-version', '7.1-preview.3')
    const uri = `https://${instanceId}/${projectId}/_apis/wit/workitems?${params.toString()}`
    const res = await this.get<WorkItem[]>(uri)
    if (res instanceof Error) {
      if (!firstError) {
        firstError = res
      }
    } else {
      const mappedWorkItems = (res as WorkItem[]).map((workItem) => {
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

  async getUserStories(instanceId: string) {
    const queryString =
      "Select [System.Id], [System.Title], [System.State] From WorkItems Where [System.WorkItemType] = 'User Story' AND [State] <> 'Closed' AND [State] <> 'Removed' order by [Microsoft.VSTS.Common.Priority] asc, [System.CreatedDate] desc"
    return await this.executeWiqlQuery(instanceId, queryString)
  }

  async getMe() {
    return this.get<AzureDevOpsUser>(
      `https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.1-preview.3`
    )
  }

  async getAccessibleOrgs(userAccountId: string) {
    const res = await this.get<AccessibleResources>(
      `https://app.vssps.visualstudio.com/_apis/accounts?memberId=${userAccountId}&api-version=7.1-preview.1`
    )

    if (!('value' in res)) {
      return Error()
    }
    return res.value
  }
}
