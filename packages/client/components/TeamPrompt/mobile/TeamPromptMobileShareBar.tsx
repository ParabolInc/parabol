import {AutoAwesome} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'

interface Props {
  isShared: boolean
  isDirty: boolean
  answeredCount: number
  promptCount: number
  submitting: boolean
  onShare: () => void
  onOpenInspiration: () => void
  onClose: () => void
}

const TeamPromptMobileShareBar = (props: Props) => {
  const {
    isShared,
    isDirty,
    answeredCount,
    promptCount,
    submitting,
    onShare,
    onOpenInspiration,
    onClose
  } = props
  const disabled = submitting || answeredCount === 0 || (isShared && !isDirty)
  return (
    <div className='flex shrink-0 flex-col gap-2 border-hairline border-t bg-surface-card px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]'>
      <div className='text-fg-muted text-xs'>
        {isShared
          ? 'Edits are private until you share again'
          : `${answeredCount} of ${promptCount} answered · Auto-saved`}
      </div>
      <div className='flex gap-2'>
        {isShared && (
          <Button variant='outline' className='h-10' onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          variant='outline'
          className='h-10 gap-1.5'
          aria-label='Inspiration'
          onClick={onOpenInspiration}
        >
          <AutoAwesome className='size-5' />
          {!isShared && 'Inspiration'}
        </Button>
        <Button variant='primary' className='h-10 flex-1' disabled={disabled} onClick={onShare}>
          {isShared ? 'Share changes' : 'Share update'}
        </Button>
      </div>
    </div>
  )
}

export default TeamPromptMobileShareBar
