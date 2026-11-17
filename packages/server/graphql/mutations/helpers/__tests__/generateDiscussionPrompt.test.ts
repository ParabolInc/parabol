jest.mock('../../../../utils/logError', () => ({__esModule: true, default: jest.fn()}))
jest.mock('../canAccessAI', () => ({__esModule: true, default: jest.fn().mockResolvedValue(true)}))
jest.mock('../../../../utils/OpenAIServerManager', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({getDiscussionPromptQuestion: jest.fn()}))
}))

import logError from '../../../../utils/logError'
import type {DataLoaderWorker} from '../../../graphql'
import generateDiscussionPrompt from '../generateDiscussionPrompt'

const dataLoader = {
  get: (name: string) => ({
    load: async () => {
      if (name === 'retroReflectionsByMeetingId') return []
      if (name === 'retroReflectionGroupsByMeetingId') return []
      return null
    },
    loadNonNull: async (id: string) => ({id, orgId: 'org1'})
  })
} as unknown as DataLoaderWorker

test('a retro that leaves the group phase without reflections has nothing to prompt', async () => {
  await generateDiscussionPrompt('meeting1', 'team1', dataLoader)
  expect(logError).not.toHaveBeenCalled()
})
