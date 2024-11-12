import clsx from 'clsx'
import * as React from 'react'
import {forwardRef} from 'react'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import {Avatar as AvatarRoot} from '../../ui/Avatar/Avatar'
import {AvatarFallback} from '../../ui/Avatar/AvatarFallback'
import {AvatarImage} from '../../ui/Avatar/AvatarImage'

interface Props {
  alt?: string
  className?: string
  onClick?: (e?: React.MouseEvent) => void
  onMouseEnter?: () => void
  onTransitionEnd?: () => void
  picture?: string | null
}

const Avatar = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {alt, className, onClick, onTransitionEnd, onMouseEnter, picture} = props
  return (
    <AvatarRoot
      onClick={onClick}
      onTransitionEnd={onTransitionEnd}
      onMouseEnter={onMouseEnter}
      ref={ref}
      className={clsx(`${onClick && 'cursor-pointer'}`, className)}
    >
      <AvatarImage src={picture || defaultUserAvatar} alt={alt || 'Avatar'} />
      <AvatarFallback delayMs={200}>
        <img src={defaultUserAvatar} alt={alt || 'Avatar not found'} />
      </AvatarFallback>
    </AvatarRoot>
  )
})

export default Avatar
