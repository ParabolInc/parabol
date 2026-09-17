import type {DataLoaderInstance} from '../../../../../dataloader/RootDataLoader'
import {getTeamPromptBlocks} from '../getTeamPromptBlocks'
import {getTeamPromptSummaryTable} from '../getTeamPromptSummaryTable'

const meetingId = 'meeting1'

const responses = [
  {
    id: 1,
    meetingId,
    userId: 'sharedUser',
    isShared: true,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    plaintextContent: 'Shipped the parser',
    content: {
      type: 'doc',
      content: [{type: 'paragraph', content: [{type: 'text', text: 'Shipped the parser'}]}]
    }
  },
  {
    id: 2,
    meetingId,
    userId: 'draftUser',
    isShared: false,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    plaintextContent: 'Still drafting',
    content: {
      type: 'doc',
      content: [{type: 'paragraph', content: [{type: 'text', text: 'Still drafting'}]}]
    }
  },
  {
    id: 3,
    meetingId,
    userId: 'emptyUser',
    isShared: true,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    plaintextContent: '',
    content: {type: 'doc', content: [{type: 'paragraph'}]}
  }
]

const users: Record<string, {preferredName: string; picture: string}> = {
  sharedUser: {preferredName: 'Shared Sally', picture: 'https://example.com/sally.png'},
  draftUser: {preferredName: 'Drafty Dan', picture: 'https://example.com/dan.png'},
  emptyUser: {preferredName: 'Empty Emma', picture: 'https://example.com/emma.png'}
}

const makeDataLoader = () =>
  ({
    get: jest.fn((loaderName: string) => {
      if (loaderName === 'teamPromptResponsesByMeetingId') {
        return {load: jest.fn().mockResolvedValue(responses)}
      }
      if (loaderName === 'users') {
        return {
          load: jest.fn(async (userId: string) => users[userId]),
          loadNonNull: jest.fn(async (userId: string) => users[userId])
        }
      }
      throw new Error(`Unexpected loader ${loaderName}`)
    })
  }) as unknown as DataLoaderInstance

test('getTeamPromptBlocks only renders shared responses', async () => {
  const blocks = await getTeamPromptBlocks(meetingId, makeDataLoader())
  expect(blocks).toHaveLength(2)
  expect(blocks[0]).toMatchObject({
    type: 'heading',
    content: [{type: 'text', text: '1 Response'}]
  })
  expect(blocks[1]).toMatchObject({
    type: 'responseBlock',
    attrs: {preferredName: 'Shared Sally', avatar: 'https://example.com/sally.png'}
  })
  expect(JSON.stringify(blocks)).not.toContain('Empty Emma')
})

test('getTeamPromptSummaryTable only rows shared responses', async () => {
  const table = await getTeamPromptSummaryTable(meetingId, makeDataLoader())
  const serialized = JSON.stringify(table)
  expect(serialized).toContain('Shared Sally')
  expect(serialized).not.toContain('Drafty Dan')
  expect(serialized).not.toContain('Still drafting')
  expect(serialized).not.toContain('Empty Emma')
})
