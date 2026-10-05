import {Button} from '../../../ui/Button/Button'
import {modKey} from '../../../utils/platform'
import shareButtonState from './shareButtonState'

interface Props {
  isShared: boolean
  isDirty: boolean
  answeredCount: number
  promptCount: number
  submitting: boolean
  onShare: () => void
}

const TeamPromptComposerFooter = (props: Props) => {
  const {isShared, isDirty, answeredCount, promptCount, submitting, onShare} = props
  const {label, disabled} = shareButtonState({
    isShared,
    isDirty,
    answeredCount,
    promptCount,
    submitting,
    isEnded: false
  })
  return (
    <div className='flex items-center gap-3 px-1 pt-2'>
      <div className='flex-1 text-fg-muted text-xs'>
        {isShared ? 'Edits are private until you share again' : 'Auto-saved · only you can see it'}
      </div>
      <Button
        variant='primary'
        size='md'
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onShare}
        title={`${modKey}+Enter`}
      >
        {label}
      </Button>
    </div>
  )
}

export default TeamPromptComposerFooter
