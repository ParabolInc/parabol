import pickRelatedDiscussions from '../../../embedder/workflows/helpers/pickRelatedDiscussions'
import type {DataLoaderWorker} from '../../graphql/graphql'
import canAccessAI from '../../graphql/mutations/helpers/canAccessAI'

const mockPick = jest.fn()
jest.mock('../../utils/OpenAIServerManager', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({pickRelatedDiscussions: mockPick}))
}))
jest.mock('../../graphql/mutations/helpers/canAccessAI', () => ({
  __esModule: true,
  default: jest.fn()
}))

const candidates = [11, 12, 13, 14].map((embeddingsMetadataId, idx) => ({
  embeddingsMetadataId,
  similarity: 0.9 - idx / 10
}))

const dataLoader = {
  get: (name: string) => ({
    load: async (id: string) =>
      name === 'teamDetails' ? {id, groupingBriefing: 'Falcon is the migration.'} : null,
    loadNonNull: async (id: string | number) => {
      if (name === 'embeddingsMetadata') return {refId: `discussion${id}`, fullText: `Topic ${id}`}
      if (name === 'discussions') return {createdAt: new Date('2026-11-10T00:00:00Z')}
      return {id, orgId: 'org1'}
    }
  })
} as unknown as DataLoaderWorker

const pick = (pool = candidates) =>
  pickRelatedDiscussions('team1', 'The migration is late', pool, 3, dataLoader)

const ids = (picked: {embeddingsMetadataId: number}[] | null) =>
  picked?.map(({embeddingsMetadataId}) => embeddingsMetadataId)

beforeEach(() => {
  jest.mocked(canAccessAI).mockResolvedValue(true)
})

it('shows the past topics the AI picks, in its order', async () => {
  mockPick.mockResolvedValue([3, 0])
  expect(ids(await pick())).toEqual([14, 11])
})

it('hands the AI every candidate with its text and day, and the team briefing', async () => {
  mockPick.mockResolvedValue([])
  await pick()
  const [topic, pastTopics, maxPicks, teamBriefing] = mockPick.mock.calls[0]!
  expect(topic).toBe('The migration is late')
  expect(pastTopics).toHaveLength(4)
  expect(pastTopics[0]).toEqual({discussedAt: new Date('2026-11-10T00:00:00Z'), text: 'Topic 11'})
  expect(maxPicks).toBe(3)
  expect(teamBriefing).toBe('Falcon is the migration.')
})

it('shows nothing when the AI finds nothing about the same issue', async () => {
  mockPick.mockResolvedValue([])
  expect(await pick()).toEqual([])
})

it('picks nothing when the AI fails, so the caller can fall back', async () => {
  mockPick.mockResolvedValue(null)
  expect(await pick()).toBeNull()
})

it('asks nothing when the team has no AI', async () => {
  jest.mocked(canAccessAI).mockResolvedValue(false)
  expect(await pick()).toBeNull()
  expect(mockPick).not.toHaveBeenCalled()
})

it('asks nothing when the search found nothing', async () => {
  expect(await pick([])).toEqual([])
  expect(mockPick).not.toHaveBeenCalled()
})
