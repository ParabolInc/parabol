import {getNextJobDelay} from '../../../embedder/getNextJobDelay'

const now = new Date('2026-10-30T12:00:00.000Z')

it('gives no delay when nothing is queued', () => expect(getNextJobDelay(null, now)).toBeNull())

it('wakes at once for a job that is already due', () =>
  expect(getNextJobDelay(new Date('2026-10-30T11:59:59.000Z'), now)).toBe(0))

it('waits until the next job is due', () =>
  expect(getNextJobDelay(new Date('2026-10-30T12:00:01.500Z'), now)).toBe(1500))
