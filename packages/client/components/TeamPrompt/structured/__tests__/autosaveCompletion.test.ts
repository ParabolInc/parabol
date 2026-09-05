import autosaveCompletion, {
  ALREADY_SHARED_ERROR,
  NOTHING_TO_SAVE_ERROR
} from '../autosaveCompletion'

test('a clean response commits, so a share may collapse the composer', () => {
  expect(autosaveCompletion(undefined, false)).toBe('commit')
  expect(autosaveCompletion(undefined, true)).toBe('commit')
})

test('a failed share never commits', () => {
  expect(autosaveCompletion('Something broke', false)).toBe('snackbar')
  expect(autosaveCompletion(ALREADY_SHARED_ERROR, false)).toBe('snackbar')
  expect(autosaveCompletion(NOTHING_TO_SAVE_ERROR, false)).toBe('evict')
})

test('an autosave that lost the race to a share is ignored', () => {
  expect(autosaveCompletion(ALREADY_SHARED_ERROR, true)).toBe('ignore')
})
