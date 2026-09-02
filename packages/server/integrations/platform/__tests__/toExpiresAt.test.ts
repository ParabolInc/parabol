import toExpiresAt from '../toExpiresAt'

describe('toExpiresAt', () => {
  beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z')))
  afterAll(() => jest.useRealTimers())

  it('subtracts a 30 second buffer from expiresIn', () => {
    expect(toExpiresAt(3600)).toEqual(new Date('2026-01-01T00:59:30.000Z'))
  })

  it('is null when the provider sent no expiresIn', () => {
    expect(toExpiresAt(undefined)).toBeNull()
    expect(toExpiresAt(0)).toBeNull()
  })
})
