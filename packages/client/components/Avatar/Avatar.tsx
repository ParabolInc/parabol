import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import defaultUserAvatar from '../../styles/theme/images/avatar-user.svg'
import AvatarBadge from '../AvatarBadge/AvatarBadge'

type ImageBlockProps = Pick<
  Props,
  'sansRadius' | 'sansShadow' | 'picture' | 'size' | 'onClick' | 'isConnected'
>

const ImageBlock = styled('div')<ImageBlockProps>(
  ({isConnected, sansRadius, sansShadow, picture, size, onClick}) => ({
    backgroundImage: `${
      isConnected === false ? 'linear-gradient(rgba(255,255,255,.65), rgba(255,255,255,.65)),' : ''
    } url(${picture}), url(${defaultUserAvatar})`,
    ':hover': {
      backgroundImage: `linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)),
    url(${picture}), url(${defaultUserAvatar})`
    },
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    borderRadius: sansRadius ? 0 : '100%',
    boxShadow: sansShadow ? 'none' : undefined,
    cursor: onClick ? 'pointer' : 'default',
    display: 'block',
    flexShrink: 0,
    width: size,
    height: size
  })
)

const BadgeBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: '25%',
  justifyContent: 'center',
  position: 'absolute',
  right: 0,
  top: 0,
  width: '25%'
})

const BadgeBlockInner = styled('div')({
  flexShrink: 0
})

interface Props {
  className?: string
  hasBadge?: boolean
  isConnected?: boolean
  onClick?: (e?: React.MouseEvent) => void
  onMouseEnter?: () => void
  onTransitionEnd?: () => void
  picture: string
  sansRadius?: boolean
  sansShadow?: boolean
  size: number
}

const Avatar = forwardRef((props: Props, ref: any) => {
  const {
    className,
    hasBadge,
    isConnected,
    onClick,
    onMouseEnter,
    onTransitionEnd,
    picture,
    sansRadius,
    sansShadow,
    size
  } = props

  return (
    <ImageBlock
      onTransitionEnd={onTransitionEnd}
      className={className}
      ref={ref}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      sansRadius={sansRadius}
      sansShadow={sansShadow}
      picture={picture}
      size={size}
      isConnected={isConnected}
    >
      {hasBadge && (
        <BadgeBlock>
          <BadgeBlockInner>
            <AvatarBadge isConnected={isConnected || false} />
          </BadgeBlockInner>
        </BadgeBlock>
      )}
    </ImageBlock>
  )
})

export default Avatar
