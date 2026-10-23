import {canShowRespondentDetails} from '../teamHealthAnonymity'

describe('canShowRespondentDetails', () => {
  it('keeps per-person facts hidden while 3 or fewer have answered', () => {
    expect(canShowRespondentDetails(0)).toBe(false)
    expect(canShowRespondentDetails(3)).toBe(false)
  })

  it('allows them once more than 3 have answered', () => {
    expect(canShowRespondentDetails(4)).toBe(true)
  })
})
