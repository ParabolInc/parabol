import type {DataLoaderWorker} from '../../../graphql'
import computeSimilaritySuggestedGroups from '../computeSimilaritySuggestedGroups'

const mockActiveDefinition: {similarWordingThreshold?: number} = {}
jest.mock('../../../../../embedder/activeEmbeddingModel', () => {
  const actual = jest.requireActual<typeof import('../../../../../embedder/activeEmbeddingModel')>(
    '../../../../../embedder/activeEmbeddingModel'
  )
  return {
    ...actual,
    get activeEmbeddingDefinition() {
      return {...actual.activeEmbeddingDefinition, ...mockActiveDefinition}
    }
  }
})

const reflections = [
  {id: 'r1', reflectionGroupId: 'g1'},
  {id: 'r2', reflectionGroupId: 'g2'}
]
const groups = [
  {id: 'g1', promptId: 'p1'},
  {id: 'g2', promptId: 'p1'}
]
const COS_45 = Math.SQRT1_2
const vectors: Record<string, number[]> = {r1: [1, 0], r2: [COS_45, COS_45]}

const dataLoader = {
  get: (name: string) => ({
    load: async (key: string) => {
      if (name === 'retroReflectionsByMeetingId') return reflections
      if (name === 'retroReflectionGroupsByMeetingId') return groups
      return vectors[key]
    }
  })
} as unknown as DataLoaderWorker

it("clusters at the active model's threshold", async () => {
  mockActiveDefinition.similarWordingThreshold = 0.7
  const suggested = await computeSimilaritySuggestedGroups('m1', false, dataLoader)
  expect(suggested).toEqual([{groupTitle: '', reflectionIds: ['r1', 'r2']}])
})

it('keeps the cards apart when they fall short of it', async () => {
  mockActiveDefinition.similarWordingThreshold = 0.8
  expect(await computeSimilaritySuggestedGroups('m1', false, dataLoader)).toEqual([])
})
