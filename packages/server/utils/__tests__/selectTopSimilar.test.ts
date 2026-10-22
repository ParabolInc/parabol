import {selectTopSimilar} from '../selectTopSimilar'

const rows = (...similarities: number[]) =>
  similarities.map((similarity, idx) => ({id: `t${idx}`, similarity}))

describe('selectTopSimilar', () => {
  it('keeps rows within maxGapFromBest of the best', () => {
    const result = selectTopSimilar(rows(0.9, 0.85, 0.8, 0.79, 0.6), {
      limit: 10,
      maxGapFromBest: 0.1
    })
    expect(result.map(({id}) => id)).toEqual(['t0', 't1', 't2'])
  })

  it('caps at limit', () => {
    const result = selectTopSimilar(rows(0.9, 0.9, 0.9, 0.9), {limit: 2, maxGapFromBest: 0.1})
    expect(result.map(({id}) => id)).toEqual(['t0', 't1'])
  })

  it('returns [] for []', () => {
    expect(selectTopSimilar([], {limit: 5, maxGapFromBest: 0.1})).toEqual([])
  })

  it('always keeps the best row', () => {
    const result = selectTopSimilar(rows(0.51, 0.2), {limit: 5, maxGapFromBest: 0})
    expect(result.map(({id}) => id)).toEqual(['t0'])
  })
})
