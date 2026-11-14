import {peekPendingArrival, setPendingArrival, takePendingArrival} from '../pendingArrivals'

test('a pending arrival is taken once', () => {
  setPendingArrival('page:2', [{client: 1, clock: 4, snapshot: '<paragraph></paragraph>'}])
  expect(takePendingArrival('page:2')).toHaveLength(1)
  expect(takePendingArrival('page:2')).toBeNull()
})

test('peeking leaves the pending arrival in place until it is taken', () => {
  setPendingArrival('page:3', [{client: 1, clock: 5, snapshot: '<paragraph></paragraph>'}])
  expect(peekPendingArrival('page:3')).toHaveLength(1)
  expect(peekPendingArrival('page:3')).toHaveLength(1)
  expect(takePendingArrival('page:3')).toHaveLength(1)
  expect(peekPendingArrival('page:3')).toBeNull()
})

test('a pending arrival expires after 15 seconds', () => {
  jest.useFakeTimers()
  setPendingArrival('page:4', [{client: 1, clock: 6, snapshot: '<paragraph></paragraph>'}])
  jest.advanceTimersByTime(14_000)
  expect(peekPendingArrival('page:4')).toHaveLength(1)
  jest.advanceTimersByTime(2_000)
  expect(peekPendingArrival('page:4')).toBeNull()
  expect(takePendingArrival('page:4')).toBeNull()
  jest.useRealTimers()
})
