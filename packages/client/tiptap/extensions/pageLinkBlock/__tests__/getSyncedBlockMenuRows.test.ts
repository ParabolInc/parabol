import {getSyncedBlockMenuRows} from '../getSyncedBlockMenuRows'

const options = {
  isOriginal: false,
  isViewOnly: false,
  canGoToOriginal: true,
  isMounted: true,
  otherCount: 2,
  isOwner: true
}

test('an original offers rename, duplicate and delete but not go to original', () => {
  expect(getSyncedBlockMenuRows({...options, isOriginal: true, otherCount: 0})).toEqual([
    'copyAndSync',
    'rename',
    'whoHasAccess',
    'duplicatePlain',
    'deleteFromPage'
  ])
})

test('view only shows two rows', () => {
  expect(getSyncedBlockMenuRows({...options, isViewOnly: true})).toEqual([
    'copyAndSync',
    'goToOriginal'
  ])
})

test("go to original hides when the viewer can't open it", () => {
  expect(getSyncedBlockMenuRows({...options, isViewOnly: true, canGoToOriginal: false})).toEqual([
    'copyAndSync'
  ])
})

test('a block that is not mounted offers copy, go to original and delete', () => {
  expect(getSyncedBlockMenuRows({...options, isMounted: false})).toEqual([
    'copyAndSync',
    'goToOriginal',
    'deleteFromPage'
  ])
})

test("an owner's original on other pages adds Unsync all and Delete all around Delete from this page", () => {
  expect(getSyncedBlockMenuRows({...options, isOriginal: true})).toEqual([
    'copyAndSync',
    'rename',
    'whoHasAccess',
    'duplicatePlain',
    'unsyncAll',
    'deleteFromPage',
    'deleteAll'
  ])
})

test('hides Unsync all and Delete all while placements are unknown', () => {
  expect(getSyncedBlockMenuRows({...options, isOriginal: true, otherCount: null})).toEqual([
    'copyAndSync',
    'rename',
    'whoHasAccess',
    'duplicatePlain',
    'deleteFromPage'
  ])
})

test('hides Unsync all and Delete all from a non-owner', () => {
  expect(getSyncedBlockMenuRows({...options, isOriginal: true, isOwner: false})).toEqual([
    'copyAndSync',
    'rename',
    'whoHasAccess',
    'duplicatePlain',
    'deleteFromPage'
  ])
})

test('a copy adds Go to original second and Unsync this copy before Delete from this page', () => {
  expect(getSyncedBlockMenuRows(options)).toEqual([
    'copyAndSync',
    'goToOriginal',
    'rename',
    'whoHasAccess',
    'duplicatePlain',
    'unsyncCopy',
    'deleteFromPage'
  ])
})
