import interleave from '../interleave'

describe('interleave', () => {
  it('round-robins across lists of unequal length', () => {
    expect(interleave<number | string>([[1, 2, 3], ['a'], ['x', 'y']])).toEqual([
      1,
      'a',
      'x',
      2,
      'y',
      3
    ])
  })

  it('is empty for no lists or only empty lists', () => {
    expect(interleave([])).toEqual([])
    expect(interleave([[], []])).toEqual([])
  })
})
