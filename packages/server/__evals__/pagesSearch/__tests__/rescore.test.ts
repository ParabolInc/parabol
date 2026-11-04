import {checkExtraGrades, type ExtraGrades, type LabeledQuery, rescore} from '../rescore'

const queries: LabeledQuery[] = [
  {query: 'alpha', relevant: {a: 3, b: 1}},
  {query: 'nothing', relevant: {}}
]
const results = [
  {query: 'alpha', category: 'title', resultKeys: ['x', 'a', 'b'], latencyMs: 10},
  {query: 'nothing', category: 'noAnswer', resultKeys: ['y', 'z'], latencyMs: 20}
]

it('matches the eval on the labels alone', () => {
  const overall = rescore(results, queries)
  expect(overall.queries).toBe(1)
  expect(overall.nDCG10).toBeCloseTo((7 / Math.log2(3) + 1 / 2) / (7 + 1 / Math.log2(3)), 6)
  expect(overall.recall20).toBe(1)
  expect(overall.mrr).toBe(0.5)
  expect(overall.junkAt5).toBeCloseTo(1 / 3, 6)
  expect(overall.noAnswerResults).toBe(2)
})

it('adds extra grades for unjudged pages', () => {
  const overall = rescore(results, queries, {alpha: {x: 2}})
  expect(overall.nDCG10).toBeCloseTo(
    (3 + 7 / Math.log2(3) + 1 / 2) / (7 + 3 / Math.log2(3) + 1 / 2),
    6
  )
  expect(overall.mrr).toBe(1)
  expect(overall.junkAt5).toBe(0)
})

it('never overrides a label', () =>
  expect(rescore(results, queries, {alpha: {a: 0, b: 3}})).toEqual(rescore(results, queries)))

it('keeps unanswerable queries unanswerable', () =>
  expect(rescore(results, queries, {nothing: {y: 3}})).toEqual(rescore(results, queries)))

it('keeps an unjudged page graded 0 as junk', () =>
  expect(rescore(results, queries, {alpha: {x: 0}})).toEqual(rescore(results, queries)))

it('accepts extra grades that cover the pool exactly', () =>
  expect(checkExtraGrades({alpha: ['x', 'y']}, {alpha: {x: 0, y: 3}})).toBeNull())

it('rejects missing, extra and malformed grades, by count only', () => {
  const extraGrades: ExtraGrades = {alpha: {x: '2', z: 1}, beta: {w: 7}}
  expect(checkExtraGrades({alpha: ['x', 'y']}, extraGrades)).toBe(
    'Extra grades: 1 pooled pairs ungraded, 2 pairs outside the pool, 2 grades not 0, 1, 2 or 3'
  )
})
