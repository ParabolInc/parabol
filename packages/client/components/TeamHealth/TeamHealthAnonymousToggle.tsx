import anonymousAvatar from '../../styles/theme/images/anonymous-avatar.svg'
import {Button} from '../../ui/Button/Button'
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
  onToggle: () => void
}

const TeamHealthAnonymousToggle = (props: Props) => {
  const {isAnonymous, preferredName, picture, aiDisabledReason, onToggle} = props
  return (
    <div className='flex flex-col items-start gap-1.5'>
      <Tooltip>
        {/* the trigger wraps the button rather than being it: a disabled button swallows the
        pointer events the tooltip listens for, and the disabled state is when it matters most */}
        <TooltipTrigger asChild>
          <span className='inline-flex'>
            <Button
              variant='outline'
              size='md'
              className='gap-2 py-0'
              disabled={!!aiDisabledReason}
              onClick={onToggle}
            >
              <Avatar picture={isAnonymous ? anonymousAvatar : picture} className='h-6 w-6' />
              {isAnonymous ? 'Send anonymously' : `Send as ${preferredName}`}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className='max-w-64 whitespace-normal'>
          {aiDisabledReason ??
            (isAnonymous
              ? 'AI rewrites anonymous comments so nobody can pick you out by how you write.'
              : 'Your comment goes to the team word for word, with your name on it.')}
        </TooltipContent>
      </Tooltip>
      {aiDisabledReason && <div className='text-fg-muted text-xs'>{aiDisabledReason}</div>}
    </div>
  )
}

export default TeamHealthAnonymousToggle
