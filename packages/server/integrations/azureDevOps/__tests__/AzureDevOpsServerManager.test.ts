jest.mock('../../helpers/authorizeOAuth2', () => ({authorizeOAuth2: jest.fn()}))

import azureDevOpsOAuthScope from 'parabol-client/shared/integrations/azureDevOpsOAuthScope'
import type {TeamMemberIntegrationAuth} from '../../../postgres/types'
import type {IntegrationProviderAzureDevOps} from '../../../postgres/types/IntegrationProvider'
import {authorizeOAuth2} from '../../helpers/authorizeOAuth2'
import RepoAccess from '../../platform/RepoAccess'
import AzureDevOpsServerManager, {
  type AzureDevOpsRawWorkItem,
  NOT_SHARED_MESSAGE
} from '../AzureDevOpsServerManager'

const mockedAuthorize = jest.mocked(authorizeOAuth2)

const INSTANCE_ID = 'dev.azure.com/acme'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const BILLING_PROJECT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'

const provider = {
  service: 'azureDevOps',
  clientId: 'cid',
  clientSecret: 'secret',
  tenantId: 'tid'
} as unknown as IntegrationProviderAzureDevOps

const auth = {
  accessToken: 'access-token',
  userId: 'user1',
  providerUserId: 'ado-member-id'
} as TeamMemberIntegrationAuth

const sharesWeb = new RepoAccess('selected', [
  {id: `${INSTANCE_ID}:${WEB_PROJECT_ID}`, name: 'Web'}
])
const sharesEverything = new RepoAccess('all', [])

const jsonResponse = (
  body: unknown,
  init: {status?: number; headers?: Record<string, string>} = {}
) =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {'Content-Type': 'application/json', ...init.headers}
  })

const htmlResponse = (status: number) =>
  new Response('<html>Sign in</html>', {status, headers: {'Content-Type': 'text/html'}})

type FetchMock = jest.Mock<Promise<Response>, [string, RequestInit]>

const buildManager = (access?: RepoAccess, managerAuth = auth) => {
  const manager = new AzureDevOpsServerManager(managerAuth, provider, access)
  const fetchMock: FetchMock = jest.fn()
  manager.fetch = fetchMock as unknown as typeof manager.fetch
  return {manager, fetchMock}
}

const readRequest = (fetchMock: FetchMock, callIndex = 0) => {
  const [url, init] = fetchMock.mock.calls[callIndex]!
  return {
    url,
    method: init.method,
    headers: init.headers as Record<string, string>,
    body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined
  }
}

const rawWorkItem = (id: number, projectId: string): AzureDevOpsRawWorkItem => ({
  id,
  url: `https://${INSTANCE_ID}/${projectId}/_apis/wit/workItems/${id}`,
  fields: {'System.Title': `Work item ${id}`}
})

describe('AzureDevOpsServerManager.getWorkItems', () => {
  it('drops the work items that live outside the shared projects', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock.mockResolvedValue(
      jsonResponse({
        value: [rawWorkItem(1, WEB_PROJECT_ID), rawWorkItem(2, BILLING_PROJECT_ID), null]
      })
    )

    await expect(manager.getWorkItems(INSTANCE_ID, [1, 2, 3])).resolves.toEqual([
      rawWorkItem(1, WEB_PROJECT_ID)
    ])
    const {url, method, headers, body} = readRequest(fetchMock)
    expect(url).toBe('https://dev.azure.com/acme/_apis/wit/workitemsbatch?api-version=7.1')
    expect(method).toBe('POST')
    expect(headers.Authorization).toBe('Bearer access-token')
    expect(body).toEqual({ids: [1, 2, 3], $expand: 'Links', errorPolicy: 'Omit'})
  })

  it('reaches no work item when built without an access grant', async () => {
    const {manager, fetchMock} = buildManager()
    fetchMock.mockResolvedValue(jsonResponse({value: [rawWorkItem(1, WEB_PROJECT_ID)]}))
    await expect(manager.getWorkItems(INSTANCE_ID, [1])).resolves.toEqual([])
  })

  it('asks for at most 200 ids per request', async () => {
    const {manager, fetchMock} = buildManager(sharesEverything)
    fetchMock.mockImplementation(async (_url, init) => {
      const {ids} = JSON.parse(String(init.body)) as {ids: number[]}
      return jsonResponse({value: ids.map((id) => rawWorkItem(id, WEB_PROJECT_ID))})
    })
    const ids = Array.from({length: 450}, (_, index) => index + 1)

    const workItems = await manager.getWorkItems(INSTANCE_ID, ids)

    const requestedIds = fetchMock.mock.calls.map((_call, callIndex) => {
      return readRequest(fetchMock, callIndex).body.ids as number[]
    })
    expect(requestedIds.map((chunk) => chunk.length)).toEqual([200, 200, 50])
    expect(requestedIds.flat()).toEqual(ids)
    expect(workItems).toHaveLength(450)
  })

  it('fails as a whole when one chunk fails', async () => {
    const {manager, fetchMock} = buildManager(sharesEverything)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({value: [rawWorkItem(1, WEB_PROJECT_ID)]}))
      .mockResolvedValueOnce(jsonResponse({message: 'VS403474'}, {status: 400}))
    const ids = Array.from({length: 201}, (_, index) => index + 1)
    const res = await manager.getWorkItems(INSTANCE_ID, ids)
    expect(res).toHaveProperty('message', 'VS403474')
  })
})

type Operation = (manager: AzureDevOpsServerManager) => Promise<unknown>

const projectOperations: [string, Operation][] = [
  [
    'createWorkItem',
    (manager) =>
      manager.createWorkItem({
        instanceId: INSTANCE_ID,
        projectId: BILLING_PROJECT_ID,
        title: 'Fix the build',
        description: null
      })
  ],
  [
    'createTask',
    (manager) =>
      manager.createTask({
        title: 'Fix the build',
        bodyContent: null,
        integrationRepoId: `${INSTANCE_ID}:${BILLING_PROJECT_ID}`
      })
  ],
  ['addComment', (manager) => manager.addComment(INSTANCE_ID, BILLING_PROJECT_ID, '42', 'Hello')],
  [
    'addComment in another organization',
    (manager) => manager.addComment('dev.azure.com/globex', WEB_PROJECT_ID, '42', 'Hello')
  ],
  [
    'setField',
    (manager) =>
      manager.setField(
        INSTANCE_ID,
        BILLING_PROJECT_ID,
        '42',
        'Microsoft.VSTS.Scheduling.StoryPoints',
        5
      )
  ],
  ['listComments', (manager) => manager.listComments(INSTANCE_ID, BILLING_PROJECT_ID, '42', 5)],
  ['listFields', (manager) => manager.listFields(INSTANCE_ID, BILLING_PROJECT_ID)],
  [
    'listWorkItemTypeFieldNames',
    (manager) => manager.listWorkItemTypeFieldNames(INSTANCE_ID, BILLING_PROJECT_ID, 'User Story')
  ]
]

describe('AzureDevOpsServerManager project access', () => {
  it.each(projectOperations)(
    '%s refuses a project that is not shared, without calling Azure DevOps',
    async (_name, operation) => {
      const {manager, fetchMock} = buildManager(sharesWeb)
      const res = await operation(manager)
      expect(res).toBeInstanceOf(Error)
      expect(res).toHaveProperty('message', NOT_SHARED_MESSAGE)
      expect(fetchMock).not.toHaveBeenCalled()
    }
  )

  it('lists every project the account can see, whatever the connection shares', async () => {
    const {manager, fetchMock} = buildManager()
    fetchMock.mockResolvedValue(
      jsonResponse({value: [{id: BILLING_PROJECT_ID, name: 'Billing', visibility: 'private'}]})
    )
    await expect(manager.listProjects(INSTANCE_ID)).resolves.toEqual([
      {id: BILLING_PROJECT_ID, name: 'Billing'}
    ])
  })
})

describe('AzureDevOpsServerManager.createWorkItem', () => {
  const backlogTypeUrl = `https://dev.azure.com/acme/${WEB_PROJECT_ID}/_apis/wit/workitemtypecategories/Microsoft.RequirementCategory?api-version=7.1`

  it('creates the backlog work item type of the project’s own process', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({defaultWorkItemType: {name: 'Product Backlog Item'}}))
      .mockResolvedValueOnce(jsonResponse({id: 57}))

    await expect(
      manager.createWorkItem({
        instanceId: INSTANCE_ID,
        projectId: WEB_PROJECT_ID,
        title: 'Fix the build',
        description: '<p>It is red</p>'
      })
    ).resolves.toEqual({id: 57})

    const lookup = readRequest(fetchMock, 0)
    expect(lookup.url).toBe(backlogTypeUrl)
    expect(lookup.method).toBe('GET')
    const create = readRequest(fetchMock, 1)
    expect(create.url).toBe(
      `https://dev.azure.com/acme/${WEB_PROJECT_ID}/_apis/wit/workitems/$Product%20Backlog%20Item?api-version=7.1`
    )
    expect(create.method).toBe('PATCH')
    expect(create.headers['Content-Type']).toBe('application/json-patch+json')
    expect(create.body).toEqual([
      {op: 'add', path: '/fields/System.Title', value: 'Fix the build'},
      {op: 'add', path: '/fields/System.Description', value: '<p>It is red</p>'}
    ])
  })

  it('creates nothing when the process has no backlog work item type', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock.mockResolvedValue(jsonResponse({}))
    const res = await manager.createWorkItem({
      instanceId: INSTANCE_ID,
      projectId: WEB_PROJECT_ID,
      title: 'Fix the build',
      description: null
    })
    expect(res).toBeInstanceOf(Error)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('createTask links the new work item to the project it was created in', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({defaultWorkItemType: {name: 'Issue'}}))
      .mockResolvedValueOnce(jsonResponse({id: 57}))

    await expect(
      manager.createTask({
        title: 'Fix the build',
        bodyContent: null,
        integrationRepoId: `${INSTANCE_ID}:${WEB_PROJECT_ID}`
      })
    ).resolves.toEqual({
      integrationHash: `${INSTANCE_ID}:${WEB_PROJECT_ID}:57`,
      issueId: '57',
      integration: {
        accessUserId: 'user1',
        instanceId: INSTANCE_ID,
        service: 'azureDevOps',
        projectKey: WEB_PROJECT_ID,
        issueKey: '57'
      }
    })
    expect(readRequest(fetchMock, 1).body).toEqual([
      {op: 'add', path: '/fields/System.Title', value: 'Fix the build'}
    ])
  })
})

describe('AzureDevOpsServerManager requests', () => {
  it('posts comments with the preview api-version the comments endpoint needs', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    const commentUrl = 'https://dev.azure.com/acme/_apis/wit/workItems/42/comments/9'
    fetchMock.mockResolvedValue(jsonResponse({url: commentUrl}))

    await expect(
      manager.addComment(INSTANCE_ID, WEB_PROJECT_ID, '42', '<div>Hello</div>')
    ).resolves.toBe(commentUrl)
    const {url, method, body} = readRequest(fetchMock)
    expect(url).toBe(
      `https://dev.azure.com/acme/${WEB_PROJECT_ID}/_apis/wit/workItems/42/comments?api-version=7.1-preview.4`
    )
    expect(method).toBe('POST')
    expect(body).toEqual({text: '<div>Hello</div>'})
  })

  it('sets a field with a JSON patch', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock.mockResolvedValue(jsonResponse({id: 42}))

    await manager.setField(
      INSTANCE_ID,
      WEB_PROJECT_ID,
      '42',
      'Microsoft.VSTS.Scheduling.StoryPoints',
      5
    )
    const {url, method, headers, body} = readRequest(fetchMock)
    expect(url).toBe(
      `https://dev.azure.com/acme/${WEB_PROJECT_ID}/_apis/wit/workitems/42?api-version=7.1`
    )
    expect(method).toBe('PATCH')
    expect(headers['Content-Type']).toBe('application/json-patch+json')
    expect(body).toEqual([
      {op: 'add', path: '/fields/Microsoft.VSTS.Scheduling.StoryPoints', value: 5}
    ])
  })

  it('runs WIQL inside a project, or across the organization for a null project', async () => {
    const {manager, fetchMock} = buildManager(sharesEverything)
    fetchMock.mockImplementation(async () => jsonResponse({workItems: [{id: 7}, {id: 3}]}))
    const query = 'SELECT [System.Id] FROM WorkItems'

    await expect(manager.queryWorkItemIds(INSTANCE_ID, WEB_PROJECT_ID, query, 25)).resolves.toEqual(
      [7, 3]
    )
    await manager.queryWorkItemIds(INSTANCE_ID, null, query, 25)

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `https://dev.azure.com/acme/${WEB_PROJECT_ID}/_apis/wit/wiql?$top=25&timePrecision=true&api-version=7.1`,
      'https://dev.azure.com/acme/_apis/wit/wiql?$top=25&timePrecision=true&api-version=7.1'
    ])
    expect(readRequest(fetchMock).body).toEqual({query})
  })

  it('encodes the project and work item into the path', async () => {
    const {manager, fetchMock} = buildManager(sharesEverything)
    fetchMock.mockResolvedValue(jsonResponse({url: 'https://dev.azure.com/acme/comment'}))
    await manager.addComment(INSTANCE_ID, '../other org', '42/../7?x=1', 'Hello')
    expect(readRequest(fetchMock).url).toBe(
      'https://dev.azure.com/acme/..%2Fother%20org/_apis/wit/workItems/42%2F..%2F7%3Fx%3D1/comments?api-version=7.1-preview.4'
    )
  })

  it.each([
    'evil.com/x',
    'dev.azure.com/a/b',
    'dev.azure.com',
    'dev.azure.com/',
    'dev.azure.com.evil.com/acme',
    'dev.azure.com/acme@evil.com',
    'dev.azure.com/acme?x=1',
    'dev.azure.com/acme#x',
    'dev.azure.com/../acme',
    ' dev.azure.com/acme',
    'dev.azure.com/acme\n'
  ])('rejects the instance id %j without fetching', async (instanceId) => {
    const {manager, fetchMock} = buildManager(sharesEverything)
    const results = await Promise.all([
      manager.listProjects(instanceId),
      manager.queryWorkItemIds(instanceId, null, 'SELECT [System.Id] FROM WorkItems', 10),
      manager.getWorkItems(instanceId, [1]),
      manager.addComment(instanceId, WEB_PROJECT_ID, '42', 'Hello'),
      manager.setField(instanceId, WEB_PROJECT_ID, '42', 'Custom.Size', 'L'),
      manager.createWorkItem({
        instanceId,
        projectId: WEB_PROJECT_ID,
        title: 'Fix the build',
        description: null
      })
    ])
    results.forEach((res) => {
      expect(res).toBeInstanceOf(Error)
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('follows x-ms-continuationtoken through every page of projects', async () => {
    const {manager, fetchMock} = buildManager()
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(
          {value: [{id: WEB_PROJECT_ID, name: 'Web'}]},
          {headers: {'x-ms-continuationtoken': 'page 2'}}
        )
      )
      .mockResolvedValueOnce(jsonResponse({value: [{id: BILLING_PROJECT_ID, name: 'Billing'}]}))

    await expect(manager.listProjects(INSTANCE_ID)).resolves.toEqual([
      {id: WEB_PROJECT_ID, name: 'Web'},
      {id: BILLING_PROJECT_ID, name: 'Billing'}
    ])
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev.azure.com/acme/_apis/projects?$top=200&api-version=7.1',
      'https://dev.azure.com/acme/_apis/projects?$top=200&continuationToken=page%202&api-version=7.1'
    ])
  })

  it('stops paging projects after 10 pages', async () => {
    const {manager, fetchMock} = buildManager()
    fetchMock.mockImplementation(async () =>
      jsonResponse(
        {value: [{id: WEB_PROJECT_ID, name: 'Web'}]},
        {headers: {'x-ms-continuationtoken': 'more'}}
      )
    )
    await expect(manager.listProjects(INSTANCE_ID)).resolves.toHaveLength(10)
    expect(fetchMock).toHaveBeenCalledTimes(10)
  })

  it('lists organizations for the stored member id, or the profile when there is none', async () => {
    const stored = buildManager()
    stored.fetchMock.mockResolvedValue(
      jsonResponse({value: [{accountId: 'account1', accountName: 'acme'}]})
    )
    await expect(stored.manager.listOrganizations()).resolves.toEqual([
      {accountId: 'account1', accountName: 'acme'}
    ])
    expect(stored.fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://app.vssps.visualstudio.com/_apis/accounts?memberId=ado-member-id&api-version=7.1'
    ])

    const lookedUp = buildManager(undefined, {...auth, providerUserId: null})
    lookedUp.fetchMock
      .mockResolvedValueOnce(jsonResponse({id: 'profile-id'}))
      .mockResolvedValueOnce(jsonResponse({value: []}))
    await lookedUp.manager.listOrganizations()
    expect(lookedUp.fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.1',
      'https://app.vssps.visualstudio.com/_apis/accounts?memberId=profile-id&api-version=7.1'
    ])
  })
})

describe('AzureDevOpsServerManager responses', () => {
  it.each([203, 401])(
    'reads a %i with the HTML sign-in page as a rejected access token',
    async (status) => {
      const {manager, fetchMock} = buildManager(sharesWeb)
      fetchMock.mockResolvedValue(htmlResponse(status))
      const res = await manager.listFields(INSTANCE_ID, WEB_PROJECT_ID)
      expect(res).toBeInstanceOf(Error)
      expect(res).toHaveProperty(
        'message',
        'Azure DevOps rejected the access token. Reconnect Azure DevOps.'
      )
    }
  )

  it('reports any other non-JSON response by its status', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock.mockResolvedValue(htmlResponse(502))
    const res = await manager.listFields(INSTANCE_ID, WEB_PROJECT_ID)
    expect(res).toHaveProperty('message', 'Azure DevOps returned an unexpected response (502)')
  })

  it('turns the message of a failed JSON response into the Error', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock.mockResolvedValue(
      jsonResponse({message: 'TF401232: Work item 42 does not exist'}, {status: 404})
    )
    const res = await manager.addComment(INSTANCE_ID, WEB_PROJECT_ID, '42', 'Hello')
    expect(res).toBeInstanceOf(Error)
    expect(res).toHaveProperty('message', 'TF401232: Work item 42 does not exist')
  })

  it('reports a failed JSON response without a message by its status', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock.mockResolvedValue(jsonResponse({}, {status: 500}))
    const res = await manager.listFields(INSTANCE_ID, WEB_PROJECT_ID)
    expect(res).toHaveProperty('message', 'Azure DevOps request failed (500)')
  })

  it('returns a timeout as an Error instead of throwing', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    const timeout = new Error('The operation was aborted due to timeout')
    timeout.name = 'TimeoutError'
    fetchMock.mockRejectedValue(timeout)
    const res = await manager.listFields(INSTANCE_ID, WEB_PROJECT_ID)
    expect(res).toHaveProperty('message', 'Azure DevOps took too long to respond')
  })
})

describe('AzureDevOpsServerManager.refresh', () => {
  beforeEach(() => {
    mockedAuthorize.mockResolvedValue({
      accessToken: 'refreshed-token',
      refreshToken: 'rotated-refresh-token',
      scopes: 'vso.work_write',
      expiresIn: 3599
    })
  })

  it('asks for the explicit work item scopes, never the resource’s .default', async () => {
    const {manager} = buildManager()
    await manager.refresh('refresh-token')

    expect(mockedAuthorize).toHaveBeenCalledTimes(1)
    const {authUrl, body, contentType} = mockedAuthorize.mock.calls[0]![0]
    expect(authUrl).toBe('https://login.microsoftonline.com/tid/oauth2/v2.0/token')
    expect(contentType).toBe('application/x-www-form-urlencoded')
    expect(body).toMatchObject({
      grant_type: 'refresh_token',
      refresh_token: 'refresh-token',
      client_id: 'cid',
      client_secret: 'secret',
      scope: azureDevOpsOAuthScope
    })
    expect(body?.scope).not.toContain('.default')
  })

  it('sends later requests with the refreshed token', async () => {
    const {manager, fetchMock} = buildManager(sharesWeb)
    fetchMock.mockResolvedValue(jsonResponse({value: []}))
    await manager.refresh('refresh-token')
    await manager.listFields(INSTANCE_ID, WEB_PROJECT_ID)
    expect(readRequest(fetchMock).headers.Authorization).toBe('Bearer refreshed-token')
  })

  it('cannot refresh without a provider', async () => {
    const manager = new AzureDevOpsServerManager(auth, null)
    await expect(manager.refresh('refresh-token')).resolves.toBeInstanceOf(Error)
    expect(mockedAuthorize).not.toHaveBeenCalled()
  })
})
