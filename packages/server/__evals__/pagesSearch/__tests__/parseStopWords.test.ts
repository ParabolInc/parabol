import parseStopWords from '../parseStopWords'

describe('parseStopWords', () => {
  it('reads comma-separated choices', () =>
    expect(parseStopWords('EVAL_STOP_WORDS', 'keep, drop')).toEqual(['keep', 'drop']))

  it.each(['skip', '', 'keep,'])('rejects %p', (value) =>
    expect(() => parseStopWords('EVAL_STOP_WORDS', value)).toThrow(
      'EVAL_STOP_WORDS must list keep and/or drop, comma-separated'
    )
  )

  it('rejects a choice listed twice', () =>
    expect(() => parseStopWords('EVAL_STOP_WORDS', 'keep,drop,keep')).toThrow(
      'EVAL_STOP_WORDS lists keep more than once'
    ))
})
