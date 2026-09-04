import {KeyboardArrowRight} from '~/ui/icons'
import useVisualViewportBottom from '../../../../hooks/useVisualViewportBottom'
import {Button} from '../../../../ui/Button/Button'
import usePhoneComposerState from './usePhoneComposerState'

const TeamPromptKeyboardBar = () => {
  const state = usePhoneComposerState()
  const keyboardBottom = useVisualViewportBottom()
  if (!state?.focusedPromptId) return null
  const {focusNextUnanswered, requestBlur, isLastPrompt} = state
  const onAdvance = () => {
    if (!focusNextUnanswered()) requestBlur()
  }
  return (
    <div
      className='fixed inset-x-0 z-[9] flex h-12 items-center border-hairline border-t border-solid bg-surface-card pr-1.5 pl-3.5'
      style={{bottom: keyboardBottom}}
      onPointerDown={(e) => e.preventDefault()}
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className='text-fg-muted text-xs'>Select text to format · - starts a list</span>
      <Button
        type='button'
        onClick={onAdvance}
        className='ml-auto flex h-11 items-center gap-1 rounded-full bg-accent-active px-3 font-semibold text-sm text-white'
      >
        {isLastPrompt ? 'Done' : 'Next question'}
        {!isLastPrompt && <KeyboardArrowRight className='h-5 w-5' />}
      </Button>
    </div>
  )
}

export default TeamPromptKeyboardBar
