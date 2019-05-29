import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import Avatar from 'universal/components/Avatar/Avatar'
import ui from 'universal/styles/ui'
import {panelShadow} from 'universal/styles/elevation'
import appTheme from 'universal/styles/theme/appTheme'
import Icon from 'universal/components/Icon'

const borderRadius = '50%'
const borderRadiusPanel = 4
const panelPadding = 8
const panelPaddingHorizontal = panelPadding * 2

const EditableAvatarRoot = styled('div')(({hasPanel, size}) => ({
  backgroundColor: hasPanel && ui.palette.white,
  boxShadow: hasPanel && panelShadow,
  borderRadius: hasPanel ? borderRadiusPanel : borderRadius,
  height: size,
  padding: hasPanel ? panelPadding : '',
  position: 'relative',
  width: size
}))

const EditableAvatarEditOverlay = styled('div')(({hasPanel, size}) => ({
  alignItems: 'center',
  backgroundColor: appTheme.palette.dark,
  borderRadius: hasPanel ? borderRadiusPanel : borderRadius,
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  fontSize: appTheme.typography.s3,
  fontWeight: 600,
  height: size,
  justifyContent: 'center',
  left: 0,
  opacity: 0,
  position: 'absolute',
  top: 0,
  width: size,
  zIndex: 200,

  '&:hover': {
    opacity: '.75',
    transition: 'opacity .2s ease-in'
  }
}))

const EditableAvatarImgBlock = styled('div')(({hasPanel, size}) => ({
  height: hasPanel ? size - panelPaddingHorizontal : size,
  position: 'relative',
  width: hasPanel ? size - panelPaddingHorizontal : size,
  zIndex: 100
}))

const EditableAvatar = (props) => {
  const {hasPanel, onClick, picture, size, unstyled} = props
  const avatarSize = hasPanel ? size - panelPaddingHorizontal : size
  return (
    <EditableAvatarRoot hasPanel={hasPanel} size={size}>
      <EditableAvatarEditOverlay hasPanel={hasPanel} onClick={onClick} size={size}>
        <Icon>edit</Icon>
        <span>{'EDIT'}</span>
      </EditableAvatarEditOverlay>
      <EditableAvatarImgBlock hasPanel={hasPanel} size={size}>
        <Avatar picture={picture} size={avatarSize} sansRadius={unstyled} sansShadow={unstyled} />
      </EditableAvatarImgBlock>
    </EditableAvatarRoot>
  )
}

EditableAvatar.propTypes = {
  hasPanel: PropTypes.bool,
  onClick: PropTypes.func,
  picture: PropTypes.string,
  size: PropTypes.number,
  type: PropTypes.oneOf(['user', 'team', 'organization']),
  unstyled: PropTypes.bool
}

export default EditableAvatar
