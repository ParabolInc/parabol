import {getIsSyncedBlockPanelStatus} from '../getIsSyncedBlockPanelStatus'

test('locked and error are panels without block chrome', () => {
  expect(getIsSyncedBlockPanelStatus('locked')).toBe(true)
  expect(getIsSyncedBlockPanelStatus('error')).toBe(true)
})

test('loading and ready keep the block chrome', () => {
  expect(getIsSyncedBlockPanelStatus('loading')).toBe(false)
  expect(getIsSyncedBlockPanelStatus('ready')).toBe(false)
})
