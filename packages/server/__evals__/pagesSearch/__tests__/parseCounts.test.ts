import parseCounts from '../parseCounts'

describe('parseCounts', () => {
  it('reads comma-separated whole numbers', () =>
    expect(parseCounts('EVAL_MIN_BYTES', '0, 100,200')).toEqual([0, 100, 200]))

  it.each(['-1', '1.5', '1e2', '', '100,'])('rejects %p', (value) =>
    expect(() => parseCounts('EVAL_MIN_BYTES', value)).toThrow(
      'EVAL_MIN_BYTES must list comma-separated whole numbers, like 100'
    )
  )

  it('rejects a value listed twice', () =>
    expect(() => parseCounts('EVAL_MIN_BYTES', '100,0,100')).toThrow(
      'EVAL_MIN_BYTES lists 100 more than once'
    ))
})
