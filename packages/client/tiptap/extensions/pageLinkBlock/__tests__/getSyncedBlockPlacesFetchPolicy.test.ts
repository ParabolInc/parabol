import {getSyncedBlockPlacesFetchPolicy} from '../getSyncedBlockPlacesFetchPolicy'

const MINUTE = 60_000

test('the first look at a block goes to the network', () => {
  expect(getSyncedBlockPlacesFetchPolicy(101, 0)).toBe('store-and-network')
})

test('a second look within a minute reads the store', () => {
  getSyncedBlockPlacesFetchPolicy(102, 0)
  expect(getSyncedBlockPlacesFetchPolicy(102, 1_000)).toBe('store-or-network')
  expect(getSyncedBlockPlacesFetchPolicy(102, MINUTE - 1)).toBe('store-or-network')
})

test('a look a minute after the last fetch goes to the network again', () => {
  getSyncedBlockPlacesFetchPolicy(103, 0)
  getSyncedBlockPlacesFetchPolicy(103, 30_000)
  expect(getSyncedBlockPlacesFetchPolicy(103, MINUTE)).toBe('store-and-network')
  expect(getSyncedBlockPlacesFetchPolicy(103, MINUTE + 1_000)).toBe('store-or-network')
})

test('each block keeps its own minute', () => {
  getSyncedBlockPlacesFetchPolicy(104, 0)
  expect(getSyncedBlockPlacesFetchPolicy(105, 1_000)).toBe('store-and-network')
  expect(getSyncedBlockPlacesFetchPolicy(104, 1_000)).toBe('store-or-network')
})
