import {getBlockDropRefusal} from '../getBlockDropRefusal'

const drag = {sourcePageId: 'page:1', childPageIds: ['page:7'], refusal: null}
test.each([
  ['an editable page', {pageId: 'page:2', viewerRole: 'editor'}, null],
  ['the source page', {pageId: 'page:1', viewerRole: 'owner'}, 'This page'],
  ['a moving child page', {pageId: 'page:7', viewerRole: 'owner'}, 'Inside itself'],
  [
    'a subpage of a moving child page',
    {pageId: 'page:9', viewerRole: 'owner', ancestorPageIds: ['page:7']},
    'Inside itself'
  ],
  ['a database', {pageId: 'page:2', viewerRole: 'editor', isDatabase: true}, 'Database'],
  ['meeting summaries', {pageId: 'page:2', viewerRole: 'editor', isMeetingTOC: true}, 'Read-only'],
  ['a commenter page', {pageId: 'page:2', viewerRole: 'commenter'}, 'View only'],
  ['a page whose access is not loaded', {pageId: 'page:2', viewerRole: undefined}, null]
] as const)('%s', (_label, target, expected) => {
  expect(getBlockDropRefusal(target, drag)).toBe(expected)
})

test('a refusal from the dragged content wins', () => {
  expect(
    getBlockDropRefusal(
      {pageId: 'page:2', viewerRole: 'owner'},
      {...drag, refusal: 'Wait for the upload to finish'}
    )
  ).toBe('Wait for the upload to finish')
})
