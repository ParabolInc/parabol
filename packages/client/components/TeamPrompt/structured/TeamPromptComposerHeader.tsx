import {Check, ChevronRight} from '~/ui/icons'
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
    promptCount
  } = props
  return (
    <div
      role='button'
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        onToggle()
      }}
      className='flex min-h-12 cursor-pointer items-center gap-2 rounded-md px-2 hover:bg-surface-hover'
    >
      <ChevronRight
        className={cn('h-6 w-6 text-fg-secondary transition-transform', isExpanded && 'rotate-90')}
      />
      <Avatar picture={picture} className='h-10 w-10' />
      <div className='flex min-w-0 flex-1 flex-col'>
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
    </div>
  )
}

export default TeamPromptComposerHeader
