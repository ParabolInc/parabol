import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import type {CSSProperties} from 'react'
import {useFragment} from 'react-relay'
import type {AvatarListUser_user$key} from '../__generated__/AvatarListUser_user.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {cn} from '../ui/cn'
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
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  const wrapperStyle: WrapperStyle = {
    position: 'absolute',
    '--avatar-border-color': borderColor || 'var(--color-surface-card)'
  }

  return (
    <motion.div
      ref={originRef}
      style={wrapperStyle}
      initial={isColumn ? {y: offset, scale: 0, opacity: 0} : {x: offset, scale: 0, opacity: 0}}
      animate={isColumn ? {y: offset, scale: 1, opacity: 1} : {x: offset, scale: 1, opacity: 1}}
      exit={{scale: 0, opacity: 0, transition: {duration: 0.15, ease: 'easeOut'}}}
      transition={{duration: 0.25, ease: 'easeIn'}}
      onClick={onClick}
      onMouseOver={openTooltip}
      onMouseLeave={closeTooltip}
    >
      <Avatar
        className={cn('border-(--avatar-border-color) border-2 border-solid', className)}
        picture={picture}
      />
      {tooltipPortal(preferredName)}
    </motion.div>
  )
}

export default AvatarListUser
