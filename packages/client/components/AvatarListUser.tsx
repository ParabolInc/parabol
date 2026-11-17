import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import type {CSSProperties} from 'react'
import {useFragment} from 'react-relay'
import type {AvatarListUser_user$key} from '../__generated__/AvatarListUser_user.graphql'
import {cn} from '../ui/cn'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import Avatar from './Avatar/Avatar'

interface Props {
  className?: string
  offset: number
  isColumn?: boolean
  user: AvatarListUser_user$key
  onClick?: () => void
  borderColor?: string
}

interface WrapperStyle extends CSSProperties {
  '--avatar-border-color': string
}

const AvatarListUser = (props: Props) => {
  const {className, isColumn, user: userRef, offset, onClick, borderColor} = props
  const user = useFragment(
    graphql`
      fragment AvatarListUser_user on User {
        picture
        preferredName
      }
    `,
    userRef
  )
  const {picture, preferredName} = user
  const wrapperStyle: WrapperStyle = {
    position: 'absolute',
    '--avatar-border-color': borderColor || 'var(--color-surface-card)'
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          style={wrapperStyle}
          initial={isColumn ? {y: offset, scale: 0, opacity: 0} : {x: offset, scale: 0, opacity: 0}}
          animate={isColumn ? {y: offset, scale: 1, opacity: 1} : {x: offset, scale: 1, opacity: 1}}
          exit={{scale: 0, opacity: 0, transition: {duration: 0.15, ease: 'easeOut'}}}
          transition={{duration: 0.25, ease: 'easeIn'}}
          onClick={onClick}
        >
          <Avatar
            className={cn('border-(--avatar-border-color) border-2 border-solid', className)}
            picture={picture}
          />
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{preferredName}</TooltipContent>
    </Tooltip>
  )
}

export default AvatarListUser
