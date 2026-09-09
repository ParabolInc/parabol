import anonymousAvatar from '../../styles/theme/images/anonymous-avatar.svg'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import Avatar from '../Avatar/Avatar'

interface Props {
  isAnonymous: boolean
  preferredName: string
  picture: string
  // why anonymity is unavailable, else null. Rewording a comment takes AI, so without it the only
  // honest option is to send the comment as written
  aiDisabledReason: string | null
  // false while the comment box is empty. The row still takes up its space, so the card doesn't
  // grow the moment the author starts typing
  isVisible: boolean
  onToggle: () => void
}

// sits inside the comment box rather than under it, so it reads as part of the field
const TeamHealthAnonymousToggle = (props: Props) => {
  const {isAnonymous, preferredName, picture, aiDisabledReason, isVisible, onToggle} = props
  return (
    <div
      className={cn('flex items-center justify-end gap-3 px-2 pb-2', !isVisible && 'invisible')}
      aria-hidden={!isVisible}
    >
      {aiDisabledReason && <div className='text-fg-muted text-xs'>{aiDisabledReason}</div>}
      <Tooltip>
        {/* the trigger wraps the button rather than being it: a disabled button swallows the
        pointer events the tooltip listens for, and the disabled state is when it matters most */}
        <TooltipTrigger asChild>
          <span className='inline-flex'>
            <Button
              variant='ghost'
              size='sm'
              className='gap-2 font-semibold text-fg-secondary'
              disabled={!!aiDisabledReason}
              onClick={onToggle}
            >
              <Avatar picture={isAnonymous ? anonymousAvatar : picture} className='h-5 w-5' />
              {isAnonymous ? 'Send anonymously' : `Send as ${preferredName}`}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className='max-w-64 whitespace-normal'>
          {aiDisabledReason ??
            (isAnonymous
              ? 'AI rewrites anonymous comments so nobody can pick you out by how you write'
              : 'Your comment goes to the team word for word, with your name on it')}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default TeamHealthAnonymousToggle
