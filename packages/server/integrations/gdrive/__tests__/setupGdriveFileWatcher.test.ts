const mockGetStartPageToken = jest.fn()
const mockChangesWatch = jest.fn()
const mockFilesList = jest.fn()
const mockUpdateSets: unknown[] = []

jest.mock('googleapis', () => ({
  google: {
    auth: {OAuth2: jest.fn().mockImplementation(() => ({setCredentials: jest.fn()}))},
    drive: () => ({
      changes: {getStartPageToken: mockGetStartPageToken, watch: mockChangesWatch},
      files: {list: mockFilesList}
    })
  }
}))
jest.mock('../../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    updateTable: () => ({
      set: (values: unknown) => {
        mockUpdateSets.push(values)
        const chain = {where: () => chain, execute: async () => {}}
        return chain
      }
    })
  })
}))
jest.mock('../gdriveWebhookToken', () => ({
  signGdriveToken: (payload: unknown) => `signed:${JSON.stringify(payload)}`
}))

import {setupGdriveFileWatcher} from '../setupGdriveFileWatcher'

const gdriveAuth = {accessToken: 'a', refreshToken: 'r', expiresAt: null}

describe('setupGdriveFileWatcher', () => {
  const originalEnv = process.env
  beforeAll(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_OAUTH_CLIENT_ID: 'id',
      GOOGLE_OAUTH_CLIENT_SECRET: 'secret',
      DEV_WEBHOOK_URL: 'https://hooks.example.com'
    }
  })
  afterAll(() => {
    process.env = originalEnv
  })
  beforeEach(() => {
    mockUpdateSets.length = 0
    mockGetStartPageToken.mockResolvedValue({data: {startPageToken: '4242'}})
    mockChangesWatch.mockResolvedValue({data: {resourceId: 'res1', expiration: '1800000000000'}})
  })

  it('watches the Drive change feed instead of a named folder', async () => {
    const expiresAt = await setupGdriveFileWatcher(gdriveAuth, 'user1', 'team1')
    expect(mockFilesList).not.toHaveBeenCalled()
    expect(mockChangesWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        pageToken: '4242',
        requestBody: expect.objectContaining({
          type: 'web_hook',
          address: 'https://hooks.example.com/gdrive',
          token: 'signed:{"userId":"user1","teamId":"team1"}'
        })
      })
    )
    expect(expiresAt).toEqual(new Date(1800000000000))
    expect(mockUpdateSets).toEqual([{watchExpiresAt: new Date(1800000000000)}])
  })

  it('throws when Google does not return a channel resourceId', async () => {
    mockChangesWatch.mockResolvedValue({data: {}})
    await expect(setupGdriveFileWatcher(gdriveAuth, 'user1', 'team1')).rejects.toThrow(
      'Failed to set up Google Drive watch channel'
    )
  })
})
