import {getBlockSelectionAnnouncement} from '../getBlockSelectionAnnouncement'

test.each([
  [0, 1, '1 block selected'],
  [0, 3, '3 blocks selected'],
  [3, 2, '2 blocks selected'],
  [2, 0, 'Selection cleared'],
  [0, 0, null],
  [2, 2, null]
])('from %i to %i blocks announces %p', (prevCount, nextCount, announcement) => {
  expect(getBlockSelectionAnnouncement(prevCount, nextCount)).toBe(announcement)
})
