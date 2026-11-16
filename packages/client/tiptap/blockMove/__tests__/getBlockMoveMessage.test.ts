import {getBlockMoveMessage} from '../getBlockMoveMessage'

test.each([
  ['moved', 1, 'Moved 1 block to Q3 Roadmap'],
  ['moved', 3, 'Moved 3 blocks to Q3 Roadmap'],
  [
    'copied',
    1,
    'Copied 1 block to Q3 Roadmap. Someone was editing it, so the original stayed here.'
  ],
  [
    'copied',
    3,
    'Copied 3 blocks to Q3 Roadmap. Someone was editing them, so the originals stayed here.'
  ],
  ['offline', 1, 'Couldn’t move: you’re offline. Nothing changed.'],
  ['readonly', 1, 'Couldn’t move: you can only view Q3 Roadmap. Nothing changed.'],
  ['streaming', 1, 'Couldn’t move: Q3 Roadmap is still being written. Nothing changed.'],
  ['unsaved', 1, 'Couldn’t move: Q3 Roadmap didn’t save in time. Nothing changed.'],
  ['gone', 1, null]
] as const)('%s × %i', (result, count, message) => {
  expect(getBlockMoveMessage(result, count, 'Q3 Roadmap')).toBe(message)
})
