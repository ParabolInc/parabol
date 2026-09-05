import shareButtonState from './shareButtonState'

interface Options {
  isPhone: boolean
  isEditingAfterShare: boolean
  isShared: boolean
  isDirty: boolean
  answeredCount: number
  promptCount: number
  submitting: boolean
  isEnded: boolean
}

const composerDoneVisible = (options: Options) => {
  const {isPhone, isEditingAfterShare, submitting, ...rest} = options
  if (!isPhone || !isEditingAfterShare || submitting) return false
  return shareButtonState({...rest, submitting}).disabled
}

export default composerDoneVisible
