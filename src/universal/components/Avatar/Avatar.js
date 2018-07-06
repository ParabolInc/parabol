import PropTypes from 'prop-types'
import React from 'react'
import AvatarBadge from 'universal/components/AvatarBadge/AvatarBadge'
import styled from 'react-emotion'

const widthLookup = {
  // NOTE: Size modifies avatarImageBlock
  fill: '100%',
  smallest: '1.5rem',
  smaller: '2rem',
  small: '2.75rem',
  medium: '4rem',
  large: '5rem',
  larger: '6rem',
  largest: '7.5rem'
}
const AvatarStyle = styled('div')(({size, isClickable}) => ({
  cursor: isClickable ? 'pointer' : 'default',
  display: 'inline-block',
  position: 'relative',
  verticalAlign: 'middle',
  width: widthLookup[size]
}))

const ImageBlock = styled('div')(({sansRadius, sansShadow, picture}) => ({
  backgroundImage: `url(${picture})`,
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  borderRadius: sansRadius ? 0 : '100%',
  boxShadow: sansShadow && 'none',
  display: 'block',
  height: 0,
  margin: '0 auto',
  padding: '100% 0 0',
  position: 'relative',
  width: '100%'
}))

const BadgeBlock = styled('div')({
  height: '25%',
  position: 'absolute',
  right: 0,
  top: 0,
  width: '25%'
})

const BadgeBlockInner = styled('div')({
  height: '14px',
  left: '50%',
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '14px'
})

const Avatar = (props) => {
  const {
    hasBadge,
    isCheckedIn,
    isClickable,
    isConnected,
    onClick,
    picture,
    sansRadius,
    sansShadow,
    innerRef,
    size
  } = props

  return (
    <AvatarStyle onClick={onClick} innerRef={innerRef} isClickable={isClickable} size={size}>
      <ImageBlock sansRadius={sansRadius} sansShadow={sansShadow} picture={picture}>
        {hasBadge && (
          <BadgeBlock>
            <BadgeBlockInner>
              <AvatarBadge isCheckedIn={isCheckedIn} isConnected={isConnected} />
            </BadgeBlockInner>
          </BadgeBlock>
        )}
      </ImageBlock>
    </AvatarStyle>
  )
}

Avatar.propTypes = {
  hasBadge: PropTypes.bool,
  isCheckedIn: PropTypes.bool,
  isClickable: PropTypes.bool,
  isConnected: PropTypes.bool,
  onClick: PropTypes.func,
  picture: PropTypes.string,
  sansRadius: PropTypes.bool,
  sansShadow: PropTypes.bool,
  innerRef: PropTypes.func,
  size: PropTypes.oneOf([
    'fill',
    'smallest',
    'smaller',
    'small',
    'medium',
    'large',
    'larger',
    'largest'
  ])
}

export default Avatar
