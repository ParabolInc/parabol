const mockListFiles = jest.fn()
const mockExportFile = jest.fn()
const mockDocsGet = jest.fn()
const mockAuthRow = {accessToken: 'a', refreshToken: 'r', expiresAt: null, scopes: ''}
const mockInsertedIds: string[] = []
const mockDeletedIds: string[] = []

jest.mock('googleapis', () => ({
  google: {
    auth: {OAuth2: jest.fn().mockImplementation(() => ({setCredentials: jest.fn()}))},
    drive: () => ({files: {list: mockListFiles, export: mockExportFile}}),
    docs: () => ({documents: {get: mockDocsGet}})
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

import {GDRIVE_DOCS_SCOPE, GDRIVE_MEET_SCOPE} from 'parabol-client/shared/gdriveScopes'
import {matchExternalMeetingToMeeting} from '../../matchExternalMeetingToMeeting'
import {attachTranscriptToSummaryPage} from '../attachTranscriptToSummaryPage'
import {processNewFiles} from '../googleDriveWebhookHandler'

const mockMatch = matchExternalMeetingToMeeting as jest.Mock
const mockAttach = attachTranscriptToSummaryPage as jest.Mock

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
    mockInsertedIds.length = 0
    mockDeletedIds.length = 0
    mockAuthRow.scopes = GDRIVE_MEET_SCOPE
    mockListFiles.mockResolvedValue({data: {files: [geminiDoc]}})
    mockExportFile.mockResolvedValue({data: '# Transcript\n\nhello'})
    mockDocsGet.mockResolvedValue({
      data: {
        title: geminiDoc.name,
        tabs: [
          {
            tabProperties: {title: 'Notes'},
            documentTab: {
              body: {
                content: [
                  {
                    paragraph: {
                      elements: [{textRun: {content: 'Docs API notes\n', textStyle: {}}}],
                      paragraphStyle: {namedStyleType: 'NORMAL_TEXT'}
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    })
  })

  it('reads the doc through the Docs API when the docs scope was granted', async () => {
    mockAuthRow.scopes = `${GDRIVE_MEET_SCOPE} ${GDRIVE_DOCS_SCOPE}`
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    await processNewFiles(payload)
    expect(mockDocsGet).toHaveBeenCalledWith({documentId: 'doc1', includeTabsContent: true})
    expect(mockExportFile).not.toHaveBeenCalled()
    expect(mockAttach).toHaveBeenCalledWith(
      42,
      [expect.objectContaining({title: 'Notes'})],
      'user1',
      'google:doc1'
    )
  })

  it('falls back to export, then to a link page, when the Docs API rejects the doc', async () => {
    mockAuthRow.scopes = `${GDRIVE_MEET_SCOPE} ${GDRIVE_DOCS_SCOPE}`
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockDocsGet.mockRejectedValue(Object.assign(new Error('Forbidden'), {status: 403}))
    mockExportFile.mockRejectedValue(Object.assign(new Error('File not found'), {status: 404}))
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual([])
    expect(mockAttach).toHaveBeenCalledWith(
      42,
      [expect.objectContaining({title: geminiDoc.name})],
      'user1',
      'google:doc1'
    )
  })

  it('releases the dedup row on a transient Docs API error so a later notification retries', async () => {
    mockAuthRow.scopes = `${GDRIVE_MEET_SCOPE} ${GDRIVE_DOCS_SCOPE}`
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockDocsGet.mockRejectedValue(Object.assign(new Error('Backend Error'), {status: 503}))
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when the Docs API returns a doc with no content yet', async () => {
    mockAuthRow.scopes = `${GDRIVE_MEET_SCOPE} ${GDRIVE_DOCS_SCOPE}`
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockDocsGet.mockResolvedValue({data: {title: geminiDoc.name, tabs: []}})
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('does not call the Docs API without the docs scope', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    await processNewFiles(payload)
    expect(mockDocsGet).not.toHaveBeenCalled()
    expect(mockExportFile).toHaveBeenCalled()
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

  it('lists Google Docs across the whole Drive instead of one folder', async () => {
    mockMatch.mockResolvedValue(null)
    await processNewFiles(payload)
    const [listArgs] = mockListFiles.mock.calls[0]!
    expect(listArgs.q).not.toContain('in parents')
    expect(listArgs.q).toContain("mimeType='application/vnd.google-apps.document'")
    expect(listArgs.fields).toContain('webViewLink')
  })

  it('attaches a link page when the doc cannot be exported', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockExportFile.mockRejectedValue(Object.assign(new Error('File not found'), {status: 404}))
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual([])
    expect(mockAttach).toHaveBeenCalledWith(
      42,
      [
        expect.objectContaining({
          title: geminiDoc.name,
          content: expect.objectContaining({
            content: [
              expect.objectContaining({type: 'heading'}),
              expect.objectContaining({
                type: 'paragraph',
                content: [
                  expect.objectContaining({text: "Parabol couldn't import these notes yet. "}),
                  expect.objectContaining({
                    text: 'Open them in Google Docs',
                    marks: [
                      expect.objectContaining({
                        attrs: expect.objectContaining({href: geminiDoc.webViewLink})
                      })
                    ]
                  })
                ]
              })
            ]
          })
        })
      ],
      'user1',
      'google:doc1'
    )
  })

  it('releases the dedup row on a transient export error so a later notification retries', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockExportFile.mockRejectedValue(Object.assign(new Error('Backend Error'), {status: 500}))
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when export is unavailable and the doc has no web link', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockListFiles.mockResolvedValue({data: {files: [{...geminiDoc, webViewLink: undefined}]}})
    mockExportFile.mockRejectedValue(Object.assign(new Error('File not found'), {status: 404}))
    await processNewFiles(payload)
    expect(mockDeletedIds).toEqual(['google:doc1'])
    expect(mockAttach).not.toHaveBeenCalled()
  })

  it('releases the dedup row when the export is empty so a later notification retries', async () => {
    mockMatch.mockResolvedValue({id: 'meeting1', summaryPageId: 42})
    mockExportFile.mockResolvedValue({data: '   '})
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
