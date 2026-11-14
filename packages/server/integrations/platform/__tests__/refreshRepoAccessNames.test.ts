import type {DataLoaderWorker} from '../../../graphql/graphql'
import type {TeamMemberIntegrationAuth} from '../../../postgres/types'
import invalidateRepoIntegrationsCache from '../../invalidateRepoIntegrationsCache'
import refreshRepoAccessNames from '../refreshRepoAccessNames'

jest.mock('../../../postgres/getKysely', () => {
  const where = jest.fn(() => ({execute: async () => undefined}))
  const set = jest.fn(() => ({where}))
  const updateTable = jest.fn(() => ({set}))
  return {__esModule: true, default: () => ({updateTable}), set, where}
})
jest.mock('../../invalidateRepoIntegrationsCache', () => ({__esModule: true, default: jest.fn()}))

const {set: setColumns, where: whereRow} = jest.requireMock('../../../postgres/getKysely') as {
  set: jest.Mock<unknown, [{meta: string}]>
  where: jest.Mock
}

const WEB_ID = 'dev.azure.com/acme:a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
const API_ID = 'dev.azure.com/acme:b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'

const clearAll = jest.fn()
const dataLoader = {clearAll} as unknown as DataLoaderWorker

const authWith = (meta: unknown) =>
  ({
    id: 7,
    teamId: 'team1',
    userId: 'user1',
    service: 'azureDevOps',
    meta
  }) as unknown as TeamMemberIntegrationAuth

const sharesWebAndApi = authWith({
  repoAccess: 'selected',
  repos: [
    {id: WEB_ID, name: 'Web'},
    {id: API_ID, name: 'Api'}
  ]
})

describe('refreshRepoAccessNames', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renames a grant the service lists under another name, matching the id without case', async () => {
    await refreshRepoAccessNames(
      sharesWebAndApi,
      [{id: WEB_ID.toUpperCase(), name: 'Website'}],
      dataLoader
    )
    expect(JSON.parse(setColumns.mock.calls[0]![0].meta)).toEqual({
      repoAccess: 'selected',
      repos: [
        {id: WEB_ID, name: 'Website'},
        {id: API_ID, name: 'Api'}
      ]
    })
    expect(whereRow).toHaveBeenCalledWith('id', '=', 7)
    expect(clearAll).toHaveBeenCalledWith('teamMemberIntegrationAuths')
    expect(invalidateRepoIntegrationsCache).toHaveBeenCalledWith(
      'team1',
      'user1',
      'azureDevOps',
      'added'
    )
  })

  it.each([
    ['every listed name matches', sharesWebAndApi, [{id: WEB_ID, name: 'Web'}]],
    ['no grant is listed', sharesWebAndApi, []],
    ['the connection shares everything', authWith({repoAccess: 'all'}), [{id: WEB_ID, name: 'X'}]]
  ])('writes nothing when %s', async (_label, auth, listedRepos) => {
    await refreshRepoAccessNames(auth, listedRepos, dataLoader)
    expect(setColumns).not.toHaveBeenCalled()
    expect(invalidateRepoIntegrationsCache).not.toHaveBeenCalled()
  })
})
