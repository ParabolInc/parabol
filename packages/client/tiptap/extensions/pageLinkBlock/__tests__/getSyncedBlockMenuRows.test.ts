import {getSyncedBlockMenuRows} from '../getSyncedBlockMenuRows'

test('an original offers rename, duplicate and delete but not go to original', () => {
  expect(
    getSyncedBlockMenuRows({
      isOriginal: true,
      isViewOnly: false,
      canGoToOriginal: true,
      isMounted: true
    })
  ).toEqual(['copyAndSync', 'rename', 'duplicatePlain', 'deleteFromPage'])
})

test('a copy adds go to original second', () => {
  expect(
    getSyncedBlockMenuRows({
      isOriginal: false,
      isViewOnly: false,
      canGoToOriginal: true,
      isMounted: true
    })
  ).toEqual(['copyAndSync', 'goToOriginal', 'rename', 'duplicatePlain', 'deleteFromPage'])
})

test('view only shows two rows', () => {
  expect(
    getSyncedBlockMenuRows({
      isOriginal: false,
      isViewOnly: true,
      canGoToOriginal: true,
      isMounted: true
    })
  ).toEqual(['copyAndSync', 'goToOriginal'])
})

test("go to original hides when the viewer can't open it", () => {
  expect(
    getSyncedBlockMenuRows({
      isOriginal: false,
      isViewOnly: true,
      canGoToOriginal: false,
      isMounted: true
    })
  ).toEqual(['copyAndSync'])
})

test('a block that is not mounted offers copy, go to original and delete', () => {
  expect(
    getSyncedBlockMenuRows({
      isOriginal: false,
      isViewOnly: false,
      canGoToOriginal: true,
      isMounted: false
    })
  ).toEqual(['copyAndSync', 'goToOriginal', 'deleteFromPage'])
})
