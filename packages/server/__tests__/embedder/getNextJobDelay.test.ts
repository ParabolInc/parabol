import {getNextJobDelay, IDLE_RECHECK_MS} from '../../../embedder/getNextJobDelay'

const now = new Date('2026-10-30T12:00:00.000Z')

it('checks again soon when nothing is queued, so jobs added without a publish still run', () =>
  expect(getNextJobDelay(null, now)).toBe(IDLE_RECHECK_MS))

it('wakes at once for a job that is already due', () =>
  expect(getNextJobDelay(new Date('2026-10-30T11:59:59.000Z'), now)).toBe(0))

it('waits until the next job is due', () =>
  expect(getNextJobDelay(new Date('2026-10-30T12:00:01.500Z'), now)).toBe(1500))

it('checks again soon when the next job is far off, in case one is added without a publish', () =>
  expect(getNextJobDelay(new Date('2026-10-30T13:00:00.000Z'), now)).toBe(IDLE_RECHECK_MS))

it('checks again within a minute', () => expect(IDLE_RECHECK_MS).toBeLessThanOrEqual(60_000))
