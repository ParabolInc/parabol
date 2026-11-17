import lastAnswerUpdatedAt from '../lastAnswerUpdatedAt'

const SHARED_AT = '2026-09-03T12:00:00.000Z'

describe('lastAnswerUpdatedAt', () => {
  it('returns sharedAt when there are no answers', () => {
    expect(lastAnswerUpdatedAt([], SHARED_AT)).toBe(SHARED_AT)
  })

  it('returns sharedAt when every answer predates the share', () => {
    const answers = [
      {updatedAt: '2026-09-03T11:00:00.000Z'},
      {updatedAt: '2026-09-03T11:59:59.000Z'}
    ]
    expect(lastAnswerUpdatedAt(answers, SHARED_AT)).toBe(SHARED_AT)
  })

  it('returns the latest answer update after the share', () => {
    const answers = [
      {updatedAt: '2026-09-03T11:00:00.000Z'},
      {updatedAt: '2026-09-03T13:30:00.000Z'},
      {updatedAt: '2026-09-03T12:30:00.000Z'}
    ]
    expect(lastAnswerUpdatedAt(answers, SHARED_AT)).toBe('2026-09-03T13:30:00.000Z')
  })
})
