jest.mock('../../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../canAccessAI', () => ({__esModule: true, default: jest.fn().mockResolvedValue(true)}))
const mockGetDiscussionPromptQuestion = jest.fn()
jest.mock('../../../../utils/OpenAIServerManager', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(() => ({getDiscussionPromptQuestion: mockGetDiscussionPromptQuestion}))
}))

import logError from '../../../../utils/logError'
import type {DataLoaderWorker} from '../../../graphql'
import generateDiscussionPrompt from '../generateDiscussionPrompt'

const makeDataLoader = (groupedReflections: number, groupingBriefing: string | null) =>
  ({
    get: (name: string) => ({
      load: async (id: string) => {
        if (name === 'retroReflectionsByMeetingId')
          return Array.from({length: groupedReflections}, () => ({
            reflectionGroupId: 'group1',
            plaintextContent: 'FMS deploys keep failing'
          }))
        if (name === 'retroReflectionGroupsByMeetingId')
          return groupedReflections ? [{id: 'group1', title: 'FMS'}] : []
        if (name === 'teamDetails') return {id, groupingBriefing}
        return null
      },
      loadNonNull: async (id: string) => ({id, orgId: 'org1'})
    })
  }) as unknown as DataLoaderWorker

test('a retro that leaves the group phase without reflections has nothing to prompt', async () => {
  await generateDiscussionPrompt('meeting1', 'team1', makeDataLoader(0, null))
  expect(logError).not.toHaveBeenCalled()
  expect(mockGetDiscussionPromptQuestion).not.toHaveBeenCalled()
})

test('asks the discussion starter with the team briefing', async () => {
  await generateDiscussionPrompt(
    'meeting1',
    'team1',
    makeDataLoader(2, 'FMS is the fleet management system.')
  )
  expect(mockGetDiscussionPromptQuestion).toHaveBeenCalledWith(
    'FMS',
    expect.any(Array),
    'FMS is the fleet management system.'
  )
})
