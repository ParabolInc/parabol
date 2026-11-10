import type AtlassianServerManager from '../AtlassianServerManager'
import {processJiraImages} from '../jiraImages'

const mockStoredPaths = new Set<string>()
const mockWritingPaths = new Set<string>()
const mockWrites: string[] = []

jest.mock('../../../appOrigin', () => ({__esModule: true, default: 'https://parabol.test'}))
jest.mock('../../../utils/fetchWithRetry', () => ({
  __esModule: true,
  default: async () => {
    await new Promise((resolve) => setTimeout(resolve, 5))
    return new Response(Buffer.from('image'), {headers: {'content-type': 'image/png'}})
  }
}))
jest.mock('../../../fileStorage/getFileStoreManager', () => ({
  __esModule: true,
  default: () => ({
    checkExists: async (partialPath: string) => mockStoredPaths.has(partialPath),
    putUserFile: async (_file: Buffer, partialPath: string) => {
      mockWrites.push(partialPath)
      if (mockWritingPaths.has(partialPath)) throw new Error('GCS Upload Error: 429')
      mockWritingPaths.add(partialPath)
      await new Promise((resolve) => setTimeout(resolve, 5))
      mockWritingPaths.delete(partialPath)
      mockStoredPaths.add(partialPath)
      return `https://parabol.test/assets/${partialPath}`
    }
  })
}))

const manager = {accessToken: 'token'} as AtlassianServerManager
const cloudId = 'cloud123'
const teamId = 'team123'
const imageUrl = 'https://site.atlassian.net/rest/api/3/attachment/content/1001'
const otherImageUrl = 'https://site.atlassian.net/rest/api/3/attachment/content/1002'

beforeEach(() => {
  mockStoredPaths.clear()
  mockWritingPaths.clear()
  mockWrites.length = 0
})

test('writes an image repeated in a description once', async () => {
  const html = `<p><img src="${imageUrl}"></p><p><img src="${otherImageUrl}"></p><p><img src="${imageUrl}"></p>`

  const result = await processJiraImages(manager, cloudId, teamId, html)

  expect(mockWrites).toHaveLength(2)
  expect(result).not.toContain('site.atlassian.net')
  expect(result.match(/parabol\.test\/assets\/Team\/team123\/assets\//g)).toHaveLength(3)
})

test('writes an image shared by concurrently processed descriptions once', async () => {
  const html = `<p><img src="${imageUrl}"></p>`

  const results = await Promise.all([
    processJiraImages(manager, cloudId, teamId, html),
    processJiraImages(manager, cloudId, teamId, html)
  ])

  expect(mockWrites).toHaveLength(1)
  expect(results[0]).toEqual(results[1])
  expect(results[0]).toContain('parabol.test/assets/Team/team123/assets/')
})

test('caches the same image separately for each team', async () => {
  const html = `<p><img src="${imageUrl}"></p>`

  await Promise.all([
    processJiraImages(manager, cloudId, teamId, html),
    processJiraImages(manager, cloudId, 'team456', html)
  ])

  expect(mockWrites).toHaveLength(2)
})
