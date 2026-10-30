import {toHealthCheckWindowStart} from '../measures/readHealthScore'

const AT = new Date('2026-09-23T00:00:00Z')

test('an earlier period compared with reaches back at least 90 days for each team’s check', () => {
  const lastThirtyDays = new Date('2026-08-24T00:00:00Z')
  expect(toHealthCheckWindowStart(AT, lastThirtyDays, false, true)).toEqual(
    new Date('2026-06-25T00:00:00Z')
  )
  const lastSixMonths = new Date('2026-03-23T00:00:00Z')
  expect(toHealthCheckWindowStart(AT, lastSixMonths, false, true)).toEqual(lastSixMonths)
})

test('the period itself only reads the period', () => {
  const lastThirtyDays = new Date('2026-08-24T00:00:00Z')
  expect(toHealthCheckWindowStart(AT, lastThirtyDays, false, false)).toEqual(lastThirtyDays)
})

test('over time, every step reads the 90 days before it', () => {
  expect(toHealthCheckWindowStart(AT, new Date('2026-01-01T00:00:00Z'), true, false)).toEqual(
    new Date('2026-06-25T00:00:00Z')
  )
})
