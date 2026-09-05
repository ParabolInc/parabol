import {Check, ChevronRight} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import Avatar from '../../Avatar/Avatar'
import TeamPromptLastUpdatedTime from '../TeamPromptLastUpdatedTime'
import TeamPromptProgressPill from './TeamPromptProgressPill'

interface Props {
  picture: string
  isExpanded: boolean
  onToggle: () => void
  isShared: boolean
  sharedAt: string | null
  updatedAt: string | null
  preview: string
  answeredCount: number
  promptCount: number
  isPhone?: boolean
  templateName?: string | null
  onDone?: () => void
}

const TeamPromptComposerHeader = (props: Props) => {
  const {
    picture,
    isExpanded,
    onToggle,
    isShared,
    sharedAt,
    updatedAt,
    preview,
    answeredCount,
    promptCount,
    isPhone,
    templateName,
    onDone
  } = props
  return (
    <div
      role={isPhone ? undefined : 'button'}
      tabIndex={isPhone ? undefined : 0}
      aria-expanded={isPhone ? undefined : isExpanded}
      onClick={isPhone ? undefined : onToggle}
      onKeyDown={
        isPhone
          ? undefined
          : (e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              onToggle()
            }
      }
      className={cn(
        'flex min-h-12 items-center gap-2 rounded-md px-2',
        !isPhone && 'cursor-pointer hover:bg-surface-hover'
      )}
    >
      {!isPhone && (
        <ChevronRight
          className={cn(
            'h-6 w-6 text-fg-secondary transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
      )}
      <Avatar picture={picture} className='h-10 w-10' />
      <div className='flex min-w-0 flex-1 flex-col'>
        {isPhone && templateName && (
          <div className='truncate text-fg-muted text-xs'>{templateName}</div>
        )}
        <div className='flex items-center gap-2'>
          <h3 className='m-0 font-semibold text-base'>Your update</h3>
          {isShared && sharedAt && (
            <div className='flex items-center gap-1 text-fg-muted text-xs'>
              <Check className='h-[18px] w-[18px] text-jade-600' />
              shared{' '}
              <TeamPromptLastUpdatedTime createdAt={sharedAt} updatedAt={updatedAt ?? sharedAt} />
            </div>
          )}
        </div>
        {!isExpanded && preview && (
          <div className='truncate text-[13px] text-fg-secondary'>{preview}</div>
        )}
      </div>
      {!isShared && (
        <TeamPromptProgressPill answeredCount={answeredCount} promptCount={promptCount} />
      )}
      {onDone && (
        <Button
          type='button'
          variant='flat'
          onClick={onDone}
          className='h-11 min-w-11 px-2 font-semibold text-accent text-sm'
        >
          Done
        </Button>
      )}
    </div>
  )
}

export default TeamPromptComposerHeader
