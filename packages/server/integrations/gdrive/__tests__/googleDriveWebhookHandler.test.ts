const mockListFiles = jest.fn()
const mockAuthRow = {accessToken: 'a', refreshToken: 'r', expiresAt: null}
const mockInsertedIds: string[] = []
const mockDeletedIds: string[] = []

jest.mock('googleapis', () => ({
  google: {
    auth: {OAuth2: jest.fn().mockImplementation(() => ({setCredentials: jest.fn()}))},
    drive: () => ({files: {list: mockListFiles}})
  }
}))
jest.mock('../../../graphql/uWSAsyncHandler', () => ({
  __esModule: true,
  default: (handler: unknown) => handler
}))
jest.mock('../../../dataloader/getNewDataLoader', () => ({
  getNewDataLoader: () => ({
    get: () => ({load: async () => mockAuthRow}),
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
jest.mock('../meetTranscript', () => ({
  ...jest.requireActual('../meetTranscript'),
  fetchMeetTranscript: jest.fn()
}))

import {matchExternalMeetingToMeeting} from '../../matchExternalMeetingToMeeting'
import {attachTranscriptToSummaryPage} from '../attachTranscriptToSummaryPage'
import {processNewFiles} from '../googleDriveWebhookHandler'
import {fetchMeetTranscript} from '../meetTranscript'

const mockMatch = matchExternalMeetingToMeeting as jest.Mock
const mockAttach = attachTranscriptToSummaryPage as jest.Mock
const mockFetchTranscript = fetchMeetTranscript as jest.Mock

const payload = {userId: 'user1', teamId: 'team1'}
const geminiDoc = {
  id: 'doc1',
  name: 'Root Team Check-In - 2026/08/18 08:59 PDT - Notes by Gemini',
  mimeType: 'application/vnd.google-apps.document',
  createdTime: '2026-08-18T17:26:41.708Z',
  webViewLink: 'https://docs.google.com/document/d/doc1/edit'
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
    jest.clearAllMocks()
    mockInsertedIds.length = 0
    mockDeletedIds.length = 0
    mockListFiles.mockResolvedValue({data: {files: [geminiDoc]}})
    mockFetchTranscript.mockResolvedValue(null)
  })

  it('attaches the Meet transcript page when the doc is the transcript doc', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockFetchTranscript.mockResolvedValue({
      type: 'doc',
      content: [{type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Transcript'}]}]
    })
    await processNewFiles(payload)
    expect(mockFetchTranscript).toHaveBeenCalledWith('a', 'doc1', new Date(geminiDoc.createdTime))
    expect(mockAttach).toHaveBeenCalledWith(
      42,
      [expect.objectContaining({title: 'Transcript'})],
      'user1',
      'google:doc1'
    )
    expect(mockDeletedIds).toEqual([])
  })

  it('attaches a notes link when no Meet transcript belongs to the doc', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockFetchTranscript.mockResolvedValue(null)
    await processNewFiles(payload)
    expect(mockAttach).toHaveBeenCalledWith(
      42,
      [expect.objectContaining({title: 'Gemini Notes'})],
      'user1',
      'google:doc1'
    )
    expect(mockDeletedIds).toEqual([])
  })

  it('attaches the notes link when the Meet API rejects the request outright', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockFetchTranscript.mockRejectedValue(
      Object.assign(new Error('Meet API conferenceRecords -> 403'), {status: 403})
    )
    await processNewFiles(payload)
    expect(mockAttach).toHaveBeenCalledWith(
      42,
      [expect.objectContaining({title: 'Gemini Notes'})],
      'user1',
      'google:doc1'
    )
    expect(mockDeletedIds).toEqual([])
  })

  it('releases the dedup row on a transient Meet API error so a later notification retries', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockFetchTranscript.mockRejectedValue(
      Object.assign(new Error('Meet API conferenceRecords -> 500'), {status: 500})
    )
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when neither transcript nor notes link is available', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockFetchTranscript.mockResolvedValue(null)
    mockListFiles.mockResolvedValue({data: {files: [{...geminiDoc, webViewLink: undefined}]}})
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when no Parabol meeting has ended yet, so a later notification retries', async () => {
    mockMatch.mockResolvedValue(null)
    await processNewFiles(payload)
    expect(mockInsertedIds).toEqual(['google:doc1'])
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockFetchTranscript).not.toHaveBeenCalled()
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when the matched meeting has no summary page yet', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: null})
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('lists Google Docs across the whole Drive instead of one folder', async () => {
    mockMatch.mockResolvedValue(null)
    await processNewFiles(payload)
    const [listArgs] = mockListFiles.mock.calls[0]!
    expect(listArgs.q).not.toContain('in parents')
    expect(listArgs.q).toContain("mimeType='application/vnd.google-apps.document'")
    expect(listArgs.fields).toContain('webViewLink')
  })
})
