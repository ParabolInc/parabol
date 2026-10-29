import {junkAt, ndcgAt, recallAt, reciprocalRank, summarize} from '../metrics'

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

  it('counts ungraded results in the top k', () =>
    expect(junkAt(5, [1, 9, 2, 8, 7, 6], grades)).toBe(3 / 5))

  it('divides by the results shown when there are fewer than k', () =>
    expect(junkAt(5, [1, 9], grades)).toBe(0.5))

  it('counts a grade-1 result as relevant', () => expect(junkAt(5, [3, 9], grades)).toBe(0.5))

  it('scores an empty list as no junk', () => expect(junkAt(5, [], grades)).toBe(0))

  it('averages answerable queries and counts results for unanswerable ones', () => {
    const metrics = summarize([
      {
        query: 'a',
        category: 'title',
        answerable: true,
        nDCG10: 1,
        recall5: 1,
        junkAt5: 0.2,
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
        junkAt5: 0.4,
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
        junkAt5: 1,
        reciprocalRank: 0,
        resultIds: [1, 2],
        resultKeys: ['onboarding-checklist', 'note-wifi'],
        latencyMs: 20
      },
      {
        query: 'd',
        category: 'noAnswer',
        answerable: false,
        nDCG10: 0,
        recall5: 0,
        junkAt5: 0,
        reciprocalRank: 0,
        resultIds: [],
        resultKeys: [],
        latencyMs: 20
      }
    ])
    expect(metrics).toEqual({
      queries: 2,
      nDCG10: 0.5,
      recall5: 0.5,
      mrr: 0.5,
      zeroResultRate: 0.5,
      junkAt5: expect.closeTo(0.3, 6),
      noAnswerResults: 1,
      p50Ms: 20,
      p90Ms: 30
    })
  })

  it('scores noAnswerResults as 0 when every query is answerable', () => {
    const metrics = summarize([
      {
        query: 'a',
        category: 'title',
        answerable: true,
        nDCG10: 1,
        recall5: 1,
        junkAt5: 0,
        reciprocalRank: 1,
        resultIds: [1],
        resultKeys: ['onboarding-checklist'],
        latencyMs: 10
      }
    ])
    expect(metrics.noAnswerResults).toBe(0)
  })
})
