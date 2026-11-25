import {initials} from '../../shared/initials'
import {Avatar} from '../../ui/Avatar/Avatar'
import {AvatarFallback} from '../../ui/Avatar/AvatarFallback'
import {AvatarImage} from '../../ui/Avatar/AvatarImage'
import {cn} from '../../ui/cn'

interface Props {
  name: string
  picture: string
  className?: string
}

const InviteeAvatar = ({name, picture, className}: Props) => (
  <Avatar className={cn('size-7 text-[11px]', className)}>
    <AvatarImage src={picture} alt='' />
    <AvatarFallback
      delayMs={200}
      className='font-semibold text-fg-primary leading-none ring-1 ring-hairline-strong ring-inset'
    >
      {initials(name)}
    </AvatarFallback>
  </Avatar>
)

export default InviteeAvatar
