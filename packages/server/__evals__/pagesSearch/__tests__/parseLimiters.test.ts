import parseLimiters from '../parseLimiters'

describe('parseLimiters', () => {
  it('reads off, relative floors and caps', () =>
    expect(parseLimiters('EVAL_LIMITERS', 'off, relative:0.1,cap:5')).toEqual([
      {token: 'off'},
      {token: 'relative:0.1', relativeFloor: 0.1},
      {token: 'cap:5', vectorOnlyLimit: 5}
    ]))

  it.each(['cap:0', 'cap:2.5', 'relative:1.5', 'relative:', 'rel:0.1', '', 'off,'])(
    'rejects %p',
    (value) =>
      expect(() => parseLimiters('EVAL_LIMITERS', value)).toThrow(
        'EVAL_LIMITERS must list off, relative:<decimal between 0 and 1> or cap:<positive integer>'
      )
  )

  it('rejects a limiter listed twice', () =>
    expect(() => parseLimiters('EVAL_LIMITERS', 'cap:5,off,cap:5')).toThrow(
      'EVAL_LIMITERS lists cap:5 more than once'
    ))
})
