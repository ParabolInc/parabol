import clusterBySimilarity from '../clusterBySimilarity'
import type {SimilarityGroup} from '../similarityMath'

/** A unit vector at the given angle, so cosine similarity between two of them is cos(difference) */
const unit = (deg: number) => {
  const rad = (deg * Math.PI) / 180
  return [Math.cos(rad), Math.sin(rad)]
}

const makeGroup = (
  id: string,
  promptId: string,
  ...vectors: (number[] | null)[]
): SimilarityGroup => ({
  id,
  promptId,
  reflections: vectors.map((embeddingVector, idx) => ({id: `${id}-r${idx}`, embeddingVector}))
})

const clusterIds = (groups: SimilarityGroup[], sameColumnOnly?: boolean) =>
  clusterBySimilarity(groups, {sameColumnOnly}).map(({groupIds}) => groupIds)

describe('clusterBySimilarity', () => {
  it('merges near-identical groups in the same column', () => {
    const groups = [makeGroup('a', 'c1', unit(0)), makeGroup('b', 'c1', unit(10))]
    expect(clusterIds(groups)).toEqual([['a', 'b']])
  })

  it('leaves unrelated groups alone', () => {
    const groups = [makeGroup('a', 'c1', unit(0)), makeGroup('b', 'c1', unit(80))]
    expect(clusterIds(groups)).toEqual([])
  })

  it('omits singletons, since they need no move', () => {
    const groups = [
      makeGroup('a', 'c1', unit(0)),
      makeGroup('b', 'c1', unit(10)),
      makeGroup('c', 'c1', unit(80))
    ]
    const clusters = clusterBySimilarity(groups)
    expect(clusters).toHaveLength(1)
    expect(clusters[0]!.groupIds).toEqual(['a', 'b'])
  })

  it('returns every reflection of a merged group, including unembedded ones', () => {
    const groups = [makeGroup('a', 'c1', unit(0), null), makeGroup('b', 'c1', unit(10))]
    expect(clusterBySimilarity(groups)[0]!.reflectionIds).toEqual(['a-r0', 'a-r1', 'b-r0'])
  })

  it('skips groups that have no embeddings at all', () => {
    const groups = [makeGroup('a', 'c1', null), makeGroup('b', 'c1', null)]
    expect(clusterBySimilarity(groups)).toEqual([])
  })

  describe('sameColumnOnly', () => {
    const groups = [makeGroup('a', 'c1', unit(0)), makeGroup('b', 'c2', unit(10))]

    it('merges across columns by default', () => {
      expect(clusterIds(groups)).toEqual([['a', 'b']])
    })

    it('never merges across columns when set', () => {
      expect(clusterIds(groups, true)).toEqual([])
    })
  })

  it('holds bigger merges to a higher bar', () => {
    // cos(35°) + the same-column bonus clears the 2-card bar but not the 4-card one
    const marginal = makeGroup('b', 'c1', unit(35))
    expect(clusterIds([makeGroup('a', 'c1', unit(0)), marginal])).toEqual([['a', 'b']])
    expect(clusterIds([makeGroup('a', 'c1', unit(0), unit(0), unit(0)), marginal])).toEqual([])
  })

  it('is deterministic regardless of the order groups arrive in', () => {
    const a = makeGroup('a', 'c1', unit(0))
    const b = makeGroup('b', 'c1', unit(12))
    const c = makeGroup('c', 'c1', unit(24))
    const forward = clusterBySimilarity([a, b, c])
    const reversed = clusterBySimilarity([c, b, a])
    expect(reversed).toEqual(forward)
    expect(forward[0]!.groupIds).toEqual(['a', 'b', 'c'])
  })
})
