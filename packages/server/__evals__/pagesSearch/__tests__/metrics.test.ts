import {ndcgAt, recallAt, reciprocalRank, summarize} from '../metrics'

const grades = new Map<number, 1 | 2 | 3>([
  [1, 3],
  [2, 2],
  [3, 1]
])

describe('pages search metrics', () => {
  it('scores a perfect ranking as 1', () => expect(ndcgAt(10, [1, 2, 3], grades)).toBeCloseTo(1, 6))

  it('discounts a reversed ranking', () =>
    expect(ndcgAt(10, [3, 2, 1], grades)).toBeCloseTo(
      (1 + 3 / Math.log2(3) + 7 / 2) / (7 + 3 / Math.log2(3) + 1 / 2),
      6
    ))

  it('ignores results past k', () => expect(ndcgAt(1, [3, 1], grades)).toBeCloseTo(1 / 7, 6))

  it('scores no graded pages as 0', () => expect(ndcgAt(10, [1], new Map())).toBe(0))

  it('counts relevant pages in the top k', () =>
    expect(recallAt(5, [9, 2, 8, 7, 6, 1], grades)).toBe(0.5))

  it('ranks the first relevant result', () => expect(reciprocalRank([9, 3, 2], grades)).toBe(1 / 3))

  it('summarizes answerable queries only', () => {
    const metrics = summarize([
      {
        query: 'a',
        category: 'title',
        answerable: true,
        nDCG10: 1,
        recall5: 1,
        reciprocalRank: 1,
        resultIds: [1],
        resultKeys: ['onboarding-checklist'],
        latencyMs: 10
      },
      {
        query: 'b',
        category: 'title',
        answerable: true,
        nDCG10: 0,
        recall5: 0,
        reciprocalRank: 0,
        resultIds: [],
        resultKeys: [],
        latencyMs: 30
      },
      {
        query: 'c',
        category: 'noAnswer',
        answerable: false,
        nDCG10: 0,
        recall5: 0,
        reciprocalRank: 0,
        resultIds: [5],
        resultKeys: ['note-wifi'],
        latencyMs: 20
      }
    ])
    expect(metrics).toEqual({
      queries: 2,
      nDCG10: 0.5,
      recall5: 0.5,
      mrr: 0.5,
      zeroResultRate: 0.5,
      p50Ms: 20,
      p90Ms: 30
    })
  })
})
