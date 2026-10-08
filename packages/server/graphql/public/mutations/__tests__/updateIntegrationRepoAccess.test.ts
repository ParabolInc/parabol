import type {GraphQLResolveInfo} from 'graphql'
import type {AzureDevOpsProject} from '../../../../integrations/azureDevOps/fetchAvailableAzureDevOpsProjects'
import invalidateRepoIntegrationsCache from '../../../../integrations/invalidateRepoIntegrationsCache'
import publish from '../../../../utils/publish'
import type {GQLContext} from '../../../graphql'
import type {IntegrationProviderServiceEnum} from '../../resolverTypes'
import updateIntegrationRepoAccess from '../updateIntegrationRepoAccess'

const getAuthRow = jest.fn()
const fetchAvailableRepos = jest.fn()
const repoList = {
  integrationRepoId: ({instanceId, projectId}: AzureDevOpsProject) => `${instanceId}:${projectId}`,
  name: ({name}: AzureDevOpsProject) => name
}
const definitionsByService: Record<string, unknown> = {
  azureDevOps: {
    service: 'azureDevOps',
    title: 'Azure DevOps',
    getAuthRow,
    getCapabilityKeys: () => ['repoList', 'repoAccess'],
    capabilities: {repoList, repoAccess: {fetchAvailableRepos}}
  },
  github: {service: 'github', title: 'GitHub', getAuthRow, capabilities: {repoList}}
}

jest.mock('../../../../integrations/platform/registry', () => ({
  getServerIntegration: (service: string) => definitionsByService[service] ?? null
}))

jest.mock('../../../../postgres/getKysely', () => {
  const where = jest.fn(() => ({execute: async () => undefined}))
  const set = jest.fn(() => ({where}))
  const updateTable = jest.fn(() => ({set}))
  return {__esModule: true, default: () => ({updateTable}), updateTable, set, where}
})

jest.mock('../../../../integrations/invalidateRepoIntegrationsCache', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const {
  updateTable,
  set: setColumns,
  where: whereRow
} = jest.requireMock('../../../../postgres/getKysely') as {
  updateTable: jest.Mock
  set: jest.Mock<unknown, [{meta: string}]>
  where: jest.Mock
}

const ACME = 'dev.azure.com/acme'
const WEB_PROJECT_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const API_PROJECT_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
const BILLING_PROJECT_ID = 'c3d4e5f6-a7b8-4c9d-8e1f-2a3b4c5d6e7f'
const WEB_ID = `${ACME}:${WEB_PROJECT_ID}`
const API_ID = `${ACME}:${API_PROJECT_ID}`
const BILLING_ID = `${ACME}:${BILLING_PROJECT_ID}`

const teamId = 'team1'
const viewerId = 'viewer1'

const availableProject = (projectId: string, name: string): AzureDevOpsProject => ({
  service: 'azureDevOps',
  instanceId: ACME,
  projectId,
  name,
  teamId,
  userId: viewerId
})

const clearAuthLoader = jest.fn()
const buildContext = () => {
  const loaders: Record<string, unknown> = {
    teamMemberIntegrationAuthsByServiceTeamAndUserId: {clearAll: clearAuthLoader}
  }
  return {
    authToken: {sub: viewerId},
    socketId: 'socket1',
    dataLoader: {get: (name: string) => loaders[name], share: () => 'op'}
  } as unknown as GQLContext
}

const info = {} as GraphQLResolveInfo
const resolve = updateIntegrationRepoAccess
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

const run = (
  integrationRepoIds: string[] | null,
  service: IntegrationProviderServiceEnum = 'azureDevOps'
) => resolve({}, {teamId, service, integrationRepoIds}, buildContext(), info)

const storedMeta = () => {
  expect(setColumns).toHaveBeenCalledTimes(1)
  return JSON.parse(setColumns.mock.calls[0]![0].meta)
}

describe('updateIntegrationRepoAccess', () => {
  beforeEach(() => {
    getAuthRow.mockResolvedValue({id: 7, accessToken: 'token', meta: null})
    fetchAvailableRepos.mockResolvedValue([
      availableProject(WEB_PROJECT_ID, 'Web'),
      availableProject(API_PROJECT_ID, 'Api')
    ])
  })

  it.each([
    ['a service without the repoAccess capability', 'github' as const],
    ['a service that is not a task integration', 'mattermost' as const]
  ])('throws for %s', async (_label, service) => {
    await expect(run([WEB_ID], service)).rejects.toThrow(
      `${service} does not support choosing what to share`
    )
    expect(getAuthRow).not.toHaveBeenCalled()
    expect(updateTable).not.toHaveBeenCalled()
  })

  it('throws when the viewer has not connected the service on this team', async () => {
    getAuthRow.mockResolvedValue(null)
    await expect(run([WEB_ID])).rejects.toThrow('Azure DevOps is not connected')
    expect(getAuthRow).toHaveBeenCalledWith(expect.objectContaining({teamId, userId: viewerId}))
    expect(fetchAvailableRepos).not.toHaveBeenCalled()
    expect(updateTable).not.toHaveBeenCalled()
  })

  it('stores {repoAccess: all} for null ids, without asking the service', async () => {
    const res = await run(null)

    expect(storedMeta()).toEqual({repoAccess: 'all'})
    expect(updateTable).toHaveBeenCalledWith('TeamMemberIntegrationAuth')
    expect(whereRow).toHaveBeenCalledWith('id', '=', 7)
    expect(fetchAvailableRepos).not.toHaveBeenCalled()
    expect(res).toEqual({
      integrationService: {
        service: 'azureDevOps',
        title: 'Azure DevOps',
        capabilities: ['repoList', 'repoAccess'],
        teamId,
        userId: viewerId
      }
    })
  })

  it('stores an empty selection for no ids, without asking the service', async () => {
    await run([])
    expect(storedMeta()).toEqual({repoAccess: 'selected', repos: []})
    expect(fetchAvailableRepos).not.toHaveBeenCalled()
  })

  it('stores each picked id with the name the service reports for it', async () => {
    await run([API_ID.toUpperCase(), WEB_ID])
    expect(storedMeta()).toEqual({
      repoAccess: 'selected',
      repos: [
        {id: API_ID, name: 'Api'},
        {id: WEB_ID, name: 'Web'}
      ]
    })
    expect(fetchAvailableRepos).toHaveBeenCalledWith(
      expect.objectContaining({teamId, userId: viewerId})
    )
  })

  it('stores an id once when it is picked twice', async () => {
    await run([WEB_ID, WEB_ID.toUpperCase()])
    expect(storedMeta()).toEqual({repoAccess: 'selected', repos: [{id: WEB_ID, name: 'Web'}]})
  })

  it('throws for an id the viewer’s account cannot see, and writes nothing', async () => {
    await expect(run([WEB_ID, BILLING_ID])).rejects.toThrow(
      'Your Azure DevOps account cannot see everything you picked'
    )
    expect(updateTable).not.toHaveBeenCalled()
    expect(clearAuthLoader).not.toHaveBeenCalled()
    expect(invalidateRepoIntegrationsCache).not.toHaveBeenCalled()
    expect(publish).not.toHaveBeenCalled()
  })

  it('keeps a previously shared id that the live list omits', async () => {
    getAuthRow.mockResolvedValue({
      id: 7,
      accessToken: 'token',
      meta: {repoAccess: 'selected', repos: [{id: BILLING_ID, name: 'Billing'}]}
    })
    await run([WEB_ID, BILLING_ID])
    expect(storedMeta()).toEqual({
      repoAccess: 'selected',
      repos: [
        {id: WEB_ID, name: 'Web'},
        {id: BILLING_ID, name: 'Billing'}
      ]
    })
  })

  it('prefers the live name over the one saved with an earlier grant', async () => {
    getAuthRow.mockResolvedValue({
      id: 7,
      accessToken: 'token',
      meta: {repoAccess: 'selected', repos: [{id: WEB_ID, name: 'Web before the rename'}]}
    })
    await run([WEB_ID])
    expect(storedMeta()).toEqual({repoAccess: 'selected', repos: [{id: WEB_ID, name: 'Web'}]})
  })

  it('narrows a selection to ids it already shares while the service is unreachable', async () => {
    getAuthRow.mockResolvedValue({
      id: 7,
      accessToken: 'token',
      meta: {
        repoAccess: 'selected',
        repos: [
          {id: WEB_ID, name: 'Web'},
          {id: BILLING_ID, name: 'Billing'}
        ]
      }
    })
    fetchAvailableRepos.mockResolvedValue(new Error('Azure DevOps took too long to respond'))
    await run([BILLING_ID.toUpperCase()])
    expect(storedMeta()).toEqual({
      repoAccess: 'selected',
      repos: [{id: BILLING_ID, name: 'Billing'}]
    })
  })

  it.each([
    ['nothing was shared before', null],
    ['everything was shared before', {repoAccess: 'all'}],
    [
      'only another id was shared before',
      {repoAccess: 'selected', repos: [{id: WEB_ID, name: 'Web'}]}
    ]
  ])(
    'throws for an id it cannot confirm while the service is unreachable and %s',
    async (_label, meta) => {
      getAuthRow.mockResolvedValue({id: 7, accessToken: 'token', meta})
      fetchAvailableRepos.mockResolvedValue(new Error('Azure DevOps took too long to respond'))
      await expect(run([WEB_ID, API_ID])).rejects.toThrow(
        'Could not reach Azure DevOps: Azure DevOps took too long to respond'
      )
      expect(updateTable).not.toHaveBeenCalled()
      expect(publish).not.toHaveBeenCalled()
    }
  )

  it('throws for more than 500 ids before asking the service', async () => {
    const tooManyIds = Array.from({length: 501}, (_, index) => `${ACME}:project-${index}`)
    await expect(run(tooManyIds)).rejects.toThrow('Share at most 500 at a time')
    expect(fetchAvailableRepos).not.toHaveBeenCalled()
    expect(updateTable).not.toHaveBeenCalled()
  })

  it('drops the cached auth row and repo list, then publishes the service to the viewer', async () => {
    await run([WEB_ID])
    expect(clearAuthLoader).toHaveBeenCalledTimes(1)
    expect(invalidateRepoIntegrationsCache).toHaveBeenCalledWith(
      teamId,
      viewerId,
      'azureDevOps',
      'removed'
    )
    expect(publish).toHaveBeenCalledWith(
      'notification',
      viewerId,
      'IntegrationService',
      expect.objectContaining({service: 'azureDevOps', teamId, userId: viewerId}),
      {mutatorId: 'socket1', operationId: 'op'}
    )
  })
})
