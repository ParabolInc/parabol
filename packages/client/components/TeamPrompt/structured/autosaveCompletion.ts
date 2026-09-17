export const NOTHING_TO_SAVE_ERROR = 'Nothing to save'
export const ALREADY_SHARED_ERROR = 'Response is already shared'

export type AutosaveCompletion = 'commit' | 'evict' | 'ignore' | 'snackbar'

const autosaveCompletion = (
  message: string | undefined,
  isStaleAutosave: boolean
): AutosaveCompletion => {
  if (message === NOTHING_TO_SAVE_ERROR) return 'evict'
  if (message === ALREADY_SHARED_ERROR && isStaleAutosave) return 'ignore'
  if (message) return 'snackbar'
  return 'commit'
}

export default autosaveCompletion
