import type {DataLoaderInstance} from '../../../../../dataloader/RootDataLoader'
import {getTeamPromptBlocks} from '../getTeamPromptBlocks'
import {getTeamPromptSummaryTable} from '../getTeamPromptSummaryTable'

const meetingId = 'meeting1'

const memberResponses = [
  {
    id: 1,
    meetingId,
    userId: 'sharedUser',
    sharedAt: new Date('2026-09-01T00:05:00.000Z'),
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    plaintextContent: 'Shipped the parser',
    content: {
      type: 'doc',
      content: [{type: 'paragraph', content: [{type: 'text', text: 'Shipped the parser'}]}]
    }
  }
]

const users: Record<string, {preferredName: string; picture: string}> = {
  sharedUser: {preferredName: 'Shared Sally', picture: 'https://example.com/sally.png'}
}

const makeDataLoader = () =>
  ({
    get: jest.fn((loaderName: string) => {
      if (loaderName === 'teamPromptMemberResponsesByMeetingId') {
        return {load: jest.fn().mockResolvedValue(memberResponses)}
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

test('getTeamPromptBlocks renders one block per member from the shared-only loader', async () => {
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
})

test('getTeamPromptSummaryTable rows members from the shared-only loader', async () => {
  const table = await getTeamPromptSummaryTable(meetingId, makeDataLoader())
  const serialized = JSON.stringify(table)
  expect(serialized).toContain('Shared Sally')
  expect(serialized).toContain('Shipped the parser')
})
