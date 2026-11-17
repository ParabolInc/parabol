import {getBlockDropRefusal} from '../../../blockMove/getBlockDropRefusal'
import {getCopyDragState} from '../getCopyDragState'

test('refuses the copied page and its sub-pages', () => {
  const drag = getCopyDragState('page:11')
  expect(getBlockDropRefusal({pageId: 'page:11', viewerRole: 'owner'}, drag)).toBe('This page')
  expect(
    getBlockDropRefusal(
      {pageId: 'page:12', viewerRole: 'owner', ancestorPageIds: ['page:11']},
      drag
    )
  ).toBe('Inside itself')
  expect(getBlockDropRefusal({pageId: 'page:13', viewerRole: 'editor'}, drag)).toBeNull()
})
