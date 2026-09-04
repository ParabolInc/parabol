import {AutoAwesome} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import {modKey} from '../../../utils/platform'

interface Props {
  isShared: boolean
  isDirty: boolean
  answeredCount: number
  promptCount: number
  submitting: boolean
  isInspirationOpen: boolean
  onOpenInspiration: () => void
  onShare: () => void
}

const TeamPromptComposerFooter = (props: Props) => {
  const {
    isShared,
    isDirty,
    answeredCount,
    promptCount,
    submitting,
    isInspirationOpen,
    onOpenInspiration,
    onShare
  } = props
  const label = isShared ? 'Share changes' : promptCount > 1 ? 'Share Responses' : 'Share Response'
  const disabled = submitting || answeredCount === 0 || (isShared && !isDirty)
  return (
    <div className='flex items-center gap-3 px-1 pt-2'>
      <div className='flex-1 text-fg-muted text-xs'>
        {isShared ? 'Edits are private until you share again' : 'Auto-saved · only you can see it'}
      </div>
      <Button
        onMouseDown={(e) => e.preventDefault()}
        onClick={onOpenInspiration}
        className={cn(
          'h-10 gap-2 rounded-full border border-solid bg-transparent px-4 font-semibold text-sm',
          isInspirationOpen
            ? 'border-accent text-accent'
            : 'border-hairline-strong text-fg-primary hover:bg-surface-hover'
        )}
      >
        <AutoAwesome className='h-[18px] w-[18px]' />
        Draft from my work
      </Button>
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
