import parseLimiters from '../parseLimiters'

describe('parseLimiters', () => {
  it('reads off and caps', () =>
    expect(parseLimiters('EVAL_LIMITERS', 'off, cap:5')).toEqual([
      {token: 'off'},
      {token: 'cap:5', vectorOnlyLimit: 5}
    ]))

  it.each(['cap:0', 'cap:2.5', 'cap:', 'relative:0.1', '', 'off,'])('rejects %p', (value) =>
    expect(() => parseLimiters('EVAL_LIMITERS', value)).toThrow(
      'EVAL_LIMITERS must list off or cap:<positive integer>'
    )
  )

  it('rejects a limiter listed twice', () =>
    expect(() => parseLimiters('EVAL_LIMITERS', 'cap:5,off,cap:5')).toThrow(
      'EVAL_LIMITERS lists cap:5 more than once'
    ))
})
