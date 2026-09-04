interface Options {
  isShared: boolean
  isDirty: boolean
  answeredCount: number
  promptCount: number
  submitting: boolean
  isEnded: boolean
}

const shareButtonState = (options: Options) => {
  const {isShared, isDirty, answeredCount, promptCount, submitting, isEnded} = options
  const label = isShared ? 'Share changes' : promptCount > 1 ? 'Share Responses' : 'Share Response'
  const disabled = isEnded || submitting || answeredCount === 0 || (isShared && !isDirty)
  return {label, disabled}
}

export default shareButtonState
