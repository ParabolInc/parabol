import {isAnonymousRespondentCount} from '../teamHealthAnonymity'

describe('isAnonymousRespondentCount', () => {
  it('keeps per-person facts hidden while 3 or fewer have answered', () => {
    expect(isAnonymousRespondentCount(0)).toBe(false)
    expect(isAnonymousRespondentCount(3)).toBe(false)
  })

  it('allows them once more than 3 have answered', () => {
    expect(isAnonymousRespondentCount(4)).toBe(true)
  })
})
