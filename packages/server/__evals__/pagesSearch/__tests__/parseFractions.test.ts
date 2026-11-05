import parseFractions from '../parseFractions'

describe('parseFractions', () => {
  it('reads comma-separated fractions', () =>
    expect(parseFractions('EVAL_FLOORS', '0.25, 0.5,1')).toEqual([0.25, 0.5, 1]))

  it.each(['0x1', '1e-1', '', '0.5,', '-0.1', '1.5'])('rejects %p', (value) =>
    expect(() => parseFractions('EVAL_FLOORS', value)).toThrow(
      'EVAL_FLOORS must list comma-separated decimals between 0 and 1, like 0.25'
    )
  )

  it('rejects a value listed twice', () =>
    expect(() => parseFractions('EVAL_ALPHAS', '0.25,0.5,0.25')).toThrow(
      'EVAL_ALPHAS lists 0.25 more than once'
    ))
})
