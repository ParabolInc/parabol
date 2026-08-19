const mockListFiles = jest.fn()
const mockExportFile = jest.fn()
const mockInsertedIds: string[] = []
const mockDeletedIds: string[] = []

jest.mock('googleapis', () => ({
  google: {
    auth: {OAuth2: jest.fn().mockImplementation(() => ({setCredentials: jest.fn()}))},
    drive: () => ({files: {list: mockListFiles, export: mockExportFile}})
  }
}))
jest.mock('../../../graphql/uWSAsyncHandler', () => ({
  __esModule: true,
  default: (handler: unknown) => handler
}))
jest.mock('../../../dataloader/getNewDataLoader', () => ({
  getNewDataLoader: () => ({
    get: () => ({load: async () => ({accessToken: 'a', refreshToken: 'r', expiresAt: null})}),
    dispose: jest.fn()
  })
}))
jest.mock('../../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    insertInto: () => ({
      values: ({id}: {id: string}) => ({
        onConflict: () => ({
          executeTakeFirst: async () => {
            mockInsertedIds.push(id)
            return {numInsertedOrUpdatedRows: 1n}
          }
        })
      })
    }),
    deleteFrom: () => ({
      where: (_col: string, _op: string, id: string) => ({
        execute: async () => {
          mockDeletedIds.push(id)
        }
      })
    })
  })
}))
jest.mock('../../matchExternalMeetingToMeeting', () => ({
  matchExternalMeetingToMeeting: jest.fn()
}))
jest.mock('../attachTranscriptToSummaryPage', () => ({
  attachTranscriptToSummaryPage: jest.fn()
}))

import {matchExternalMeetingToMeeting} from '../../matchExternalMeetingToMeeting'
import {attachTranscriptToSummaryPage} from '../attachTranscriptToSummaryPage'
import {processNewFiles} from '../googleDriveWebhookHandler'

const mockMatch = matchExternalMeetingToMeeting as jest.Mock
const mockAttach = attachTranscriptToSummaryPage as jest.Mock

const payload = {userId: 'user1', teamId: 'team1', folderId: 'folder1'}
const geminiDoc = {
  id: 'doc1',
  name: 'Notes by Gemini',
  mimeType: 'application/vnd.google-apps.document',
  createdTime: '2026-08-18T10:00:00Z'
}

describe('googleDriveWebhookHandler processNewFiles', () => {
  const originalEnv = process.env
  beforeAll(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_OAUTH_CLIENT_ID: 'id',
      GOOGLE_OAUTH_CLIENT_SECRET: 'secret'
    }
  })
  afterAll(() => {
    process.env = originalEnv
  })
  beforeEach(() => {
    mockInsertedIds.length = 0
    mockDeletedIds.length = 0
    mockListFiles.mockResolvedValue({data: {files: [geminiDoc]}})
    mockExportFile.mockResolvedValue({data: '# Transcript\n\nhello'})
  })

  it('releases the dedup row when no Parabol meeting has ended yet, so a later notification retries', async () => {
    mockMatch.mockResolvedValue(null)
    await processNewFiles(payload)
    expect(mockInsertedIds).toEqual(['google:doc1'])
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockExportFile).not.toHaveBeenCalled()
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when the matched meeting has no summary page yet', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: null})
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when the Drive export fails', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockExportFile.mockRejectedValue(new Error('rate limited'))
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('attaches the transcript pages to the matched summary page and keeps the dedup row', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual([])
    expect(mockAttach).toHaveBeenCalledWith(
      42,
      [expect.objectContaining({title: 'Transcript'})],
      'user1',
      'google:doc1'
    )
  })
})
