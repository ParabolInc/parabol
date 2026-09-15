jest.mock('../../../utils/AtlassianServerManager')
jest.mock('../../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => mockDb
}))

import type {AtlassianAuth} from '../../../postgres/types'
import AtlassianServerManager, {
  type AccessibleResource
} from '../../../utils/AtlassianServerManager'
import hasAtlassianSiteAccess from '../hasAtlassianSiteAccess'

type MockUpdateChain = {set: jest.Mock; where: jest.Mock; execute: jest.Mock}

const mockUpdateChain: MockUpdateChain = {
  set: jest.fn(() => mockUpdateChain),
  where: jest.fn(() => mockUpdateChain),
  execute: jest.fn(() => Promise.resolve([]))
}
const mockUpdateTable = jest.fn(() => mockUpdateChain)
const mockDb = {updateTable: mockUpdateTable}

const getAccessibleResources = jest.mocked(AtlassianServerManager.prototype.getAccessibleResources)

const makeSite = (id: string): AccessibleResource => ({
  id,
  name: id,
  scopes: [],
  avatarUrl: '',
  url: `https://${id}.atlassian.net`
})

const makeAuth = (cloudIds: string[]) =>
  ({
    accessToken: 'tok',
    cloudIds,
    userId: 'u1',
    providerId: 7,
    providerUserId: 'pu1'
  }) as unknown as AtlassianAuth

it('accepts a site in the stored snapshot without a live call', async () => {
  expect(await hasAtlassianSiteAccess(makeAuth(['cloud1']), 'cloud1')).toBe(true)
  expect(getAccessibleResources).not.toHaveBeenCalled()
  expect(mockUpdateTable).not.toHaveBeenCalled()
})

it('accepts a site missing from the snapshot but granted live, and refreshes the snapshot', async () => {
  getAccessibleResources.mockResolvedValue([makeSite('cloud1'), makeSite('cloud2')])
  expect(await hasAtlassianSiteAccess(makeAuth(['cloud1']), 'cloud2')).toBe(true)
  expect(mockUpdateTable).toHaveBeenCalledWith('TeamMemberIntegrationAuth')
  expect(mockUpdateChain.set).toHaveBeenCalledWith({
    meta: JSON.stringify({cloudIds: ['cloud1', 'cloud2']})
  })
  expect(mockUpdateChain.execute).toHaveBeenCalled()
})

it('rejects a site missing from both the snapshot and the live list', async () => {
  getAccessibleResources.mockResolvedValue([makeSite('cloud1')])
  expect(await hasAtlassianSiteAccess(makeAuth(['cloud1']), 'cloud2')).toBe(false)
  expect(mockUpdateTable).not.toHaveBeenCalled()
})

it('rejects when the live list cannot be fetched', async () => {
  getAccessibleResources.mockResolvedValue(new Error('Atlassian is down'))
  expect(await hasAtlassianSiteAccess(makeAuth(['cloud1']), 'cloud2')).toBe(false)
  expect(mockUpdateTable).not.toHaveBeenCalled()
})
