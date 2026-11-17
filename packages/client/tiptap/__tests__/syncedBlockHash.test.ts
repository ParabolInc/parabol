import {getSyncedBlockHash, parseSyncedBlockHash} from '../syncedBlockHash'

test('reads back the hash it writes and rejects anything else', () => {
  expect(getSyncedBlockHash(9)).toBe('#synced-block-9')
  expect(parseSyncedBlockHash(getSyncedBlockHash(9))).toBe(9)
  expect(parseSyncedBlockHash('#synced-block-x')).toBeNull()
  expect(parseSyncedBlockHash('#synced-block-0')).toBeNull()
  expect(parseSyncedBlockHash('#synced-block-1.5')).toBeNull()
  expect(parseSyncedBlockHash('#other')).toBeNull()
  expect(parseSyncedBlockHash('')).toBeNull()
})
